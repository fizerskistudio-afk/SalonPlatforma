begin;

set local transaction read only;

do $$
declare
  missing_functions text[];
  unsafe_functions text[];
begin
  if to_regclass(
    'public.review_invitation_jobs'
  ) is null then
    raise exception
      'REVIEW_INVITATION_JOBS_TABLE_MISSING';
  end if;

  select array_agg(
    signature
  )
  into missing_functions
  from unnest(
    array[
      'public.claim_due_review_invitation_jobs(integer)',
      'public.prepare_review_invitation_delivery(uuid,text)',
      'public.complete_review_invitation_delivery(uuid,uuid,uuid,text,text)',
      'public.queue_review_invitation_after_completion()'
    ]
  ) as signature
  where to_regprocedure(
    signature
  ) is null;

  if missing_functions is not null then
    raise exception
      'REVIEW_INVITATION_FUNCTIONS_MISSING: %',
      missing_functions;
  end if;

  if not exists (
    select 1
    from pg_trigger
    where pg_trigger.tgname =
      'bookings_queue_review_invitation'
      and not pg_trigger.tgisinternal
  ) then
    raise exception
      'REVIEW_INVITATION_BOOKING_TRIGGER_MISSING';
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
        'review_invitation_jobs'
      and pg_class.relrowsecurity =
        true
  ) then
    raise exception
      'REVIEW_INVITATION_JOBS_RLS_DISABLED';
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
      'claim_due_review_invitation_jobs',
      'prepare_review_invitation_delivery',
      'complete_review_invitation_delivery'
    )
    and pg_proc.prosecdef =
      false;

  if unsafe_functions is not null then
    raise exception
      'REVIEW_INVITATION_FUNCTION_NOT_SECURITY_DEFINER: %',
      unsafe_functions;
  end if;

  if has_function_privilege(
    'anon',
    'public.claim_due_review_invitation_jobs(integer)',
    'execute'
  )
    or has_function_privilege(
      'authenticated',
      'public.claim_due_review_invitation_jobs(integer)',
      'execute'
    )
    or has_function_privilege(
      'anon',
      'public.prepare_review_invitation_delivery(uuid,text)',
      'execute'
    )
    or has_function_privilege(
      'authenticated',
      'public.prepare_review_invitation_delivery(uuid,text)',
      'execute'
    )
    or has_function_privilege(
      'anon',
      'public.complete_review_invitation_delivery(uuid,uuid,uuid,text,text)',
      'execute'
    )
    or has_function_privilege(
      'authenticated',
      'public.complete_review_invitation_delivery(uuid,uuid,uuid,text,text)',
      'execute'
    )
  then
    raise exception
      'REVIEW_INVITATION_PUBLIC_EXECUTE_PRESENT';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.claim_due_review_invitation_jobs(integer)',
    'execute'
  )
    or not has_function_privilege(
      'service_role',
      'public.prepare_review_invitation_delivery(uuid,text)',
      'execute'
    )
    or not has_function_privilege(
      'service_role',
      'public.complete_review_invitation_delivery(uuid,uuid,uuid,text,text)',
      'execute'
    )
  then
    raise exception
      'REVIEW_INVITATION_SERVICE_ROLE_EXECUTE_MISSING';
  end if;

  if position(
    'for update skip locked'
    in lower(
      pg_get_functiondef(
        'public.claim_due_review_invitation_jobs(integer)'::regprocedure
      )
    )
  ) = 0
  then
    raise exception
      'REVIEW_INVITATION_SKIP_LOCKED_MISSING';
  end if;

  if position(
    'delete from public.review_invitations'
    in lower(
      pg_get_functiondef(
        'public.complete_review_invitation_delivery(uuid,uuid,uuid,text,text)'::regprocedure
      )
    )
  ) = 0
  then
    raise exception
      'REVIEW_INVITATION_FAILED_TOKEN_ROTATION_MISSING';
  end if;
end;
$$;

select
  'PASS' as review_invitation_delivery_status,
  to_regclass(
    'public.review_invitation_jobs'
  ) is not null as jobs_table_present,
  to_regprocedure(
    'public.claim_due_review_invitation_jobs(integer)'
  ) is not null as claim_rpc_present,
  to_regprocedure(
    'public.prepare_review_invitation_delivery(uuid,text)'
  ) is not null as prepare_rpc_present,
  to_regprocedure(
    'public.complete_review_invitation_delivery(uuid,uuid,uuid,text,text)'
  ) is not null as complete_rpc_present,
  exists (
    select 1
    from pg_trigger
    where pg_trigger.tgname =
      'bookings_queue_review_invitation'
      and not pg_trigger.tgisinternal
  ) as booking_trigger_present;

rollback;
