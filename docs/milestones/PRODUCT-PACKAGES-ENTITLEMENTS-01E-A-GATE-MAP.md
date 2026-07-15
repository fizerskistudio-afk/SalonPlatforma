# PRODUCT-PACKAGES-ENTITLEMENTS-01E-A — GATE MAP FOUNDATION

**Datum:** 15. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`
**Očekivani početni HEAD:** `47694a3aa12d6ff917278150024641536ec54fc9`
**Zavisi od:** završenih i pushovanih `01A–01D` i primenjene migracije `030`.

## Cilj

Uvesti jednu autoritativnu mapu između:

```text
product feature
→ površina aplikacije
→ entitlement
→ route boundary
→ integration requirement
→ minimalni paket
```

Ova faza samo definiše i testira contract. Nijedna postojeća tenant-admin, staff, public ili API ruta još nije zaključana.

## Zašto prvo contract

Package assignment je sada stvaran podatak u bazi. Pre promene navigacije i API ponašanja moramo imati jednu mapu koja sprečava:

- različite entitlement ključeve za UI i API;
- skrivanje staff panela iz Booking Page paketa;
- mešanje package, permission i integration blokatora;
- neusklađene upgrade poruke;
- slučajan hard lock legacy tenant-a;
- route gate koji postoji samo u klijentskom kodu.

## Booking Page invariant

Booking Page zadržava:

- admin dashboard;
- bookings;
- customers;
- services;
- team;
- schedule;
- members;
- booking notifications;
- osnovna settings podešavanja;
- staff portal;
- staff reservations;
- staff notes;
- staff time off;
- staff schedule.

Booking Page nema:

- full public site;
- advanced branding;
- gallery;
- SEO;
- custom domain;
- theme library;
- Google Calendar integracije;
- reviews;
- AI assist;
- advanced analytics.

## Route boundaries

U 01E-A se registruju postojeće stranice:

| Route | Feature | Entitlement |
|---|---|---|
| `/admin` | admin dashboard | `analytics.basic` |
| `/admin/bookings` | reservations | `booking.management` |
| `/admin/customers` | customer history | `booking.management` |
| `/admin/services` | catalog | `booking.management` |
| `/admin/team` | employees | `booking.management` |
| `/admin/gallery` | site gallery | `site.gallery` |
| `/admin/schedule` | working hours | `booking.management` |
| `/admin/members` | tenant access | `booking.management` |
| `/admin/reviews` | reviews inbox | `reviews.management` |
| `/admin/notifications` | booking email rules | `booking.email_notifications` |
| `/admin/settings` | base settings shell | `booking.management` |
| `/staff` | staff portal | `staff.portal` |
| `/staff/calendar` | personal Google Calendar | `staff.calendar_connection` |

Granularne funkcije unutar settings i staff dashboarda imaju feature keys bez route boundary-ja. Njihovi server action/API gate-ovi dolaze u `01E-B` i `01E-C`.

## Integration separation

Gate decision i dalje mora razlikovati:

- `package`;
- `permission`;
- `integration`.

Primer: Reputation Pro može imati `reviews.management`, ali reviews funkcija je i dalje integration-blocked dok Google Business Profile nije povezan.

## Legacy rollout

Business sa `package_key = NULL` ostaje `legacy_full_access`.

Invalid assignment u rollout fazi ostaje fail-open uz `requiresAttention = true`.

Ovo ponašanje nije promenjeno u 01E-A.

## Novi moduli

### `gates.ts`

- feature registry;
- route resolver;
- minimalni package resolver;
- upgrade candidates;
- feature gate decision;
- integration requirement metadata.

### `business-access.ts`

Čista transformacija business package reda u access snapshot.

### `access-server.ts`

Server-only loader po:

- `business_id` za admin/staff authenticated boundary;
- `business_slug` za public boundary.

Loader ne radi auth, redirect, permission proveru, integration proveru niti mutation.

## Non-goals

01E-A ne menja:

- `AdminShell`;
- `StaffShell`;
- protected layouts;
- API rute;
- server actions;
- public rendering;
- upgrade UI;
- Supabase šemu ili podatke;
- package assignment;
- billing;
- Google OAuth;
- commit ili push.

## Sledeći korak

`PRODUCT-PACKAGES-ENTITLEMENTS-01E-B — TENANT ADMIN GATES`

Tada centralna mapa ulazi u tenant-admin layout, navigaciju i server mutation boundary-je. Osnovni Booking Page tok ostaje dostupan, dok premium funkcije dobijaju package guard i upgrade UX.

## Acceptance

- [ ] svaki feature koristi postojeći registry entitlement;
- [ ] svaka route definicija ima stabilan exact/prefix contract;
- [ ] Booking Page admin i staff core testovi prolaze;
- [ ] gallery počinje od Digital Studio;
- [ ] staff calendar počinje od Operations Pro;
- [ ] reviews počinje od Reputation Pro;
- [ ] package, permission i integration blokatori ostaju odvojeni;
- [ ] legacy i invalid rollout assignment ostaju fail-open;
- [ ] access loader ne radi redirect ili mutation;
- [ ] nijedan postojeći UI/API fajl nije izmenjen;
- [ ] `npx tsc --noEmit` prolazi;
- [ ] `npm run check` prolazi;
- [ ] nema migracije, commita ili push-a.
