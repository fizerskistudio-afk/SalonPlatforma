-- DATABASE-PERFORMANCE-01A
-- READ-ONLY AUDIT
--
-- Ovaj fajl sadrži samo SELECT / WITH ... SELECT upite.
-- Ne pravi indekse, ne menja funkcije i ne briše podatke.
-- Pokrenuti u Supabase SQL Editor-u nad ciljnom bazom.
--
-- Ne objavljivati PII, secrets, auth tokene ili kompletne booking podatke.
-- Za sledeću fazu dovoljni su planovi, brojevi redova, veličine i definicije indeksa.

-- ============================================================
-- 1. Server i vreme snimka
-- ============================================================

select
  now() as captured_at,
  current_database() as database_name,
  current_user as database_user,
  version() as postgres_version;

-- ============================================================
-- 2. Relevantne relacije i približan broj redova
-- ============================================================

select
  n.nspname as schema_name,
  c.relname as relation_name,
  c.relkind,
  greatest(c.reltuples, 0)::bigint as estimated_rows,
  pg_size_pretty(
    pg_relation_size(c.oid)
  ) as table_only_size,
  pg_size_pretty(
    pg_indexes_size(c.oid)
  ) as indexes_size,
  pg_size_pretty(
    pg_total_relation_size(c.oid)
  ) as total_size
from pg_class c
join pg_namespace n
  on n.oid = c.relnamespace
where
  n.nspname = 'public'
  and c.relkind in ('r', 'p')
  and (
    c.relname in (
      'businesses',
      'services',
      'employees',
      'bookings',
      'public_rate_limit_buckets'
    )
    or c.relname like '%booking%'
    or c.relname like '%availability%'
    or c.relname like '%notification%'
    or c.relname like '%delivery%'
    or c.relname like '%time_off%'
    or c.relname like '%schedule%'
    or c.relname like '%working_hour%'
  )
order by
  pg_total_relation_size(c.oid) desc,
  c.relname;

-- ============================================================
-- 3. Table activity, dead tuples i maintenance signal
-- ============================================================

select
  schemaname,
  relname,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  n_live_tup,
  n_dead_tup,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
from pg_stat_user_tables
where
  schemaname = 'public'
  and (
    relname in (
      'businesses',
      'services',
      'employees',
      'bookings',
      'public_rate_limit_buckets'
    )
    or relname like '%booking%'
    or relname like '%availability%'
    or relname like '%notification%'
    or relname like '%delivery%'
    or relname like '%time_off%'
    or relname like '%schedule%'
    or relname like '%working_hour%'
  )
order by
  n_live_tup desc,
  relname;

-- ============================================================
-- 4. Index inventory
-- ============================================================

select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where
  schemaname = 'public'
  and (
    tablename in (
      'businesses',
      'services',
      'employees',
      'bookings',
      'public_rate_limit_buckets'
    )
    or tablename like '%booking%'
    or tablename like '%availability%'
    or tablename like '%notification%'
    or tablename like '%delivery%'
    or tablename like '%time_off%'
    or tablename like '%schedule%'
    or tablename like '%working_hour%'
  )
order by
  tablename,
  indexname;

-- ============================================================
-- 5. Index usage
-- ============================================================

select
  s.schemaname,
  s.relname as table_name,
  s.indexrelname as index_name,
  s.idx_scan,
  s.idx_tup_read,
  s.idx_tup_fetch,
  pg_size_pretty(
    pg_relation_size(s.indexrelid)
  ) as index_size
from pg_stat_user_indexes s
where
  s.schemaname = 'public'
  and (
    s.relname in (
      'businesses',
      'services',
      'employees',
      'bookings',
      'public_rate_limit_buckets'
    )
    or s.relname like '%booking%'
    or s.relname like '%availability%'
    or s.relname like '%notification%'
    or s.relname like '%delivery%'
    or s.relname like '%time_off%'
    or s.relname like '%schedule%'
    or s.relname like '%working_hour%'
  )
order by
  s.relname,
  s.idx_scan desc,
  s.indexrelname;

-- ============================================================
-- 6. Constraints relevantni za booking integritet
-- ============================================================

select
  conrelid::regclass as relation_name,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(
    oid,
    true
  ) as definition
from pg_constraint
where
  connamespace = 'public'::regnamespace
  and (
    conrelid::regclass::text in (
      'businesses',
      'services',
      'employees',
      'bookings',
      'public_rate_limit_buckets'
    )
    or conrelid::regclass::text like '%booking%'
    or conrelid::regclass::text like '%time_off%'
    or conrelid::regclass::text like '%schedule%'
  )
order by
  relation_name::text,
  constraint_type,
  constraint_name;

-- ============================================================
-- 7. Definicije ključnih RPC funkcija
-- ============================================================

select
  p.oid::regprocedure as function_signature,
  p.prosecdef as security_definer,
  p.provolatile as volatility,
  pg_get_function_result(
    p.oid
  ) as result_type,
  pg_get_functiondef(
    p.oid
  ) as function_definition
from pg_proc p
join pg_namespace n
  on n.oid = p.pronamespace
where
  n.nspname = 'public'
  and p.proname in (
    'get_available_slots',
    'create_public_booking',
    'consume_public_rate_limit'
  )
order by
  p.proname,
  p.oid::regprocedure::text;

-- ============================================================
-- 8. Rate-limit bucket health
-- ============================================================

select
  count(*) as total_buckets,
  count(*) filter (
    where expires_at < now()
  ) as expired_buckets,
  count(*) filter (
    where expires_at >= now()
  ) as active_buckets,
  min(window_started_at) as oldest_window,
  max(window_started_at) as newest_window,
  min(expires_at) as oldest_expiry,
  max(expires_at) as newest_expiry,
  pg_size_pretty(
    pg_total_relation_size(
      'public.public_rate_limit_buckets'::regclass
    )
  ) as total_relation_size
from public.public_rate_limit_buckets;

select
  scope,
  count(*) as bucket_count,
  count(*) filter (
    where expires_at < now()
  ) as expired_bucket_count,
  sum(request_count) as recorded_requests,
  max(request_count) as max_bucket_request_count,
  min(window_started_at) as oldest_window,
  max(window_started_at) as newest_window
from public.public_rate_limit_buckets
group by scope
order by
  bucket_count desc,
  scope;

-- ============================================================
-- 9. pg_stat_statements dostupnost
-- ============================================================

select
  exists (
    select 1
    from pg_extension
    where extname = 'pg_stat_statements'
  ) as pg_stat_statements_enabled;

-- Ako je prethodni rezultat TRUE, sledeći upit pokrenuti odvojeno:
--
-- select
--   calls,
--   round(total_exec_time::numeric, 2) as total_exec_ms,
--   round(mean_exec_time::numeric, 2) as mean_exec_ms,
--   rows,
--   left(query, 500) as query_sample
-- from pg_stat_statements
-- where
--   query ilike '%get_available_slots%'
--   or query ilike '%create_public_booking%'
--   or query ilike '%consume_public_rate_limit%'
--   or query ilike '%public_rate_limit_buckets%'
-- order by total_exec_time desc
-- limit 50;

-- ============================================================
-- 10. Bezbedni EXPLAIN template-i
-- ============================================================

-- A) Business lookup — zameniti stvarnim slug-om.
--
-- explain (
--   analyze,
--   buffers,
--   verbose,
--   format text
-- )
-- select id
-- from public.businesses
-- where
--   slug = 'mika-berberin'
--   and is_active = true
--   and publication_status = 'published'
-- limit 1;

-- B) Availability RPC je read-only; zameniti stvarnim UUID vrednostima.
--
-- explain (
--   analyze,
--   buffers,
--   verbose,
--   format text
-- )
-- select *
-- from public.get_available_slots(
--   '00000000-0000-0000-0000-000000000000'::uuid,
--   '00000000-0000-0000-0000-000000000000'::uuid,
--   current_date,
--   null::uuid
-- );

-- C) NIKADA ne koristiti EXPLAIN ANALYZE nad create_public_booking.
-- ANALYZE izvršava write funkciju i napravio bi stvarnu rezervaciju.
