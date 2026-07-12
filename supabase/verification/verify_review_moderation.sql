begin;

set local transaction read only;

do $$
declare
  unsafe_functions text[];
begin
  if to_regclass(
    'public.review_moderation_events'
  ) is null then
    raise exception
      'REVIEW_MODERATION_EVENTS_TABLE_MISSING';
  end if;

  if to_regprocedure(
    'public.moderate_review(uuid,public.review_status,text)'
  ) is null then
    raise exception
      'MODERATE_REVIEW_RPC_MISSING';
  end if;

  if to_regprocedure(
    'public.set_review_owner_reply(uuid,text)'
  ) is null then
    raise exception
      'REVIEW_OWNER_REPLY_RPC_MISSING';
  end if;

  if not exists (
    select 1
    from pg_class
    inner join pg_namespace
      on pg_namespace.oid =
        pg_class.relnamespace
    where pg_namespace.nspname =
        'public'
      and pg_class.relname =
        'review_moderation_events'
      and pg_class.relrowsecurity =
        true
  ) then
    raise exception
      'REVIEW_MODERATION_EVENTS_RLS_DISABLED';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname =
        'public'
      and tablename =
        'review_moderation_events'
      and policyname =
        'review_moderation_events_admin_select'
  ) then
    raise exception
      'REVIEW_MODERATION_EVENTS_POLICY_MISSING';
  end if;

  select array_agg(
    pg_proc.proname
  )
  into unsafe_functions
  from pg_proc
  inner join pg_namespace
    on pg_namespace.oid =
      pg_proc.pronamespace
  where pg_namespace.nspname =
      'public'
    and pg_proc.proname in (
      'moderate_review',
      'set_review_owner_reply'
    )
    and pg_proc.prosecdef =
      false;

  if unsafe_functions is not null then
    raise exception
      'REVIEW_MODERATION_RPC_NOT_SECURITY_DEFINER: %',
      unsafe_functions;
  end if;

  if has_function_privilege(
    'anon',
    'public.moderate_review(uuid,public.review_status,text)',
    'execute'
  )
    or has_function_privilege(
      'anon',
      'public.set_review_owner_reply(uuid,text)',
      'execute'
    )
  then
    raise exception
      'REVIEW_MODERATION_ANON_EXECUTE_PRESENT';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.moderate_review(uuid,public.review_status,text)',
    'execute'
  )
    or not has_function_privilege(
      'authenticated',
      'public.set_review_owner_reply(uuid,text)',
      'execute'
    )
  then
    raise exception
      'REVIEW_MODERATION_AUTH_EXECUTE_MISSING';
  end if;

  if has_table_privilege(
    'authenticated',
    'public.reviews',
    'update'
  ) then
    raise exception
      'REVIEWS_DIRECT_AUTH_UPDATE_PRESENT';
  end if;

  if position(
    'for update'
    in lower(
      pg_get_functiondef(
        'public.moderate_review(uuid,public.review_status,text)'::regprocedure
      )
    )
  ) = 0
  then
    raise exception
      'MODERATE_REVIEW_ROW_LOCK_MISSING';
  end if;

  if position(
    'business_members'
    in lower(
      pg_get_functiondef(
        'public.moderate_review(uuid,public.review_status,text)'::regprocedure
      )
    )
  ) = 0
  then
    raise exception
      'MODERATE_REVIEW_MEMBERSHIP_CHECK_MISSING';
  end if;

  if position(
    'review_moderation_events'
    in lower(
      pg_get_functiondef(
        'public.moderate_review(uuid,public.review_status,text)'::regprocedure
      )
    )
  ) = 0
    or position(
      'review_moderation_events'
      in lower(
        pg_get_functiondef(
          'public.set_review_owner_reply(uuid,text)'::regprocedure
        )
      )
    ) = 0
  then
    raise exception
      'REVIEW_MODERATION_AUDIT_INSERT_MISSING';
  end if;
end;
$$;

select
  'PASS' as review_moderation_status,
  to_regclass(
    'public.review_moderation_events'
  ) is not null as audit_table_present,
  to_regprocedure(
    'public.moderate_review(uuid,public.review_status,text)'
  ) is not null as moderation_rpc_present,
  to_regprocedure(
    'public.set_review_owner_reply(uuid,text)'
  ) is not null as reply_rpc_present,
  not has_table_privilege(
    'authenticated',
    'public.reviews',
    'update'
  ) as direct_review_update_blocked,
  exists (
    select 1
    from pg_policies
    where schemaname =
        'public'
      and tablename =
        'review_moderation_events'
      and policyname =
        'review_moderation_events_admin_select'
  ) as audit_policy_present;

rollback;
