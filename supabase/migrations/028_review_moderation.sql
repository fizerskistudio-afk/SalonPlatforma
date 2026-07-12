begin;

create type public.review_moderation_action as enum (
  'status_changed',
  'reply_set',
  'reply_removed'
);

create table public.review_moderation_events (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  review_id uuid not null
    references public.reviews(id)
    on delete cascade,

  actor_user_id uuid
    references auth.users(id)
    on delete set null,

  action public.review_moderation_action
    not null,

  previous_status public.review_status,
  next_status public.review_status,

  reason text,

  metadata jsonb not null
    default '{}'::jsonb,

  created_at timestamptz not null
    default now(),

  constraint review_moderation_events_reason_length_check
    check (
      reason is null
      or char_length(reason) <= 1000
    ),

  constraint review_moderation_events_metadata_object_check
    check (
      jsonb_typeof(metadata) =
        'object'
    )
);

create index review_moderation_events_business_created_idx
  on public.review_moderation_events (
    business_id,
    created_at desc
  );

create index review_moderation_events_review_created_idx
  on public.review_moderation_events (
    review_id,
    created_at desc
  );

alter table public.review_moderation_events
enable row level security;

create policy review_moderation_events_admin_select
on public.review_moderation_events
for select
to authenticated
using (
  public.can_manage_business_reviews(
    business_id
  )
);

revoke all
on table public.review_moderation_events
from anon, authenticated;

grant select
on table public.review_moderation_events
to authenticated;

create or replace function public.moderate_review(
  p_review_id uuid,
  p_next_status public.review_status,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_review public.reviews%rowtype;
  v_actor_user_id uuid;
  v_reason text;
  v_transition_allowed boolean;
  v_moderated_at timestamptz;
begin
  v_actor_user_id :=
    auth.uid();

  if v_actor_user_id is null then
    raise exception
      'REVIEW_FORBIDDEN';
  end if;

  if p_review_id is null
    or p_next_status is null
  then
    raise exception
      'REVIEW_MODERATION_INVALID';
  end if;

  select *
  into v_review
  from public.reviews
  where reviews.id =
      p_review_id
  for update;

  if not found then
    raise exception
      'REVIEW_NOT_FOUND';
  end if;

  if not exists (
    select 1
    from public.business_members
    where business_members.business_id =
        v_review.business_id
      and business_members.user_id =
        v_actor_user_id
      and business_members.is_active =
        true
      and business_members.role in (
        'owner',
        'manager'
      )
  )
  then
    raise exception
      'REVIEW_FORBIDDEN';
  end if;

  if v_review.status =
      p_next_status
  then
    return jsonb_build_object(
      'reviewId',
      v_review.id,
      'previousStatus',
      v_review.status,
      'status',
      v_review.status,
      'changed',
      false
    );
  end if;

  v_transition_allowed :=
    case v_review.status
      when 'pending' then
        p_next_status in (
          'published',
          'rejected',
          'flagged',
          'archived'
        )

      when 'published' then
        p_next_status in (
          'flagged',
          'archived'
        )

      when 'rejected' then
        p_next_status in (
          'pending',
          'archived'
        )

      when 'flagged' then
        p_next_status in (
          'published',
          'rejected',
          'archived'
        )

      when 'archived' then
        p_next_status =
          'pending'

      else false
    end;

  if not v_transition_allowed then
    raise exception
      'REVIEW_TRANSITION_NOT_ALLOWED';
  end if;

  v_reason :=
    nullif(
      trim(
        coalesce(
          p_reason,
          ''
        )
      ),
      ''
    );

  if p_next_status in (
    'rejected',
    'flagged',
    'archived'
  )
    and (
      v_reason is null
      or char_length(v_reason) < 3
    )
  then
    raise exception
      'REVIEW_REASON_REQUIRED';
  end if;

  if v_reason is not null
    and char_length(v_reason) > 500
  then
    raise exception
      'REVIEW_REASON_TOO_LONG';
  end if;

  v_moderated_at :=
    now();

  update public.reviews
  set
    status =
      p_next_status,
    published_at =
      case
        when p_next_status =
          'published'
          then v_moderated_at
        else published_at
      end,
    moderated_at =
      v_moderated_at,
    moderated_by =
      v_actor_user_id
  where id =
    v_review.id;

  insert into public.review_moderation_events (
    business_id,
    review_id,
    actor_user_id,
    action,
    previous_status,
    next_status,
    reason,
    metadata
  )
  values (
    v_review.business_id,
    v_review.id,
    v_actor_user_id,
    'status_changed',
    v_review.status,
    p_next_status,
    v_reason,
    jsonb_build_object(
      'source',
      v_review.source,
      'verifiedVisit',
      v_review.is_verified_visit
    )
  );

  return jsonb_build_object(
    'reviewId',
    v_review.id,
    'previousStatus',
    v_review.status,
    'status',
    p_next_status,
    'changed',
    true,
    'moderatedAt',
    v_moderated_at
  );
end;
$$;

revoke all
on function public.moderate_review(uuid, public.review_status, text)
from public, anon;

grant execute
on function public.moderate_review(uuid, public.review_status, text)
to authenticated;

create or replace function public.set_review_owner_reply(
  p_review_id uuid,
  p_reply text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_review public.reviews%rowtype;
  v_actor_user_id uuid;
  v_reply text;
  v_action public.review_moderation_action;
  v_changed_at timestamptz;
begin
  v_actor_user_id :=
    auth.uid();

  if v_actor_user_id is null then
    raise exception
      'REVIEW_FORBIDDEN';
  end if;

  if p_review_id is null then
    raise exception
      'REVIEW_REPLY_INVALID';
  end if;

  select *
  into v_review
  from public.reviews
  where reviews.id =
      p_review_id
  for update;

  if not found then
    raise exception
      'REVIEW_NOT_FOUND';
  end if;

  if not exists (
    select 1
    from public.business_members
    where business_members.business_id =
        v_review.business_id
      and business_members.user_id =
        v_actor_user_id
      and business_members.is_active =
        true
      and business_members.role in (
        'owner',
        'manager'
      )
  )
  then
    raise exception
      'REVIEW_FORBIDDEN';
  end if;

  if v_review.source <>
      'platform'
  then
    raise exception
      'REVIEW_REPLY_NOT_SUPPORTED';
  end if;

  if v_review.status <>
      'published'
  then
    raise exception
      'REVIEW_REPLY_REQUIRES_PUBLISHED';
  end if;

  v_reply :=
    nullif(
      trim(
        coalesce(
          p_reply,
          ''
        )
      ),
      ''
    );

  if v_reply is not null
    and char_length(v_reply) < 2
  then
    raise exception
      'REVIEW_REPLY_TOO_SHORT';
  end if;

  if v_reply is not null
    and char_length(v_reply) > 2000
  then
    raise exception
      'REVIEW_REPLY_TOO_LONG';
  end if;

  v_changed_at :=
    now();

  v_action :=
    case
      when v_reply is null
        then 'reply_removed'::public.review_moderation_action
      else 'reply_set'::public.review_moderation_action
    end;

  update public.reviews
  set
    owner_reply =
      v_reply,
    owner_reply_at =
      case
        when v_reply is null
          then null
        else v_changed_at
      end,
    owner_reply_by =
      case
        when v_reply is null
          then null
        else v_actor_user_id
      end
  where id =
    v_review.id;

  insert into public.review_moderation_events (
    business_id,
    review_id,
    actor_user_id,
    action,
    previous_status,
    next_status,
    metadata
  )
  values (
    v_review.business_id,
    v_review.id,
    v_actor_user_id,
    v_action,
    v_review.status,
    v_review.status,
    jsonb_build_object(
      'previousReplyPresent',
      v_review.owner_reply is not null,
      'replyLength',
      coalesce(
        char_length(v_reply),
        0
      )
    )
  );

  return jsonb_build_object(
    'reviewId',
    v_review.id,
    'status',
    v_review.status,
    'replyPresent',
    v_reply is not null,
    'changedAt',
    v_changed_at
  );
end;
$$;

revoke all
on function public.set_review_owner_reply(uuid, text)
from public, anon;

grant execute
on function public.set_review_owner_reply(uuid, text)
to authenticated;

commit;
