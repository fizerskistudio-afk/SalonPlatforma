# PLATFORM-ADMIN-OPERATIONS-01C — GUARDED LIFECYCLE QUICK ACTIONS

**Datum:** 15. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`
**Očekivani početni staging:** tačno 13 PASS fajlova iz `PLATFORM-ADMIN-OPERATIONS-01A` i `01B`.

## Cilj

Dodati bezbedne lifecycle quick actions u Operations workspace bez stvaranja paralelnog write toka ili nove API rute.

## Jedina write granica

Quick actions koriste postojeći endpoint:

```text
PATCH /api/platform-admin/businesses/publication
```

Endpoint već izvršava:

- platform-admin autentifikaciju;
- permission proveru po konkretnom lifecycle prelazu;
- proveru dozvoljenog statusnog prelaza;
- production readiness proveru pre publish-a;
- optimistic concurrency preko `updated_at`;
- atomic update sa istom očekivanom verzijom;
- audit-safe lifecycle log.

01C ne kopira ovu logiku u client komponentu i ne uvodi drugi endpoint.

## Operations read model

Tenant read model sada prenosi:

```text
updatedAt
```

Vrednost dolazi direktno iz `businesses.updated_at` i prosleđuje se quick action komponenti kao `expectedUpdatedAt`.

Posle uspešne promene API vraća novu verziju, koju komponenta čuva za sledeću akciju.

## Permission-aware UI

Quick action komponenta:

1. uzima dozvoljene target statuse iz `getAllowedLifecycleTargets`;
2. za svaki target određuje permission kroz `getPublicationPermission`;
3. prikazuje samo akcije koje trenutna platform-admin rola sme da izvrši;
4. server ponovo proverava istu dozvolu pre write-a.

IT i sales uloge zato ne dobijaju skrivenu write mogućnost kroz Operations ekran.

## Confirmation UX

Svaka akcija zahteva eksplicitni browser confirmation.

Poruke jasno navode posledicu:

- publish ponovo server-side proverava production readiness;
- draft isključuje javni sajt i booking;
- suspension privremeno isključuje javni tenant;
- archive isključuje tenant i zahteva povratak kroz draft.

## Shared lifecycle copy

Action label i confirmation tekst izdvojeni su u:

```text
lib/platform-admin/lifecycle-action-copy.ts
```

Isti helper koriste:

- postojeći `BusinessPublicationControls`;
- novi `OperationsLifecycleQuickActions`.

Time se uklanja duplirana i potencijalno različita lifecycle poruka.

## Error i concurrency ponašanje

Ako se tenant promeni u drugom tabu ili kroz drugi admin tok, endpoint vraća `LIFECYCLE_CHANGED`.

Operations UI prikazuje server poruku i ne pokušava force update.

Publish readiness blocker takođe ostaje server-side rezultat. Korisnik zatim otvara postojeći command center radi završetka readiness stavki.

## Scope quick actions

01C obuhvata samo lifecycle:

- publish;
- unpublish u draft;
- suspend;
- archive;
- reactivate kao draft.

Owner credential reset, package assignment, content mutation i booking mutation ostaju u postojećim namenskim ekranima.

## Non-goals

01C ne:

- uvodi novu API write rutu;
- menja permission matricu;
- zaobilazi lifecycle service;
- zaobilazi production readiness;
- uvodi force update;
- menja Supabase šemu;
- pokreće database write tokom instalacije;
- uvodi billing;
- commituje ili pushuje.

## Sledeći korak

`PLATFORM-ADMIN-OPERATIONS-01D — CLOSEOUT AND RUNTIME SMOKE`

Closeout treba da potvrdi:

- dashboard read model;
- URL-stabilne operations views;
- role visibility;
- lifecycle happy path;
- readiness-blocked publish;
- stale-version conflict;
- ROADMAP update;
- jedan ciljani Git checkpoint uz eksplicitnu autorizaciju.

## Acceptance

- [ ] operations read model sadrži `updatedAt`;
- [ ] quick actions koriste postojeći publication endpoint;
- [ ] nema druge lifecycle API rute;
- [ ] action visibility koristi postojeću permission matricu;
- [ ] server ponovo proverava permission;
- [ ] server proverava dozvoljeni lifecycle prelaz;
- [ ] publish ostaje readiness-gated;
- [ ] write koristi optimistic concurrency;
- [ ] svaka akcija zahteva confirmation;
- [ ] command center i Operations koriste isti lifecycle copy;
- [ ] ciljani testovi prolaze;
- [ ] `npx tsc --noEmit` prolazi;
- [ ] `npm run check` prolazi;
- [ ] nema migracije, commita ili push-a.
