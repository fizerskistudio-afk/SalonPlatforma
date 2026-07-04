begin;

-- =========================================================
-- 014 TENANT MEMBER ACCESS
-- =========================================================

create or replace function public.is_business_owner(
  target_business_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.business_members
    where business_members.business_id = target_business_id
      and business_members.user_id = (select auth.uid())
      and business_members.role = 'owner'::public.business_role
      and business_members.is_active = true
  );
$$;

revoke all
on function public.is_business_owner(uuid)
from public;

grant execute
on function public.is_business_owner(uuid)
to authenticated, service_role;

drop policy if exists
  "Owners and managers can add memberships"
on public.business_members;

drop policy if exists
  "Owners and managers can update memberships"
on public.business_members;

drop policy if exists
  "Owners and managers can delete memberships"
on public.business_members;

create policy "Owners can add memberships"
on public.business_members
for insert
to authenticated
with check (
  public.is_business_owner(business_id)
);

create policy "Owners can update memberships"
on public.business_members
for update
to authenticated
using (
  public.is_business_owner(business_id)
)
with check (
  public.is_business_owner(business_id)
);

create policy "Owners can delete memberships"
on public.business_members
for delete
to authenticated
using (
  public.is_business_owner(business_id)
);

create or replace function public.protect_last_active_business_owner()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_removes_active_owner boolean;
begin
  if tg_op = 'DELETE' then
    v_removes_active_owner :=
      old.role = 'owner'::public.business_role
      and old.is_active = true;
  else
    v_removes_active_owner :=
      old.role = 'owner'::public.business_role
      and old.is_active = true
      and (
        new.role <> 'owner'::public.business_role
        or new.is_active = false
      );
  end if;

  if v_removes_active_owner
    and not exists (
      select 1
      from public.business_members
      where business_members.business_id = old.business_id
        and business_members.id <> old.id
        and business_members.role = 'owner'::public.business_role
        and business_members.is_active = true
    )
  then
    raise exception using
      errcode = 'P0001',
      message = 'LAST_ACTIVE_OWNER';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists
  protect_last_active_business_owner_trigger
on public.business_members;

create trigger protect_last_active_business_owner_trigger
before update or delete
on public.business_members
for each row
execute function public.protect_last_active_business_owner();

drop trigger if exists
  business_members_set_updated_at
on public.business_members;

create trigger business_members_set_updated_at
before update
on public.business_members
for each row
execute function public.set_updated_at();

create index if not exists
  business_members_business_role_active_idx
on public.business_members (
  business_id,
  role,
  is_active
);

commit;
