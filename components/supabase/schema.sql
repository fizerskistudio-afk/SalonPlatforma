begin;

-- =========================================================
-- 001 INITIAL SCHEMA
-- Salon booking platform
-- =========================================================

-- PostgreSQL extensions
create extension if not exists pgcrypto with schema extensions;
create extension if not exists btree_gist with schema extensions;

-- =========================================================
-- ENUM TYPES
-- =========================================================

create type public.business_role as enum (
  'owner',
  'manager',
  'staff'
);

create type public.service_price_type as enum (
  'fixed',
  'from',
  'range'
);

create type public.booking_status as enum (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

create type public.booking_source as enum (
  'web',
  'admin',
  'phone',
  'walk_in'
);

create type public.schedule_block_type as enum (
  'time_off',
  'break',
  'blocked'
);

-- =========================================================
-- SHARED FUNCTIONS
-- =========================================================

-- Proverava da JSON objekat sadrži mk, sq i en string vrednosti.
create or replace function public.is_localized_text(input_value jsonb)
returns boolean
language sql
immutable
as $$
  select
    jsonb_typeof(input_value) = 'object'
    and input_value ?& array['mk', 'sq', 'en']
    and jsonb_typeof(input_value -> 'mk') = 'string'
    and jsonb_typeof(input_value -> 'sq') = 'string'
    and jsonb_typeof(input_value -> 'en') = 'string';
$$;

-- Automatski osvežava updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- BUSINESSES
-- =========================================================

create table public.businesses (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique,
  name text not null,

  tagline jsonb not null default
    '{"mk":"","sq":"","en":""}'::jsonb,

  description jsonb not null default
    '{"mk":"","sq":"","en":""}'::jsonb,

  address jsonb not null default
    '{"mk":"","sq":"","en":""}'::jsonb,

  city jsonb not null default
    '{"mk":"","sq":"","en":""}'::jsonb,

  country jsonb not null default
    '{"mk":"","sq":"","en":""}'::jsonb,

  phone text,
  email text,

  instagram_handle text,
  instagram_url text,

  hero_image_url text,
  logo_url text,

  default_locale text not null default 'mk',
  currency char(3) not null default 'EUR',
  timezone text not null default 'Europe/Skopje',

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint businesses_slug_format_check
    check (
      slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    ),

  constraint businesses_default_locale_check
    check (
      default_locale in ('mk', 'sq', 'en')
    ),

  constraint businesses_currency_check
    check (
      currency ~ '^[A-Z]{3}$'
    ),

  constraint businesses_tagline_localized_check
    check (
      public.is_localized_text(tagline)
    ),

  constraint businesses_description_localized_check
    check (
      public.is_localized_text(description)
    ),

  constraint businesses_address_localized_check
    check (
      public.is_localized_text(address)
    ),

  constraint businesses_city_localized_check
    check (
      public.is_localized_text(city)
    ),

  constraint businesses_country_localized_check
    check (
      public.is_localized_text(country)
    )
);

-- =========================================================
-- BOOKING SETTINGS
-- =========================================================

create table public.booking_settings (
  business_id uuid primary key
    references public.businesses(id)
    on delete cascade,

  slot_interval_minutes integer not null default 30,
  booking_window_days integer not null default 14,
  min_advance_minutes integer not null default 60,

  allow_any_employee boolean not null default true,
  require_email boolean not null default false,
  require_phone boolean not null default true,
  allow_notes boolean not null default true,
  auto_confirm boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint booking_settings_slot_interval_check
    check (
      slot_interval_minutes between 5 and 240
    ),

  constraint booking_settings_window_check
    check (
      booking_window_days between 1 and 365
    ),

  constraint booking_settings_advance_check
    check (
      min_advance_minutes between 0 and 10080
    )
);

-- =========================================================
-- BUSINESS MEMBERS / FUTURE ADMIN ACCESS
-- =========================================================

create table public.business_members (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  role public.business_role not null default 'staff',
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint business_members_business_user_unique
    unique (business_id, user_id)
);

-- =========================================================
-- SERVICE CATEGORIES
-- =========================================================

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  slug text not null,

  name jsonb not null,
  description jsonb not null default
    '{"mk":"","sq":"","en":""}'::jsonb,

  icon_key text,
  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint service_categories_name_localized_check
    check (
      public.is_localized_text(name)
    ),

  constraint service_categories_description_localized_check
    check (
      public.is_localized_text(description)
    ),

  constraint service_categories_slug_format_check
    check (
      slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    ),

  constraint service_categories_business_slug_unique
    unique (business_id, slug),

  constraint service_categories_business_id_id_unique
    unique (business_id, id)
);

-- =========================================================
-- SERVICES
-- =========================================================

create table public.services (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  category_id uuid not null,

  slug text not null,

  name jsonb not null,
  description jsonb not null default
    '{"mk":"","sq":"","en":""}'::jsonb,

  duration_minutes integer not null,

  price_type public.service_price_type not null default 'fixed',
  price_from numeric(10, 2) not null,
  price_to numeric(10, 2),

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint services_business_category_fk
    foreign key (business_id, category_id)
    references public.service_categories(business_id, id)
    on delete restrict,

  constraint services_name_localized_check
    check (
      public.is_localized_text(name)
    ),

  constraint services_description_localized_check
    check (
      public.is_localized_text(description)
    ),

  constraint services_slug_format_check
    check (
      slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    ),

  constraint services_duration_check
    check (
      duration_minutes between 5 and 1440
    ),

  constraint services_price_from_check
    check (
      price_from >= 0
    ),

  constraint services_price_to_check
    check (
      price_to is null or price_to >= price_from
    ),

  constraint services_price_range_check
    check (
      price_type <> 'range'
      or price_to is not null
    ),

  constraint services_business_slug_unique
    unique (business_id, slug),

  constraint services_business_id_id_unique
    unique (business_id, id)
);

-- =========================================================
-- EMPLOYEES
-- =========================================================

create table public.employees (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  slug text not null,

  name text not null,

  title jsonb not null default
    '{"mk":"","sq":"","en":""}'::jsonb,

  bio jsonb not null default
    '{"mk":"","sq":"","en":""}'::jsonb,

  image_url text,
  email text,
  phone text,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint employees_title_localized_check
    check (
      public.is_localized_text(title)
    ),

  constraint employees_bio_localized_check
    check (
      public.is_localized_text(bio)
    ),

  constraint employees_slug_format_check
    check (
      slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    ),

  constraint employees_business_slug_unique
    unique (business_id, slug),

  constraint employees_business_id_id_unique
    unique (business_id, id)
);

-- =========================================================
-- EMPLOYEE ↔ SERVICE RELATION
-- =========================================================

create table public.employee_services (
  business_id uuid not null,

  employee_id uuid not null,
  service_id uuid not null,

  custom_duration_minutes integer,
  custom_price_from numeric(10, 2),

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (employee_id, service_id),

  constraint employee_services_business_employee_fk
    foreign key (business_id, employee_id)
    references public.employees(business_id, id)
    on delete cascade,

  constraint employee_services_business_service_fk
    foreign key (business_id, service_id)
    references public.services(business_id, id)
    on delete cascade,

  constraint employee_services_custom_duration_check
    check (
      custom_duration_minutes is null
      or custom_duration_minutes between 5 and 1440
    ),

  constraint employee_services_custom_price_check
    check (
      custom_price_from is null
      or custom_price_from >= 0
    )
);

-- =========================================================
-- WORKING HOURS
--
-- employee_id = null  → salon working hours
-- employee_id != null → employee-specific override
--
-- day_of_week:
-- 0 = Sunday
-- 1 = Monday
-- ...
-- 6 = Saturday
-- =========================================================

create table public.working_hours (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  employee_id uuid,

  day_of_week smallint not null,

  is_closed boolean not null default false,
  open_time time,
  close_time time,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint working_hours_business_employee_fk
    foreign key (business_id, employee_id)
    references public.employees(business_id, id)
    on delete cascade,

  constraint working_hours_day_check
    check (
      day_of_week between 0 and 6
    ),

  constraint working_hours_times_check
    check (
      (
        is_closed = true
        and open_time is null
        and close_time is null
      )
      or
      (
        is_closed = false
        and open_time is not null
        and close_time is not null
        and open_time < close_time
      )
    )
);

create unique index working_hours_business_day_unique
  on public.working_hours (
    business_id,
    day_of_week
  )
  where employee_id is null;

create unique index working_hours_employee_day_unique
  on public.working_hours (
    business_id,
    employee_id,
    day_of_week
  )
  where employee_id is not null;

-- =========================================================
-- TIME OFF / BREAKS / BLOCKED PERIODS
--
-- employee_id = null → block for the entire business
-- =========================================================

create table public.time_off (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  employee_id uuid,

  block_type public.schedule_block_type
    not null default 'time_off',

  starts_at timestamptz not null,
  ends_at timestamptz not null,

  reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint time_off_business_employee_fk
    foreign key (business_id, employee_id)
    references public.employees(business_id, id)
    on delete cascade,

  constraint time_off_valid_range_check
    check (
      ends_at > starts_at
    )
);

-- =========================================================
-- CUSTOMERS
-- =========================================================

create table public.customers (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  full_name text not null,
  phone text,
  email text,
  notes text,

  last_booking_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint customers_contact_check
    check (
      phone is not null or email is not null
    ),

  constraint customers_business_id_id_unique
    unique (business_id, id)
);

-- =========================================================
-- BOOKINGS
-- =========================================================

create table public.bookings (
  id uuid primary key default gen_random_uuid(),

  reference_code text not null default
    upper(
      substr(
        replace(gen_random_uuid()::text, '-', ''),
        1,
        10
      )
    ),

  public_token uuid not null default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  service_id uuid not null,
  employee_id uuid not null,
  customer_id uuid,

  customer_name text not null,
  customer_phone text,
  customer_email text,
  customer_note text,

  starts_at timestamptz not null,
  ends_at timestamptz not null,

  duration_minutes integer not null,

  price_amount numeric(10, 2) not null,
  currency char(3) not null,

  status public.booking_status
    not null default 'confirmed',

  source public.booking_source
    not null default 'web',

  internal_note text,

  google_event_id text,

  cancellation_reason text,
  cancelled_at timestamptz,

  created_by uuid
    references auth.users(id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint bookings_business_service_fk
    foreign key (business_id, service_id)
    references public.services(business_id, id)
    on delete restrict,

  constraint bookings_business_employee_fk
    foreign key (business_id, employee_id)
    references public.employees(business_id, id)
    on delete restrict,

  constraint bookings_business_customer_fk
    foreign key (business_id, customer_id)
    references public.customers(business_id, id)
    on delete set null,

  constraint bookings_reference_code_unique
    unique (reference_code),

  constraint bookings_public_token_unique
    unique (public_token),

  constraint bookings_valid_range_check
    check (
      ends_at > starts_at
    ),

  constraint bookings_duration_check
    check (
      duration_minutes between 5 and 1440
    ),

  constraint bookings_price_check
    check (
      price_amount >= 0
    ),

  constraint bookings_currency_check
    check (
      currency ~ '^[A-Z]{3}$'
    ),

  constraint bookings_customer_contact_check
    check (
      customer_phone is not null
      or customer_email is not null
    )
);

-- =========================================================
-- BOOKING PREPARATION TRIGGER
--
-- Uzima trajanje/cenu iz employee_services ili services.
-- Potvrđuje da zaposleni radi izabranu uslugu.
-- Automatski računa ends_at.
-- =========================================================

create or replace function public.prepare_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  service_duration integer;
  service_price numeric(10, 2);
  business_currency char(3);

  employee_custom_duration integer;
  employee_custom_price numeric(10, 2);
begin
  select
    services.duration_minutes,
    services.price_from,
    businesses.currency,
    employee_services.custom_duration_minutes,
    employee_services.custom_price_from
  into
    service_duration,
    service_price,
    business_currency,
    employee_custom_duration,
    employee_custom_price
  from public.services
  join public.businesses
    on businesses.id = services.business_id
  join public.employees
    on employees.id = new.employee_id
    and employees.business_id = new.business_id
  join public.employee_services
    on employee_services.business_id = new.business_id
    and employee_services.employee_id = new.employee_id
    and employee_services.service_id = new.service_id
  where services.id = new.service_id
    and services.business_id = new.business_id
    and businesses.is_active = true
    and services.is_active = true
    and employees.is_active = true
    and employee_services.is_active = true;

  if not found then
    raise exception
      'Invalid business, service, employee, or employee-service relation';
  end if;

  if tg_op = 'INSERT' then
    new.duration_minutes :=
      coalesce(
        new.duration_minutes,
        employee_custom_duration,
        service_duration
      );

    new.price_amount :=
      coalesce(
        new.price_amount,
        employee_custom_price,
        service_price
      );

    new.currency :=
      coalesce(
        new.currency,
        business_currency
      );

  elsif
    new.business_id is distinct from old.business_id
    or new.service_id is distinct from old.service_id
    or new.employee_id is distinct from old.employee_id
  then
    new.duration_minutes :=
      coalesce(
        employee_custom_duration,
        service_duration
      );

    new.price_amount :=
      coalesce(
        employee_custom_price,
        service_price
      );

    new.currency := business_currency;

  else
    new.duration_minutes :=
      coalesce(
        new.duration_minutes,
        employee_custom_duration,
        service_duration
      );

    new.price_amount :=
      coalesce(
        new.price_amount,
        employee_custom_price,
        service_price
      );

    new.currency :=
      coalesce(
        new.currency,
        business_currency
      );
  end if;

  new.ends_at :=
    new.starts_at
    + make_interval(
        mins => new.duration_minutes
      );

  return new;
end;
$$;

create trigger bookings_prepare_before_insert
before insert
on public.bookings
for each row
execute function public.prepare_booking();

create trigger bookings_prepare_before_update
before update of
  business_id,
  service_id,
  employee_id,
  starts_at,
  duration_minutes,
  price_amount,
  currency
on public.bookings
for each row
execute function public.prepare_booking();

-- Automatski vodi cancelled_at.
create or replace function public.sync_booking_status_timestamps()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'cancelled' then
    if new.cancelled_at is null then
      new.cancelled_at = now();
    end if;
  else
    new.cancelled_at = null;
  end if;

  return new;
end;
$$;

create trigger bookings_status_before_insert
before insert
on public.bookings
for each row
execute function public.sync_booking_status_timestamps();

create trigger bookings_status_before_update
before update of status
on public.bookings
for each row
execute function public.sync_booking_status_timestamps();

-- =========================================================
-- DATABASE-LEVEL DOUBLE BOOKING PROTECTION
--
-- [) znači:
-- početak je uključen, kraj nije.
--
-- Termin 10:00–10:30 i termin 10:30–11:00
-- ne smatraju se preklapanjem.
-- =========================================================

alter table public.bookings
add constraint bookings_no_employee_time_overlap
exclude using gist (
  employee_id with =,
  tstzrange(
    starts_at,
    ends_at,
    '[)'
  ) with &&
)
where (
  status in (
    'pending'::public.booking_status,
    'confirmed'::public.booking_status
  )
);

-- Google Calendar event ne sme pripadati dvema rezervacijama.
create unique index bookings_google_event_id_unique
  on public.bookings (google_event_id)
  where google_event_id is not null;

-- =========================================================
-- INDEXES
-- =========================================================

create index service_categories_business_active_sort_idx
  on public.service_categories (
    business_id,
    is_active,
    sort_order
  );

create index services_business_category_active_sort_idx
  on public.services (
    business_id,
    category_id,
    is_active,
    sort_order
  );

create index employees_business_active_sort_idx
  on public.employees (
    business_id,
    is_active,
    sort_order
  );

create index employee_services_business_employee_idx
  on public.employee_services (
    business_id,
    employee_id,
    is_active
  );

create index employee_services_business_service_idx
  on public.employee_services (
    business_id,
    service_id,
    is_active
  );

create index working_hours_business_employee_day_idx
  on public.working_hours (
    business_id,
    employee_id,
    day_of_week
  );

create index time_off_business_employee_range_idx
  on public.time_off (
    business_id,
    employee_id,
    starts_at,
    ends_at
  );

create index customers_business_phone_idx
  on public.customers (
    business_id,
    phone
  );

create index customers_business_email_idx
  on public.customers (
    business_id,
    lower(email)
  );

create index bookings_business_start_idx
  on public.bookings (
    business_id,
    starts_at
  );

create index bookings_employee_start_idx
  on public.bookings (
    employee_id,
    starts_at
  );

create index bookings_business_status_start_idx
  on public.bookings (
    business_id,
    status,
    starts_at
  );

create index bookings_customer_id_idx
  on public.bookings (
    customer_id
  );

-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

create trigger businesses_set_updated_at
before update on public.businesses
for each row
execute function public.set_updated_at();

create trigger booking_settings_set_updated_at
before update on public.booking_settings
for each row
execute function public.set_updated_at();

create trigger business_members_set_updated_at
before update on public.business_members
for each row
execute function public.set_updated_at();

create trigger service_categories_set_updated_at
before update on public.service_categories
for each row
execute function public.set_updated_at();

create trigger services_set_updated_at
before update on public.services
for each row
execute function public.set_updated_at();

create trigger employees_set_updated_at
before update on public.employees
for each row
execute function public.set_updated_at();

create trigger employee_services_set_updated_at
before update on public.employee_services
for each row
execute function public.set_updated_at();

create trigger working_hours_set_updated_at
before update on public.working_hours
for each row
execute function public.set_updated_at();

create trigger time_off_set_updated_at
before update on public.time_off
for each row
execute function public.set_updated_at();

create trigger customers_set_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

create trigger bookings_set_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();

-- =========================================================
-- MEMBERSHIP HELPERS FOR RLS
-- =========================================================

create or replace function public.is_business_member(
  target_business_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_members
    where business_members.business_id = target_business_id
      and business_members.user_id = (
        select auth.uid()
      )
      and business_members.is_active = true
  );
$$;

create or replace function public.is_business_admin(
  target_business_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_members
    where business_members.business_id = target_business_id
      and business_members.user_id = (
        select auth.uid()
      )
      and business_members.is_active = true
      and business_members.role in (
        'owner'::public.business_role,
        'manager'::public.business_role
      )
  );
$$;

revoke all
on function public.is_business_member(uuid)
from public;

revoke all
on function public.is_business_admin(uuid)
from public;

grant execute
on function public.is_business_member(uuid)
to authenticated, service_role;

grant execute
on function public.is_business_admin(uuid)
to authenticated, service_role;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.businesses
  enable row level security;

alter table public.booking_settings
  enable row level security;

alter table public.business_members
  enable row level security;

alter table public.service_categories
  enable row level security;

alter table public.services
  enable row level security;

alter table public.employees
  enable row level security;

alter table public.employee_services
  enable row level security;

alter table public.working_hours
  enable row level security;

alter table public.time_off
  enable row level security;

alter table public.customers
  enable row level security;

alter table public.bookings
  enable row level security;

-- =========================================================
-- PUBLIC CATALOG POLICIES
-- =========================================================

create policy "Public can view active businesses"
on public.businesses
for select
to anon, authenticated
using (
  is_active = true
);

create policy "Public can view active booking settings"
on public.booking_settings
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = booking_settings.business_id
      and businesses.is_active = true
  )
);

create policy "Public can view active service categories"
on public.service_categories
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.businesses
    where businesses.id = service_categories.business_id
      and businesses.is_active = true
  )
);

create policy "Public can view active services"
on public.services
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.businesses
    where businesses.id = services.business_id
      and businesses.is_active = true
  )
);

create policy "Public can view active employees"
on public.employees
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.businesses
    where businesses.id = employees.business_id
      and businesses.is_active = true
  )
);

create policy "Public can view active employee services"
on public.employee_services
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.services
    where services.id = employee_services.service_id
      and services.is_active = true
  )
  and exists (
    select 1
    from public.employees
    where employees.id = employee_services.employee_id
      and employees.is_active = true
  )
);

-- =========================================================
-- MEMBER / ADMIN POLICIES
-- =========================================================

create policy "Members can view their businesses"
on public.businesses
for select
to authenticated
using (
  public.is_business_member(id)
);

create policy "Admins can update their businesses"
on public.businesses
for update
to authenticated
using (
  public.is_business_admin(id)
)
with check (
  public.is_business_admin(id)
);

create policy "Admins can manage booking settings"
on public.booking_settings
for all
to authenticated
using (
  public.is_business_admin(business_id)
)
with check (
  public.is_business_admin(business_id)
);

create policy "Users can view their own memberships"
on public.business_members
for select
to authenticated
using (
  user_id = (
    select auth.uid()
  )
  or public.is_business_admin(business_id)
);

create policy "Owners and managers can add memberships"
on public.business_members
for insert
to authenticated
with check (
  public.is_business_admin(business_id)
);

create policy "Owners and managers can update memberships"
on public.business_members
for update
to authenticated
using (
  public.is_business_admin(business_id)
)
with check (
  public.is_business_admin(business_id)
);

create policy "Owners and managers can delete memberships"
on public.business_members
for delete
to authenticated
using (
  public.is_business_admin(business_id)
);

create policy "Admins can manage service categories"
on public.service_categories
for all
to authenticated
using (
  public.is_business_admin(business_id)
)
with check (
  public.is_business_admin(business_id)
);

create policy "Admins can manage services"
on public.services
for all
to authenticated
using (
  public.is_business_admin(business_id)
)
with check (
  public.is_business_admin(business_id)
);

create policy "Admins can manage employees"
on public.employees
for all
to authenticated
using (
  public.is_business_admin(business_id)
)
with check (
  public.is_business_admin(business_id)
);

create policy "Admins can manage employee services"
on public.employee_services
for all
to authenticated
using (
  public.is_business_admin(business_id)
)
with check (
  public.is_business_admin(business_id)
);

create policy "Members can manage working hours"
on public.working_hours
for all
to authenticated
using (
  public.is_business_member(business_id)
)
with check (
  public.is_business_member(business_id)
);

create policy "Members can manage time off"
on public.time_off
for all
to authenticated
using (
  public.is_business_member(business_id)
)
with check (
  public.is_business_member(business_id)
);

create policy "Members can manage customers"
on public.customers
for all
to authenticated
using (
  public.is_business_member(business_id)
)
with check (
  public.is_business_member(business_id)
);

create policy "Members can manage bookings"
on public.bookings
for all
to authenticated
using (
  public.is_business_member(business_id)
)
with check (
  public.is_business_member(business_id)
);

-- =========================================================
-- GRANTS
-- =========================================================

grant usage on schema public
to anon, authenticated;

grant select
on public.businesses,
   public.booking_settings,
   public.service_categories,
   public.services,
   public.employees,
   public.employee_services
to anon;

grant select, insert, update, delete
on public.businesses,
   public.booking_settings,
   public.business_members,
   public.service_categories,
   public.services,
   public.employees,
   public.employee_services,
   public.working_hours,
   public.time_off,
   public.customers,
   public.bookings
to authenticated;

grant all privileges
on public.businesses,
   public.booking_settings,
   public.business_members,
   public.service_categories,
   public.services,
   public.employees,
   public.employee_services,
   public.working_hours,
   public.time_off,
   public.customers,
   public.bookings
to service_role;

commit;