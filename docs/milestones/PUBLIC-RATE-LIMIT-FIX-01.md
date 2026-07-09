# PUBLIC-RATE-LIMIT-FIX-01

## Problem

`consume_public_rate_limit` used a PL/pgSQL variable named `current_time`.
PostgreSQL parsed `current_time` as the SQL `CURRENT_TIME` keyword in the
`ON CONFLICT DO UPDATE` expression. `CURRENT_TIME` is `time with time zone`,
while `public_rate_limit_buckets.updated_at` is `timestamp with time zone`.
This produced error `42804` and fail-closed login protection correctly denied
login while the limiter storage was unavailable.

## Fix

- Rename all local function values with a `v_` prefix.
- Use `excluded.updated_at` inside the conflict update.
- Correct migration `022` for new installations.
- Add migration `023` for databases where `022` was already applied.
- Clear only admin/staff login buckets after replacing the function.

## Apply

Run `supabase/migrations/023_fix_public_rate_limit_timestamp.sql` in the
Supabase SQL Editor, or apply migrations through the project's normal workflow.
No application restart is required after the database migration, although a
browser refresh is recommended.
