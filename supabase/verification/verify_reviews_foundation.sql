begin;

set local transaction read only;

do $$
declare
  missing_tables text[];
  missing_policies text[];
  rls_disabled_tables text[];
  missing_settings_count bigint;
begin
  select array_agg(required_table)
  into missing_tables
  from unnest(
    array[
      'review_settings',
      'review_provider_connections',
      'review_invitations',
      'reviews'
    ]
  ) as required_table
  where not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = required_table
  );

  if missing_tables is not null then
    raise exception
      'REVIEWS_MISSING_TABLES: %',
      missing_tables;
  end if;

  select array_agg(class_name)
  into rls_disabled_tables
  from (
    select
      pg_class.relname as class_name
    from pg_class
    inner join pg_namespace
      on pg_namespace.oid =
        pg_class.relnamespace
    where pg_namespace.nspname =
      'public'
      and pg_class.relname in (
        'review_settings',
        'review_provider_connections',
        'review_invitations',
        'reviews'
      )
      and pg_class.relrowsecurity =
        false
  ) as disabled;

  if rls_disabled_tables is not null then
    raise exception
      'REVIEWS_RLS_DISABLED: %',
      rls_disabled_tables;
  end if;

  select array_agg(required_policy)
  into missing_policies
  from unnest(
    array[
      'review_settings_admin_select',
      'review_settings_admin_update',
      'review_provider_connections_admin_select',
      'review_invitations_admin_select',
      'reviews_public_select_published',
      'reviews_admin_select'
    ]
  ) as required_policy
  where not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and policyname =
        required_policy
  );

  if missing_policies is not null then
    raise exception
      'REVIEWS_MISSING_POLICIES: %',
      missing_policies;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name =
        'review_invitations'
      and column_name = 'token'
  ) then
    raise exception
      'REVIEWS_RAW_TOKEN_COLUMN_PRESENT';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name =
        'review_invitations'
      and column_name =
        'token_hash'
  ) then
    raise exception
      'REVIEWS_TOKEN_HASH_COLUMN_MISSING';
  end if;

  select count(*)
  into missing_settings_count
  from public.businesses
  left join public.review_settings
    on review_settings.business_id =
      businesses.id
  where review_settings.business_id
    is null;

  if missing_settings_count > 0 then
    raise exception
      'REVIEWS_SETTINGS_BACKFILL_MISSING: %',
      missing_settings_count;
  end if;

  if not exists (
    select 1
    from pg_proc
    inner join pg_namespace
      on pg_namespace.oid =
        pg_proc.pronamespace
    where pg_namespace.nspname =
      'public'
      and pg_proc.proname =
        'can_manage_business_reviews'
  ) then
    raise exception
      'REVIEWS_PERMISSION_HELPER_MISSING';
  end if;
end;
$$;

select
  (
    select count(*)
    from public.review_settings
  ) as review_settings_rows,
  (
    select count(*)
    from public.reviews
  ) as review_rows,
  (
    select count(*)
    from public.review_invitations
  ) as invitation_rows,
  (
    select count(*)
    from public.review_provider_connections
  ) as provider_connection_rows,
  'PASS' as reviews_foundation_status;

rollback;
