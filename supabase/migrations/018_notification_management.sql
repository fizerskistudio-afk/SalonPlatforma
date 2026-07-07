begin;

-- =========================================================
-- GRANULAR BOOKING EMAIL PREFERENCES
--
-- Existing master switches remain in place:
--   customer_notifications_enabled
--   business_notifications_enabled
--
-- These columns allow the owner to control each lifecycle
-- message independently without changing application code.
-- =========================================================

alter table public.business_email_settings
  add column if not exists booking_request_received_enabled boolean not null default true,
  add column if not exists booking_confirmed_enabled boolean not null default true,
  add column if not exists booking_rescheduled_enabled boolean not null default true,
  add column if not exists booking_cancelled_enabled boolean not null default true,
  add column if not exists business_new_booking_enabled boolean not null default true;

create index if not exists notification_deliveries_business_status_created_idx
  on public.notification_deliveries (
    business_id,
    status,
    created_at desc
  );

commit;
