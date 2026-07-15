# PRODUCT-PACKAGES-ENTITLEMENTS-01C — SERVER RESOLVER

**Aktiviran:** 15. jul 2026.
**Status:** application contract pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`
**Zavisi od:** staged `01A` registry i staged `01B` migration contract.

## Cilj

Uvesti jedan server-only resolver koji iz nullable package assignment podataka pravi autoritativni application contract, bez povezivanja na postojeće admin, staff, booking ili platform-admin rute.

## Rollout stanja

### `legacy_full_access`

```text
package_key = NULL
→ postojeći tenant još nema eksplicitno dodeljen komercijalni paket
→ sve funkcije ostaju dostupne tokom rollout-a
```

Ovo stanje ne predstavlja novi komercijalni paket. Ono je privremeni compatibility režim za postojeće tenant-e.

### `assigned`

```text
package_key = validan registry ključ
package_contract_version = trenutna contract verzija
→ entitlementi dolaze iz package registry-ja
```

### `invalid_assignment`

```text
package_key je nepoznat
ili contract version nedostaje
ili contract version nije podržan
→ sistem prijavljuje requiresAttention
→ tokom bezbednog rollout-a zadržava full access
```

Invalid metadata ne sme slučajno da ugasi booking, staff, Calendar ili Reviews funkcije. Kasniji platform-admin assignment tok mora sprečiti nastanak ovog stanja i prikazati incident kada se ono ipak pojavi.

## Odvojene odluke

Resolver formalno odvaja:

### Package entitlement

Da li je funkcija kupljena ili dostupna kroz legacy rollout režim.

### Permission

Da li trenutno prijavljena rola sme da izvrši radnju.

### Integration state

Da li je potreban Google ili drugi eksterni nalog stvarno povezan i spreman.

Konačna odluka je:

```text
allowed =
  entitled
  AND permissionGranted
  AND (
    integration nije potrebna
    OR integrationConnected
  )
```

`blockedBy` eksplicitno vraća:

- `package`;
- `permission`;
- `integration`;
- `null`.

## 01C scope

- čisti `resolver.ts` contract koji Vitest može da učita bez Next server runtime-a;
- `server.ts` server-only public wrapper;
- `ProductPackageAssignmentRow`;
- `ProductPackageAccess`;
- `resolveProductPackageAccess`;
- `hasProductEntitlement`;
- `resolveProductFeatureDecision`;
- behavior testovi za sva rollout stanja;
- testovi za package, permission i integration granice.

## Non-goals

01C ne uvodi:

- database query helper;
- promenu `AdminContext`;
- promenu `StaffContext`;
- platform-admin package selector;
- tenant ili staff UI gating;
- API route guard;
- upgrade CTA;
- billing;
- usage accounting;
- Groq API;
- automatsku primenu migracije `030`;
- commit ili push.

## Sledeći paket — 01D

`PRODUCT-PACKAGES-ENTITLEMENTS-01D — PLATFORM-ADMIN ASSIGNMENT` treba da uvede:

- platform-admin permission za package read/write;
- package summary na tenant overview-u;
- eksplicitnu package assignment mutation;
- optimistic concurrency;
- actor i timestamp audit polja;
- bez tenant/staff runtime gating-a dok assignment tok ne bude potvrđen.

## Acceptance

- [ ] `NULL` package assignment vraća `legacy_full_access`;
- [ ] validan package i contract version vraćaju tačan entitlement skup;
- [ ] nepotpun ili nepodržan assignment vraća `invalid_assignment`;
- [ ] invalid assignment tokom rollout-a ne gasi postojeće funkcije;
- [ ] package, permission i integration blocker su odvojeni;
- [ ] čista resolver logika prolazi u Vitest-u bez `server-only` import greške;
- [ ] javni `server.ts` entry point ostaje `server-only`;
- [ ] nijedna postojeća ruta nije promenjena;
- [ ] staged 01A i 01B fajlovi ostaju netaknuti;
- [ ] `npx tsc --noEmit` prolazi;
- [ ] `npm run check` prolazi;
- [ ] nema commita, push-a ili Supabase apply koraka.
