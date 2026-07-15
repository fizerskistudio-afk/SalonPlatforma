begin;

alter table public.businesses
  add column if not exists package_key text,
  add column if not exists package_contract_version smallint,
  add column if not exists package_assigned_at timestamptz,
  add column if not exists package_assigned_by_user_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'businesses_package_key_check'
      and conrelid = 'public.businesses'::regclass
  ) then
    alter table public.businesses
      add constraint businesses_package_key_check
      check (
        package_key is null
        or package_key in (
          'booking_page',
          'digital_studio',
          'operations_pro',
          'reputation_pro',
          'signature'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'businesses_package_contract_version_check'
      and conrelid = 'public.businesses'::regclass
  ) then
    alter table public.businesses
      add constraint businesses_package_contract_version_check
      check (
        package_contract_version is null
        or package_contract_version > 0
      );
  end if;
end
$$;

comment on column public.businesses.package_key is
  'Commercial package key. NULL means legacy/unassigned during the safe rollout and must not disable existing functionality.';

comment on column public.businesses.package_contract_version is
  'Version of the product package registry used when package_key was assigned.';

comment on column public.businesses.package_assigned_at is
  'Timestamp of the latest explicit package assignment.';

comment on column public.businesses.package_assigned_by_user_id is
  'Auth user id of the platform operator who made the latest explicit package assignment.';

commit;
