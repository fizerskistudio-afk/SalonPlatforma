begin;

create type public.review_invitation_job_status as enum (
  'pending',
  'processing',
  'sent',
  'skipped',
  'failed'
);

create table public.review_invitation_jobs (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  booking_id uuid not null
    references public.bookings(id)
    on delete cascade,

  status public.review_invitation_job_status not null
    default 'pending',

  run_after timestamptz not null,

  attempt_count integer not null
    default 0,

  claimed_at timestamptz,
  last_attempt_at timestamptz,
  completed_at timestamptz,

  invitation_id uuid
    references public.review_invitations(id)
    on delete set null,

  notification_delivery_id uuid
    references public.notification_deliveries(id)
    on delete set null,

  last_error text,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint review_invitation_jobs_booking_unique
    unique (booking_id),

  constraint review_invitation_jobs_attempt_count_check
    check (
      attempt_count between 0 and 20
    ),

  constraint review_invitation_jobs_last_error_length_check
    check (
      last_error is null
      or char_length(last_error) <= 2000
    )
);

create index review_invitation_jobs_due_idx
  on public.review_invitation_jobs (
    status,
    run_after,
    created_at
  )
  where status in (
    'pending',
    'processing',
    'failed'
  );

create index review_invitation_jobs_business_status_idx
  on public.review_invitation_jobs (
    business_id,
    status,
    created_at desc
  );

create trigger review_invitation_jobs_set_updated_at
before update
on public.review_invitation_jobs
for each row
execute function public.set_updated_at();

create or replace function public.queue_review_invitation_after_completion()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status = 'completed'
    and old.status is distinct from new.status
  then
    insert into public.review_invitation_jobs (
      business_id,
      booking_id,
      run_after
    )
    select
      new.business_id,
      new.id,
      now() +
        make_interval(
          hours =>
            review_settings.invitation_delay_hours
        )
    from public.review_settings
    inner join public.businesses
      on businesses.id =
        review_settings.business_id
    where review_settings.business_id =
        new.business_id
      and review_settings.reviews_enabled =
        true
      and review_settings.verified_reviews_enabled =
        true
      and businesses.is_active =
        true
      and businesses.publication_status =
        'published'
      and new.customer_email is not null
      and char_length(
        trim(
          new.customer_email
        )
      ) > 0
      and not exists (
        select 1
        from public.reviews
        where reviews.booking_id =
          new.id
      )
    on conflict (
      booking_id
    )
    do nothing;
  end if;

  return new;
end;
$$;

revoke all
on function public.queue_review_invitation_after_completion()
from public, anon, authenticated;

create trigger bookings_queue_review_invitation
after update of status
on public.bookings
for each row
execute function public.queue_review_invitation_after_completion();

create or replace function public.claim_due_review_invitation_jobs(
  p_limit integer default 50
)
returns table (
  job_id uuid,
  business_id uuid,
  booking_id uuid,
  attempt_count integer
)
language sql
security definer
set search_path = public, pg_temp
as $$
  with candidates as (
    select
      review_invitation_jobs.id
    from public.review_invitation_jobs
    where (
      (
        review_invitation_jobs.status in (
          'pending',
          'failed'
        )
        and review_invitation_jobs.run_after <=
          now()
      )
      or (
        review_invitation_jobs.status =
          'processing'
        and review_invitation_jobs.claimed_at <
          now() - interval '15 minutes'
      )
    )
      and review_invitation_jobs.attempt_count <
        5
    order by
      review_invitation_jobs.run_after,
      review_invitation_jobs.created_at
    for update skip locked
    limit greatest(
      least(
        coalesce(
          p_limit,
          50
        ),
        250
      ),
      1
    )
  )
  update public.review_invitation_jobs
  set
    status = 'processing',
    attempt_count =
      review_invitation_jobs.attempt_count + 1,
    claimed_at = now(),
    last_attempt_at = now(),
    completed_at = null,
    last_error = null
  from candidates
  where review_invitation_jobs.id =
    candidates.id
  returning
    review_invitation_jobs.id,
    review_invitation_jobs.business_id,
    review_invitation_jobs.booking_id,
    review_invitation_jobs.attempt_count;
$$;

revoke all
on function public.claim_due_review_invitation_jobs(integer)
from public, anon, authenticated;

grant execute
on function public.claim_due_review_invitation_jobs(integer)
to service_role;

create or replace function public.prepare_review_invitation_delivery(
  p_job_id uuid,
  p_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_job public.review_invitation_jobs%rowtype;

  v_business_name text;
  v_business_slug text;
  v_default_locale text;
  v_timezone text;

  v_customer_name text;
  v_customer_email text;
  v_booking_starts_at timestamptz;
  v_booking_status public.booking_status;

  v_service_name jsonb;
  v_employee_name text;

  v_reviews_enabled boolean;
  v_verified_enabled boolean;
  v_expiry_days integer;

  v_invitation_id uuid;
  v_expires_at timestamptz;
  v_existing_status public.review_invitation_status;
  v_existing_sent_at timestamptz;
  v_existing_used_at timestamptz;
begin
  if p_job_id is null
    or p_token_hash is null
    or p_token_hash !~ '^[0-9a-f]{64}$'
  then
    raise exception
      'REVIEW_INVITATION_PREPARE_INVALID';
  end if;

  select *
  into v_job
  from public.review_invitation_jobs
  where review_invitation_jobs.id =
      p_job_id
  for update;

  if not found
    or v_job.status <>
      'processing'
  then
    raise exception
      'REVIEW_INVITATION_JOB_NOT_PROCESSING';
  end if;

  select
    businesses.name,
    businesses.slug,
    businesses.default_locale,
    businesses.timezone,
    bookings.customer_name,
    bookings.customer_email,
    bookings.starts_at,
    bookings.status,
    services.name,
    employees.name,
    review_settings.reviews_enabled,
    review_settings.verified_reviews_enabled,
    review_settings.invitation_expiry_days
  into
    v_business_name,
    v_business_slug,
    v_default_locale,
    v_timezone,
    v_customer_name,
    v_customer_email,
    v_booking_starts_at,
    v_booking_status,
    v_service_name,
    v_employee_name,
    v_reviews_enabled,
    v_verified_enabled,
    v_expiry_days
  from public.bookings
  inner join public.businesses
    on businesses.id =
      bookings.business_id
  inner join public.review_settings
    on review_settings.business_id =
      bookings.business_id
  inner join public.services
    on services.id =
      bookings.service_id
  inner join public.employees
    on employees.id =
      bookings.employee_id
  where bookings.id =
      v_job.booking_id
    and bookings.business_id =
      v_job.business_id
    and businesses.is_active =
      true
    and businesses.publication_status =
      'published';

  if not found
    or v_booking_status <>
      'completed'
    or v_reviews_enabled is not true
    or v_verified_enabled is not true
    or v_customer_email is null
    or char_length(
      trim(
        v_customer_email
      )
    ) = 0
    or exists (
      select 1
      from public.reviews
      where reviews.booking_id =
        v_job.booking_id
    )
  then
    update public.review_invitation_jobs
    set
      status = 'skipped',
      completed_at = now(),
      claimed_at = null,
      last_error =
        'REVIEW_INVITATION_NOT_ELIGIBLE'
    where id =
      v_job.id;

    return jsonb_build_object(
      'eligible',
      false,
      'reason',
      'REVIEW_INVITATION_NOT_ELIGIBLE'
    );
  end if;

  select
    review_invitations.status,
    review_invitations.sent_at,
    review_invitations.used_at
  into
    v_existing_status,
    v_existing_sent_at,
    v_existing_used_at
  from public.review_invitations
  where review_invitations.booking_id =
      v_job.booking_id;

  if found
    and (
      v_existing_sent_at is not null
      or v_existing_used_at is not null
      or v_existing_status in (
        'sent',
        'opened',
        'used',
        'revoked'
      )
    )
  then
    update public.review_invitation_jobs
    set
      status =
        case
          when v_existing_status in (
            'sent',
            'opened',
            'used'
          )
            then 'sent'::public.review_invitation_job_status
          else 'skipped'::public.review_invitation_job_status
        end,
      completed_at = now(),
      claimed_at = null,
      last_error =
        'REVIEW_INVITATION_ALREADY_FINAL'
    where id =
      v_job.id;

    return jsonb_build_object(
      'eligible',
      false,
      'reason',
      'REVIEW_INVITATION_ALREADY_FINAL'
    );
  end if;

  delete from public.review_invitations
  where review_invitations.booking_id =
      v_job.booking_id
    and review_invitations.sent_at is null
    and review_invitations.used_at is null
    and review_invitations.status in (
      'pending',
      'failed',
      'expired'
    );

  v_expires_at :=
    now() +
    make_interval(
      days =>
        v_expiry_days
    );

  insert into public.review_invitations (
    business_id,
    booking_id,
    channel,
    status,
    token_hash,
    expires_at,
    attempt_count
  )
  values (
    v_job.business_id,
    v_job.booking_id,
    'email',
    'pending',
    p_token_hash,
    v_expires_at,
    v_job.attempt_count
  )
  returning id
  into v_invitation_id;

  update public.review_invitation_jobs
  set
    invitation_id =
      v_invitation_id,
    notification_delivery_id =
      null
  where id =
    v_job.id;

  return jsonb_build_object(
    'eligible',
    true,
    'reason',
    null,
    'invitationId',
    v_invitation_id,
    'recipient',
    trim(
      v_customer_email
    ),
    'businessName',
    v_business_name,
    'businessSlug',
    v_business_slug,
    'defaultLocale',
    v_default_locale,
    'timezone',
    v_timezone,
    'customerName',
    v_customer_name,
    'serviceName',
    v_service_name,
    'employeeName',
    v_employee_name,
    'bookingStartsAt',
    v_booking_starts_at,
    'expiresAt',
    v_expires_at
  );
end;
$$;

revoke all
on function public.prepare_review_invitation_delivery(uuid, text)
from public, anon, authenticated;

grant execute
on function public.prepare_review_invitation_delivery(uuid, text)
to service_role;

create or replace function public.complete_review_invitation_delivery(
  p_job_id uuid,
  p_invitation_id uuid,
  p_notification_delivery_id uuid,
  p_outcome text,
  p_error text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_job public.review_invitation_jobs%rowtype;
  v_error text;
  v_backoff_minutes integer;
begin
  if p_outcome not in (
    'sent',
    'skipped',
    'failed'
  )
  then
    raise exception
      'REVIEW_INVITATION_OUTCOME_INVALID';
  end if;

  select *
  into v_job
  from public.review_invitation_jobs
  where review_invitation_jobs.id =
      p_job_id
  for update;

  if not found then
    raise exception
      'REVIEW_INVITATION_JOB_NOT_FOUND';
  end if;

  v_error :=
    left(
      nullif(
        trim(
          coalesce(
            p_error,
            ''
          )
        ),
        ''
      ),
      2000
    );

  if p_outcome = 'sent' then
    if p_invitation_id is null then
      raise exception
        'REVIEW_INVITATION_ID_REQUIRED';
    end if;

    update public.review_invitations
    set
      status = 'sent',
      sent_at =
        coalesce(
          sent_at,
          now()
        ),
      attempt_count =
        greatest(
          attempt_count,
          v_job.attempt_count
        ),
      last_error = null
    where id =
        p_invitation_id
      and booking_id =
        v_job.booking_id;

    if not found then
      raise exception
        'REVIEW_INVITATION_NOT_FOUND';
    end if;

    update public.review_invitation_jobs
    set
      status = 'sent',
      invitation_id =
        p_invitation_id,
      notification_delivery_id =
        p_notification_delivery_id,
      completed_at = now(),
      claimed_at = null,
      last_error = null
    where id =
      v_job.id;

    return;
  end if;

  delete from public.review_invitations
  where id =
      p_invitation_id
    and booking_id =
      v_job.booking_id
    and sent_at is null
    and used_at is null;

  if p_outcome = 'skipped' then
    update public.review_invitation_jobs
    set
      status = 'skipped',
      invitation_id = null,
      notification_delivery_id =
        p_notification_delivery_id,
      completed_at = now(),
      claimed_at = null,
      last_error =
        coalesce(
          v_error,
          'REVIEW_INVITATION_SKIPPED'
        )
    where id =
      v_job.id;

    return;
  end if;

  v_backoff_minutes :=
    least(
      360,
      15 *
      greatest(
        1,
        power(
          2,
          greatest(
            v_job.attempt_count - 1,
            0
          )
        )::integer
      )
    );

  update public.review_invitation_jobs
  set
    status = 'failed',
    invitation_id = null,
    notification_delivery_id =
      p_notification_delivery_id,
    run_after =
      now() +
      make_interval(
        mins =>
          v_backoff_minutes
      ),
    completed_at = null,
    claimed_at = null,
    last_error =
      coalesce(
        v_error,
        'REVIEW_INVITATION_DELIVERY_FAILED'
      )
  where id =
    v_job.id;
end;
$$;

revoke all
on function public.complete_review_invitation_delivery(uuid, uuid, uuid, text, text)
from public, anon, authenticated;

grant execute
on function public.complete_review_invitation_delivery(uuid, uuid, uuid, text, text)
to service_role;

alter table public.review_invitation_jobs
enable row level security;

create policy review_invitation_jobs_admin_select
on public.review_invitation_jobs
for select
to authenticated
using (
  public.can_manage_business_reviews(
    business_id
  )
);

revoke all
on table public.review_invitation_jobs
from anon, authenticated;

grant select
on table public.review_invitation_jobs
to authenticated;

commit;
