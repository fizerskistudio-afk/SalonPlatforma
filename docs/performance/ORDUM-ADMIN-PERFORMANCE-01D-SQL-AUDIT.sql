-- ORDUM-ADMIN-PERFORMANCE-01D-SQL-AUDIT
-- READ-ONLY. Run manually in Supabase SQL Editor.

select
  current_database() as database_name,
  current_setting('server_version') as postgres_version,
  now() as measured_at;

select
  extname,
  extversion
from pg_extension
where extname in ('pg_stat_statements', 'index_advisor')
order by extname;

select
  s.schemaname,
  s.relname as table_name,
  s.n_live_tup as approximate_live_rows,
  s.n_dead_tup as approximate_dead_rows,
  pg_size_pretty(
    pg_total_relation_size(
      quote_ident(s.schemaname)
      || '.'
      || quote_ident(s.relname)
    )
  ) as total_size,
  s.last_analyze,
  s.last_autoanalyze
from pg_stat_user_tables as s
where
  s.schemaname = 'public'
  and s.relname in (
    'businesses',
    'business_members',
    'employees',
    'working_hours',
    'time_off',
    'staff_time_off_requests',
    'bookings',
    'customers',
    'services'
  )
order by total_size desc;

select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where
  schemaname = 'public'
  and tablename in (
    'businesses',
    'business_members',
    'employees',
    'working_hours',
    'time_off',
    'staff_time_off_requests',
    'bookings',
    'customers',
    'services'
  )
order by tablename, indexname;

select
  ui.relname as table_name,
  ui.indexrelname as index_name,
  ui.idx_scan,
  ui.idx_tup_read,
  ui.idx_tup_fetch,
  pg_size_pretty(
    pg_relation_size(ui.indexrelid)
  ) as index_size
from pg_stat_user_indexes as ui
where
  ui.schemaname = 'public'
  and ui.relname in (
    'businesses',
    'business_members',
    'employees',
    'working_hours',
    'time_off',
    'staff_time_off_requests',
    'bookings',
    'customers',
    'services'
  )
order by ui.relname, ui.idx_scan desc, ui.indexrelname;

explain (analyze, buffers, settings, verbose, format text)
select id, name, slug, timezone
from public.businesses
where id = (
  select id from public.businesses limit 1
);

explain (analyze, buffers, settings, verbose, format text)
select id, slug, name, sort_order, is_active
from public.employees
where business_id = (
  select id from public.businesses limit 1
)
order by sort_order asc, name asc;

explain (analyze, buffers, settings, verbose, format text)
select
  id,
  business_id,
  employee_id,
  day_of_week,
  is_closed,
  open_time,
  close_time,
  created_at,
  updated_at
from public.working_hours
where business_id = (
  select id from public.businesses limit 1
)
order by day_of_week asc;

explain (analyze, buffers, settings, verbose, format text)
select
  id,
  business_id,
  employee_id,
  block_type,
  starts_at,
  ends_at,
  reason,
  created_at,
  updated_at
from public.time_off
where business_id = (
  select id from public.businesses limit 1
)
order by starts_at asc;

explain (analyze, buffers, settings, verbose, format text)
select
  id,
  employee_id,
  starts_at,
  ends_at,
  reason,
  status,
  review_note,
  created_at
from public.staff_time_off_requests
where
  business_id = (
    select id from public.businesses limit 1
  )
  and status = 'pending'
order by created_at desc
limit 100;

explain (analyze, buffers, settings, verbose, format text)
select
  id,
  reference_code,
  public_token,
  business_id,
  service_id,
  employee_id,
  customer_id,
  customer_name,
  customer_phone,
  customer_email,
  customer_note,
  starts_at,
  ends_at,
  duration_minutes,
  price_amount,
  currency,
  status,
  source,
  internal_note,
  cancellation_reason,
  cancelled_at,
  created_at,
  updated_at
from public.bookings
where business_id = (
  select id from public.businesses limit 1
)
order by starts_at desc
limit 250;

select
  'table' as cache_type,
  round(
    100
    * sum(heap_blks_hit)::numeric
    / nullif(
        sum(heap_blks_hit) + sum(heap_blks_read),
        0
      ),
    2
  ) as hit_ratio_percent
from pg_statio_user_tables
union all
select
  'index' as cache_type,
  round(
    100
    * sum(idx_blks_hit)::numeric
    / nullif(
        sum(idx_blks_hit) + sum(idx_blks_read),
        0
      ),
    2
  ) as hit_ratio_percent
from pg_statio_user_indexes;

-- OPTIONAL, only if pg_stat_statements is installed:
-- select
--   calls,
--   round(total_exec_time::numeric, 2) as total_exec_ms,
--   round(mean_exec_time::numeric, 2) as mean_exec_ms,
--   rows,
--   left(query, 500) as query_sample
-- from pg_stat_statements
-- where query ilike any (
--   array[
--     '%employees%',
--     '%working_hours%',
--     '%time_off%',
--     '%staff_time_off_requests%',
--     '%bookings%'
--   ]
-- )
-- order by total_exec_time desc
-- limit 30;
