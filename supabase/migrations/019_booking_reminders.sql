begin;

-- =========================================================
-- BOOKING EMAIL REMINDERS
--
-- 24h is enabled by default. 2h is opt-in because some salons
-- prefer a single reminder. Both remain subordinate to the
-- existing customer_notifications_enabled master switch.
-- =========================================================

alter table public.business_email_settings
  add column if not exists booking_reminder_24h_enabled boolean not null default true,
  add column if not exists booking_reminder_2h_enabled boolean not null default false;

-- Speeds up the recurring scan without indexing cancelled,
-- completed or no-show reservations.
create index if not exists bookings_confirmed_upcoming_email_idx
  on public.bookings (
    starts_at,
    business_id
  )
  where status = 'confirmed'::public.booking_status
    and customer_email is not null;

commit;
