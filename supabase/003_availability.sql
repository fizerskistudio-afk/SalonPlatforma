begin;

-- =========================================================
-- 003 AVAILABLE BOOKING SLOTS
-- =========================================================
--
-- Računa slobodne termine na osnovu:
-- - poslovnog i zaposlenog
-- - usluge i njenog trajanja
-- - radnog vremena
-- - booking podešavanja
-- - postojećih rezervacija
-- - odmora, pauza i blokada
-- - vremenske zone salona
--
-- Vraća vremena kao timestamptz, odnosno apsolutne UTC trenutke.
-- =========================================================

create or replace function public.get_available_slots(
  p_business_id uuid,
  p_service_id uuid,
  p_date date,
  p_employee_id uuid default null
)
returns table (
  employee_id uuid,
  employee_name text,
  starts_at timestamptz,
  ends_at timestamptz
)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_timezone text;
  v_slot_interval integer;
  v_booking_window_days integer;
  v_min_advance_minutes integer;
  v_local_today date;
begin
  -- Učitavanje salona i booking podešavanja.
  select
    businesses.timezone,
    booking_settings.slot_interval_minutes,
    booking_settings.booking_window_days,
    booking_settings.min_advance_minutes
  into
    v_timezone,
    v_slot_interval,
    v_booking_window_days,
    v_min_advance_minutes
  from public.businesses
  join public.booking_settings
    on booking_settings.business_id =
      businesses.id
  where businesses.id = p_business_id
    and businesses.is_active = true;

  if not found then
    raise exception
      'Active business or booking settings were not found';
  end if;

  -- Današnji datum u lokalnoj vremenskoj zoni salona.
  v_local_today :=
    (now() at time zone v_timezone)::date;

  -- Datum ne sme biti u prošlosti.
  if p_date < v_local_today then
    return;
  end if;

  -- Datum mora biti unutar booking window perioda.
  if p_date >
    v_local_today
    + (v_booking_window_days - 1)
  then
    return;
  end if;

  return query
  with eligible_employees as (
    select
      employees.id as employee_id,
      employees.name as employee_name,

      coalesce(
        employee_services.custom_duration_minutes,
        services.duration_minutes
      ) as duration_minutes

    from public.employee_services

    join public.employees
      on employees.id =
        employee_services.employee_id
      and employees.business_id =
        employee_services.business_id

    join public.services
      on services.id =
        employee_services.service_id
      and services.business_id =
        employee_services.business_id

    where employee_services.business_id =
        p_business_id

      and employee_services.service_id =
        p_service_id

      and employee_services.is_active = true
      and employees.is_active = true
      and services.is_active = true

      and (
        p_employee_id is null
        or employees.id = p_employee_id
      )
  ),

  effective_hours as (
    select
      eligible_employees.employee_id,
      eligible_employees.employee_name,
      eligible_employees.duration_minutes,

      selected_hours.is_closed,
      selected_hours.open_time,
      selected_hours.close_time

    from eligible_employees

    join lateral (
      select
        working_hours.is_closed,
        working_hours.open_time,
        working_hours.close_time

      from public.working_hours

      where working_hours.business_id =
          p_business_id

        and working_hours.day_of_week =
          extract(dow from p_date)::smallint

        and (
          working_hours.employee_id =
            eligible_employees.employee_id

          or working_hours.employee_id is null
        )

      -- Specifično radno vreme zaposlenog ima prednost
      -- nad opštim radnim vremenom salona.
      order by
        (
          working_hours.employee_id is not null
        ) desc

      limit 1
    ) as selected_hours
      on true
  ),

  generated_slots as (
    select
      effective_hours.employee_id,
      effective_hours.employee_name,

      (
        generated.slot_local_start
        at time zone v_timezone
      ) as starts_at,

      (
        generated.slot_local_start
        at time zone v_timezone
      )
      + make_interval(
          mins =>
            effective_hours.duration_minutes
        ) as ends_at

    from effective_hours

    cross join lateral generate_series(
      p_date + effective_hours.open_time,

      (
        p_date + effective_hours.close_time
      )
      - make_interval(
          mins =>
            effective_hours.duration_minutes
        ),

      make_interval(
        mins => v_slot_interval
      )
    ) as generated(slot_local_start)

    where effective_hours.is_closed = false
      and effective_hours.open_time is not null
      and effective_hours.close_time is not null
  )

  select
    generated_slots.employee_id,
    generated_slots.employee_name,
    generated_slots.starts_at,
    generated_slots.ends_at

  from generated_slots

  where
    -- Minimalno vreme unapred.
    generated_slots.starts_at >=
      now()
      + make_interval(
          mins => v_min_advance_minutes
        )

    -- Salon ili zaposleni nisu blokirani.
    and not exists (
      select 1
      from public.time_off

      where time_off.business_id =
          p_business_id

        and (
          time_off.employee_id is null
          or time_off.employee_id =
            generated_slots.employee_id
        )

        and tstzrange(
          time_off.starts_at,
          time_off.ends_at,
          '[)'
        )
        &&
        tstzrange(
          generated_slots.starts_at,
          generated_slots.ends_at,
          '[)'
        )
    )

    -- Zaposleni nema postojeću aktivnu rezervaciju.
    and not exists (
      select 1
      from public.bookings

      where bookings.business_id =
          p_business_id

        and bookings.employee_id =
          generated_slots.employee_id

        and bookings.status in (
          'pending'::public.booking_status,
          'confirmed'::public.booking_status
        )

        and tstzrange(
          bookings.starts_at,
          bookings.ends_at,
          '[)'
        )
        &&
        tstzrange(
          generated_slots.starts_at,
          generated_slots.ends_at,
          '[)'
        )
    )

  order by
    generated_slots.starts_at,
    generated_slots.employee_name;
end;
$$;

-- Funkcija nije dostupna direktno javnom browser klijentu.
revoke all
on function public.get_available_slots(
  uuid,
  uuid,
  date,
  uuid
)
from public, anon, authenticated;

-- Poziva je samo naš server-side admin klijent.
grant execute
on function public.get_available_slots(
  uuid,
  uuid,
  date,
  uuid
)
to service_role;

commit;