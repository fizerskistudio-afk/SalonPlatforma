begin;

create table if not exists public.public_rate_limit_buckets (
  scope text not null,
  key_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 0,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now(),

  constraint public_rate_limit_buckets_scope_check
    check (
      char_length(scope) between 1 and 100
    ),

  constraint public_rate_limit_buckets_key_hash_check
    check (
      key_hash ~ '^[0-9a-f]{64}$'
    ),

  constraint public_rate_limit_buckets_request_count_check
    check (
      request_count >= 0
    ),

  primary key (
    scope,
    key_hash,
    window_started_at
  )
);

create index if not exists public_rate_limit_buckets_expires_at_idx
  on public.public_rate_limit_buckets (
    expires_at
  );

alter table public.public_rate_limit_buckets
  enable row level security;

revoke all
  on table public.public_rate_limit_buckets
  from anon, authenticated;

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
  current_time timestamptz := clock_timestamp();
  window_epoch bigint;
  window_start timestamptz;
  window_reset timestamptz;
  next_count integer;
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

  window_epoch :=
    floor(
      extract(epoch from current_time) /
      p_window_seconds
    )::bigint *
    p_window_seconds;

  window_start :=
    to_timestamp(window_epoch);

  window_reset :=
    window_start +
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
    window_start,
    1,
    window_reset + interval '1 day',
    current_time
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
    updated_at = current_time
  returning request_count
    into next_count;

  if random() < 0.01 then
    delete from public.public_rate_limit_buckets
    where expires_at < current_time;
  end if;

  return query
  select
    next_count <= p_limit,
    greatest(
      p_limit - next_count,
      0
    ),
    case
      when next_count <= p_limit then 0
      else greatest(
        ceil(
          extract(
            epoch from (
              window_reset - current_time
            )
          )
        )::integer,
        1
      )
    end,
    window_reset;
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

commit;
