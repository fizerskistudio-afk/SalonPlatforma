begin;

-- =========================================================
-- 006 FIX INITIAL STAFF EMPLOYEE ID AMBIGUITY
--
-- PL/pgSQL variable employee_id conflicted with table columns
-- named employee_id. All local variables now use v_ prefixes.
-- =========================================================

create or replace function public.configure_initial_business_staff(
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

  v_employee_payload jsonb;
  v_employee_id uuid;

  v_employee_name text;
  v_employee_slug text;
  v_employee_title jsonb;
  v_employee_bio jsonb;
  v_employee_email text;
  v_employee_phone text;

  v_working_hours_payload jsonb;
  v_working_hour_item jsonb;

  v_day_text text;
  v_day_value smallint;
  v_is_closed boolean;

  v_open_time_text text;
  v_close_time_text text;

  v_open_time time;
  v_close_time time;

  v_seen_days smallint[] :=
    array[]::smallint[];

  v_existing_employee_count integer;
  v_active_service_count integer;
  v_assigned_service_count integer;
  v_inserted_hours_count integer := 0;
begin
  if
    input_payload is null
    or jsonb_typeof(input_payload) <> 'object'
  then
    raise exception 'INVALID_INPUT_PAYLOAD';
  end if;

  v_business_slug :=
    nullif(
      btrim(
        input_payload ->> 'businessSlug'
      ),
      ''
    );

  if
    v_business_slug is null
    or v_business_slug !~
      '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'INVALID_BUSINESS_SLUG';
  end if;

  v_employee_payload :=
    input_payload -> 'employee';

  if
    v_employee_payload is null
    or jsonb_typeof(v_employee_payload) <> 'object'
  then
    raise exception 'INVALID_EMPLOYEE_PAYLOAD';
  end if;

  v_employee_name :=
    nullif(
      btrim(
        v_employee_payload ->> 'name'
      ),
      ''
    );

  v_employee_slug :=
    nullif(
      btrim(
        v_employee_payload ->> 'slug'
      ),
      ''
    );

  v_employee_title :=
    v_employee_payload -> 'title';

  v_employee_bio :=
    v_employee_payload -> 'bio';

  v_employee_email :=
    nullif(
      lower(
        btrim(
          v_employee_payload ->> 'email'
        )
      ),
      ''
    );

  v_employee_phone :=
    nullif(
      btrim(
        v_employee_payload ->> 'phone'
      ),
      ''
    );

  if
    v_employee_name is null
    or char_length(v_employee_name) < 2
    or char_length(v_employee_name) > 120
  then
    raise exception 'INVALID_EMPLOYEE_NAME';
  end if;

  if
    v_employee_slug is null
    or char_length(v_employee_slug) > 80
    or v_employee_slug !~
      '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'INVALID_EMPLOYEE_SLUG';
  end if;

  if
    v_employee_title is null
    or not public.is_localized_text(
      v_employee_title
    )
  then
    raise exception 'INVALID_EMPLOYEE_TITLE';
  end if;

  if
    v_employee_bio is null
    or not public.is_localized_text(
      v_employee_bio
    )
  then
    raise exception 'INVALID_EMPLOYEE_BIO';
  end if;

  v_working_hours_payload :=
    input_payload -> 'workingHours';

  if
    v_working_hours_payload is null
    or jsonb_typeof(v_working_hours_payload) <> 'array'
    or jsonb_array_length(v_working_hours_payload) <> 7
  then
    raise exception 'INVALID_WORKING_HOURS';
  end if;

  perform pg_advisory_xact_lock(
    hashtext(
      v_business_slug
    )::bigint
  );

  select
    business.id
  into
    v_business_id
  from public.businesses as business
  where business.slug =
    v_business_slug
  for update;

  if not found then
    raise exception 'BUSINESS_NOT_FOUND';
  end if;

  select
    count(*)
  into
    v_existing_employee_count
  from public.employees as employee
  where employee.business_id =
    v_business_id;

  if
    v_existing_employee_count > 0
  then
    raise exception 'BUSINESS_ALREADY_HAS_EMPLOYEES';
  end if;

  select
    count(*)
  into
    v_active_service_count
  from public.services as service
  where
    service.business_id =
      v_business_id
    and service.is_active = true;

  if
    v_active_service_count = 0
  then
    raise exception 'BUSINESS_HAS_NO_ACTIVE_SERVICES';
  end if;

  insert into public.employees (
    business_id,
    slug,
    name,
    title,
    bio,
    email,
    phone,
    sort_order,
    is_active
  )
  values (
    v_business_id,
    v_employee_slug,
    v_employee_name,
    v_employee_title,
    v_employee_bio,
    v_employee_email,
    v_employee_phone,
    1,
    true
  )
  returning employees.id
  into v_employee_id;

  insert into public.employee_services (
    business_id,
    employee_id,
    service_id,
    custom_duration_minutes,
    custom_price_from,
    is_active
  )
  select
    v_business_id,
    v_employee_id,
    service.id,
    null,
    null,
    true
  from public.services as service
  where
    service.business_id =
      v_business_id
    and service.is_active = true;

  get diagnostics
    v_assigned_service_count =
      row_count;

  for v_working_hour_item in
    select hour_item.value
    from jsonb_array_elements(
      v_working_hours_payload
    ) as hour_item(value)
  loop
    if
      jsonb_typeof(v_working_hour_item) <> 'object'
    then
      raise exception 'INVALID_WORKING_HOUR_ITEM';
    end if;

    v_day_text :=
      v_working_hour_item ->> 'dayOfWeek';

    if
      v_day_text is null
      or v_day_text !~ '^[0-6]$'
    then
      raise exception 'INVALID_WORKING_HOUR_DAY';
    end if;

    v_day_value :=
      v_day_text::smallint;

    if
      array_position(
        v_seen_days,
        v_day_value
      ) is not null
    then
      raise exception 'DUPLICATE_WORKING_HOUR_DAY';
    end if;

    v_seen_days :=
      array_append(
        v_seen_days,
        v_day_value
      );

    if
      jsonb_typeof(
        v_working_hour_item -> 'isClosed'
      ) <> 'boolean'
    then
      raise exception 'INVALID_WORKING_HOUR_CLOSED_VALUE';
    end if;

    v_is_closed :=
      (
        v_working_hour_item ->> 'isClosed'
      )::boolean;

    v_open_time_text :=
      nullif(
        btrim(
          v_working_hour_item ->> 'openTime'
        ),
        ''
      );

    v_close_time_text :=
      nullif(
        btrim(
          v_working_hour_item ->> 'closeTime'
        ),
        ''
      );

    if v_is_closed then
      if
        v_open_time_text is not null
        or v_close_time_text is not null
      then
        raise exception 'CLOSED_DAY_HAS_TIMES';
      end if;

      v_open_time := null;
      v_close_time := null;
    else
      if
        v_open_time_text is null
        or v_close_time_text is null
      then
        raise exception 'OPEN_DAY_MISSING_TIMES';
      end if;

      begin
        v_open_time :=
          v_open_time_text::time;

        v_close_time :=
          v_close_time_text::time;
      exception
        when others then
          raise exception 'INVALID_WORKING_HOUR_TIME';
      end;

      if
        v_open_time >= v_close_time
      then
        raise exception 'INVALID_WORKING_HOUR_RANGE';
      end if;
    end if;

    insert into public.working_hours (
      business_id,
      employee_id,
      day_of_week,
      is_closed,
      open_time,
      close_time
    )
    values (
      v_business_id,
      null,
      v_day_value,
      v_is_closed,
      v_open_time,
      v_close_time
    )
    on conflict (
      business_id,
      day_of_week
    )
    where employee_id is null
    do update set
      is_closed =
        excluded.is_closed,

      open_time =
        excluded.open_time,

      close_time =
        excluded.close_time,

      updated_at =
        now();

    insert into public.working_hours (
      business_id,
      employee_id,
      day_of_week,
      is_closed,
      open_time,
      close_time
    )
    values (
      v_business_id,
      v_employee_id,
      v_day_value,
      v_is_closed,
      v_open_time,
      v_close_time
    )
    on conflict (
      business_id,
      employee_id,
      day_of_week
    )
    where employee_id is not null
    do update set
      is_closed =
        excluded.is_closed,

      open_time =
        excluded.open_time,

      close_time =
        excluded.close_time,

      updated_at =
        now();

    v_inserted_hours_count :=
      v_inserted_hours_count + 1;
  end loop;

  if
    cardinality(v_seen_days) <> 7
  then
    raise exception 'INCOMPLETE_WORKING_HOURS';
  end if;

  return jsonb_build_object(
    'businessId',
      v_business_id,

    'businessSlug',
      v_business_slug,

    'employeeId',
      v_employee_id,

    'employeeName',
      v_employee_name,

    'employeeSlug',
      v_employee_slug,

    'servicesAssigned',
      v_assigned_service_count,

    'businessHoursCreated',
      v_inserted_hours_count,

    'employeeHoursCreated',
      v_inserted_hours_count
  );
end;
$$;

revoke all
on function public.configure_initial_business_staff(jsonb)
from public;

revoke all
on function public.configure_initial_business_staff(jsonb)
from anon;

revoke all
on function public.configure_initial_business_staff(jsonb)
from authenticated;

grant execute
on function public.configure_initial_business_staff(jsonb)
to service_role;

commit;