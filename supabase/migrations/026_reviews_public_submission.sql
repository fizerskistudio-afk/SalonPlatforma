begin;

-- =========================================================
-- DIRECT PUBLIC REVIEW SUBMISSION
-- =========================================================

create or replace function public.submit_direct_review(
  input_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_business_slug text;
  v_business_id uuid;
  v_moderation_required boolean;

  v_author_name text;
  v_rating smallint;
  v_body text;
  v_language_code text;

  v_status public.review_status;
  v_review_id uuid;
begin
  if input_payload is null
    or jsonb_typeof(input_payload) <> 'object'
  then
    raise exception 'INVALID_REVIEW_PAYLOAD';
  end if;

  if jsonb_typeof(input_payload -> 'businessSlug') <> 'string'
    or jsonb_typeof(input_payload -> 'authorName') <> 'string'
    or jsonb_typeof(input_payload -> 'rating') <> 'number'
    or jsonb_typeof(input_payload -> 'body') <> 'string'
  then
    raise exception 'INVALID_REVIEW_PAYLOAD';
  end if;

  if input_payload ? 'languageCode'
    and input_payload -> 'languageCode' <> 'null'::jsonb
    and jsonb_typeof(input_payload -> 'languageCode') <> 'string'
  then
    raise exception 'INVALID_REVIEW_PAYLOAD';
  end if;

  v_business_slug :=
    trim(input_payload ->> 'businessSlug');

  v_author_name :=
    trim(input_payload ->> 'authorName');

  v_body :=
    trim(input_payload ->> 'body');

  if (input_payload ->> 'rating') !~ '^[1-5]$' then
    raise exception 'INVALID_REVIEW_PAYLOAD';
  end if;

  v_rating :=
    (input_payload ->> 'rating')::smallint;

  v_language_code :=
    nullif(
      trim(input_payload ->> 'languageCode'),
      ''
    );

  if v_business_slug = ''
    or v_business_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or char_length(v_author_name) not between 2 and 160
    or char_length(v_body) not between 2 and 2000
    or (
      v_language_code is not null
      and v_language_code not in (
        'sr-Latn',
        'mk',
        'hr',
        'sq',
        'en',
        'de',
        'fr'
      )
    )
  then
    raise exception 'INVALID_REVIEW_PAYLOAD';
  end if;

  select
    businesses.id,
    review_settings.moderation_required
  into
    v_business_id,
    v_moderation_required
  from public.businesses
  inner join public.review_settings
    on review_settings.business_id =
      businesses.id
  where businesses.slug =
      v_business_slug
    and businesses.is_active =
      true
    and businesses.publication_status =
      'published'
    and review_settings.reviews_enabled =
      true
    and review_settings.direct_reviews_enabled =
      true;

  if v_business_id is null then
    raise exception
      'REVIEW_SUBMISSION_NOT_AVAILABLE';
  end if;

  v_status :=
    case
      when v_moderation_required
        then 'pending'::public.review_status
      else 'published'::public.review_status
    end;

  insert into public.reviews (
    business_id,
    source,
    status,
    author_name,
    rating,
    body,
    language_code,
    is_verified_visit,
    published_at
  )
  values (
    v_business_id,
    'platform',
    v_status,
    v_author_name,
    v_rating,
    v_body,
    v_language_code,
    false,
    case
      when v_status = 'published'
        then now()
      else null
    end
  )
  returning id
  into v_review_id;

  return jsonb_build_object(
    'reviewId', v_review_id,
    'status', v_status,
    'isVerifiedVisit', false
  );
end;
$$;

revoke all
on function public.submit_direct_review(jsonb)
from public, anon, authenticated;

grant execute
on function public.submit_direct_review(jsonb)
to service_role;

-- =========================================================
-- VERIFIED INVITATION CONTEXT
-- No customer PII is returned to the bearer.
-- =========================================================

create or replace function public.get_review_invitation_context(
  p_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_business_slug text;
  v_business_name text;
  v_default_locale text;
  v_booking_starts_at timestamptz;
  v_service_name jsonb;
  v_employee_name text;
  v_expires_at timestamptz;
begin
  if p_token_hash is null
    or p_token_hash !~ '^[0-9a-f]{64}$'
  then
    raise exception 'REVIEW_LINK_INVALID';
  end if;

  select
    businesses.slug,
    businesses.name,
    businesses.default_locale,
    bookings.starts_at,
    services.name,
    employees.name,
    review_invitations.expires_at
  into
    v_business_slug,
    v_business_name,
    v_default_locale,
    v_booking_starts_at,
    v_service_name,
    v_employee_name,
    v_expires_at
  from public.review_invitations
  inner join public.businesses
    on businesses.id =
      review_invitations.business_id
  inner join public.review_settings
    on review_settings.business_id =
      review_invitations.business_id
  inner join public.bookings
    on bookings.id =
      review_invitations.booking_id
  inner join public.services
    on services.id =
      bookings.service_id
  inner join public.employees
    on employees.id =
      bookings.employee_id
  where review_invitations.token_hash =
      p_token_hash
    and review_invitations.status in (
      'pending',
      'sent',
      'opened'
    )
    and review_invitations.used_at is null
    and review_invitations.revoked_at is null
    and review_invitations.expires_at > now()
    and bookings.status =
      'completed'
    and businesses.is_active =
      true
    and businesses.publication_status =
      'published'
    and review_settings.reviews_enabled =
      true
    and review_settings.verified_reviews_enabled =
      true;

  if not found then
    raise exception 'REVIEW_LINK_INVALID';
  end if;

  return jsonb_build_object(
    'businessSlug', v_business_slug,
    'businessName', v_business_name,
    'defaultLocale', v_default_locale,
    'bookingStartsAt', v_booking_starts_at,
    'serviceName', v_service_name,
    'employeeName', v_employee_name,
    'expiresAt', v_expires_at
  );
end;
$$;

revoke all
on function public.get_review_invitation_context(text)
from public, anon, authenticated;

grant execute
on function public.get_review_invitation_context(text)
to service_role;

-- =========================================================
-- ATOMIC VERIFIED REVIEW SUBMISSION
-- Invitation row is locked and consumed in the same transaction.
-- =========================================================

create or replace function public.submit_verified_review(
  p_token_hash text,
  input_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invitation_id uuid;
  v_business_id uuid;
  v_booking_id uuid;
  v_invitation_status public.review_invitation_status;
  v_expires_at timestamptz;
  v_used_at timestamptz;
  v_revoked_at timestamptz;

  v_reviews_enabled boolean;
  v_verified_reviews_enabled boolean;
  v_moderation_required boolean;
  v_business_active boolean;
  v_publication_status text;
  v_booking_status public.booking_status;

  v_author_name text;
  v_rating smallint;
  v_body text;
  v_language_code text;

  v_status public.review_status;
  v_review_id uuid;
begin
  if p_token_hash is null
    or p_token_hash !~ '^[0-9a-f]{64}$'
    or input_payload is null
    or jsonb_typeof(input_payload) <> 'object'
  then
    raise exception 'REVIEW_LINK_INVALID';
  end if;

  if jsonb_typeof(input_payload -> 'authorName') <> 'string'
    or jsonb_typeof(input_payload -> 'rating') <> 'number'
    or jsonb_typeof(input_payload -> 'body') <> 'string'
  then
    raise exception 'INVALID_REVIEW_PAYLOAD';
  end if;

  if input_payload ? 'languageCode'
    and input_payload -> 'languageCode' <> 'null'::jsonb
    and jsonb_typeof(input_payload -> 'languageCode') <> 'string'
  then
    raise exception 'INVALID_REVIEW_PAYLOAD';
  end if;

  v_author_name :=
    trim(input_payload ->> 'authorName');

  v_body :=
    trim(input_payload ->> 'body');

  if (input_payload ->> 'rating') !~ '^[1-5]$' then
    raise exception 'INVALID_REVIEW_PAYLOAD';
  end if;

  v_rating :=
    (input_payload ->> 'rating')::smallint;

  v_language_code :=
    nullif(
      trim(input_payload ->> 'languageCode'),
      ''
    );

  if char_length(v_author_name) not between 2 and 160
    or char_length(v_body) not between 2 and 2000
    or (
      v_language_code is not null
      and v_language_code not in (
        'sr-Latn',
        'mk',
        'hr',
        'sq',
        'en',
        'de',
        'fr'
      )
    )
  then
    raise exception 'INVALID_REVIEW_PAYLOAD';
  end if;

  select
    review_invitations.id,
    review_invitations.business_id,
    review_invitations.booking_id,
    review_invitations.status,
    review_invitations.expires_at,
    review_invitations.used_at,
    review_invitations.revoked_at,
    review_settings.reviews_enabled,
    review_settings.verified_reviews_enabled,
    review_settings.moderation_required,
    businesses.is_active,
    businesses.publication_status::text,
    bookings.status
  into
    v_invitation_id,
    v_business_id,
    v_booking_id,
    v_invitation_status,
    v_expires_at,
    v_used_at,
    v_revoked_at,
    v_reviews_enabled,
    v_verified_reviews_enabled,
    v_moderation_required,
    v_business_active,
    v_publication_status,
    v_booking_status
  from public.review_invitations
  inner join public.review_settings
    on review_settings.business_id =
      review_invitations.business_id
  inner join public.businesses
    on businesses.id =
      review_invitations.business_id
  inner join public.bookings
    on bookings.id =
      review_invitations.booking_id
  where review_invitations.token_hash =
      p_token_hash
  for update of review_invitations;

  if not found
    or v_invitation_status not in (
      'pending',
      'sent',
      'opened'
    )
    or v_used_at is not null
    or v_revoked_at is not null
    or v_expires_at <= now()
    or v_reviews_enabled is not true
    or v_verified_reviews_enabled is not true
    or v_business_active is not true
    or v_publication_status <> 'published'
    or v_booking_status <> 'completed'
  then
    raise exception 'REVIEW_LINK_INVALID';
  end if;

  v_status :=
    case
      when v_moderation_required
        then 'pending'::public.review_status
      else 'published'::public.review_status
    end;

  insert into public.reviews (
    business_id,
    source,
    status,
    booking_id,
    invitation_id,
    author_name,
    rating,
    body,
    language_code,
    is_verified_visit,
    published_at
  )
  values (
    v_business_id,
    'platform',
    v_status,
    v_booking_id,
    v_invitation_id,
    v_author_name,
    v_rating,
    v_body,
    v_language_code,
    true,
    case
      when v_status = 'published'
        then now()
      else null
    end
  )
  returning id
  into v_review_id;

  update public.review_invitations
  set
    status = 'used',
    used_at = now(),
    last_error = null
  where id =
    v_invitation_id;

  return jsonb_build_object(
    'reviewId', v_review_id,
    'status', v_status,
    'isVerifiedVisit', true
  );
end;
$$;

revoke all
on function public.submit_verified_review(text, jsonb)
from public, anon, authenticated;

grant execute
on function public.submit_verified_review(text, jsonb)
to service_role;

commit;
