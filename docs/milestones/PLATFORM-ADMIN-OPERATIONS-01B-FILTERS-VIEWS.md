# PLATFORM-ADMIN-OPERATIONS-01B — FILTERS AND OPERATIONAL VIEWS

**Datum:** 15. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`
**Očekivani početni staging:** tačno 7 PASS fajlova iz `PLATFORM-ADMIN-OPERATIONS-01A`.

## Cilj

Dodati poseban read-only Operations workspace sa stabilnim URL filterima i jasno odvojenim operativnim pogledima.

## Nova ruta

```text
/platform-admin/operations
```

Ruta koristi:

- postojeći `PlatformAdminLayout`;
- `platform.dashboard.read` permission;
- `loadPlatformOperationsOverview()` iz 01A;
- pure query/filter modul bez dodatnih database upita.

## Operativni pogledi

### Zahteva pažnju

Tenant-i sa najmanje jednim aktivnim operational reason signalom.

### Launch queue

Draft tenant-i koji čekaju završetak onboarding/objave toka.

### Objavljeni

Tenant-i sa `published` lifecycle statusom.

### Svi tenant-i

Kompletan read-only pregled.

Brojači pogleda se računaju nad celim read modelom i ne nestaju kada korisnik promeni filter.

## URL filteri

GET parametri:

```text
view
q
lifecycle
severity
package
```

Primer bookmarkable URL-a:

```text
/platform-admin/operations?view=attention&q=studio&lifecycle=published&severity=warning&package=invalid
```

Ne koristi se client-only filter state.

Refresh, back/forward navigacija i direktno deljenje URL-a zadržavaju isti kontekst.

## Filter značenje

### Search

Case-insensitive pretraga po:

- nazivu tenant-a;
- slug-u.

Input se trimuje i ograničava na 120 karaktera.

### Lifecycle

- all;
- draft;
- published;
- suspended;
- archived.

### Severity

- all;
- critical;
- warning;
- info.

Zdrav tenant bez attention reasons ne ulazi u severity filter.

### Package stanje

- assigned;
- legacy full access;
- invalid assignment;
- all.

Ovo nije billing filter i ne menja package assignment.

## Sortiranje

Rezultati se sortiraju po:

1. severity;
2. broju upcoming rezervacija;
3. nazivu.

Healthy tenant-i dolaze posle tenant-a sa aktivnim signalima.

## UX

Svaki rezultat prikazuje:

- naziv i slug;
- publication status;
- severity ili stabilno stanje;
- operational reasons;
- package label;
- broj rezervacija u narednih sedam dana;
- link ka postojećem tenant command center-u.

Navigation dobija poseban `Operacije` item.

## Granice

01B ostaje read-only.

Ne uvodi:

- mutation action;
- API write rutu;
- lifecycle promenu;
- package promenu;
- owner reset;
- billing;
- migraciju;
- commit ili push.

## Sledeći korak

`PLATFORM-ADMIN-OPERATIONS-01C — GUARDED QUICK ACTIONS`

Planirani quick actions moraju imati:

- posebnu permission proveru;
- server-side ownership/lifecycle proveru;
- optimistic concurrency;
- confirmation UI;
- audit-safe rezultat;
- bez zaobilaženja postojećih lifecycle i owner-access servisa.

## Acceptance

- [ ] dedicated operations ruta postoji;
- [ ] ruta zahteva `platform.dashboard.read`;
- [ ] dashboard read model se ponovo koristi;
- [ ] nema dodatnih database query-ja u operations page-u;
- [ ] attention, launch, published i all views rade;
- [ ] search po nazivu i slug-u radi;
- [ ] lifecycle filter radi;
- [ ] severity filter radi;
- [ ] package-state filter radi;
- [ ] URL je determinističan i bookmarkable;
- [ ] navigation sadrži Operacije;
- [ ] svaki rezultat vodi u postojeći command center;
- [ ] ciljani testovi prolaze;
- [ ] `npx tsc --noEmit` prolazi;
- [ ] `npm run check` prolazi;
- [ ] nema migracije, commita ili push-a.
