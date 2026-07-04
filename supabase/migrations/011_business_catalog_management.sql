begin;

create or replace function public.manage_business_catalog(
  input_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_mode text;
  v_entity_type text;
  v_business_slug text;
  v_business_id uuid;
  v_default_locale text;
  v_supported_locales text[];

  v_current_slug text;
  v_item_slug text;
  v_item_data jsonb;
  v_expected_updated_at timestamptz;

  v_item_id uuid;
  v_item_updated_at timestamptz;

  v_name_value text;
  v_description_value text;
  v_localized_name jsonb := '{}'::jsonb;
  v_localized_description jsonb := '{}'::jsonb;
  v_current_name jsonb;
  v_current_description jsonb;
  v_locale text;

  v_icon_key text;
  v_sort_order integer;
  v_is_active boolean;

  v_category_id uuid;
  v_category_is_active boolean;
  v_duration_minutes integer;
  v_price_type text;
  v_price_from numeric(10, 2);
  v_price_to numeric(10, 2);
begin
  if input_payload is null
    or jsonb_typeof(input_payload) <> 'object'
  then
    raise exception 'INVALID_PAYLOAD';
  end if;

  v_mode := trim(input_payload ->> 'mode');
  v_entity_type := trim(input_payload ->> 'entityType');
  v_business_slug := trim(input_payload ->> 'businessSlug');
  v_current_slug := nullif(trim(input_payload ->> 'currentSlug'), '');
  v_item_slug := trim(input_payload ->> 'itemSlug');
  v_item_data := input_payload -> 'item';

  if v_mode is null
    or v_mode not in ('create', 'update')
  then
    raise exception 'INVALID_MODE';
  end if;

  if v_entity_type is null
    or v_entity_type not in ('category', 'service')
  then
    raise exception 'INVALID_ENTITY_TYPE';
  end if;

  if v_business_slug is null
    or v_business_slug = ''
    or v_business_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'INVALID_BUSINESS_SLUG';
  end if;

  if v_item_slug is null
    or v_item_slug = ''
    or v_item_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'INVALID_ITEM_SLUG';
  end if;

  if v_mode = 'update'
    and (
      v_current_slug is null
      or v_current_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    )
  then
    raise exception 'INVALID_CURRENT_SLUG';
  end if;

  if v_item_data is null
    or jsonb_typeof(v_item_data) <> 'object'
  then
    raise exception 'INVALID_ITEM_DATA';
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

  v_name_value := trim(v_item_data ->> 'name');
  v_description_value := coalesce(
    trim(v_item_data ->> 'description'),
    ''
  );

  if v_name_value is null
    or char_length(v_name_value) < 2
    or char_length(v_name_value) > 160
  then
    raise exception 'INVALID_ITEM_NAME';
  end if;

  if v_entity_type = 'category'
    and char_length(v_description_value) > 2000
  then
    raise exception 'INVALID_CATEGORY_DESCRIPTION';
  end if;

  if v_entity_type = 'service'
    and char_length(v_description_value) > 3000
  then
    raise exception 'INVALID_SERVICE_DESCRIPTION';
  end if;

  if jsonb_typeof(v_item_data -> 'sortOrder') is distinct from 'number'
    or jsonb_typeof(v_item_data -> 'isActive') is distinct from 'boolean'
  then
    raise exception 'INVALID_ITEM_DATA';
  end if;

  begin
    v_sort_order := (v_item_data ->> 'sortOrder')::integer;
    v_is_active := (v_item_data ->> 'isActive')::boolean;
  exception
    when invalid_text_representation
      or numeric_value_out_of_range
    then
      raise exception 'INVALID_ITEM_DATA';
  end;

  if v_sort_order < 0
    or v_sort_order > 100000
  then
    raise exception 'INVALID_SORT_ORDER';
  end if;

  if v_mode = 'update' then
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
  end if;

  if v_entity_type = 'category' then
    v_icon_key := nullif(trim(v_item_data ->> 'iconKey'), '');

    if v_icon_key is not null
      and char_length(v_icon_key) > 100
    then
      raise exception 'INVALID_CATEGORY_ICON';
    end if;

    if v_mode = 'create' then
      if exists (
        select 1
        from public.service_categories
        where service_categories.business_id = v_business_id
          and service_categories.slug = v_item_slug
      ) then
        raise exception 'CATALOG_SLUG_EXISTS';
      end if;

      foreach v_locale in array array_cat(
        array[v_default_locale],
        v_supported_locales
      )
      loop
        if v_locale is not null
          and trim(v_locale) <> ''
        then
          v_localized_name := v_localized_name
            || jsonb_build_object(
              trim(v_locale),
              v_name_value
            );

          v_localized_description := v_localized_description
            || jsonb_build_object(
              trim(v_locale),
              v_description_value
            );
        end if;
      end loop;

      insert into public.service_categories (
        business_id,
        slug,
        name,
        description,
        icon_key,
        sort_order,
        is_active
      )
      values (
        v_business_id,
        v_item_slug,
        v_localized_name,
        v_localized_description,
        v_icon_key,
        v_sort_order,
        v_is_active
      )
      returning
        id,
        updated_at
      into
        v_item_id,
        v_item_updated_at;
    else
      select
        service_categories.id,
        service_categories.updated_at,
        service_categories.name,
        service_categories.description
      into
        v_item_id,
        v_item_updated_at,
        v_current_name,
        v_current_description
      from public.service_categories
      where service_categories.business_id = v_business_id
        and service_categories.slug = v_current_slug
      for update;

      if v_item_id is null then
        raise exception 'CATEGORY_NOT_FOUND';
      end if;

      if v_item_updated_at <> v_expected_updated_at then
        raise exception 'CATALOG_CONFLICT';
      end if;

      if v_item_slug <> v_current_slug
        and exists (
          select 1
          from public.service_categories
          where service_categories.business_id = v_business_id
            and service_categories.slug = v_item_slug
            and service_categories.id <> v_item_id
        )
      then
        raise exception 'CATALOG_SLUG_EXISTS';
      end if;

      if v_is_active = false
        and exists (
          select 1
          from public.services
          where services.business_id = v_business_id
            and services.category_id = v_item_id
            and services.is_active = true
        )
      then
        raise exception 'CATEGORY_HAS_ACTIVE_SERVICES';
      end if;

      v_localized_name := coalesce(
        v_current_name,
        '{}'::jsonb
      ) || jsonb_build_object(
        v_default_locale,
        v_name_value
      );

      v_localized_description := coalesce(
        v_current_description,
        '{}'::jsonb
      ) || jsonb_build_object(
        v_default_locale,
        v_description_value
      );

      update public.service_categories
      set
        slug = v_item_slug,
        name = v_localized_name,
        description = v_localized_description,
        icon_key = v_icon_key,
        sort_order = v_sort_order,
        is_active = v_is_active,
        updated_at = now()
      where service_categories.id = v_item_id
      returning updated_at
      into v_item_updated_at;
    end if;
  else
    if jsonb_typeof(v_item_data -> 'durationMinutes') is distinct from 'number'
      or jsonb_typeof(v_item_data -> 'priceFrom') is distinct from 'number'
    then
      raise exception 'INVALID_SERVICE_DATA';
    end if;

    begin
      v_category_id := (v_item_data ->> 'categoryId')::uuid;
      v_duration_minutes := (v_item_data ->> 'durationMinutes')::integer;
      v_price_from := (v_item_data ->> 'priceFrom')::numeric(10, 2);

      if v_item_data -> 'priceTo' is null
        or jsonb_typeof(v_item_data -> 'priceTo') = 'null'
      then
        v_price_to := null;
      else
        v_price_to := (v_item_data ->> 'priceTo')::numeric(10, 2);
      end if;
    exception
      when invalid_text_representation
        or numeric_value_out_of_range
    then
      raise exception 'INVALID_SERVICE_DATA';
    end;

    v_price_type := trim(v_item_data ->> 'priceType');

    if v_duration_minutes < 5
      or v_duration_minutes > 1440
    then
      raise exception 'INVALID_SERVICE_DURATION';
    end if;

    if v_price_type is null
      or v_price_type not in ('fixed', 'from', 'range')
    then
      raise exception 'INVALID_SERVICE_PRICE_TYPE';
    end if;

    if v_price_from < 0 then
      raise exception 'INVALID_SERVICE_PRICE_FROM';
    end if;

    if v_price_type = 'range' then
      if v_price_to is null
        or v_price_to < v_price_from
      then
        raise exception 'INVALID_SERVICE_PRICE_TO';
      end if;
    else
      v_price_to := null;
    end if;

    select
      service_categories.is_active
    into
      v_category_is_active
    from public.service_categories
    where service_categories.business_id = v_business_id
      and service_categories.id = v_category_id;

    if not found then
      raise exception 'CATEGORY_NOT_FOUND';
    end if;

    if v_is_active = true
      and v_category_is_active = false
    then
      raise exception 'SERVICE_CATEGORY_INACTIVE';
    end if;

    if v_mode = 'create' then
      if exists (
        select 1
        from public.services
        where services.business_id = v_business_id
          and services.slug = v_item_slug
      ) then
        raise exception 'CATALOG_SLUG_EXISTS';
      end if;

      foreach v_locale in array array_cat(
        array[v_default_locale],
        v_supported_locales
      )
      loop
        if v_locale is not null
          and trim(v_locale) <> ''
        then
          v_localized_name := v_localized_name
            || jsonb_build_object(
              trim(v_locale),
              v_name_value
            );

          v_localized_description := v_localized_description
            || jsonb_build_object(
              trim(v_locale),
              v_description_value
            );
        end if;
      end loop;

      insert into public.services (
        business_id,
        category_id,
        slug,
        name,
        description,
        duration_minutes,
        price_type,
        price_from,
        price_to,
        sort_order,
        is_active
      )
      values (
        v_business_id,
        v_category_id,
        v_item_slug,
        v_localized_name,
        v_localized_description,
        v_duration_minutes,
        v_price_type::public.service_price_type,
        v_price_from,
        v_price_to,
        v_sort_order,
        v_is_active
      )
      returning
        id,
        updated_at
      into
        v_item_id,
        v_item_updated_at;
    else
      select
        services.id,
        services.updated_at,
        services.name,
        services.description
      into
        v_item_id,
        v_item_updated_at,
        v_current_name,
        v_current_description
      from public.services
      where services.business_id = v_business_id
        and services.slug = v_current_slug
      for update;

      if v_item_id is null then
        raise exception 'SERVICE_NOT_FOUND';
      end if;

      if v_item_updated_at <> v_expected_updated_at then
        raise exception 'CATALOG_CONFLICT';
      end if;

      if v_item_slug <> v_current_slug
        and exists (
          select 1
          from public.services
          where services.business_id = v_business_id
            and services.slug = v_item_slug
            and services.id <> v_item_id
        )
      then
        raise exception 'CATALOG_SLUG_EXISTS';
      end if;

      v_localized_name := coalesce(
        v_current_name,
        '{}'::jsonb
      ) || jsonb_build_object(
        v_default_locale,
        v_name_value
      );

      v_localized_description := coalesce(
        v_current_description,
        '{}'::jsonb
      ) || jsonb_build_object(
        v_default_locale,
        v_description_value
      );

      update public.services
      set
        category_id = v_category_id,
        slug = v_item_slug,
        name = v_localized_name,
        description = v_localized_description,
        duration_minutes = v_duration_minutes,
        price_type = v_price_type::public.service_price_type,
        price_from = v_price_from,
        price_to = v_price_to,
        sort_order = v_sort_order,
        is_active = v_is_active,
        updated_at = now()
      where services.id = v_item_id
      returning updated_at
      into v_item_updated_at;
    end if;
  end if;

  return jsonb_build_object(
    'businessId', v_business_id,
    'businessSlug', v_business_slug,
    'entityType', v_entity_type,
    'itemId', v_item_id,
    'itemSlug', v_item_slug,
    'updatedAt', v_item_updated_at,
    'mode', v_mode
  );
end;
$$;

revoke all
on function public.manage_business_catalog(jsonb)
from public;

grant execute
on function public.manage_business_catalog(jsonb)
to service_role;

comment on function public.manage_business_catalog(jsonb) is
  'Creates or updates one service category or service for a business atomically.';

commit;
