begin;

set local transaction read only;

do $$
declare
  missing_functions text[];
  unsafe_functions text[];
begin
  select array_agg(signature)
  into missing_functions
  from unnest(
    array[
      'public.submit_direct_review(jsonb)',
      'public.get_review_invitation_context(text)',
      'public.submit_verified_review(text,jsonb)'
    ]
  ) as signature
  where to_regprocedure(
    signature
  ) is null;

  if missing_functions is not null then
    raise exception
      'REVIEWS_SUBMISSION_MISSING_FUNCTIONS: %',
      missing_functions;
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
      'submit_direct_review',
      'get_review_invitation_context',
      'submit_verified_review'
    )
    and pg_proc.prosecdef =
      false;

  if unsafe_functions is not null then
    raise exception
      'REVIEWS_SUBMISSION_NOT_SECURITY_DEFINER: %',
      unsafe_functions;
  end if;

  if has_function_privilege(
    'anon',
    'public.submit_direct_review(jsonb)',
    'execute'
  )
    or has_function_privilege(
      'authenticated',
      'public.submit_direct_review(jsonb)',
      'execute'
    )
    or has_function_privilege(
      'anon',
      'public.get_review_invitation_context(text)',
      'execute'
    )
    or has_function_privilege(
      'authenticated',
      'public.get_review_invitation_context(text)',
      'execute'
    )
    or has_function_privilege(
      'anon',
      'public.submit_verified_review(text,jsonb)',
      'execute'
    )
    or has_function_privilege(
      'authenticated',
      'public.submit_verified_review(text,jsonb)',
      'execute'
    )
  then
    raise exception
      'REVIEWS_SUBMISSION_PUBLIC_EXECUTE_PRESENT';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.submit_direct_review(jsonb)',
    'execute'
  )
    or not has_function_privilege(
      'service_role',
      'public.get_review_invitation_context(text)',
      'execute'
    )
    or not has_function_privilege(
      'service_role',
      'public.submit_verified_review(text,jsonb)',
      'execute'
    )
  then
    raise exception
      'REVIEWS_SUBMISSION_SERVICE_ROLE_EXECUTE_MISSING';
  end if;

  if position(
    'for update of review_invitations'
    in lower(
      pg_get_functiondef(
        'public.submit_verified_review(text,jsonb)'::regprocedure
      )
    )
  ) = 0
  then
    raise exception
      'REVIEWS_VERIFIED_SUBMISSION_ROW_LOCK_MISSING';
  end if;

  if position(
    'review_settings.direct_reviews_enabled'
    in lower(
      pg_get_functiondef(
        'public.submit_direct_review(jsonb)'::regprocedure
      )
    )
  ) = 0
  then
    raise exception
      'REVIEWS_DIRECT_SETTINGS_GUARD_MISSING';
  end if;

  if position(
    'review_settings.verified_reviews_enabled'
    in lower(
      pg_get_functiondef(
        'public.submit_verified_review(text,jsonb)'::regprocedure
      )
    )
  ) = 0
  then
    raise exception
      'REVIEWS_VERIFIED_SETTINGS_GUARD_MISSING';
  end if;
end;
$$;

select
  'PASS' as reviews_public_submission_status,
  to_regprocedure(
    'public.submit_direct_review(jsonb)'
  ) is not null as direct_rpc_present,
  to_regprocedure(
    'public.get_review_invitation_context(text)'
  ) is not null as invitation_context_rpc_present,
  to_regprocedure(
    'public.submit_verified_review(text,jsonb)'
  ) is not null as verified_rpc_present;

rollback;
