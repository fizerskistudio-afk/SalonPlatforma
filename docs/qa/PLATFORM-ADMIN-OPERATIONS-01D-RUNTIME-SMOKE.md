# PLATFORM-ADMIN-OPERATIONS-01D — RUNTIME SMOKE

**Datum:** 15. jul 2026.
**Tip:** kontrolisani browser smoke sa eksplicitnim lifecycle write akcijama.
**Automatsko izvršavanje:** zabranjeno — scenario menja tenant status.

## Svrha

Potvrditi da Operations workspace koristi iste lifecycle zaštite kao postojeći tenant command center.

Ovaj runbook se izvršava samo nad namenskim test tenant-om. Ne koristiti aktivni production tenant sa stvarnim rezervacijama bez posebne odluke.

## Preduslovi

- aplikacija pokrenuta lokalno ili na kontrolisanom preview okruženju;
- platform-admin nalog sa rolom `launch_manager` ili `super_admin`;
- jedan namenski draft test tenant;
- zabeležen početni `publication_status`, `is_active` i `updated_at`;
- otvoren browser Network panel;
- nema paralelne migracije ili drugog admin rada nad istim tenant-om.

## Scenario 1 — read-only role visibility

Prijaviti se kao `sales` ili `it`.

Očekivano:

- `/platform-admin/operations` se učitava ako rola ima dashboard read pristup;
- nema lifecycle quick-action dugmadi;
- command center link ostaje dostupan u okviru postojeće read permission granice;
- nijedan PATCH zahtev se ne šalje.

## Scenario 2 — readiness-blocked publish

Koristiti draft tenant koji nema kompletan production readiness.

1. Otvoriti Operations → Launch queue.
2. Kliknuti `Objavi javno`.
3. Potvrditi dijalog.

Očekivano:

- šalje se `PATCH /api/platform-admin/businesses/publication`;
- odgovor je `409`;
- code je `TENANT_NOT_READY`;
- status tenant-a ostaje draft;
- UI prikazuje server poruku;
- nema force update-a.

## Scenario 3 — validan lifecycle happy path

Koristiti namenski tenant sa kompletnim readiness-om.

1. Objaviti draft tenant.
2. Potvrditi da je public tenant dostupan.
3. Vratiti ga u draft ili suspendovati.
4. Potvrditi da public tenant više nije operativan.
5. Arhivirati tenant.
6. Potvrditi da je jedini povratni target `Reaktiviraj kao draft`.

Očekivano:

- svaki uspešan odgovor vraća novi `updatedAt`;
- sledeća quick akcija koristi novu verziju;
- `publication_status` i `is_active` ostaju usklađeni;
- audit log beleži prethodni i novi status.

## Scenario 4 — stale-version konflikt

1. Otvoriti isti tenant u dva browser taba.
2. U prvom tabu promeniti lifecycle status.
3. Bez refresh-a u drugom tabu pokušati drugi lifecycle prelaz.

Očekivano:

- drugi zahtev vraća `409`;
- code je `LIFECYCLE_CHANGED`;
- druga akcija ne prepisuje novije stanje;
- UI prikazuje server poruku i zahteva refresh.

## Scenario 5 — URL filter persistence

Otvoriti:

```text
/platform-admin/operations?view=attention&q=studio&lifecycle=published&severity=warning&package=invalid
```

Očekivano:

- refresh čuva isti pogled;
- back/forward navigacija čuva filtere;
- search radi po nazivu i slug-u;
- reset filtera zadržava aktivni view;
- brojači view-ova ostaju globalni.

## Evidence

| Scenario | Rezultat | Evidence |
| --- | --- | --- |
| Read-only rola | PENDING | screenshot + Network |
| Readiness-blocked publish | PENDING | response status/code |
| Lifecycle happy path | PENDING | statusi + public URL |
| Stale-version konflikt | PENDING | response status/code |
| URL filter persistence | PENDING | URL + screenshot |

## Cleanup

Posle smoke-a:

1. vratiti test tenant u dogovoreni status;
2. potvrditi `is_active` usklađenost;
3. zatvoriti test sesije;
4. ne upisivati auth tokene, cookies ili tajne u evidence;
5. evidentirati rezultate u ovom dokumentu ili zasebnom sanitizovanom evidence fajlu.
