begin;

alter table public.businesses
  add column if not exists supported_locales text[]
  not null
  default array['mk', 'sq', 'en']::text[];

update public.businesses
set supported_locales =
  array_prepend(
    default_locale,
    supported_locales
  )
where not (
  default_locale =
  any(supported_locales)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'businesses_supported_locales_count_check'
  ) then
    alter table public.businesses
      add constraint
        businesses_supported_locales_count_check
      check (
        cardinality(
          supported_locales
        ) between 1 and 20
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname =
      'businesses_default_locale_supported_check'
  ) then
    alter table public.businesses
      add constraint
        businesses_default_locale_supported_check
      check (
        default_locale =
        any(supported_locales)
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname =
      'businesses_supported_locales_no_blank_check'
  ) then
    alter table public.businesses
      add constraint
        businesses_supported_locales_no_blank_check
      check (
        array_position(
          supported_locales,
          ''
        ) is null
      );
  end if;
end;
$$;

commit;
