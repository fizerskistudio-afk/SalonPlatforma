begin;

-- =========================================================
-- BUSINESS EMAIL SETTINGS
--
-- delivery_mode = platform
--   Booking email is branded as the salon, but sent through
--   the platform-owned sending domain.
--
-- delivery_mode = custom_domain
--   Booking email is sent from the salon's verified domain.
--   Runtime code falls back to the platform sender until the
--   domain_status is verified.
--
-- Exported/standalone sites can override sender identity with
-- environment variables without changing this schema.
-- =========================================================

create table if not exists public.business_email_settings (
  business_id uuid primary key
    references public.businesses(id)
    on delete cascade,

  delivery_mode text not null default 'platform',

  from_name text,
  from_email text,
  reply_to_email text,
  notification_email text,

  custom_domain text,
  domain_status text not null default 'not_configured',
  provider_domain_id text,

  customer_notifications_enabled boolean not null default true,
  business_notifications_enabled boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint business_email_settings_delivery_mode_check
    check (
      delivery_mode in (
        'platform',
        'custom_domain'
      )
    ),

  constraint business_email_settings_domain_status_check
    check (
      domain_status in (
        'not_configured',
        'pending',
        'verified',
        'failed'
      )
    ),

  constraint business_email_settings_from_name_length_check
    check (
      from_name is null
      or char_length(from_name) between 1 and 120
    ),

  constraint business_email_settings_from_email_length_check
    check (
      from_email is null
      or char_length(from_email) between 3 and 254
    ),

  constraint business_email_settings_reply_to_length_check
    check (
      reply_to_email is null
      or char_length(reply_to_email) between 3 and 254
    ),

  constraint business_email_settings_notification_email_length_check
    check (
      notification_email is null
      or char_length(notification_email) between 3 and 254
    ),

  constraint business_email_settings_custom_domain_length_check
    check (
      custom_domain is null
      or char_length(custom_domain) between 3 and 253
    )
);

insert into public.business_email_settings (
  business_id,
  delivery_mode,
  reply_to_email,
  notification_email
)
select
  businesses.id,
  'platform',
  businesses.email,
  businesses.email
from public.businesses
on conflict (business_id) do nothing;

create or replace function public.create_default_business_email_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_email_settings (
    business_id,
    delivery_mode,
    reply_to_email,
    notification_email
  )
  values (
    new.id,
    'platform',
    new.email,
    new.email
  )
  on conflict (business_id) do nothing;

  return new;
end;
$$;

drop trigger if exists businesses_create_default_email_settings
  on public.businesses;

create trigger businesses_create_default_email_settings
after insert on public.businesses
for each row
execute function public.create_default_business_email_settings();

create index if not exists business_email_settings_domain_status_idx
  on public.business_email_settings (
    delivery_mode,
    domain_status
  );

drop trigger if exists business_email_settings_set_updated_at
  on public.business_email_settings;

create trigger business_email_settings_set_updated_at
before update on public.business_email_settings
for each row
execute function public.set_updated_at();

-- =========================================================
-- NOTIFICATION DELIVERY LOG
--
-- One dedupe key represents one logical notification. Failed
-- and skipped rows can be retried by updating the same row;
-- sent rows are never sent again by normal lifecycle hooks.
-- =========================================================

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),

  business_id uuid
    references public.businesses(id)
    on delete cascade,

  booking_id uuid
    references public.bookings(id)
    on delete set null,

  scope text not null,
  audience text not null,
  template_key text not null,
  dedupe_key text not null,

  original_recipient text not null,
  actual_recipient text not null,

  sender text not null,
  reply_to text,
  subject text not null,

  provider text not null default 'resend',
  provider_message_id text,

  status text not null default 'pending',
  attempt_count integer not null default 0,
  test_mode boolean not null default false,

  error text,
  metadata jsonb not null default '{}'::jsonb,

  last_attempt_at timestamptz,
  sent_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint notification_deliveries_scope_check
    check (
      scope in (
        'platform',
        'business'
      )
    ),

  constraint notification_deliveries_audience_check
    check (
      audience in (
        'platform',
        'business',
        'owner',
        'staff',
        'customer'
      )
    ),

  constraint notification_deliveries_status_check
    check (
      status in (
        'pending',
        'sent',
        'failed',
        'skipped'
      )
    ),

  constraint notification_deliveries_attempt_count_check
    check (attempt_count >= 0),

  constraint notification_deliveries_dedupe_key_unique
    unique (dedupe_key)
);

create index if not exists notification_deliveries_business_created_idx
  on public.notification_deliveries (
    business_id,
    created_at desc
  );

create index if not exists notification_deliveries_booking_created_idx
  on public.notification_deliveries (
    booking_id,
    created_at desc
  )
  where booking_id is not null;

create index if not exists notification_deliveries_status_created_idx
  on public.notification_deliveries (
    status,
    created_at desc
  );

drop trigger if exists notification_deliveries_set_updated_at
  on public.notification_deliveries;

create trigger notification_deliveries_set_updated_at
before update on public.notification_deliveries
for each row
execute function public.set_updated_at();

alter table public.business_email_settings
  enable row level security;

alter table public.notification_deliveries
  enable row level security;

-- Email sender configuration and delivery logs are deliberately
-- server-only in this phase. Admin UI access will go through
-- validated server actions using the service-role client.
revoke all
on public.business_email_settings
from anon, authenticated;

revoke all
on public.notification_deliveries
from anon, authenticated;

commit;
