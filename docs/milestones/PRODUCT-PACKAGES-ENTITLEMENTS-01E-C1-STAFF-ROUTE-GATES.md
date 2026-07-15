# PRODUCT-PACKAGES-ENTITLEMENTS-01E-C1 — STAFF ROUTE GATES

**Datum:** 15. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`
**Očekivani početni HEAD:** `47694a3aa12d6ff917278150024641536ec54fc9`
**Očekivani staging:** PASS fajlovi iz `01E-A`, `01E-B1` i `01E-B2`.

## Cilj

Aktivirati staff route i navigation package gate bez zaključavanja osnovnog staff operativnog panela.

C1 štiti:

- `/staff/calendar` kroz `staff.calendar_connection`.

C1 još ne štiti:

- Google OAuth connect route;
- OAuth callback;
- disconnect action;
- ručni upcoming-bookings sync;
- automatski employee Calendar sync engine.

Te server granice dolaze odmah u `01E-C2`.

## Booking Page staff invariant

Booking Page zadržava:

- staff login;
- staff dashboard;
- sopstvene rezervacije;
- dozvoljene napomene;
- pauze i odsustva;
- sopstveni raspored;
- password-change i setup-required tok.

Samo lični Google Calendar i employee sync funkcije počinju od Operations Pro.

## Protected staff layout

Layout sada:

1. autentifikuje staff korisnika;
2. učitava package access aktivnog salona po `business_id`;
3. prosleđuje package access u `StaffShell`;
4. ne menja staff dashboard children niti osnovni staff auth tok.

Legacy i invalid rollout assignment ostaju fail-open kroz centralni resolver.

## Staff navigacija

Link „Moj kalendar“:

- ostaje vidljiv;
- ostaje klikabilan;
- prikazuje lock i `Paket` badge kada feature nije uključen;
- jasno navodi `Operations Pro`;
- vodi na kontrolisani locked state umesto mrtvog linka.

## Calendar stranica

`/staff/calendar` poziva server-only staff feature context pre:

- čitanja connection reda;
- prikaza Google naloga;
- prikaza sync grešaka;
- prikaza connect/disconnect/sync kontrola.

Paket ispod Operations Pro dobija staff-specific upgrade notice i povratak na `/staff`.

## Package-only granica u C1

C1 prosleđuje:

```text
permissionGranted = true
integrationConnected = true
```

Time proverava samo package entitlement.

Integration state se i dalje prikazuje tek kada package dozvoli pristup stranici.

## Non-goals

C1 ne menja:

- staff booking data;
- staff notes;
- time-off;
- schedule;
- Google OAuth;
- calendar token podatke;
- automatic sync engine;
- Supabase šemu ili podatke;
- billing;
- commit ili push.

## Sledeći korak

`PRODUCT-PACKAGES-ENTITLEMENTS-01E-C2 — STAFF CALENDAR SERVER GATES`

C2 mora zaštititi connect, callback, disconnect, manual sync i automatic employee sync čak i kada pozivalac zaobiđe UI.

## Acceptance

- [ ] protected staff layout učitava package access;
- [ ] `StaffShell` dobija package access;
- [ ] calendar link ostaje vidljiv i klikabilan;
- [ ] package lock prikazuje Operations Pro;
- [ ] calendar page se blokira pre connection data loadera;
- [ ] Booking Page staff dashboard ostaje dostupan;
- [ ] Booking Page rezervacije, napomene, odsustva i raspored nisu menjani;
- [ ] Operations Pro otvara calendar stranicu;
- [ ] legacy tenant ostaje fail-open;
- [ ] upgrade notice nema mrtav billing link;
- [ ] `npx tsc --noEmit` prolazi;
- [ ] `npm run check` prolazi;
- [ ] nema migracije, commita ili push-a.
