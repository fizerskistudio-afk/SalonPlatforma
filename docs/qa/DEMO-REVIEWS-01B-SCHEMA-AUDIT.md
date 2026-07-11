# DEMO-REVIEWS-FOUNDATION-01B — Schema Audit

## Git baseline

- Branch: `backup/theme-core-barber-beta`
- HEAD: `4f7571fcb23dfd10ac1d89f5def627a884c58bdf`

## Migration inventory

- SQL migration count: **22**
- Poslednji leksikografski fajl: `024_add_business_publication_lifecycle.sql`
- Najveći numerički prefiks: `24`
- Predloženi sledeći prefiks: `25`

## Core table detection

- `businesses: missing`
- `bookings: missing`
- `customers: missing`
- `services: missing`
- `employees: missing`

## Tenant membership candidates

- Nije detektovana membership tabela.

## Existing RLS policy tables

- `storage`
- `business_members`
- `working_hours`
- `time_off`
- `customers`
- `bookings`
- `staff_time_off_requests`

## Existing helper functions

- `is_supported_locale`
- `is_localized_text`
- `are_supported_locales`
- `provision_business`
- `configure_initial_business_staff`
- `update_business_operational_settings`
- `manage_business_employee`
- `update_business_employee_schedule`
- `manage_business_catalog`
- `manage_business_time_off`
- `is_business_owner`
- `protect_last_active_business_owner`
- `normalize_business_member_employee_link`
- `current_staff_employee_id`
- `current_staff_membership_id`
- `staff_update_own_booking_status`
- `cancel_staff_time_off_request`
- `review_staff_time_off_request`
- `create_default_business_email_settings`
- `apply_resend_delivery_event`
- `consume_public_rate_limit`

### Updated-at helper candidates

- Nije pronađeno.

## Booking lifecycle evidence

- `supabase\migrations\012_business_time_off_management.sql:200` — `'pending'::public.booking_status,`
- `supabase\migrations\012_business_time_off_management.sql:201` — `'confirmed'::public.booking_status`
- `supabase\migrations\015_staff_dashboard.sql:91` — `status text not null default 'pending',`
- `supabase\migrations\015_staff_dashboard.sql:128` — `'pending',`
- `supabase\migrations\015_staff_dashboard.sql:131` — `'cancelled'`
- `supabase\migrations\015_staff_dashboard.sql:138` — `status = 'pending'`
- `supabase\migrations\015_staff_dashboard.sql:145` — `status = 'cancelled'`
- `supabase\migrations\015_staff_dashboard.sql:374` — `and status = 'pending'`
- `supabase\migrations\015_staff_dashboard.sql:422` — `v_booking.status = 'pending'::public.booking_status`
- `supabase\migrations\015_staff_dashboard.sql:423` — `and p_next_status = 'confirmed'::public.booking_status`
- `supabase\migrations\015_staff_dashboard.sql:427` — `v_booking.status = 'confirmed'::public.booking_status`
- `supabase\migrations\015_staff_dashboard.sql:429` — `'completed'::public.booking_status,`
- `supabase\migrations\015_staff_dashboard.sql:430` — `'no_show'::public.booking_status`
- `supabase\migrations\015_staff_dashboard.sql:494` — `if v_request.status <> 'pending' then`
- `supabase\migrations\015_staff_dashboard.sql:497` — `message = 'TIME_OFF_REQUEST_NOT_PENDING';`
- `supabase\migrations\015_staff_dashboard.sql:502` — `status = 'cancelled',`
- `supabase\migrations\015_staff_dashboard.sql:560` — `if v_request.status <> 'pending' then`
- `supabase\migrations\015_staff_dashboard.sql:563` — `message = 'TIME_OFF_REQUEST_NOT_PENDING';`
- `supabase\migrations\015_staff_dashboard.sql:573` — `'pending'::public.booking_status,`
- `supabase\migrations\015_staff_dashboard.sql:574` — `'confirmed'::public.booking_status`
- `supabase\migrations\016_employee_google_calendar.sql:91` — `sync_status text not null default 'pending',`
- `supabase\migrations\016_employee_google_calendar.sql:112` — `'pending',`
- `supabase\migrations\017_email_notifications.sql:53` — `'pending',`
- `supabase\migrations\017_email_notifications.sql:185` — `status text not null default 'pending',`
- `supabase\migrations\017_email_notifications.sql:220` — `'pending',`
- `supabase\migrations\018_notification_management.sql:16` — `add column if not exists booking_confirmed_enabled boolean not null default true,`
- `supabase\migrations\018_notification_management.sql:18` — `add column if not exists booking_cancelled_enabled boolean not null default true,`
- `supabase\migrations\019_booking_reminders.sql:15` — `-- Speeds up the recurring scan without indexing cancelled,`
- `supabase\migrations\019_booking_reminders.sql:16` — `-- completed or no-show reservations.`
- `supabase\migrations\019_booking_reminders.sql:17` — `create index if not exists bookings_confirmed_upcoming_email_idx`
- `supabase\migrations\019_booking_reminders.sql:22` — `where status = 'confirmed'::public.booking_status`
- `supabase\migrations\020_resend_delivery_webhooks.sql:8` — `--   pending / sent / failed / skipped`

## Auth and tenant source evidence

- `lib\auth\admin.ts:10` — `| "owner"`
- `lib\auth\admin.ts:11` — `| "manager";`
- `lib\auth\admin.ts:15` — `business_id: string;`
- `lib\auth\admin.ts:17` — `| "owner"`
- `lib\auth\admin.ts:18` — `| "manager"`
- `lib\auth\admin.ts:19` — `| "staff";`
- `lib\auth\admin.ts:44` — `type RequireAdminOptions = {`
- `lib\auth\admin.ts:135` — `.from("business_members")`
- `lib\auth\admin.ts:137` — `"id, business_id, role, is_active"`
- `lib\auth\admin.ts:142` — `"owner",`
- `lib\auth\admin.ts:143` — `"manager",`
- `lib\auth\admin.ts:162` — `membership.role !== "owner" &&`
- `lib\auth\admin.ts:163` — `membership.role !== "manager"`
- `lib\auth\admin.ts:175` — `.from("businesses")`
- `lib\auth\admin.ts:181` — `membership.business_id`
- `lib\auth\admin.ts:235` — `export async function requireAdmin(`
- `lib\auth\admin.ts:237` — `RequireAdminOptions =`
- `lib\admin\bookings.ts:3` — `import { requireAdmin } from "@/lib/auth/admin";`
- `lib\admin\bookings.ts:10` — `"completed",`
- `lib\admin\bookings.ts:39` — `business_id: string;`
- `lib\admin\bookings.ts:131` — `await requireAdmin();`
- `lib\admin\bookings.ts:140` — `.from("businesses")`
- `lib\admin\bookings.ts:166` — `.from("bookings")`
- `lib\admin\bookings.ts:172` — `"business_id",`
- `lib\admin\bookings.ts:195` — `"business_id",`
- `lib\admin\bookings.ts:249` — `.from("services")`
- `lib\admin\bookings.ts:252` — `"business_id",`
- `lib\admin\bookings.ts:267` — `.from("employees")`
- `lib\admin\bookings.ts:270` — `"business_id",`
- `app\admin\(protected)\bookings\actions.ts:8` — `import { requireAdmin } from "@/lib/auth/admin";`
- `app\admin\(protected)\bookings\actions.ts:43` — `"completed",`
- `app\admin\(protected)\bookings\actions.ts:58` — `"completed",`
- `app\admin\(protected)\bookings\actions.ts:63` — `completed: [],`
- `app\admin\(protected)\bookings\actions.ts:149` — `await requireAdmin();`
- `app\admin\(protected)\bookings\actions.ts:208` — `.from("bookings")`
- `app\admin\(protected)\bookings\actions.ts:212` — `"business_id",`
- `app\admin\(protected)\bookings\actions.ts:269` — `.from("bookings")`
- `app\admin\(protected)\bookings\actions.ts:290` — `"business_id",`
- `app\admin\(protected)\bookings\actions.ts:363` — `await requireAdmin();`
- `app\admin\(protected)\bookings\actions.ts:396` — `.from("bookings")`
- `app\admin\(protected)\bookings\actions.ts:408` — `"business_id",`

## RLS evidence

- `supabase\migrations\013_business_media_storage.sql:45` — `create policy`
- `supabase\migrations\014_tenant_member_access.sql:20` — `and business_members.user_id = (select auth.uid())`
- `supabase\migrations\014_tenant_member_access.sql:46` — `create policy "Owners can add memberships"`
- `supabase\migrations\014_tenant_member_access.sql:54` — `create policy "Owners can update memberships"`
- `supabase\migrations\014_tenant_member_access.sql:65` — `create policy "Owners can delete memberships"`
- `supabase\migrations\015_staff_dashboard.sql:203` — `select auth.uid()`
- `supabase\migrations\015_staff_dashboard.sql:225` — `select auth.uid()`
- `supabase\migrations\015_staff_dashboard.sql:272` — `create policy "Admins can manage working hours"`
- `supabase\migrations\015_staff_dashboard.sql:283` — `create policy "Staff can view own working hours"`
- `supabase\migrations\015_staff_dashboard.sql:295` — `create policy "Admins can manage time off"`
- `supabase\migrations\015_staff_dashboard.sql:306` — `create policy "Staff can view own time off"`
- `supabase\migrations\015_staff_dashboard.sql:314` — `create policy "Admins can manage customers"`
- `supabase\migrations\015_staff_dashboard.sql:325` — `create policy "Admins can manage bookings"`
- `supabase\migrations\015_staff_dashboard.sql:336` — `create policy "Staff can view own bookings"`
- `supabase\migrations\015_staff_dashboard.sql:345` — `enable row level security;`
- `supabase\migrations\015_staff_dashboard.sql:347` — `create policy "Admins can manage staff time off requests"`
- `supabase\migrations\015_staff_dashboard.sql:358` — `create policy "Staff can view own time off requests"`
- `supabase\migrations\015_staff_dashboard.sql:367` — `create policy "Staff can create own time off requests"`
- `supabase\migrations\015_staff_dashboard.sql:607` — `reviewed_by = auth.uid(),`
- `supabase\migrations\016_employee_google_calendar.sql:151` — `enable row level security;`
- `supabase\migrations\016_employee_google_calendar.sql:154` — `enable row level security;`
- `supabase\migrations\017_email_notifications.sql:262` — `enable row level security;`
- `supabase\migrations\017_email_notifications.sql:265` — `enable row level security;`
- `supabase\migrations\020_resend_delivery_webhooks.sql:268` — `enable row level security;`
- `supabase\migrations\022_add_public_rate_limiting.sql:39` — `enable row level security;`

## 01B migration gate

- Businesses table: **FAIL**
- Bookings table: **FAIL**
- Completed lifecycle status: **PASS**
- Tenant membership model detected: **REVIEW**

## Blockers / manual review

- Booking tabela nije pronađena u migration istoriji.
- Businesses tabela nije pronađena u migration istoriji.
- Tenant membership tabela nije pouzdano detektovana; RLS politika mora koristiti postojeći helper ili eksplicitno potvrđenu tabelu.

## Planned database objects

Sledeći paket će, na osnovu ovog audita, dodati:

1. `review_settings`
2. `reviews`
3. `review_invitations`
4. `review_provider_connections`
5. source/status/rating/verified-visit constraints
6. same-business booking verification trigger
7. one verified review per booking
8. one Google row per external review ID
9. public published-only read policy
10. owner/manager tenant policies usklađene sa postojećim membership modelom

## Raw machine summary

```json
{
  "migrationCount": 22,
  "latestMigration": "024_add_business_publication_lifecycle.sql",
  "latestNumericPrefix": 24,
  "suggestedNextPrefix": "25",
  "tableNames": [
    "staff_time_off_requests",
    "employee_google_calendar_connections",
    "employee_google_calendar_events",
    "business_email_settings",
    "notification_deliveries",
    "resend_webhook_events",
    "public_rate_limit_buckets"
  ],
  "membershipCandidates": [],
  "policyTableNames": [
    "storage",
    "business_members",
    "working_hours",
    "time_off",
    "customers",
    "bookings",
    "staff_time_off_requests"
  ],
  "functionNames": [
    "is_supported_locale",
    "is_localized_text",
    "are_supported_locales",
    "provision_business",
    "configure_initial_business_staff",
    "update_business_operational_settings",
    "manage_business_employee",
    "update_business_employee_schedule",
    "manage_business_catalog",
    "manage_business_time_off",
    "is_business_owner",
    "protect_last_active_business_owner",
    "normalize_business_member_employee_link",
    "current_staff_employee_id",
    "current_staff_membership_id",
    "staff_update_own_booking_status",
    "cancel_staff_time_off_request",
    "review_staff_time_off_request",
    "create_default_business_email_settings",
    "apply_resend_delivery_event",
    "consume_public_rate_limit"
  ],
  "updatedAtHelpers": [],
  "missingCoreTables": [
    "businesses",
    "bookings",
    "customers",
    "services",
    "employees"
  ],
  "completedExists": true,
  "bookingTableExists": false,
  "businessTableExists": false
}
```
