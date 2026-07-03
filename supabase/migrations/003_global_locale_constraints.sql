begin;

-- =========================================================
-- 003 GLOBAL LOCALE CONSTRAINTS
--
-- Omogućava da business sadržaj koristi sve jezike iz
-- centralnog locale registry-ja, bez obaveznog mk/sq/en
-- paketa za svaki lokalizovani JSON objekat.
--
-- Postojeći Lumière tenant i njegovi podaci ostaju netaknuti.
-- =========================================================


-- =========================================================
-- SUPPORTED LOCALE VALIDATION
-- =========================================================

create or replace function public.is_supported_locale(
  input_value text
)
returns boolean
language sql
immutable
parallel safe
set search_path = public
as $$
  select coalesce(
    input_value = any(
      array[
        'sr-Latn',
        'sr-Cyrl',
        'mk',
        'sq',
        'en',
        'de',
        'da',
        'fr',
        'it',
        'es',
        'nl',
        'no',
        'sv',
        'pl',
        'pt',
        'ro',
        'hu',
        'hr',
        'sl',
        'bg',
        'el',
        'tr',
        'cs',
        'sk',
        'ar',
        'he'
      ]::text[]
    ),
    false
  );
$$;


-- =========================================================
-- LOCALIZED JSON VALIDATION
--
-- Lokalizovani sadržaj mora:
-- 1. biti JSON objekat;
-- 2. imati najmanje jedan jezik;
-- 3. imati samo podržane locale ključeve;
-- 4. imati string vrednost za svaki prevod.
--
-- Više nije obavezno da svaki objekat sadrži mk, sq i en.
-- =========================================================

create or replace function public.is_localized_text(
  input_value jsonb
)
returns boolean
language plpgsql
immutable
parallel safe
set search_path = public
as $$
declare
  localized_entry record;
begin
  if input_value is null then
    return false;
  end if;

  if jsonb_typeof(
    input_value
  ) <> 'object' then
    return false;
  end if;

  if input_value = '{}'::jsonb then
    return false;
  end if;

  for localized_entry in
    select
      key,
      value
    from jsonb_each(
      input_value
    )
  loop
    if not public.is_supported_locale(
      localized_entry.key
    ) then
      return false;
    end if;

    if jsonb_typeof(
      localized_entry.value
    ) <> 'string' then
      return false;
    end if;
  end loop;

  return true;
end;
$$;


-- =========================================================
-- SUPPORTED LOCALES ARRAY VALIDATION
-- =========================================================

create or replace function public.are_supported_locales(
  input_value text[]
)
returns boolean
language sql
immutable
parallel safe
set search_path = public
as $$
  select
    case
      when input_value is null then
        false

      when cardinality(
        input_value
      ) = 0 then
        false

      else
        not exists (
          select 1
          from unnest(
            input_value
          ) as configured_locale
          where not public.is_supported_locale(
            configured_locale
          )
        )
    end;
$$;


-- =========================================================
-- BUSINESSES LOCALE COLUMNS
-- =========================================================

alter table public.businesses
  add column if not exists
    supported_locales text[];


alter table public.businesses
  alter column default_locale
  set default 'en';


alter table public.businesses
  alter column supported_locales
  set default array['en']::text[];


-- Postojeći redovi bez supported_locales dobijaju
-- trenutni default_locale kao jedini aktivni jezik.

update public.businesses
set supported_locales =
  array[
    default_locale
  ]::text[]
where
  supported_locales is null
  or cardinality(
    supported_locales
  ) = 0;


-- Garantuje da je glavni jezik uvek deo aktivnih jezika.

update public.businesses
set supported_locales =
  array_prepend(
    default_locale,
    supported_locales
  )
where not (
  default_locale =
  any(
    supported_locales
  )
);


alter table public.businesses
  alter column supported_locales
  set not null;


-- =========================================================
-- REPLACE OLD BUSINESS LOCALE CONSTRAINTS
-- =========================================================

alter table public.businesses
  drop constraint if exists
    businesses_default_locale_check;


alter table public.businesses
  drop constraint if exists
    businesses_supported_locales_check;


alter table public.businesses
  drop constraint if exists
    businesses_default_locale_in_supported_check;


alter table public.businesses
  add constraint businesses_default_locale_check
  check (
    public.is_supported_locale(
      default_locale
    )
  );


alter table public.businesses
  add constraint businesses_supported_locales_check
  check (
    public.are_supported_locales(
      supported_locales
    )
  );


alter table public.businesses
  add constraint businesses_default_locale_in_supported_check
  check (
    default_locale =
    any(
      supported_locales
    )
  );


-- =========================================================
-- SELF-TESTS
--
-- Migracija će se prekinuti ako osnovna pravila ne rade.
-- =========================================================

do $$
begin
  if not public.is_supported_locale(
    'sr-Latn'
  ) then
    raise exception
      'sr-Latn locale validation failed.';
  end if;

  if not public.is_supported_locale(
    'de'
  ) then
    raise exception
      'de locale validation failed.';
  end if;

  if public.is_supported_locale(
    'invalid-locale'
  ) then
    raise exception
      'Invalid locale was incorrectly accepted.';
  end if;

  if not public.is_localized_text(
    '{
      "sr-Latn": "Šišanje",
      "en": "Haircut",
      "de": "Haarschnitt"
    }'::jsonb
  ) then
    raise exception
      'Global localized text validation failed.';
  end if;

  if public.is_localized_text(
    '{}'::jsonb
  ) then
    raise exception
      'Empty localized object was incorrectly accepted.';
  end if;

  if public.is_localized_text(
    '[
      "Haircut"
    ]'::jsonb
  ) then
    raise exception
      'Localized array was incorrectly accepted.';
  end if;

  if public.is_localized_text(
    '{
      "sr-Latn": 123
    }'::jsonb
  ) then
    raise exception
      'Non-string translation was incorrectly accepted.';
  end if;

  if public.is_localized_text(
    '{
      "invalid-locale": "Test"
    }'::jsonb
  ) then
    raise exception
      'Unsupported localized key was incorrectly accepted.';
  end if;

  if not public.are_supported_locales(
    array[
      'sr-Latn',
      'en',
      'de'
    ]::text[]
  ) then
    raise exception
      'Supported locale array validation failed.';
  end if;

  if public.are_supported_locales(
    array[
      'sr-Latn',
      'invalid-locale'
    ]::text[]
  ) then
    raise exception
      'Invalid supported locale array was incorrectly accepted.';
  end if;
end;
$$;


comment on function public.is_supported_locale(text) is
  'Validates locale codes supported by the platform locale registry.';


comment on function public.is_localized_text(jsonb) is
  'Validates localized JSON objects with supported locale keys and string values.';


comment on function public.are_supported_locales(text[]) is
  'Validates a non-empty array of supported platform locale codes.';


comment on column public.businesses.supported_locales is
  'Locales enabled for public business content and language selection.';


commit;