begin;

create or replace function public.manage_business_time_off(
  input_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_mode text;
  v_business_slug text;
  v_business_id uuid;
  v_timezone text;

  v_block_id uuid;
  v_expected_updated_at timestamptz;
  v_current_updated_at timestamptz;
  v_block_data jsonb;

  v_employee_slug text;
  v_employee_id uuid;
  v_block_type public.schedule_block_type;
  v_reason text;
  v_starts_local timestamp;
  v_ends_local timestamp;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_booking_conflicts integer;
begin
  if input_payload is null
    or jsonb_typeof(input_payload) <> 'object'
  then
    raise exception 'INVALID_PAYLOAD';
  end if;

  v_mode := trim(input_payload ->> 'mode');
  v_business_slug := trim(input_payload ->> 'businessSlug');

  if v_mode is null
    or v_mode not in ('create', 'update', 'delete')
  then
    raise exception 'INVALID_MODE';
  end if;

  if v_business_slug is null
    or v_business_slug = ''
    or v_business_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'INVALID_BUSINESS_SLUG';
  end if;

  select
    businesses.id,
    businesses.timezone
  into
    v_business_id,
    v_timezone
  from public.businesses
  where businesses.slug = v_business_slug;

  if v_business_id is null then
    raise exception 'BUSINESS_NOT_FOUND';
  end if;

  if v_mode in ('update', 'delete') then
    begin
      v_block_id := (input_payload ->> 'blockId')::uuid;
    exception
      when invalid_text_representation then
        raise exception 'INVALID_BLOCK_ID';
    end;

    begin
      v_expected_updated_at :=
        (input_payload ->> 'expectedUpdatedAt')::timestamptz;
    exception
      when invalid_datetime_format then
        raise exception 'INVALID_EXPECTED_UPDATED_AT';
    end;

    select time_off.updated_at
    into v_current_updated_at
    from public.time_off
    where time_off.id = v_block_id
      and time_off.business_id = v_business_id
    for update;

    if v_current_updated_at is null then
      raise exception 'TIME_OFF_NOT_FOUND';
    end if;

    if v_current_updated_at <> v_expected_updated_at then
      raise exception 'TIME_OFF_CONFLICT';
    end if;
  end if;

  if v_mode = 'delete' then
    delete from public.time_off
    where time_off.id = v_block_id
      and time_off.business_id = v_business_id;

    return jsonb_build_object(
      'mode', v_mode,
      'businessId', v_business_id,
      'businessSlug', v_business_slug,
      'blockId', v_block_id
    );
  end if;

  v_block_data := input_payload -> 'block';

  if v_block_data is null
    or jsonb_typeof(v_block_data) <> 'object'
  then
    raise exception 'INVALID_BLOCK_DATA';
  end if;

  v_employee_slug := nullif(trim(v_block_data ->> 'employeeSlug'), '');
  v_reason := nullif(trim(v_block_data ->> 'reason'), '');

  begin
    v_block_type := (v_block_data ->> 'blockType')::public.schedule_block_type;
  exception
    when invalid_text_representation then
      raise exception 'INVALID_BLOCK_TYPE';
  end;

  begin
    v_starts_local := (v_block_data ->> 'startsLocal')::timestamp;
    v_ends_local := (v_block_data ->> 'endsLocal')::timestamp;
  exception
    when invalid_datetime_format then
      raise exception 'INVALID_BLOCK_RANGE';
  end;

  if v_ends_local <= v_starts_local then
    raise exception 'INVALID_BLOCK_RANGE';
  end if;

  if v_reason is not null
    and char_length(v_reason) > 500
  then
    raise exception 'INVALID_BLOCK_REASON';
  end if;

  if v_employee_slug is not null then
    if v_employee_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
      raise exception 'INVALID_EMPLOYEE_SLUG';
    end if;

    select employees.id
    into v_employee_id
    from public.employees
    where employees.business_id = v_business_id
      and employees.slug = v_employee_slug;

    if v_employee_id is null then
      raise exception 'EMPLOYEE_NOT_FOUND';
    end if;
  else
    v_employee_id := null;
  end if;

  v_starts_at := v_starts_local at time zone v_timezone;
  v_ends_at := v_ends_local at time zone v_timezone;

  if exists (
    select 1
    from public.time_off existing_block
    where existing_block.business_id = v_business_id
      and (
        v_mode = 'create'
        or existing_block.id <> v_block_id
      )
      and (
        existing_block.employee_id is null
        or v_employee_id is null
        or existing_block.employee_id = v_employee_id
      )
      and tstzrange(
        existing_block.starts_at,
        existing_block.ends_at,
        '[)'
      ) && tstzrange(
        v_starts_at,
        v_ends_at,
        '[)'
      )
  ) then
    raise exception 'TIME_OFF_OVERLAP';
  end if;

  select count(*)
  into v_booking_conflicts
  from public.bookings
  where bookings.business_id = v_business_id
    and bookings.status in (
      'pending'::public.booking_status,
      'confirmed'::public.booking_status
    )
    and (
      v_employee_id is null
      or bookings.employee_id = v_employee_id
    )
    and tstzrange(
      bookings.starts_at,
      bookings.ends_at,
      '[)'
    ) && tstzrange(
      v_starts_at,
      v_ends_at,
      '[)'
    );

  if v_booking_conflicts > 0 then
    raise exception 'TIME_OFF_BOOKING_CONFLICT:%', v_booking_conflicts;
  end if;

  if v_mode = 'create' then
    insert into public.time_off (
      business_id,
      employee_id,
      block_type,
      starts_at,
      ends_at,
      reason
    )
    values (
      v_business_id,
      v_employee_id,
      v_block_type,
      v_starts_at,
      v_ends_at,
      v_reason
    )
    returning
      id,
      updated_at
    into
      v_block_id,
      v_current_updated_at;
  else
    update public.time_off
    set
      employee_id = v_employee_id,
      block_type = v_block_type,
      starts_at = v_starts_at,
      ends_at = v_ends_at,
      reason = v_reason,
      updated_at = now()
    where time_off.id = v_block_id
      and time_off.business_id = v_business_id
    returning updated_at
    into v_current_updated_at;
  end if;

  return jsonb_build_object(
    'mode', v_mode,
    'businessId', v_business_id,
    'businessSlug', v_business_slug,
    'blockId', v_block_id,
    'employeeId', v_employee_id,
    'blockType', v_block_type,
    'startsAt', v_starts_at,
    'endsAt', v_ends_at,
    'updatedAt', v_current_updated_at
  );
end;
$$;

revoke all
on function public.manage_business_time_off(jsonb)
from public;

grant execute
on function public.manage_business_time_off(jsonb)
to service_role;

comment on function public.manage_business_time_off(jsonb) is
  'Atomically creates, updates, or deletes platform-admin time-off blocks while protecting active bookings.';

commit;
