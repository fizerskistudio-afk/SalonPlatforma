# PRODUCT-PACKAGES-ENTITLEMENTS-01E-C2 — STAFF CALENDAR SERVER GATES

**Datum:** 15. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`
**Očekivani početni HEAD:** `47694a3aa12d6ff917278150024641536ec54fc9`
**Očekivani staging:** 30 PASS fajlova iz `01E-A`, `01E-B1`, `01E-B2` i `01E-C1`.

## Cilj

Zatvoriti sve postojeće server-side zaobilaznice za lični Google Calendar zaposlenog i employee Calendar sync.

C2 štiti:

- disconnect staff Google Calendar akciju;
- ručni upcoming-bookings sync;
- staff OAuth connect route;
- employee OAuth callback;
- automatski booking → employee Calendar sync engine.

## Package granice

Koriste se dve odvojene feature odluke:

```text
staff.calendar_connection
→ povezivanje i odspajanje ličnog Google naloga

staff.employee_calendar_sync
→ ručni i automatski booking sync
```

Obe trenutno počinju od Operations Pro, ali ostaju odvojene jer predstavljaju različite proizvodne mogućnosti.

## Shared staff server access

`staff-gates-server.ts` dobija business-id helper:

```text
loadStaffProductFeatureServerAccessForBusinessId
```

Helper:

- validira da je feature sa `staff` površine;
- učitava package assignment;
- donosi package-only odluku;
- vraća `PRODUCT_PACKAGE_REQUIRED` i kontrolisanu poruku;
- ne autentifikuje korisnika samostalno.

Auth i ownership moraju biti potvrđeni pre poziva:

- server actions prvo koriste `requireStaff`;
- connect route prvo potvrđuje staff membership i employee profil;
- callback prvo potvrđuje state, user, membership, employee i business.

## Staff actions

### Disconnect

Redosled:

```text
requireStaff
→ staff.calendar_connection package gate
→ delete connection row
```

### Manual sync

Redosled:

```text
requireStaff
→ staff.employee_calendar_sync package gate
→ load upcoming bookings
→ call employee sync engine
```

Blokirani action vraća `ok: false` i upgrade poruku bez DB ili Google rada.

## OAuth connect

Staff connect route proverava package nakon potvrđenog membership/employee konteksta, a pre:

- OAuth state generisanja;
- Google authorization URL-a;
- nonce i target cookie-ja.

Blokirani poziv se vraća na:

```text
/staff/calendar?googleCalendar=package_required
```

## OAuth callback

Employee callback ponovo proverava package nakon potvrđenog user/membership/business konteksta, ali pre:

- authorization code exchange-a;
- Google profile poziva;
- token enkripcije;
- connection upsert-a.

Ovo pokriva downgrade između connect i callback koraka.

Business Calendar callback nije promenjen.

## Automatski employee sync

`employee-sync.ts` već učitava business red kao deo booking konteksta.

C2 tom redu dodaje package assignment polja i donosi odluku bez dodatnog DB round-trip-a.

Paket ispod Operations Pro vraća:

```text
ok = true
action = skipped
```

Booking mutation zato ne pada. Samo se employee Calendar operacija ne izvršava.

Legacy i invalid rollout assignment ostaju fail-open.

## Two-way busy sync

`calendar.two_way_busy_sync` postoji u registry-ju i gate mapi, ali odgovarajući busy-read engine još nije implementiran.

C2 ne izmišlja nepostojeći runtime tok. Kada se busy-read uvede, mora koristiti zaseban `staff.two_way_busy_sync` gate.

## Non-goals

C2 ne menja:

- staff dashboard;
- rezervacije, napomene, odsustva i raspored;
- business/salon Google Calendar package gate;
- Google OAuth scopes;
- token encryption;
- Supabase šemu ili podatke;
- billing;
- commit ili push.

## Sledeći korak

`PRODUCT-PACKAGES-ENTITLEMENTS-01E-D — UPGRADE UX AND CLOSEOUT`

D završava package-gating chapter:

- ujednačene required-package poruke;
- bez mrtvih linkova;
- platform-admin preview ostaje funkcionalan;
- cross-package i legacy test matrica;
- finalni runtime smoke;
- ROADMAP closeout.

## Acceptance

- [ ] shared business-id staff package helper postoji;
- [ ] disconnect je blokiran pre delete-a;
- [ ] manual sync je blokiran pre booking query-ja;
- [ ] connect je blokiran pre OAuth state-a;
- [ ] callback ponovo proverava package pre token exchange-a;
- [ ] automatic employee sync koristi business package assignment;
- [ ] blocked automatic sync vraća `skipped`, ne booking grešku;
- [ ] Operations Pro prolazi kroz sve staff Calendar granice;
- [ ] legacy tenant ostaje fail-open;
- [ ] base staff capabilities nisu menjane;
- [ ] business Calendar callback nije promenjen;
- [ ] `npx tsc --noEmit` prolazi;
- [ ] `npm run check` prolazi;
- [ ] nema migracije, commita ili push-a.
