begin;

-- =========================================================
-- TENANT-ADMIN-03
-- Staff ↔ employee link, restricted staff access,
-- booking status RPC and time-off request workflow.
-- =========================================================

alter table public.business_members
  add column if not exists employee_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'business_members_business_id_id_unique'
      and conrelid = 'public.business_members'::regclass
  ) then
    alter table public.business_members
      add constraint business_members_business_id_id_unique
      unique (business_id, id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'business_members_business_employee_fk'
      and conrelid = 'public.business_members'::regclass
  ) then
    alter table public.business_members
      add constraint business_members_business_employee_fk
      foreign key (business_id, employee_id)
      references public.employees(business_id, id)
      on delete restrict;
  end if;
end
$$;

create unique index if not exists
  business_members_business_employee_unique
on public.business_members (
  business_id,
  employee_id
)
where employee_id is not null;

create or replace function public.normalize_business_member_employee_link()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.role <> 'staff'::public.business_role then
    new.employee_id := null;
  end if;

  return new;
end;
$$;

drop trigger if exists
  normalize_business_member_employee_link_trigger
on public.business_members;

create trigger normalize_business_member_employee_link_trigger
before insert or update of role, employee_id
on public.business_members
for each row
execute function public.normalize_business_member_employee_link();

create table if not exists public.staff_time_off_requests (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  employee_id uuid not null,
  member_id uuid not null,

  starts_at timestamptz not null,
  ends_at timestamptz not null,

  reason text not null,

  status text not null default 'pending',

  reviewed_by uuid
    references auth.users(id)
    on delete set null,

  reviewed_at timestamptz,
  review_note text,

  approved_time_off_id uuid
    references public.time_off(id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint staff_time_off_requests_business_employee_fk
    foreign key (business_id, employee_id)
    references public.employees(business_id, id)
    on delete cascade,

  constraint staff_time_off_requests_business_member_fk
    foreign key (business_id, member_id)
    references public.business_members(business_id, id)
    on delete cascade,

  constraint staff_time_off_requests_range_check
    check (ends_at > starts_at),

  constraint staff_time_off_requests_reason_check
    check (
      char_length(trim(reason)) between 3 and 500
    ),

  constraint staff_time_off_requests_status_check
    check (
      status in (
        'pending',
        'approved',
        'rejected',
        'cancelled'
      )
    ),

  constraint staff_time_off_requests_review_state_check
    check (
      (
        status = 'pending'
        and reviewed_at is null
        and reviewed_by is null
        and approved_time_off_id is null
      )
      or
      (
        status = 'cancelled'
        and approved_time_off_id is null
      )
      or
      (
        status = 'rejected'
        and reviewed_at is not null
        and reviewed_by is not null
        and approved_time_off_id is null
      )
      or
      (
        status = 'approved'
        and reviewed_at is not null
        and reviewed_by is not null
        and approved_time_off_id is not null
      )
    )
);

create index if not exists
  staff_time_off_requests_business_status_starts_idx
on public.staff_time_off_requests (
  business_id,
  status,
  starts_at
);

create index if not exists
  staff_time_off_requests_employee_starts_idx
on public.staff_time_off_requests (
  employee_id,
  starts_at
);

drop trigger if exists
  staff_time_off_requests_set_updated_at
on public.staff_time_off_requests;

create trigger staff_time_off_requests_set_updated_at
before update
on public.staff_time_off_requests
for each row
execute function public.set_updated_at();

create or replace function public.current_staff_employee_id(
  target_business_id uuid
)
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select business_members.employee_id
  from public.business_members
  where business_members.business_id = target_business_id
    and business_members.user_id = (
      select auth.uid()
    )
    and business_members.role = 'staff'::public.business_role
    and business_members.is_active = true
    and business_members.employee_id is not null
  order by business_members.created_at
  limit 1;
$$;

create or replace function public.current_staff_membership_id(
  target_business_id uuid
)
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select business_members.id
  from public.business_members
  where business_members.business_id = target_business_id
    and business_members.user_id = (
      select auth.uid()
    )
    and business_members.role = 'staff'::public.business_role
    and business_members.is_active = true
    and business_members.employee_id is not null
  order by business_members.created_at
  limit 1;
$$;

revoke all
on function public.current_staff_employee_id(uuid)
from public;

revoke all
on function public.current_staff_membership_id(uuid)
from public;

grant execute
on function public.current_staff_employee_id(uuid)
to authenticated, service_role;

grant execute
on function public.current_staff_membership_id(uuid)
to authenticated, service_role;

-- ---------------------------------------------------------
-- Tighten existing broad member policies.
-- Owner/manager keep operational control.
-- Staff receives read-only access only to own schedule/data.
-- ---------------------------------------------------------

drop policy if exists
  "Members can manage working hours"
on public.working_hours;

drop policy if exists
  "Members can manage time off"
on public.time_off;

drop policy if exists
  "Members can manage customers"
on public.customers;

drop policy if exists
  "Members can manage bookings"
on public.bookings;

create policy "Admins can manage working hours"
on public.working_hours
for all
to authenticated
using (
  public.is_business_admin(business_id)
)
with check (
  public.is_business_admin(business_id)
);

create policy "Staff can view own working hours"
on public.working_hours
for select
to authenticated
using (
  public.current_staff_employee_id(business_id) is not null
  and (
    employee_id is null
    or employee_id = public.current_staff_employee_id(business_id)
  )
);

create policy "Admins can manage time off"
on public.time_off
for all
to authenticated
using (
  public.is_business_admin(business_id)
)
with check (
  public.is_business_admin(business_id)
);

create policy "Staff can view own time off"
on public.time_off
for select
to authenticated
using (
  employee_id = public.current_staff_employee_id(business_id)
);

create policy "Admins can manage customers"
on public.customers
for all
to authenticated
using (
  public.is_business_admin(business_id)
)
with check (
  public.is_business_admin(business_id)
);

create policy "Admins can manage bookings"
on public.bookings
for all
to authenticated
using (
  public.is_business_admin(business_id)
)
with check (
  public.is_business_admin(business_id)
);

create policy "Staff can view own bookings"
on public.bookings
for select
to authenticated
using (
  employee_id = public.current_staff_employee_id(business_id)
);

alter table public.staff_time_off_requests
  enable row level security;

create policy "Admins can manage staff time off requests"
on public.staff_time_off_requests
for all
to authenticated
using (
  public.is_business_admin(business_id)
)
with check (
  public.is_business_admin(business_id)
);

create policy "Staff can view own time off requests"
on public.staff_time_off_requests
for select
to authenticated
using (
  member_id = public.current_staff_membership_id(business_id)
  and employee_id = public.current_staff_employee_id(business_id)
);

create policy "Staff can create own time off requests"
on public.staff_time_off_requests
for insert
to authenticated
with check (
  member_id = public.current_staff_membership_id(business_id)
  and employee_id = public.current_staff_employee_id(business_id)
  and status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
  and approved_time_off_id is null
);

create or replace function public.staff_update_own_booking_status(
  p_booking_id uuid,
  p_next_status public.booking_status
)
returns table (
  id uuid,
  status public.booking_status
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_booking public.bookings%rowtype;
  v_employee_id uuid;
begin
  select bookings.*
  into v_booking
  from public.bookings
  where bookings.id = p_booking_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'BOOKING_NOT_FOUND';
  end if;

  v_employee_id :=
    public.current_staff_employee_id(
      v_booking.business_id
    );

  if v_employee_id is null
     or v_employee_id <> v_booking.employee_id then
    raise exception using
      errcode = '42501',
      message = 'STAFF_BOOKING_FORBIDDEN';
  end if;

  if not (
    (
      v_booking.status = 'pending'::public.booking_status
      and p_next_status = 'confirmed'::public.booking_status
    )
    or
    (
      v_booking.status = 'confirmed'::public.booking_status
      and p_next_status in (
        'completed'::public.booking_status,
        'no_show'::public.booking_status
      )
    )
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'STAFF_BOOKING_TRANSITION_NOT_ALLOWED';
  end if;

  update public.bookings
  set
    status = p_next_status,
    updated_at = now()
  where bookings.id = p_booking_id
  returning
    bookings.id,
    bookings.status
  into
    id,
    status;

  return next;
end;
$$;

create or replace function public.cancel_staff_time_off_request(
  p_request_id uuid
)
returns table (
  id uuid,
  status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_request public.staff_time_off_requests%rowtype;
begin
  select staff_time_off_requests.*
  into v_request
  from public.staff_time_off_requests
  where staff_time_off_requests.id = p_request_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'TIME_OFF_REQUEST_NOT_FOUND';
  end if;

  if v_request.member_id <>
       public.current_staff_membership_id(
         v_request.business_id
       )
     or v_request.employee_id <>
       public.current_staff_employee_id(
         v_request.business_id
       ) then
    raise exception using
      errcode = '42501',
      message = 'TIME_OFF_REQUEST_FORBIDDEN';
  end if;

  if v_request.status <> 'pending' then
    raise exception using
      errcode = 'P0001',
      message = 'TIME_OFF_REQUEST_NOT_PENDING';
  end if;

  update public.staff_time_off_requests
  set
    status = 'cancelled',
    updated_at = now()
  where staff_time_off_requests.id = p_request_id
  returning
    staff_time_off_requests.id,
    staff_time_off_requests.status
  into
    id,
    status;

  return next;
end;
$$;

create or replace function public.review_staff_time_off_request(
  p_request_id uuid,
  p_decision text,
  p_review_note text default null
)
returns table (
  id uuid,
  status text,
  approved_time_off_id uuid
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_request public.staff_time_off_requests%rowtype;
  v_time_off_id uuid;
begin
  if p_decision not in ('approved', 'rejected') then
    raise exception using
      errcode = '22023',
      message = 'INVALID_TIME_OFF_DECISION';
  end if;

  select staff_time_off_requests.*
  into v_request
  from public.staff_time_off_requests
  where staff_time_off_requests.id = p_request_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'TIME_OFF_REQUEST_NOT_FOUND';
  end if;

  if not public.is_business_admin(
    v_request.business_id
  ) then
    raise exception using
      errcode = '42501',
      message = 'TIME_OFF_REVIEW_FORBIDDEN';
  end if;

  if v_request.status <> 'pending' then
    raise exception using
      errcode = 'P0001',
      message = 'TIME_OFF_REQUEST_NOT_PENDING';
  end if;

  if p_decision = 'approved' then
    if exists (
      select 1
      from public.bookings
      where bookings.business_id = v_request.business_id
        and bookings.employee_id = v_request.employee_id
        and bookings.status in (
          'pending'::public.booking_status,
          'confirmed'::public.booking_status
        )
        and bookings.starts_at < v_request.ends_at
        and bookings.ends_at > v_request.starts_at
    ) then
      raise exception using
        errcode = 'P0001',
        message = 'TIME_OFF_BOOKING_CONFLICT';
    end if;

    insert into public.time_off (
      business_id,
      employee_id,
      block_type,
      starts_at,
      ends_at,
      reason
    )
    values (
      v_request.business_id,
      v_request.employee_id,
      'time_off'::public.schedule_block_type,
      v_request.starts_at,
      v_request.ends_at,
      v_request.reason
    )
    returning time_off.id
    into v_time_off_id;
  end if;

  update public.staff_time_off_requests
  set
    status = p_decision,
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    review_note = nullif(
      trim(coalesce(p_review_note, '')),
      ''
    ),
    approved_time_off_id = v_time_off_id,
    updated_at = now()
  where staff_time_off_requests.id = p_request_id
  returning
    staff_time_off_requests.id,
    staff_time_off_requests.status,
    staff_time_off_requests.approved_time_off_id
  into
    id,
    status,
    approved_time_off_id;

  return next;
end;
$$;

revoke all
on function public.staff_update_own_booking_status(
  uuid,
  public.booking_status
)
from public;

revoke all
on function public.cancel_staff_time_off_request(uuid)
from public;

revoke all
on function public.review_staff_time_off_request(
  uuid,
  text,
  text
)
from public;

grant execute
on function public.staff_update_own_booking_status(
  uuid,
  public.booking_status
)
to authenticated;

grant execute
on function public.cancel_staff_time_off_request(uuid)
to authenticated;

grant execute
on function public.review_staff_time_off_request(
  uuid,
  text,
  text
)
to authenticated;

grant select, insert, update, delete
on public.staff_time_off_requests
to authenticated, service_role;

commit;
