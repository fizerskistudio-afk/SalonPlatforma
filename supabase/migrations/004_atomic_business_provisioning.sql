begin;

-- =========================================================
-- 004 ATOMIC BUSINESS PROVISIONING
--
-- Kreira novi business, booking settings, kategorije
-- i usluge unutar jedne PostgreSQL transakcije.
--
-- Funkcija je dostupna samo service_role nalogu.
-- =========================================================

create or replace function public.provision_business(
  input_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  business_payload jsonb;
  preset_payload jsonb;

  categories_payload jsonb;
  services_payload jsonb;
  supported_locales_payload jsonb;

  business_id uuid;
  category_id uuid;

  business_name text;
  business_slug text;
  business_city text;
  business_country text;
  business_phone text;
  business_email text;
  business_timezone text;

  default_locale text;
  supported_locales text[];

  selected_currency text;
  selected_template_key text;
  selected_template_config jsonb;

  localized_city jsonb;
  localized_country jsonb;
  localized_empty_text jsonb;

  booking_settings jsonb;

  category_item jsonb;
  service_item jsonb;

  category_client_key text;
  category_slug text;
  category_ids jsonb := '{}'::jsonb;

  service_category_client_key text;
  service_category_id_text text;
  service_description jsonb;

  category_count integer := 0;
  service_count integer := 0;
begin
  -- =======================================================
  -- ROOT PAYLOAD
  -- =======================================================

  if input_payload is null
    or jsonb_typeof(input_payload) <> 'object'
  then
    raise exception using
      errcode = '22023',
      message =
        'Provisioning payload must be a JSON object.';
  end if;

  business_payload :=
    input_payload -> 'business';

  preset_payload :=
    input_payload -> 'preset';

  if business_payload is null
    or jsonb_typeof(business_payload) <> 'object'
  then
    raise exception using
      errcode = '22023',
      message =
        'Provisioning business payload is missing.';
  end if;

  if preset_payload is null
    or jsonb_typeof(preset_payload) <> 'object'
  then
    raise exception using
      errcode = '22023',
      message =
        'Provisioning preset payload is missing.';
  end if;


  -- =======================================================
  -- BUSINESS IDENTITY
  -- =======================================================

  business_name :=
    btrim(
      coalesce(
        business_payload ->> 'name',
        ''
      )
    );

  business_slug :=
    btrim(
      coalesce(
        business_payload ->> 'slug',
        ''
      )
    );

  business_city :=
    btrim(
      coalesce(
        business_payload ->> 'city',
        ''
      )
    );

  business_country :=
    btrim(
      coalesce(
        business_payload ->> 'country',
        ''
      )
    );

  business_phone :=
    btrim(
      coalesce(
        business_payload ->> 'phone',
        ''
      )
    );

  business_email :=
    nullif(
      lower(
        btrim(
          coalesce(
            business_payload ->> 'email',
            ''
          )
        )
      ),
      ''
    );

  business_timezone :=
    btrim(
      coalesce(
        business_payload ->> 'timezone',
        ''
      )
    );

  if char_length(business_name) < 2
    or char_length(business_name) > 120
  then
    raise exception using
      errcode = '22023',
      message =
        'Business name must contain between 2 and 120 characters.';
  end if;

  if business_slug !~
    '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception using
      errcode = '22023',
      message =
        'Business slug format is invalid.';
  end if;

  if char_length(business_slug) > 80 then
    raise exception using
      errcode = '22023',
      message =
        'Business slug is too long.';
  end if;

  if char_length(business_city) < 2
    or char_length(business_city) > 100
  then
    raise exception using
      errcode = '22023',
      message =
        'Business city is invalid.';
  end if;

  if char_length(business_country) < 2
    or char_length(business_country) > 100
  then
    raise exception using
      errcode = '22023',
      message =
        'Business country is invalid.';
  end if;

  if char_length(business_phone) < 5
    or char_length(business_phone) > 40
  then
    raise exception using
      errcode = '22023',
      message =
        'Business phone is invalid.';
  end if;

  if char_length(business_timezone) < 3
    or char_length(business_timezone) > 100
  then
    raise exception using
      errcode = '22023',
      message =
        'Business timezone is invalid.';
  end if;


  -- =======================================================
  -- PRESET CONFIGURATION
  -- =======================================================

  default_locale :=
    btrim(
      coalesce(
        preset_payload ->> 'locale',
        ''
      )
    );

  selected_currency :=
    upper(
      btrim(
        coalesce(
          preset_payload ->> 'currency',
          ''
        )
      )
    );

  selected_template_key :=
    btrim(
      coalesce(
        preset_payload ->> 'templateKey',
        ''
      )
    );

  selected_template_config :=
    case
      when jsonb_typeof(
        preset_payload -> 'templateConfig'
      ) = 'object'
      then preset_payload -> 'templateConfig'

      else '{}'::jsonb
    end;

  supported_locales_payload :=
    preset_payload -> 'supportedLocales';

  categories_payload :=
    preset_payload -> 'categories';

  services_payload :=
    preset_payload -> 'services';

  booking_settings :=
    preset_payload -> 'bookingSettings';

  if not public.is_supported_locale(
    default_locale
  ) then
    raise exception using
      errcode = '22023',
      message =
        'Default business locale is not supported.';
  end if;

  if selected_currency !~ '^[A-Z]{3}$' then
    raise exception using
      errcode = '22023',
      message =
        'Business currency is invalid.';
  end if;

  if selected_template_key = '' then
    raise exception using
      errcode = '22023',
      message =
        'Business template key is required.';
  end if;

  if supported_locales_payload is null
    or jsonb_typeof(
      supported_locales_payload
    ) <> 'array'
  then
    raise exception using
      errcode = '22023',
      message =
        'Supported locales must be a JSON array.';
  end if;

  select
    array_agg(
      locale_value
    )
  into supported_locales
  from jsonb_array_elements_text(
    supported_locales_payload
  ) as supported_locale(
    locale_value
  );

  if not public.are_supported_locales(
    supported_locales
  ) then
    raise exception using
      errcode = '22023',
      message =
        'Supported business locale list is invalid.';
  end if;

  if not (
    default_locale =
    any(supported_locales)
  ) then
    raise exception using
      errcode = '22023',
      message =
        'Default locale must be included in supported locales.';
  end if;

  if booking_settings is null
    or jsonb_typeof(
      booking_settings
    ) <> 'object'
  then
    raise exception using
      errcode = '22023',
      message =
        'Booking settings payload is invalid.';
  end if;

  if categories_payload is null
    or jsonb_typeof(
      categories_payload
    ) <> 'array'
    or jsonb_array_length(
      categories_payload
    ) = 0
  then
    raise exception using
      errcode = '22023',
      message =
        'At least one service category is required.';
  end if;

  if services_payload is null
    or jsonb_typeof(
      services_payload
    ) <> 'array'
    or jsonb_array_length(
      services_payload
    ) = 0
  then
    raise exception using
      errcode = '22023',
      message =
        'At least one service is required.';
  end if;


  -- =======================================================
  -- CONCURRENCY AND DUPLICATE SLUG PROTECTION
  -- =======================================================

  perform pg_advisory_xact_lock(
    hashtextextended(
      business_slug,
      0
    )
  );

  if exists (
    select 1
    from public.businesses
    where slug = business_slug
  ) then
    raise exception using
      errcode = '23505',
      message =
        'Business slug already exists.';
  end if;


  -- =======================================================
  -- LOCALIZED BUSINESS VALUES
  -- =======================================================

  select
    jsonb_object_agg(
      locale_value,
      business_city
    )
  into localized_city
  from unnest(
    supported_locales
  ) as configured_locale(
    locale_value
  );

  select
    jsonb_object_agg(
      locale_value,
      business_country
    )
  into localized_country
  from unnest(
    supported_locales
  ) as configured_locale(
    locale_value
  );

  localized_empty_text :=
    jsonb_build_object(
      default_locale,
      ''
    );


  -- =======================================================
  -- BUSINESS
  -- =======================================================

  insert into public.businesses (
    slug,
    name,

    tagline,
    description,
    address,
    city,
    country,

    phone,
    email,

    default_locale,
    supported_locales,
    currency,
    timezone,

    template_key,
    template_config,

    is_active
  )
  values (
    business_slug,
    business_name,

    localized_empty_text,
    localized_empty_text,
    localized_empty_text,
    localized_city,
    localized_country,

    business_phone,
    business_email,

    default_locale,
    supported_locales,
    selected_currency,
    business_timezone,

    selected_template_key,
    selected_template_config,

    true
  )
  returning id
  into business_id;


  -- =======================================================
  -- BOOKING SETTINGS
  -- =======================================================

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
    business_id,

    (
      booking_settings ->
      'slotIntervalMinutes'
    )::text::integer,

    (
      booking_settings ->
      'bookingWindowDays'
    )::text::integer,

    (
      booking_settings ->
      'minimumAdvanceMinutes'
    )::text::integer,

    (
      booking_settings ->
      'allowAnyEmployee'
    )::text::boolean,

    (
      booking_settings ->
      'requireEmail'
    )::text::boolean,

    (
      booking_settings ->
      'requirePhone'
    )::text::boolean,

    (
      booking_settings ->
      'allowNotes'
    )::text::boolean,

    (
      booking_settings ->
      'autoConfirm'
    )::text::boolean
  );


  -- =======================================================
  -- SERVICE CATEGORIES
  -- =======================================================

  for category_item in
    select category_value
    from jsonb_array_elements(
      categories_payload
    ) as category_row(
      category_value
    )
  loop
    category_client_key :=
      btrim(
        coalesce(
          category_item ->> 'clientKey',
          ''
        )
      );

    category_slug :=
      btrim(
        coalesce(
          category_item ->> 'slug',
          ''
        )
      );

    if category_client_key = '' then
      raise exception using
        errcode = '22023',
        message =
          'Category client key is required.';
    end if;

    if category_ids ?
      category_client_key
    then
      raise exception using
        errcode = '22023',
        message =
          'Duplicate category client key.';
    end if;

    if category_slug !~
      '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    then
      raise exception using
        errcode = '22023',
        message =
          'Category slug format is invalid.';
    end if;

    if not public.is_localized_text(
      category_item -> 'name'
    ) then
      raise exception using
        errcode = '22023',
        message =
          'Category name translations are invalid.';
    end if;

    if not public.is_localized_text(
      category_item -> 'description'
    ) then
      raise exception using
        errcode = '22023',
        message =
          'Category description translations are invalid.';
    end if;

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
      business_id,
      category_slug,
      category_item -> 'name',
      category_item -> 'description',
      nullif(
        btrim(
          coalesce(
            category_item ->> 'icon',
            ''
          )
        ),
        ''
      ),
      (
        category_item ->
        'sortOrder'
      )::text::integer,
      true
    )
    returning id
    into category_id;

    category_ids :=
      category_ids ||
      jsonb_build_object(
        category_client_key,
        category_id::text
      );

    category_count :=
      category_count + 1;
  end loop;


  -- =======================================================
  -- SERVICES
  -- =======================================================

  for service_item in
    select service_value
    from jsonb_array_elements(
      services_payload
    ) as service_row(
      service_value
    )
  loop
    service_category_client_key :=
      btrim(
        coalesce(
          service_item ->>
            'categoryClientKey',
          ''
        )
      );

    service_category_id_text :=
      category_ids ->>
      service_category_client_key;

    if service_category_id_text is null then
      raise exception using
        errcode = '22023',
        message =
          'Service category reference is invalid.';
    end if;

    if (
      service_item ->> 'slug'
    ) !~
      '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    then
      raise exception using
        errcode = '22023',
        message =
          'Service slug format is invalid.';
    end if;

    if not public.is_localized_text(
      service_item -> 'name'
    ) then
      raise exception using
        errcode = '22023',
        message =
          'Service name translations are invalid.';
    end if;

    service_description :=
      case
        when jsonb_typeof(
          service_item -> 'description'
        ) = 'object'
        then service_item -> 'description'

        else localized_empty_text
      end;

    if not public.is_localized_text(
      service_description
    ) then
      raise exception using
        errcode = '22023',
        message =
          'Service description translations are invalid.';
    end if;

    if (
      service_item ->> 'priceType'
    ) not in (
      'fixed',
      'from',
      'range'
    ) then
      raise exception using
        errcode = '22023',
        message =
          'Service price type is invalid.';
    end if;

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
      business_id,
      service_category_id_text::uuid,
      service_item ->> 'slug',

      service_item -> 'name',
      service_description,

      (
        service_item ->
        'durationMinutes'
      )::text::integer,

      (
        service_item ->>
        'priceType'
      )::public.service_price_type,

      (
        service_item ->
        'priceFrom'
      )::text::numeric,

      case
        when service_item -> 'priceTo'
          is null
          or service_item -> 'priceTo' =
            'null'::jsonb
        then null

        else (
          service_item ->
          'priceTo'
        )::text::numeric
      end,

      (
        service_item ->
        'sortOrder'
      )::text::integer,

      true
    );

    service_count :=
      service_count + 1;
  end loop;


  -- =======================================================
  -- RESULT
  -- =======================================================

  return jsonb_build_object(
    'businessId',
    business_id,

    'slug',
    business_slug,

    'name',
    business_name,

    'defaultLocale',
    default_locale,

    'supportedLocales',
    to_jsonb(
      supported_locales
    ),

    'currency',
    selected_currency,

    'templateKey',
    selected_template_key,

    'categoriesCreated',
    category_count,

    'servicesCreated',
    service_count
  );
end;
$$;


revoke all
on function public.provision_business(jsonb)
from public;


revoke all
on function public.provision_business(jsonb)
from anon;


revoke all
on function public.provision_business(jsonb)
from authenticated;


grant execute
on function public.provision_business(jsonb)
to service_role;


comment on function public.provision_business(jsonb) is
  'Atomically provisions a business, booking settings, service categories and services.';


commit;