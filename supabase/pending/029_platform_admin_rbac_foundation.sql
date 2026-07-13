-- PENDING SOURCE ONLY.
-- Do not apply without explicit database approval and a reviewed bootstrap plan.

begin;

do $$
begin
  create type public.platform_admin_role as enum (
    'super_admin',
    'sales',
    'launch_manager',
    'it'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.platform_admin_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references auth.users(id)
    on delete restrict,
  role public.platform_admin_role not null,
  display_name text,
  is_active boolean not null default true,
  created_by uuid
    references auth.users(id)
    on delete set null,
  updated_by uuid
    references auth.users(id)
    on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_admin_members_user_unique
    unique (user_id),
  constraint platform_admin_members_display_name_length
    check (
      display_name is null
      or char_length(display_name) between 1 and 120
    )
);

alter table public.platform_admin_members
  enable row level security;

revoke all
on table public.platform_admin_members
from anon, authenticated;

create index if not exists
  platform_admin_members_role_active_idx
on public.platform_admin_members (
  role,
  is_active
);

drop trigger if exists
  platform_admin_members_set_updated_at
on public.platform_admin_members;

create trigger platform_admin_members_set_updated_at
before update
on public.platform_admin_members
for each row
execute function public.set_updated_at();

create or replace function public.get_my_platform_admin_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select platform_admin_members.role::text
  from public.platform_admin_members
  where platform_admin_members.user_id = (select auth.uid())
    and platform_admin_members.is_active = true
  limit 1;
$$;

revoke all
on function public.get_my_platform_admin_role()
from public;

grant execute
on function public.get_my_platform_admin_role()
to authenticated, service_role;

create or replace function public.protect_last_active_platform_super_admin()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  removes_active_super_admin boolean;
begin
  if tg_op = 'DELETE' then
    removes_active_super_admin :=
      old.role = 'super_admin'::public.platform_admin_role
      and old.is_active = true;
  else
    removes_active_super_admin :=
      old.role = 'super_admin'::public.platform_admin_role
      and old.is_active = true
      and (
        new.role <> 'super_admin'::public.platform_admin_role
        or new.is_active = false
      );
  end if;

  if removes_active_super_admin
    and not exists (
      select 1
      from public.platform_admin_members
      where platform_admin_members.id <> old.id
        and platform_admin_members.role =
          'super_admin'::public.platform_admin_role
        and platform_admin_members.is_active = true
    )
  then
    raise exception using
      errcode = 'P0001',
      message = 'LAST_ACTIVE_PLATFORM_SUPER_ADMIN';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists
  protect_last_active_platform_super_admin_trigger
on public.platform_admin_members;

create trigger protect_last_active_platform_super_admin_trigger
before update or delete
on public.platform_admin_members
for each row
execute function public.protect_last_active_platform_super_admin();

comment on table public.platform_admin_members is
  'Platform staff membership, separate from tenant business_members.';

comment on function public.get_my_platform_admin_role() is
  'Returns only the authenticated caller active platform role.';

commit;

-- Intentionally omitted:
--   - bootstrap INSERT for the current super-admin;
--   - department tables or team-management UI;
--   - automatic application auth-mode activation;
--   - database execution from an installer.
