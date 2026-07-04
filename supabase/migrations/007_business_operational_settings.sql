begin;

create or replace function public.update_business_operational_settings(
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
  v_settings jsonb;
  v_working_hours jsonb;

  v_slot_interval_minutes integer;
  v_booking_window_days integer;
  v_min_advance_minutes integer;
  v_allow_any_employee boolean;
  v_require_email boolean;
  v_require_phone boolean;
  v_allow_notes boolean;
  v_auto_confirm boolean;

  v_hour jsonb;
  v_day_of_week integer;
  v_is_closed boolean;
  v_open_time text;
  v_close_time text;
  v_seen_days integer[] := array[]::integer[];
begin
  if input_payload is null
    or jsonb_typeof(input_payload) <> 'object'
  then
    raise exception 'INVALID_PAYLOAD';
  end if;

  v_business_slug := trim(input_payload ->> 'businessSlug');
  v_settings := input_payload -> 'settings';
  v_working_hours := input_payload -> 'workingHours';

  if v_business_slug is null
    or v_business_slug = ''
    or v_business_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'INVALID_BUSINESS_SLUG';
  end if;

  select businesses.id
  into v_business_id
  from public.businesses
  where businesses.slug = v_business_slug;

  if v_business_id is null then
    raise exception 'BUSINESS_NOT_FOUND';
  end if;

  if v_settings is null
    or jsonb_typeof(v_settings) <> 'object'
  then
    raise exception 'INVALID_SETTINGS';
  end if;

  if jsonb_typeof(v_settings -> 'slotIntervalMinutes') <> 'number'
    or jsonb_typeof(v_settings -> 'bookingWindowDays') <> 'number'
    or jsonb_typeof(v_settings -> 'minimumAdvanceMinutes') <> 'number'
    or jsonb_typeof(v_settings -> 'allowAnyEmployee') <> 'boolean'
    or jsonb_typeof(v_settings -> 'requireEmail') <> 'boolean'
    or jsonb_typeof(v_settings -> 'requirePhone') <> 'boolean'
    or jsonb_typeof(v_settings -> 'allowNotes') <> 'boolean'
    or jsonb_typeof(v_settings -> 'autoConfirm') <> 'boolean'
  then
    raise exception 'INVALID_SETTINGS';
  end if;

  v_slot_interval_minutes :=
    (v_settings ->> 'slotIntervalMinutes')::integer;

  v_booking_window_days :=
    (v_settings ->> 'bookingWindowDays')::integer;

  v_min_advance_minutes :=
    (v_settings ->> 'minimumAdvanceMinutes')::integer;

  v_allow_any_employee :=
    (v_settings ->> 'allowAnyEmployee')::boolean;

  v_require_email :=
    (v_settings ->> 'requireEmail')::boolean;

  v_require_phone :=
    (v_settings ->> 'requirePhone')::boolean;

  v_allow_notes :=
    (v_settings ->> 'allowNotes')::boolean;

  v_auto_confirm :=
    (v_settings ->> 'autoConfirm')::boolean;

  if v_slot_interval_minutes < 5
    or v_slot_interval_minutes > 240
  then
    raise exception 'INVALID_SLOT_INTERVAL';
  end if;

  if v_booking_window_days < 1
    or v_booking_window_days > 365
  then
    raise exception 'INVALID_BOOKING_WINDOW';
  end if;

  if v_min_advance_minutes < 0
    or v_min_advance_minutes > 10080
  then
    raise exception 'INVALID_MINIMUM_ADVANCE';
  end if;

  if v_working_hours is null
    or jsonb_typeof(v_working_hours) <> 'array'
    or jsonb_array_length(v_working_hours) <> 7
  then
    raise exception 'INVALID_WORKING_HOURS';
  end if;

  for v_hour in
    select value
    from jsonb_array_elements(v_working_hours)
  loop
    if jsonb_typeof(v_hour) <> 'object'
      or jsonb_typeof(v_hour -> 'dayOfWeek') <> 'number'
      or jsonb_typeof(v_hour -> 'isClosed') <> 'boolean'
    then
      raise exception 'INVALID_WORKING_HOURS';
    end if;

    v_day_of_week :=
      (v_hour ->> 'dayOfWeek')::integer;

    v_is_closed :=
      (v_hour ->> 'isClosed')::boolean;

    if v_day_of_week < 0
      or v_day_of_week > 6
      or v_day_of_week = any(v_seen_days)
    then
      raise exception 'INVALID_WORKING_HOURS';
    end if;

    v_seen_days :=
      array_append(
        v_seen_days,
        v_day_of_week
      );

    if v_is_closed then
      continue;
    end if;

    if jsonb_typeof(v_hour -> 'openTime') <> 'string'
      or jsonb_typeof(v_hour -> 'closeTime') <> 'string'
    then
      raise exception 'INVALID_WORKING_HOURS';
    end if;

    v_open_time :=
      trim(v_hour ->> 'openTime');

    v_close_time :=
      trim(v_hour ->> 'closeTime');

    if v_open_time !~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'
      or v_close_time !~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'
      or v_open_time >= v_close_time
    then
      raise exception 'INVALID_WORKING_HOURS';
    end if;
  end loop;

  if cardinality(v_seen_days) <> 7 then
    raise exception 'INVALID_WORKING_HOURS';
  end if;

  insert into public.booking_settings (
    business_id,
    slot_interval_minutes,
    booking_window_days,
    min_advance_minutes,
    allow_any_employee,
    require_email,
    require_phone,
    allow_notes,
    auto_confirm
  )
  values (
    v_business_id,
    v_slot_interval_minutes,
    v_booking_window_days,
    v_min_advance_minutes,
    v_allow_any_employee,
    v_require_email,
    v_require_phone,
    v_allow_notes,
    v_auto_confirm
  )
  on conflict (business_id)
  do update set
    slot_interval_minutes = excluded.slot_interval_minutes,
    booking_window_days = excluded.booking_window_days,
    min_advance_minutes = excluded.min_advance_minutes,
    allow_any_employee = excluded.allow_any_employee,
    require_email = excluded.require_email,
    require_phone = excluded.require_phone,
    allow_notes = excluded.allow_notes,
    auto_confirm = excluded.auto_confirm;

  delete from public.working_hours
  where working_hours.business_id = v_business_id
    and working_hours.employee_id is null;

  for v_hour in
    select value
    from jsonb_array_elements(v_working_hours)
  loop
    v_day_of_week :=
      (v_hour ->> 'dayOfWeek')::integer;

    v_is_closed :=
      (v_hour ->> 'isClosed')::boolean;

    if v_is_closed then
      v_open_time := null;
      v_close_time := null;
    else
      v_open_time :=
        trim(v_hour ->> 'openTime');

      v_close_time :=
        trim(v_hour ->> 'closeTime');
    end if;

    insert into public.working_hours (
      business_id,
      employee_id,
      day_of_week,
      open_time,
      close_time,
      is_closed
    )
    values (
      v_business_id,
      null,
      v_day_of_week,
      v_open_time,
      v_close_time,
      v_is_closed
    );
  end loop;

  return jsonb_build_object(
    'businessId', v_business_id,
    'businessSlug', v_business_slug,
    'workingHoursUpdated', 7,
    'settingsUpdated', true
  );
end;
$$;

revoke all
on function public.update_business_operational_settings(jsonb)
from public;

grant execute
on function public.update_business_operational_settings(jsonb)
to service_role;

commit;
