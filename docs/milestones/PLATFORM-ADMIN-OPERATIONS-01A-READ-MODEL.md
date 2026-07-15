# PLATFORM-ADMIN-OPERATIONS-01A — OPERATIONAL READ MODEL

**Datum:** 15. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`
**Početno stanje:** clean working tree i lokalni HEAD identičan remote branch HEAD-u.

## Cilj

Pretvoriti postojeći platform-admin dashboard iz velike stranice sa ugrađenim database upitima u proverljiv, server-only operational read model.

01A ostaje potpuno read-only.

## Problem koji rešava

Postojeći `/platform-admin` već prikazuje:

- lifecycle statistiku;
- owner status;
- sedmodnevni booking broj;
- attention queue;
- system-health konfiguraciju;
- poslednje tenant-e.

Međutim, tenant aggregation i Supabase upiti nalaze se direktno u page fajlu. To otežava:

- testiranje;
- ponovno korišćenje;
- dodavanje package i integration health signala;
- kontrolisanu degradaciju delimičnih query grešaka;
- kasnije uvođenje filtera i quick actions.

## Novi server read model

`lib/platform-admin/operations-server.ts` postaje server-only granica za:

- tenant identity i publication status;
- aktivnog owner-a;
- kontakt i template signal;
- package assignment i contract health;
- broj upcoming pending/confirmed rezervacija u narednih sedam dana;
- parcijalne loader greške.

Loader ne izvršava nijednu write operaciju.

## Package-aware operations signal

Svaki tenant dobija:

- `packageLabel`;
- `packageMode`;
- `packageRequiresAttention`.

Legacy full access ostaje validan rollout režim i ne ulazi u attention queue.

Samo invalid assignment, kao što su nepoznat package key ili pogrešna contract verzija, dodaje razlog:

```text
Package assignment zahteva proveru
```

## Severity model

Attention queue uvodi tri nivoa:

### Critical

- suspendovan tenant;
- aktivan tenant bez aktivnog owner-a.

### Warning

- invalid package assignment;
- published tenant bez kontakta;
- published tenant sa template fallback-om.

### Info

- draft tenant koji čeka objavu.

Redosled je:

```text
critical → warning → info
```

Unutar istog nivoa tenant sa više upcoming rezervacija ide prvi, jer potencijalni incident ima veći operativni uticaj.

Archived tenant-i se ne prikazuju u aktivnoj attention queue.

## Dashboard UX

Dashboard sada prikazuje:

- severity badge;
- package label uz attention item;
- package label u listi poslednjih tenant-a.

Stranica više ne importuje Supabase admin client niti sadrži direktne tenant database upite.

## Granica platform-admina

01A ne pretvara platform-admin u drugi tenant-admin panel.

Platform-admin vidi agregirane signale i ulazi u postojeći tenant command center. Detaljno uređivanje sadržaja, kataloga, staff rasporeda i booking operacija ostaje u postojećim namenskim tokovima i permission granicama.

## Non-goals

01A ne:

- dodaje mutation ili API rutu;
- menja lifecycle status;
- menja package assignment;
- resetuje owner pristup;
- aktivira integraciju;
- menja Supabase šemu ili podatke;
- uvodi billing;
- commituje ili pushuje.

## Sledeći korak

`PLATFORM-ADMIN-OPERATIONS-01B — FILTERS AND OPERATIONAL VIEWS`

Planirani scope:

- URL-stabilni filteri po lifecycle, severity i package stanju;
- search po nazivu i slug-u;
- odvojeni views za attention, launch queue i published tenants;
- bez write akcija.

Tek posle stabilnog read/query UX-a ide `01C — GUARDED QUICK ACTIONS`.

## Acceptance

- [ ] platform dashboard koristi server-only operations loader;
- [ ] page nema direktan Supabase query;
- [ ] package health je deo tenant read modela;
- [ ] legacy full access nije attention razlog;
- [ ] invalid assignment jeste warning;
- [ ] critical ide pre warning i info;
- [ ] bookings su tiebreaker unutar severity nivoa;
- [ ] archived tenant-i su isključeni;
- [ ] UI prikazuje severity i package label;
- [ ] ciljani Vitest testovi prolaze;
- [ ] `npx tsc --noEmit` prolazi;
- [ ] `npm run check` prolazi;
- [ ] nema migracije, commita ili push-a.
