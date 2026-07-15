# PRODUCT-PACKAGES-ENTITLEMENTS-CLOSEOUT-01

**Datum:** 15. jul 2026.
**Status:** lokalni application closeout spreman za završnu proveru.
**Branch:** `backup/theme-core-barber-beta`
**Očekivani početni HEAD:** `47694a3aa12d6ff917278150024641536ec54fc9`
**Očekivani staging:** 42 PASS fajla iz `01E-A`, `01E-B1`, `01E-B2`, `01E-C1`, `01E-C2` i `01E-D`.

## Cilj

Zatvoriti runtime package-gating chapter jednim proverljivim staged checkpoint-om, ažurirati operativni ROADMAP i ostaviti repository spreman za ciljani commit.

Closeout ne izvršava commit ni push.

## Završeni slojevi

### Package contract i persistence

- pet kumulativnih paketa;
- centralni entitlement registry;
- nullable tenant package assignment;
- contract version;
- legacy full-access rollout;
- invalid assignment fail-open uz attention signal.

### Server resolution

- package access resolver po business ID-u i slug-u;
- package, permission i integration ostaju odvojene odluke;
- centralna feature i route gate mapa;
- minimalni potreban paket za zaključanu funkciju.

### Tenant-admin runtime

- package-aware navigacija;
- zaključane premium stranice;
- gallery mutation i signed-upload server gate;
- reviews moderation i reply server gate;
- stabilan `PRODUCT_PACKAGE_REQUIRED` rezultat.

### Staff runtime

- osnovni staff portal ostaje u Booking Page paketu;
- lični Google Calendar počinje od Operations Pro;
- connect, callback, disconnect i manual sync imaju server gate;
- automatic employee sync vraća `skipped` kada paket nije dovoljan;
- booking mutation ne pada zbog package downgrade-a.

### Upgrade UX i test matrica

- shared upgrade guidance;
- stvarni trenutni i minimalni paket;
- bez mrtvih billing/upgrade linkova;
- svih pet paketa u runtime matrici;
- legacy i invalid assignment fail-open;
- blocker precedence: package → permission → integration;
- platform-admin preview ostaje odvojen i funkcionalan.

## Finalna automatizovana provera

Installer izvršava:

```text
git diff --cached --check
ciljani product-package Vitest smoke
npx tsc --noEmit
npm run check
finalni no-pager staged diff pregled
```

Ciljani smoke obuhvata:

- runtime package matricu;
- upgrade guidance;
- upgrade UX contract;
- platform-admin preview contract;
- closeout contract.

## ROADMAP realignment

ROADMAP se ažurira tako da:

1. access recovery više nije označen kao aktivan;
2. product package chapter bude evidentiran;
3. `PLATFORM-ADMIN-OPERATIONS-01` postane sledeći aktivni milestone;
4. `AI-CONTENT-ASSIST-FOUNDATION-01` bude eksplicitno postavljen pre content starter packs;
5. commit i push ostanu neoznačeni dok korisnik ne potvrdi završni staged pregled.

## Non-goals

Closeout ne:

- menja Supabase šemu;
- menja package assignment podatke;
- aktivira integracije;
- uvodi billing;
- pokreće production cron;
- commituje;
- pushuje;
- dira `main`.

## Predloženi Git checkpoint posle PASS-a

```text
feat(product-packages): enforce tenant and staff entitlement gates
```

Commit i push se izvršavaju samo uz eksplicitnu autorizaciju korisnika.

## Acceptance

- [ ] početni staging ima tačno 42 A–D fajla;
- [ ] ROADMAP nema unstaged promene pre instalacije;
- [ ] closeout dokument i contract test su staged;
- [ ] ROADMAP je ažuriran i staged;
- [ ] ciljani package smoke prolazi;
- [ ] TypeScript prolazi;
- [ ] kompletan `npm run check` prolazi;
- [ ] finalni staging ima tačno 45 fajlova;
- [ ] support fajlovi su uklonjeni;
- [ ] nema migracije;
- [ ] nema commita;
- [ ] nema push-a.
