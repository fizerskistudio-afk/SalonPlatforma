begin;

-- =========================================================
-- EMPLOYEE GOOGLE CALENDAR CONNECTIONS
--
-- Salon-level Google Calendar remains in:
--   public.google_calendar_connections
--
-- This table stores one personal Google Calendar connection
-- per employee. Refresh tokens remain server-only.
-- =========================================================

create table if not exists public.employee_google_calendar_connections (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  employee_id uuid not null,

  connected_by_user_id uuid
    references auth.users(id)
    on delete set null,

  google_account_id text,
  google_account_email text,

  calendar_id text not null default 'primary',
  calendar_name text not null default 'Primary calendar',

  refresh_token_encrypted text not null,
  scopes text[] not null default '{}'::text[],

  is_active boolean not null default true,

  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  last_error text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint employee_google_calendar_connections_business_employee_fk
    foreign key (business_id, employee_id)
    references public.employees(business_id, id)
    on delete cascade,

  constraint employee_google_calendar_connections_business_employee_unique
    unique (business_id, employee_id),

  constraint employee_google_calendar_connections_employee_unique
    unique (employee_id)
);

create index if not exists employee_google_calendar_connections_business_idx
  on public.employee_google_calendar_connections (
    business_id,
    is_active
  );

create index if not exists employee_google_calendar_connections_user_idx
  on public.employee_google_calendar_connections (
    connected_by_user_id
  )
  where connected_by_user_id is not null;

-- =========================================================
-- EMPLOYEE-SCOPED GOOGLE EVENTS
--
-- A booking can temporarily have more than one row here when
-- it is moved from employee A to employee B. The old row stays
-- tracked until the old personal-calendar event is deleted.
-- =========================================================

create table if not exists public.employee_google_calendar_events (
  id uuid primary key default gen_random_uuid(),

  booking_id uuid not null
    references public.bookings(id)
    on delete cascade,

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  employee_id uuid not null,

  google_event_id text not null,

  sync_status text not null default 'pending',
  sync_error text,
  synced_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint employee_google_calendar_events_business_employee_fk
    foreign key (business_id, employee_id)
    references public.employees(business_id, id)
    on delete restrict,

  constraint employee_google_calendar_events_booking_employee_unique
    unique (booking_id, employee_id),

  constraint employee_google_calendar_events_employee_event_unique
    unique (employee_id, google_event_id),

  constraint employee_google_calendar_events_sync_status_check
    check (
      sync_status in (
        'pending',
        'synced',
        'failed',
        'deleted'
      )
    )
);

create index if not exists employee_google_calendar_events_booking_idx
  on public.employee_google_calendar_events (
    booking_id,
    sync_status
  );

create index if not exists employee_google_calendar_events_employee_idx
  on public.employee_google_calendar_events (
    employee_id,
    sync_status,
    updated_at desc
  );

-- Existing helper is already part of the platform schema.
drop trigger if exists employee_google_calendar_connections_set_updated_at
  on public.employee_google_calendar_connections;

create trigger employee_google_calendar_connections_set_updated_at
before update on public.employee_google_calendar_connections
for each row
execute function public.set_updated_at();

drop trigger if exists employee_google_calendar_events_set_updated_at
  on public.employee_google_calendar_events;

create trigger employee_google_calendar_events_set_updated_at
before update on public.employee_google_calendar_events
for each row
execute function public.set_updated_at();

alter table public.employee_google_calendar_connections
  enable row level security;

alter table public.employee_google_calendar_events
  enable row level security;

-- Tokens and raw event mappings are intentionally server-only.
-- All application access goes through authenticated server code
-- using the service-role client after role/employee validation.
revoke all
on public.employee_google_calendar_connections
from anon, authenticated;

revoke all
on public.employee_google_calendar_events
from anon, authenticated;

commit;
