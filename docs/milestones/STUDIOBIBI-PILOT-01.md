# STUDIOBIBI-PILOT-01 — Clean Tenant Launch

## Position in the roadmap

This milestone starts after all planned demo themes are complete and before the shared demo landing and final deploy QA.

Studio Bi&Bi is the first real hair-salon infrastructure pilot.

## Core decision

The old Studio Bi&Bi application is not migrated as application code.

We do not reuse:

- its booking engine;
- its database structure;
- its Supabase project as the platform database;
- its admin implementation;
- its provider-specific workarounds;
- its deployment architecture.

The old site is used only as a business-content reference until the domain cutover is complete.

## What is recreated on the platform

A new Studio Bi&Bi tenant is created inside the shared Salon Platforma infrastructure with:

- one finalized platform theme;
- shared multi-tenant database rules;
- shared RLS and lifecycle rules;
- shared owner/manager/staff admin;
- shared booking and availability engine;
- shared email, Calendar, monitoring and error handling;
- shared seven-language UI contract.

## Content intake

The following business data is copied and cleaned:

- salon name and branding;
- domain and contact details;
- service categories;
- services, duration and prices;
- employee profiles;
- employee-to-service mapping;
- working hours and absences;
- localized MK/SQ/EN content;
- selected images and gallery content.

Services are reorganized into explicit platform categories instead of preserving the old site's mixed structure.

Historical booking rows are not imported by default. A read-only export may be retained for business records.

## Infrastructure gate

Before domain cutover:

- the shared Supabase production environment must not auto-pause;
- booking availability must work without manual unpause;
- owner and staff logins must pass;
- Calendar and email providers must be configured for the tenant;
- booking, reschedule and cancellation must pass;
- monitoring must surface provider and database failures;
- backup/rollback data must exist;
- the old site must remain available as rollback until acceptance.

## Domain cutover

`studiobibi.mk` is connected only after the new tenant passes preview and booking QA.

Cutover steps:

1. lower DNS TTL where possible;
2. verify the platform custom-domain mapping;
3. perform desktop and mobile booking smoke;
4. switch DNS;
5. verify HTTPS, canonical metadata and booking;
6. retain the old deployment during the rollback window.

## Pilot acceptance

The pilot is accepted when:

- real customers can book without manual database intervention;
- two salon employees can use their expected staff workflow;
- owner/admin configuration works through the shared panel;
- tenant isolation remains intact;
- MK/SQ/EN content and the seven-language system UI behave correctly;
- email and Calendar side effects are observable;
- the domain is stable;
- at least one week of real use is completed and documented.

## Strategic purpose

This is not a cosmetic relaunch of one salon website.

It proves that the common platform can operate a real hair salon with a real domain, real staff, real services and real customers without a tenant-specific code fork.
