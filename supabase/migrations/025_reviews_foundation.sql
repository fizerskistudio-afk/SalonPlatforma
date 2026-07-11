begin;

-- =========================================================
-- REVIEW ENUMS
-- =========================================================

create type public.review_source as enum (
  'platform',
  'google',
  'manual-testimonial',
  'demo'
);

create type public.review_status as enum (
  'pending',
  'published',
  'rejected',
  'flagged',
  'archived'
);

create type public.review_invitation_channel as enum (
  'email',
  'sms',
  'manual'
);

create type public.review_invitation_status as enum (
  'pending',
  'sent',
  'opened',
  'used',
  'expired',
  'revoked',
  'failed'
);

create type public.review_provider as enum (
  'google'
);

create type public.review_provider_status as enum (
  'disconnected',
  'pending',
  'connected',
  'error'
);

-- =========================================================
-- TENANT REVIEW SETTINGS
-- =========================================================

create table public.review_settings (
  business_id uuid primary key
    references public.businesses(id)
    on delete cascade,

  reviews_enabled boolean not null default true,
  direct_reviews_enabled boolean not null default true,
  verified_reviews_enabled boolean not null default true,
  testimonials_enabled boolean not null default true,
  google_reviews_enabled boolean not null default false,

  moderation_required boolean not null default true,
  show_rating_summary boolean not null default true,
  allow_demo_content boolean not null default false,

  invitation_delay_hours integer not null default 2,
  invitation_expiry_days integer not null default 30,

  google_review_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint review_settings_invitation_delay_check
    check (
      invitation_delay_hours between 0 and 720
    ),

  constraint review_settings_invitation_expiry_check
    check (
      invitation_expiry_days between 1 and 365
    ),

  constraint review_settings_google_review_url_check
    check (
      google_review_url is null
      or google_review_url ~ '^https://'
    )
);

insert into public.review_settings (
  business_id
)
select businesses.id
from public.businesses
on conflict (business_id)
do nothing;

create or replace function public.ensure_business_review_settings()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  insert into public.review_settings (
    business_id
  )
  values (
    new.id
  )
  on conflict (business_id)
  do nothing;

  return new;
end;
$$;

create trigger businesses_ensure_review_settings
after insert
on public.businesses
for each row
execute function public.ensure_business_review_settings();

-- =========================================================
-- REVIEW PROVIDER METADATA
-- OAuth/access tokens are intentionally not stored here.
-- =========================================================

create table public.review_provider_connections (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  provider public.review_provider not null,
  status public.review_provider_status not null
    default 'disconnected',

  external_account_id text,
  external_location_id text,
  place_id text,

  metadata jsonb not null default '{}'::jsonb,

  last_synced_at timestamptz,
  last_error text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint review_provider_connections_business_provider_unique
    unique (business_id, provider),

  constraint review_provider_connections_metadata_object_check
    check (
      jsonb_typeof(metadata) = 'object'
    ),

  constraint review_provider_connections_last_error_length_check
    check (
      last_error is null
      or char_length(last_error) <= 2000
    )
);

-- =========================================================
-- VERIFIED VISIT INVITATIONS
-- Only SHA-256 hashes are stored. Raw tokens never enter DB.
-- =========================================================

create table public.review_invitations (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  booking_id uuid not null
    references public.bookings(id)
    on delete restrict,

  channel public.review_invitation_channel not null
    default 'email',

  status public.review_invitation_status not null
    default 'pending',

  token_hash text not null,

  expires_at timestamptz not null,

  sent_at timestamptz,
  opened_at timestamptz,
  used_at timestamptz,
  revoked_at timestamptz,

  attempt_count integer not null default 0,
  last_error text,

  created_by uuid
    references auth.users(id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint review_invitations_booking_unique
    unique (booking_id),

  constraint review_invitations_token_hash_unique
    unique (token_hash),

  constraint review_invitations_token_hash_format_check
    check (
      token_hash ~ '^[0-9a-f]{64}$'
    ),

  constraint review_invitations_expiry_check
    check (
      expires_at > created_at
    ),

  constraint review_invitations_attempt_count_check
    check (
      attempt_count between 0 and 100
    ),

  constraint review_invitations_used_status_check
    check (
      status <> 'used'
      or used_at is not null
    ),

  constraint review_invitations_revoked_status_check
    check (
      status <> 'revoked'
      or revoked_at is not null
    ),

  constraint review_invitations_last_error_length_check
    check (
      last_error is null
      or char_length(last_error) <= 2000
    )
);

-- =========================================================
-- REVIEWS
-- =========================================================

create table public.reviews (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  source public.review_source not null,
  status public.review_status not null
    default 'pending',

  booking_id uuid
    references public.bookings(id)
    on delete restrict,

  invitation_id uuid
    references public.review_invitations(id)
    on delete restrict,

  customer_id uuid
    references public.customers(id)
    on delete set null,

  service_id uuid
    references public.services(id)
    on delete set null,

  employee_id uuid
    references public.employees(id)
    on delete set null,

  external_id text,
  external_url text,

  author_name text not null,
  author_avatar_url text,

  rating smallint,
  body text not null,
  language_code text,

  is_verified_visit boolean not null
    default false,

  provider_metadata jsonb not null
    default '{}'::jsonb,

  owner_reply text,
  owner_reply_at timestamptz,
  owner_reply_by uuid
    references auth.users(id)
    on delete set null,

  provider_published_at timestamptz,

  published_at timestamptz,
  moderated_at timestamptz,
  moderated_by uuid
    references auth.users(id)
    on delete set null,

  is_featured boolean not null default false,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint reviews_rating_source_check
    check (
      (
        source = 'manual-testimonial'
        and (
          rating is null
          or rating between 1 and 5
        )
      )
      or
      (
        source <> 'manual-testimonial'
        and rating is not null
        and rating between 1 and 5
      )
    ),

  constraint reviews_verified_visit_check
    check (
      (
        is_verified_visit = false
        and booking_id is null
        and invitation_id is null
      )
      or
      (
        is_verified_visit = true
        and source = 'platform'
        and booking_id is not null
        and invitation_id is not null
      )
    ),

  constraint reviews_google_external_id_check
    check (
      (
        source = 'google'
        and external_id is not null
        and char_length(trim(external_id)) > 0
      )
      or
      (
        source <> 'google'
        and external_id is null
      )
    ),

  constraint reviews_author_name_length_check
    check (
      char_length(trim(author_name))
      between 1 and 160
    ),

  constraint reviews_body_length_check
    check (
      char_length(trim(body))
      between 2 and 5000
    ),

  constraint reviews_language_code_check
    check (
      language_code is null
      or language_code
        ~ '^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$'
    ),

  constraint reviews_external_url_check
    check (
      external_url is null
      or external_url ~ '^https://'
    ),

  constraint reviews_author_avatar_url_check
    check (
      author_avatar_url is null
      or author_avatar_url ~ '^https://'
    ),

  constraint reviews_provider_metadata_object_check
    check (
      jsonb_typeof(provider_metadata) = 'object'
    ),

  constraint reviews_owner_reply_length_check
    check (
      owner_reply is null
      or char_length(owner_reply) <= 5000
    ),

  constraint reviews_published_at_check
    check (
      status <> 'published'
      or published_at is not null
    )
);

-- =========================================================
-- TRUST VALIDATION
-- =========================================================

create or replace function public.validate_review_invitation_row()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  booking_business_id uuid;
  booking_status_value public.booking_status;
begin
  if tg_op = 'UPDATE'
    and (
      new.business_id is distinct from old.business_id
      or new.booking_id is distinct from old.booking_id
      or new.token_hash is distinct from old.token_hash
    )
  then
    raise exception
      'REVIEW_INVITATION_IDENTITY_IMMUTABLE';
  end if;

  select
    bookings.business_id,
    bookings.status
  into
    booking_business_id,
    booking_status_value
  from public.bookings
  where bookings.id = new.booking_id;

  if booking_business_id is null then
    raise exception
      'REVIEW_INVITATION_BOOKING_NOT_FOUND';
  end if;

  if booking_business_id <> new.business_id then
    raise exception
      'REVIEW_INVITATION_CROSS_TENANT';
  end if;

  if booking_status_value <> 'completed' then
    raise exception
      'REVIEW_INVITATION_BOOKING_NOT_COMPLETED';
  end if;

  if tg_op = 'INSERT'
    and new.expires_at <= now()
  then
    raise exception
      'REVIEW_INVITATION_ALREADY_EXPIRED';
  end if;

  return new;
end;
$$;

create trigger review_invitations_validate
before insert or update
on public.review_invitations
for each row
execute function public.validate_review_invitation_row();

create or replace function public.validate_review_row()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  booking_business_id uuid;
  booking_status_value public.booking_status;
  booking_customer_id uuid;
  booking_service_id uuid;
  booking_employee_id uuid;

  invitation_business_id uuid;
  invitation_booking_id uuid;
  invitation_status_value public.review_invitation_status;
  invitation_expires_at timestamptz;
  invitation_used_at timestamptz;
begin
  if tg_op = 'UPDATE'
    and (
      new.business_id is distinct from old.business_id
      or new.source is distinct from old.source
      or new.booking_id is distinct from old.booking_id
      or new.invitation_id is distinct from old.invitation_id
      or new.external_id is distinct from old.external_id
      or new.is_verified_visit is distinct from old.is_verified_visit
      or new.created_at is distinct from old.created_at
    )
  then
    raise exception
      'REVIEW_TRUST_IDENTITY_IMMUTABLE';
  end if;

  if new.booking_id is not null then
    select
      bookings.business_id,
      bookings.status,
      bookings.customer_id,
      bookings.service_id,
      bookings.employee_id
    into
      booking_business_id,
      booking_status_value,
      booking_customer_id,
      booking_service_id,
      booking_employee_id
    from public.bookings
    where bookings.id = new.booking_id;

    if booking_business_id is null then
      raise exception
        'REVIEW_BOOKING_NOT_FOUND';
    end if;

    if booking_business_id <> new.business_id then
      raise exception
        'REVIEW_BOOKING_CROSS_TENANT';
    end if;

    if booking_status_value <> 'completed' then
      raise exception
        'REVIEW_BOOKING_NOT_COMPLETED';
    end if;

    new.customer_id :=
      booking_customer_id;

    new.service_id :=
      booking_service_id;

    new.employee_id :=
      booking_employee_id;
  end if;

  if new.invitation_id is not null then
    select
      review_invitations.business_id,
      review_invitations.booking_id,
      review_invitations.status,
      review_invitations.expires_at,
      review_invitations.used_at
    into
      invitation_business_id,
      invitation_booking_id,
      invitation_status_value,
      invitation_expires_at,
      invitation_used_at
    from public.review_invitations
    where review_invitations.id =
      new.invitation_id;

    if invitation_business_id is null then
      raise exception
        'REVIEW_INVITATION_NOT_FOUND';
    end if;

    if invitation_business_id <>
      new.business_id
    then
      raise exception
        'REVIEW_INVITATION_CROSS_TENANT';
    end if;

    if invitation_booking_id <>
      new.booking_id
    then
      raise exception
        'REVIEW_INVITATION_BOOKING_MISMATCH';
    end if;

    if tg_op = 'INSERT'
      and (
        invitation_status_value in (
          'used',
          'expired',
          'revoked'
        )
        or invitation_used_at is not null
        or invitation_expires_at <= now()
      )
    then
      raise exception
        'REVIEW_INVITATION_NOT_USABLE';
    end if;
  end if;

  if new.customer_id is not null
    and not exists (
      select 1
      from public.customers
      where customers.id =
        new.customer_id
        and customers.business_id =
          new.business_id
    )
  then
    raise exception
      'REVIEW_CUSTOMER_CROSS_TENANT';
  end if;

  if new.service_id is not null
    and not exists (
      select 1
      from public.services
      where services.id =
        new.service_id
        and services.business_id =
          new.business_id
    )
  then
    raise exception
      'REVIEW_SERVICE_CROSS_TENANT';
  end if;

  if new.employee_id is not null
    and not exists (
      select 1
      from public.employees
      where employees.id =
        new.employee_id
        and employees.business_id =
          new.business_id
    )
  then
    raise exception
      'REVIEW_EMPLOYEE_CROSS_TENANT';
  end if;

  if new.source = 'demo'
    and new.status = 'published'
    and not exists (
      select 1
      from public.review_settings
      where review_settings.business_id =
        new.business_id
        and review_settings.allow_demo_content =
          true
    )
  then
    raise exception
      'REVIEW_DEMO_CONTENT_NOT_ALLOWED';
  end if;

  if new.status = 'published'
    and new.published_at is null
  then
    new.published_at := now();
  end if;

  return new;
end;
$$;

create trigger reviews_validate
before insert or update
on public.reviews
for each row
execute function public.validate_review_row();

-- =========================================================
-- INDEXES AND UNIQUENESS
-- =========================================================

create index reviews_business_status_published_idx
  on public.reviews (
    business_id,
    status,
    published_at desc,
    created_at desc
  );

create index reviews_business_source_status_idx
  on public.reviews (
    business_id,
    source,
    status
  );

create index reviews_business_featured_sort_idx
  on public.reviews (
    business_id,
    is_featured desc,
    sort_order,
    created_at desc
  )
  where status = 'published';

create unique index reviews_booking_unique
  on public.reviews (
    booking_id
  )
  where booking_id is not null;

create unique index reviews_invitation_unique
  on public.reviews (
    invitation_id
  )
  where invitation_id is not null;

create unique index reviews_google_external_unique
  on public.reviews (
    business_id,
    external_id
  )
  where source = 'google'
    and external_id is not null;

create index review_invitations_business_status_idx
  on public.review_invitations (
    business_id,
    status,
    expires_at
  );

create index review_invitations_expiry_idx
  on public.review_invitations (
    expires_at
  )
  where status in (
    'pending',
    'sent',
    'opened'
  );

create index review_provider_connections_business_status_idx
  on public.review_provider_connections (
    business_id,
    status
  );

-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

create trigger review_settings_set_updated_at
before update
on public.review_settings
for each row
execute function public.set_updated_at();

create trigger review_provider_connections_set_updated_at
before update
on public.review_provider_connections
for each row
execute function public.set_updated_at();

create trigger review_invitations_set_updated_at
before update
on public.review_invitations
for each row
execute function public.set_updated_at();

create trigger reviews_set_updated_at
before update
on public.reviews
for each row
execute function public.set_updated_at();

-- =========================================================
-- TENANT AUTHORIZATION HELPER
-- =========================================================

create or replace function public.can_manage_business_reviews(
  input_business_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.business_members
    where business_members.business_id =
      input_business_id
      and business_members.user_id =
        auth.uid()
      and business_members.is_active =
        true
      and business_members.role in (
        'owner',
        'manager'
      )
  );
$$;

revoke all
on function public.can_manage_business_reviews(uuid)
from public;

grant execute
on function public.can_manage_business_reviews(uuid)
to authenticated;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.review_settings
enable row level security;

alter table public.review_provider_connections
enable row level security;

alter table public.review_invitations
enable row level security;

alter table public.reviews
enable row level security;

create policy review_settings_admin_select
on public.review_settings
for select
to authenticated
using (
  public.can_manage_business_reviews(
    business_id
  )
);

create policy review_settings_admin_update
on public.review_settings
for update
to authenticated
using (
  public.can_manage_business_reviews(
    business_id
  )
)
with check (
  public.can_manage_business_reviews(
    business_id
  )
);

create policy review_provider_connections_admin_select
on public.review_provider_connections
for select
to authenticated
using (
  public.can_manage_business_reviews(
    business_id
  )
);

create policy review_invitations_admin_select
on public.review_invitations
for select
to authenticated
using (
  public.can_manage_business_reviews(
    business_id
  )
);

create policy reviews_public_select_published
on public.reviews
for select
to anon, authenticated
using (
  status = 'published'
  and exists (
    select 1
    from public.businesses
    inner join public.review_settings
      on review_settings.business_id =
        businesses.id
    where businesses.id =
      reviews.business_id
      and businesses.is_active =
        true
      and review_settings.reviews_enabled =
        true
  )
);

create policy reviews_admin_select
on public.reviews
for select
to authenticated
using (
  public.can_manage_business_reviews(
    business_id
  )
);

-- Mutations are intentionally server-only until the reviewed
-- submission and moderation RPC/API segments are added.

revoke all
on table public.review_settings
from anon, authenticated;

revoke all
on table public.review_provider_connections
from anon, authenticated;

revoke all
on table public.review_invitations
from anon, authenticated;

revoke all
on table public.reviews
from anon, authenticated;

grant select
on table public.reviews
to anon, authenticated;

grant select, update
on table public.review_settings
to authenticated;

grant select
on table public.review_provider_connections
to authenticated;

grant select
on table public.review_invitations
to authenticated;

commit;
