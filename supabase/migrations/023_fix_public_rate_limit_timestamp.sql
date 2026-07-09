begin;

-- Hotfix for migration 022 already applied to a database.
-- The old PL/pgSQL variable name `current_time` collided with the
-- PostgreSQL CURRENT_TIME keyword (timetz), which broke writes to
-- the timestamptz updated_at column.

create or replace function public.consume_public_rate_limit(
  p_scope text,
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  retry_after_seconds integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window_epoch bigint;
  v_window_start timestamptz;
  v_window_reset timestamptz;
  v_next_count integer;
begin
  if
    p_scope is null
    or char_length(trim(p_scope)) not between 1 and 100
    or p_key_hash is null
    or p_key_hash !~ '^[0-9a-f]{64}$'
    or p_limit < 1
    or p_limit > 10000
    or p_window_seconds < 1
    or p_window_seconds > 86400
  then
    raise exception 'INVALID_RATE_LIMIT_ARGUMENTS';
  end if;

  v_window_epoch :=
    floor(
      extract(epoch from v_now) /
      p_window_seconds
    )::bigint *
    p_window_seconds;

  v_window_start :=
    to_timestamp(v_window_epoch);

  v_window_reset :=
    v_window_start +
    make_interval(
      secs => p_window_seconds
    );

  insert into public.public_rate_limit_buckets (
    scope,
    key_hash,
    window_started_at,
    request_count,
    expires_at,
    updated_at
  )
  values (
    trim(p_scope),
    p_key_hash,
    v_window_start,
    1,
    v_window_reset + interval '1 day',
    v_now
  )
  on conflict (
    scope,
    key_hash,
    window_started_at
  )
  do update set
    request_count =
      public.public_rate_limit_buckets.request_count + 1,
    expires_at = excluded.expires_at,
    updated_at = excluded.updated_at
  returning request_count
    into v_next_count;

  if random() < 0.01 then
    delete from public.public_rate_limit_buckets
    where expires_at < v_now;
  end if;

  return query
  select
    v_next_count <= p_limit,
    greatest(
      p_limit - v_next_count,
      0
    ),
    case
      when v_next_count <= p_limit then 0
      else greatest(
        ceil(
          extract(
            epoch from (
              v_window_reset - v_now
            )
          )
        )::integer,
        1
      )
    end,
    v_window_reset;
end;
$$;

revoke all
  on function public.consume_public_rate_limit(
    text,
    text,
    integer,
    integer
  )
  from public, anon, authenticated;

grant execute
  on function public.consume_public_rate_limit(
    text,
    text,
    integer,
    integer
  )
  to service_role;

-- Release only login buckets so administrators and staff can retry
-- immediately after this migration. Public booking/availability
-- limits are intentionally preserved.
delete from public.public_rate_limit_buckets
where scope in (
  'admin-login-address',
  'admin-login-account',
  'staff-login-address',
  'staff-login-account'
);

commit;
