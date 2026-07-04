begin;

-- =========================================================
-- 005 INITIAL BUSINESS STAFF
--
-- Atomically creates:
--   1. first employee
--   2. employee ↔ all active services relations
--   3. business working hours
--   4. employee working hours
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
  business_slug text;

  target_business_id uuid;

  employee_payload jsonb;
  employee_id uuid;

  employee_name text;
  employee_slug text;
  employee_title jsonb;
  employee_bio jsonb;
  employee_email text;
  employee_phone text;

  working_hours_payload jsonb;
  working_hour_item jsonb;

  day_text text;
  day_value smallint;
  is_closed_value boolean;

  open_time_text text;
  close_time_text text;

  open_time_value time;
  close_time_value time;

  seen_days smallint[] :=
    array[]::smallint[];

  existing_employee_count integer;
  active_service_count integer;
  assigned_service_count integer;
  inserted_hours_count integer := 0;
begin
  if
    input_payload is null
    or jsonb_typeof(input_payload) <> 'object'
  then
    raise exception 'INVALID_INPUT_PAYLOAD';
  end if;

  business_slug :=
    nullif(
      btrim(
        input_payload ->> 'businessSlug'
      ),
      ''
    );

  if
    business_slug is null
    or business_slug !~
      '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'INVALID_BUSINESS_SLUG';
  end if;

  employee_payload :=
    input_payload -> 'employee';

  if
    employee_payload is null
    or jsonb_typeof(employee_payload) <> 'object'
  then
    raise exception 'INVALID_EMPLOYEE_PAYLOAD';
  end if;

  employee_name :=
    nullif(
      btrim(
        employee_payload ->> 'name'
      ),
      ''
    );

  employee_slug :=
    nullif(
      btrim(
        employee_payload ->> 'slug'
      ),
      ''
    );

  employee_title :=
    employee_payload -> 'title';

  employee_bio :=
    employee_payload -> 'bio';

  employee_email :=
    nullif(
      lower(
        btrim(
          employee_payload ->> 'email'
        )
      ),
      ''
    );

  employee_phone :=
    nullif(
      btrim(
        employee_payload ->> 'phone'
      ),
      ''
    );

  if
    employee_name is null
    or char_length(employee_name) < 2
    or char_length(employee_name) > 120
  then
    raise exception 'INVALID_EMPLOYEE_NAME';
  end if;

  if
    employee_slug is null
    or char_length(employee_slug) > 80
    or employee_slug !~
      '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'INVALID_EMPLOYEE_SLUG';
  end if;

  if
    employee_title is null
    or not public.is_localized_text(
      employee_title
    )
  then
    raise exception 'INVALID_EMPLOYEE_TITLE';
  end if;

  if
    employee_bio is null
    or not public.is_localized_text(
      employee_bio
    )
  then
    raise exception 'INVALID_EMPLOYEE_BIO';
  end if;

  working_hours_payload :=
    input_payload -> 'workingHours';

  if
    working_hours_payload is null
    or jsonb_typeof(
      working_hours_payload
    ) <> 'array'
    or jsonb_array_length(
      working_hours_payload
    ) <> 7
  then
    raise exception 'INVALID_WORKING_HOURS';
  end if;

  perform pg_advisory_xact_lock(
    hashtext(
      business_slug
    )::bigint
  );

  select
    id
  into
    target_business_id
  from public.businesses
  where slug = business_slug
  for update;

  if not found then
    raise exception 'BUSINESS_NOT_FOUND';
  end if;

  select
    count(*)
  into
    existing_employee_count
  from public.employees
  where business_id =
    target_business_id;

  if
    existing_employee_count > 0
  then
    raise exception 'BUSINESS_ALREADY_HAS_EMPLOYEES';
  end if;

  select
    count(*)
  into
    active_service_count
  from public.services
  where
    business_id =
      target_business_id
    and is_active = true;

  if
    active_service_count = 0
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
    target_business_id,
    employee_slug,
    employee_name,
    employee_title,
    employee_bio,
    employee_email,
    employee_phone,
    1,
    true
  )
  returning id
  into employee_id;

  insert into public.employee_services (
    business_id,
    employee_id,
    service_id,
    custom_duration_minutes,
    custom_price_from,
    is_active
  )
  select
    target_business_id,
    employee_id,
    service.id,
    null,
    null,
    true
  from public.services as service
  where
    service.business_id =
      target_business_id
    and service.is_active = true;

  get diagnostics
    assigned_service_count =
      row_count;

  for working_hour_item in
    select value
    from jsonb_array_elements(
      working_hours_payload
    )
  loop
    if
      jsonb_typeof(
        working_hour_item
      ) <> 'object'
    then
      raise exception 'INVALID_WORKING_HOUR_ITEM';
    end if;

    day_text :=
      working_hour_item ->> 'dayOfWeek';

    if
      day_text is null
      or day_text !~ '^[0-6]$'
    then
      raise exception 'INVALID_WORKING_HOUR_DAY';
    end if;

    day_value :=
      day_text::smallint;

    if
      array_position(
        seen_days,
        day_value
      ) is not null
    then
      raise exception 'DUPLICATE_WORKING_HOUR_DAY';
    end if;

    seen_days :=
      array_append(
        seen_days,
        day_value
      );

    if
      jsonb_typeof(
        working_hour_item -> 'isClosed'
      ) <> 'boolean'
    then
      raise exception 'INVALID_WORKING_HOUR_CLOSED_VALUE';
    end if;

    is_closed_value :=
      (
        working_hour_item ->> 'isClosed'
      )::boolean;

    open_time_text :=
      nullif(
        btrim(
          working_hour_item ->> 'openTime'
        ),
        ''
      );

    close_time_text :=
      nullif(
        btrim(
          working_hour_item ->> 'closeTime'
        ),
        ''
      );

    if is_closed_value then
      if
        open_time_text is not null
        or close_time_text is not null
      then
        raise exception 'CLOSED_DAY_HAS_TIMES';
      end if;

      open_time_value := null;
      close_time_value := null;
    else
      if
        open_time_text is null
        or close_time_text is null
      then
        raise exception 'OPEN_DAY_MISSING_TIMES';
      end if;

      begin
        open_time_value :=
          open_time_text::time;

        close_time_value :=
          close_time_text::time;
      exception
        when others then
          raise exception 'INVALID_WORKING_HOUR_TIME';
      end;

      if
        open_time_value >=
          close_time_value
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
      target_business_id,
      null,
      day_value,
      is_closed_value,
      open_time_value,
      close_time_value
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
      target_business_id,
      employee_id,
      day_value,
      is_closed_value,
      open_time_value,
      close_time_value
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

    inserted_hours_count :=
      inserted_hours_count + 1;
  end loop;

  if
    cardinality(
      seen_days
    ) <> 7
  then
    raise exception 'INCOMPLETE_WORKING_HOURS';
  end if;

  return jsonb_build_object(
    'businessId',
      target_business_id,

    'businessSlug',
      business_slug,

    'employeeId',
      employee_id,

    'employeeName',
      employee_name,

    'employeeSlug',
      employee_slug,

    'servicesAssigned',
      assigned_service_count,

    'businessHoursCreated',
      inserted_hours_count,

    'employeeHoursCreated',
      inserted_hours_count
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