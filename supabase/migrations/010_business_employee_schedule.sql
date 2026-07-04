begin;

create or replace function public.update_business_employee_schedule(
  input_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_business_slug text;
  v_employee_slug text;
  v_business_id uuid;
  v_employee_id uuid;
  v_use_business_hours boolean;
  v_working_hours jsonb;

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

  v_business_slug := lower(trim(input_payload ->> 'businessSlug'));
  v_employee_slug := lower(trim(input_payload ->> 'employeeSlug'));

  if v_business_slug is null
    or v_business_slug = ''
    or v_business_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'INVALID_BUSINESS_SLUG';
  end if;

  if v_employee_slug is null
    or v_employee_slug = ''
    or v_employee_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'INVALID_EMPLOYEE_SLUG';
  end if;

  if jsonb_typeof(input_payload -> 'useBusinessHours') <> 'boolean'
  then
    raise exception 'INVALID_SCHEDULE_MODE';
  end if;

  v_use_business_hours :=
    (input_payload ->> 'useBusinessHours')::boolean;

  select businesses.id
  into v_business_id
  from public.businesses
  where businesses.slug = v_business_slug;

  if v_business_id is null then
    raise exception 'BUSINESS_NOT_FOUND';
  end if;

  select employees.id
  into v_employee_id
  from public.employees
  where employees.business_id = v_business_id
    and employees.slug = v_employee_slug;

  if v_employee_id is null then
    raise exception 'EMPLOYEE_NOT_FOUND';
  end if;

  if v_use_business_hours then
    delete from public.working_hours
    where working_hours.business_id = v_business_id
      and working_hours.employee_id = v_employee_id;

    return jsonb_build_object(
      'businessId', v_business_id,
      'businessSlug', v_business_slug,
      'employeeId', v_employee_id,
      'employeeSlug', v_employee_slug,
      'useBusinessHours', true,
      'workingHoursUpdated', 0
    );
  end if;

  v_working_hours := input_payload -> 'workingHours';

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
      or v_open_time::time >= v_close_time::time
    then
      raise exception 'INVALID_WORKING_HOURS';
    end if;
  end loop;

  if cardinality(v_seen_days) <> 7 then
    raise exception 'INVALID_WORKING_HOURS';
  end if;

  delete from public.working_hours
  where working_hours.business_id = v_business_id
    and working_hours.employee_id = v_employee_id;

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
      v_employee_id,
      v_day_of_week,
      case
        when v_open_time is null then null
        else v_open_time::time
      end,
      case
        when v_close_time is null then null
        else v_close_time::time
      end,
      v_is_closed
    );
  end loop;

  return jsonb_build_object(
    'businessId', v_business_id,
    'businessSlug', v_business_slug,
    'employeeId', v_employee_id,
    'employeeSlug', v_employee_slug,
    'useBusinessHours', false,
    'workingHoursUpdated', 7
  );
end;
$$;

revoke all
on function public.update_business_employee_schedule(jsonb)
from public;

grant execute
on function public.update_business_employee_schedule(jsonb)
to service_role;

commit;
