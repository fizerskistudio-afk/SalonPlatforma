# PRODUCT-PACKAGES-ENTITLEMENTS-01E-B1 — TENANT ADMIN ROUTE GATES

**Datum:** 15. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`
**Očekivani početni HEAD:** `47694a3aa12d6ff917278150024641536ec54fc9`
**Očekivani staging:** samo PASS fajlovi iz `01E-A`.

## Cilj

Aktivirati prvi tenant-admin runtime package gate bez zaključavanja osnovnog Booking Page operativnog toka.

B1 štiti:

- `/admin/gallery` kroz `site.gallery`;
- `/admin/reviews` kroz `reviews.management`.

B1 ne štiti mutation/server-action/API boundary. To dolazi odmah zatim u `01E-B2`.

## Booking Page ostaje operativan

Booking Page i dalje ima:

- dashboard;
- rezervacije;
- klijente;
- usluge;
- tim;
- raspored;
- članove;
- booking notifikacije;
- osnovna podešavanja;
- staff panel.

`/admin/settings` se ne zaključava kao celina. Kasniji granularni gate zaključava samo Google Calendar i druge premium sekcije unutar settings-a.

## Protected layout

Protected admin layout sada:

1. učitava aktivni admin tenant;
2. učitava package access po `business_id`;
3. računa reviews feature decision;
4. ne izvršava reviews attention query kada paket nema Reviews;
5. prosleđuje package access u `AdminShell`.

Legacy i invalid rollout assignment ostaju fail-open kroz postojeći resolver.

## Navigacija

Svaki admin navigation item dobija feature key iz centralne gate mape.

Kada package nema feature:

- link ostaje vidljiv;
- link ostaje klikabilan;
- prikazuje se `Paket` lock badge;
- ruta otvara kontrolisani locked state.

Ovo sprečava:

- mrtve linkove;
- neobjašnjivo nestajanje funkcija;
- oslanjanje samo na client-side skrivanje.

## Premium stranice

Galerija i Reviews pozivaju server-only tenant-admin feature context pre svojih data loadera.

Ako package nema entitlement:

- data loader se ne izvršava;
- prikazuje se `ProductFeatureUpgradeNotice`;
- prikazuju se trenutni i minimalni paket;
- postoji bezbedan povratak na `/admin`;
- ne postoji lažni billing ili upgrade link.

## Package-only granica u B1

B1 route gate namerno prosleđuje:

```text
permissionGranted = true
integrationConnected = true
```

Time se u ovoj fazi proverava samo package entitlement.

Permission i integration ostaju zasebni blokatori u centralnom contractu i biće aktivirani na odgovarajućim mutation/integration granicama.

## Non-goals

B1 ne menja:

- galerijske create/update/delete akcije;
- review moderation mutation;
- Google integration state;
- public site rendering;
- staff panel;
- package assignment;
- Supabase šemu ili podatke;
- billing;
- commit ili push.

## Sledeći korak

`PRODUCT-PACKAGES-ENTITLEMENTS-01E-B2 — TENANT ADMIN MUTATION GATES`

B2 mora server-side zaštititi sve premium mutation/API/action ulaze čak i kada pozivalac zaobiđe UI ili direktno pošalje zahtev.

## Acceptance

- [ ] package access se učitava u protected admin layoutu;
- [ ] reviews attention query se preskače bez Reviews entitlementa;
- [ ] svi navigation item-i koriste centralni feature key;
- [ ] zaključan premium link ostaje vidljiv i klikabilan;
- [ ] galerija se blokira pre data loadera za Booking Page;
- [ ] reviews se blokira pre data loadera ispod Reputation Pro;
- [ ] Digital Studio otvara galeriju;
- [ ] Reputation Pro otvara reviews;
- [ ] legacy tenant ostaje fail-open;
- [ ] upgrade notice nema mrtav billing link;
- [ ] osnovni Booking Page admin tok ostaje dostupan;
- [ ] `npx tsc --noEmit` prolazi;
- [ ] `npm run check` prolazi;
- [ ] nema migracije, commita ili push-a.
