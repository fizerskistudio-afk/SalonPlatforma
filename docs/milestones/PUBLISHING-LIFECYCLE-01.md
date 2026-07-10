# PUBLISHING-LIFECYCLE-01

**Datum pripreme:** 10. jul 2026.  
**Status:** kod primenjen; lint, unit testovi i build prošli. Live lifecycle smoke i migration verifikacija ostaju u master QA ciklusu.

## Cilj

Razdvojiti operativni status tenant-a od javne dostupnosti i uvesti kontrolisan lifecycle:

- `draft`;
- `published`;
- `suspended`;
- `archived`.

## Database model

Migration `024_add_business_publication_lifecycle.sql`:

- dodaje `businesses.publication_status`;
- postojeći aktivni tenant-i postaju `published`;
- postojeći neaktivni tenant-i postaju `suspended`;
- novi tenant-i po defaultu nastaju kao `draft`;
- dodaje check constraint i indeks.

## Javni runtime

Samo tenant koji je:

```text
publication_status = published
is_active = true
```

može da:

- prikaže javni katalog;
- uđe u sitemap;
- vrati availability;
- primi javni booking.

Draft, suspended i archived tenant-i javno vraćaju 404 ili business-not-found odgovor.

## Platform admin

Detalj tenant-a dobija:

- lifecycle status badge;
- status kontrole;
- admin preview link;
- publish;
- return to draft;
- suspend;
- archive.

Admin preview zahteva aktivnu platform-admin sesiju. Preview prikazuje tenant sajt, ali booking dugmad su onemogućena.

## Operativna odluka

- `draft` i `published` drže `is_active = true`;
- `suspended` i `archived` postavljaju `is_active = false`;
- status može kasnije da se promeni nazad;
- samo platform admin menja lifecycle u ovoj fazi.

## Test scope

Dodati unit testovi za:

- status validaciju;
- legacy fallback;
- public availability pravilo;
- operational mapping.

## Acceptance criteria

- migration prolazi;
- Mika i Lumière ostaju `published`;
- novi tenant nastaje kao `draft`;
- draft nije javno dostupan i nije u sitemap-u;
- admin preview radi samo platform adminu;
- publish uključuje javni sajt i booking;
- suspend/archive isključuju javni sajt i booking;
- `npm run check` prolazi.


## Installer FIX-01

- ispravljeni su sitemap markeri koji nisu odgovarali stvarnom formatiranju fajla;
- prethodni installer je stao pre sitemap upisa i pre platform-admin UI patch-eva;
- FIX-01 je idempotentan i nastavlja od delimično primenjenog stanja;
- admin preview sada koristi pravi template i za suspended/archived tenant-e.


## Ubrzana lokalna potvrda

- `npm run lint`: PASSED
- `npm test`: PASSED
- `npm run build`: PASSED
- lifecycle UI smoke: DEFERRED TO MASTER-SYSTEM-QA-01
- migration 024 live verification: DEFERRED TO MASTER-SYSTEM-QA-01
