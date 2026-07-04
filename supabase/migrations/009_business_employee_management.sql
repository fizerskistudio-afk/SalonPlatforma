begin;

create or replace function public.manage_business_employee(
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
  v_default_locale text;
  v_supported_locales text[];

  v_employee_slug text;
  v_employee_data jsonb;
  v_expected_updated_at timestamptz;

  v_employee_id uuid;
  v_employee_updated_at timestamptz;
  v_current_title jsonb;
  v_current_bio jsonb;

  v_name text;
  v_title_value text;
  v_bio_value text;
  v_email text;
  v_phone text;
  v_image_url text;
  v_sort_order integer;
  v_is_active boolean;

  v_title jsonb := '{}'::jsonb;
  v_bio jsonb := '{}'::jsonb;
  v_locale text;

  v_service_ids_json jsonb;
  v_service_ids uuid[] := array[]::uuid[];
  v_service_count integer := 0;
  v_valid_service_count integer := 0;
begin
  if input_payload is null
    or jsonb_typeof(input_payload) <> 'object'
  then
    raise exception 'INVALID_PAYLOAD';
  end if;

  v_mode := trim(input_payload ->> 'mode');
  v_business_slug := trim(input_payload ->> 'businessSlug');
  v_employee_slug := trim(input_payload ->> 'employeeSlug');
  v_employee_data := input_payload -> 'employee';
  v_service_ids_json := input_payload -> 'serviceIds';

  if v_mode is null
    or v_mode not in ('create', 'update')
  then
    raise exception 'INVALID_MODE';
  end if;

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

  if v_employee_data is null
    or jsonb_typeof(v_employee_data) <> 'object'
  then
    raise exception 'INVALID_EMPLOYEE_DATA';
  end if;

  if v_service_ids_json is null
    or jsonb_typeof(v_service_ids_json) <> 'array'
  then
    raise exception 'INVALID_SERVICE_IDS';
  end if;

  select
    businesses.id,
    businesses.default_locale,
    coalesce(
      businesses.supported_locales,
      array[]::text[]
    )
  into
    v_business_id,
    v_default_locale,
    v_supported_locales
  from public.businesses
  where businesses.slug = v_business_slug;

  if v_business_id is null then
    raise exception 'BUSINESS_NOT_FOUND';
  end if;

  v_name := trim(v_employee_data ->> 'name');
  v_title_value := trim(v_employee_data ->> 'title');
  v_bio_value := coalesce(trim(v_employee_data ->> 'bio'), '');
  v_email := nullif(trim(v_employee_data ->> 'email'), '');
  v_phone := nullif(trim(v_employee_data ->> 'phone'), '');
  v_image_url := nullif(trim(v_employee_data ->> 'imageUrl'), '');

  if jsonb_typeof(v_employee_data -> 'sortOrder') is distinct from 'number'
    or jsonb_typeof(v_employee_data -> 'isActive') is distinct from 'boolean'
  then
    raise exception 'INVALID_EMPLOYEE_DATA';
  end if;

  v_sort_order := (v_employee_data ->> 'sortOrder')::integer;
  v_is_active := (v_employee_data ->> 'isActive')::boolean;

  if v_name is null
    or char_length(v_name) < 2
    or char_length(v_name) > 120
  then
    raise exception 'INVALID_EMPLOYEE_NAME';
  end if;

  if v_title_value is null
    or char_length(v_title_value) < 2
    or char_length(v_title_value) > 100
  then
    raise exception 'INVALID_EMPLOYEE_TITLE';
  end if;

  if char_length(v_bio_value) > 1000 then
    raise exception 'INVALID_EMPLOYEE_BIO';
  end if;

  if v_email is not null
    and char_length(v_email) > 254
  then
    raise exception 'INVALID_EMPLOYEE_EMAIL';
  end if;

  if v_phone is not null
    and char_length(v_phone) > 40
  then
    raise exception 'INVALID_EMPLOYEE_PHONE';
  end if;

  if v_image_url is not null
    and char_length(v_image_url) > 2000
  then
    raise exception 'INVALID_EMPLOYEE_IMAGE';
  end if;

  if v_sort_order < 0
    or v_sort_order > 100000
  then
    raise exception 'INVALID_EMPLOYEE_SORT_ORDER';
  end if;

  begin
    select coalesce(
      array_agg(distinct service_id),
      array[]::uuid[]
    )
    into v_service_ids
    from (
      select value::uuid as service_id
      from jsonb_array_elements_text(v_service_ids_json)
    ) as parsed_service_ids;
  exception
    when invalid_text_representation then
      raise exception 'INVALID_SERVICE_IDS';
  end;

  v_service_count := jsonb_array_length(v_service_ids_json);

  if cardinality(v_service_ids) <> v_service_count then
    raise exception 'INVALID_SERVICE_IDS';
  end if;

  if v_service_count > 0 then
    select count(*)
    into v_valid_service_count
    from public.services
    where services.business_id = v_business_id
      and services.id = any(v_service_ids)
      and services.is_active = true;

    if v_valid_service_count <> v_service_count then
      raise exception 'SERVICE_NOT_FOUND_OR_INACTIVE';
    end if;
  end if;

  if v_mode = 'create' then
    if exists (
      select 1
      from public.employees
      where employees.business_id = v_business_id
        and employees.slug = v_employee_slug
    ) then
      raise exception 'EMPLOYEE_SLUG_EXISTS';
    end if;

    foreach v_locale in array array_cat(
      array['mk', 'sq', 'en', v_default_locale],
      v_supported_locales
    )
    loop
      if v_locale is not null
        and trim(v_locale) <> ''
      then
        v_title := v_title || jsonb_build_object(
          trim(v_locale),
          v_title_value
        );

        v_bio := v_bio || jsonb_build_object(
          trim(v_locale),
          v_bio_value
        );
      end if;
    end loop;

    insert into public.employees (
      business_id,
      slug,
      name,
      title,
      bio,
      image_url,
      email,
      phone,
      sort_order,
      is_active
    )
    values (
      v_business_id,
      v_employee_slug,
      v_name,
      v_title,
      v_bio,
      v_image_url,
      v_email,
      v_phone,
      v_sort_order,
      v_is_active
    )
    returning
      id,
      updated_at
    into
      v_employee_id,
      v_employee_updated_at;
  else
    if jsonb_typeof(input_payload -> 'expectedUpdatedAt') is distinct from 'string' then
      raise exception 'INVALID_EXPECTED_UPDATED_AT';
    end if;

    begin
      v_expected_updated_at :=
        (input_payload ->> 'expectedUpdatedAt')::timestamptz;
    exception
      when invalid_datetime_format then
        raise exception 'INVALID_EXPECTED_UPDATED_AT';
    end;

    select
      employees.id,
      employees.updated_at,
      employees.title,
      employees.bio
    into
      v_employee_id,
      v_employee_updated_at,
      v_current_title,
      v_current_bio
    from public.employees
    where employees.business_id = v_business_id
      and employees.slug = v_employee_slug
    for update;

    if v_employee_id is null then
      raise exception 'EMPLOYEE_NOT_FOUND';
    end if;

    if v_employee_updated_at <> v_expected_updated_at then
      raise exception 'EMPLOYEE_CONFLICT';
    end if;

    v_title := coalesce(v_current_title, '{}'::jsonb)
      || jsonb_build_object(v_default_locale, v_title_value);

    v_bio := coalesce(v_current_bio, '{}'::jsonb)
      || jsonb_build_object(v_default_locale, v_bio_value);

    foreach v_locale in array array['mk', 'sq', 'en']
    loop
      if not (v_title ? v_locale) then
        v_title := v_title || jsonb_build_object(v_locale, '');
      end if;

      if not (v_bio ? v_locale) then
        v_bio := v_bio || jsonb_build_object(v_locale, '');
      end if;
    end loop;

    update public.employees
    set
      name = v_name,
      title = v_title,
      bio = v_bio,
      image_url = v_image_url,
      email = v_email,
      phone = v_phone,
      sort_order = v_sort_order,
      is_active = v_is_active,
      updated_at = now()
    where employees.id = v_employee_id
    returning updated_at
    into v_employee_updated_at;
  end if;

  update public.employee_services
  set
    is_active = false,
    updated_at = now()
  where employee_services.business_id = v_business_id
    and employee_services.employee_id = v_employee_id
    and not (
      employee_services.service_id = any(v_service_ids)
    )
    and employee_services.is_active = true;

  if v_service_count > 0 then
    insert into public.employee_services (
      business_id,
      employee_id,
      service_id,
      is_active
    )
    select
      v_business_id,
      v_employee_id,
      service_id,
      true
    from unnest(v_service_ids) as service_id
    on conflict (employee_id, service_id)
    do update set
      is_active = true,
      updated_at = now();
  end if;

  select employees.updated_at
  into v_employee_updated_at
  from public.employees
  where employees.id = v_employee_id;

  return jsonb_build_object(
    'businessId', v_business_id,
    'businessSlug', v_business_slug,
    'employeeId', v_employee_id,
    'employeeSlug', v_employee_slug,
    'updatedAt', v_employee_updated_at,
    'serviceCount', v_service_count,
    'mode', v_mode
  );
end;
$$;

revoke all
on function public.manage_business_employee(jsonb)
from public;

grant execute
on function public.manage_business_employee(jsonb)
to service_role;

commit;
