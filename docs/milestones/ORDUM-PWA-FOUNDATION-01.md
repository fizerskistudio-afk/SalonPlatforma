# ORDUM-PWA-FOUNDATION-01

## Status

Code milestone za instalabilni i bezbedni Ordum Workspace PWA foundation.

## Cilj

Omogućiti da se postojeći Ordum Workspace instalira kao PWA bez keširanja privatnih tenant podataka, simuliranja poslovnih mutacija offline ili lažnog predstavljanja Ordum Network-a kao gotovog proizvoda.

## Uvedeno

- centralni typed PWA surface registry;
- odvojeni `workspace` i `network` identity contract;
- `workspace` kao `live_foundation` i izloženi manifest;
- `network` kao `planned` i `contract_only`;
- zasebna `/workspace.webmanifest` ruta;
- Workspace metadata i Apple Web App identity;
- Workspace 192, 512, maskable i Apple touch ikone;
- root-scope Workspace service worker;
- statični, potpuno javni offline fallback;
- admin i staff manifest shortcut-i;
- screenshot ownership bez izmišljanja screenshot sadržaja;
- eksplicitni `Cache-Control: private, no-store` za privatne rute;
- targeted registry, manifest i source-contract testovi.

## Zašto worker ima root scope

Instalirani Workspace mora da može da otvori postojeći `/admin` ili `/staff` Studio tok u istom standalone prozoru.

Root scope ne znači root caching.

Worker:

- ne presreće POST, PATCH, PUT ili DELETE;
- ne kešira `/admin`;
- ne kešira `/staff`;
- ne kešira `/api`;
- ne kešira tenant HTML;
- ne kešira authenticated Workspace HTML;
- ne koristi background write queue;
- ne koristi runtime `cache.put`;
- presreće samo Workspace navigaciju radi statičnog offline fallback-a;
- kešira samo javni offline HTML i PWA ikone.

## Manifest granice

### Workspace

```text
name: Ordum Workspace
start_url: /workspace
scope: /
display: standalone
status: live_foundation
exposure: manifest
```

### Network

```text
name: Ordum Network
status: planned
exposure: contract_only
service worker: none
offline fallback: none
```

`/network.webmanifest` se ne izlaže u ovom milestone-u. Network shell i discovery runtime još ne postoje.

## Screenshot ownership

Registry određuje da Workspace screenshot-e poseduje `workspace`, a Network screenshot-e poseduje `network`.

Manifest ne navodi screenshot fajlove dok nisu ručno snimljeni iz stvarnog accepted browser toka. Ne koristimo generičke ili izmišljene screenshot-e samo radi install prompt prezentacije.

## Offline ponašanje

### Dostupno offline

- statični Workspace offline ekran;
- PWA identity ikone.

### Nije dostupno offline

- Workspace tenant context;
- admin;
- staff;
- rezervacije;
- klijenti;
- kalendar;
- usluge;
- dostupnost;
- promena tenant-a;
- logout rezultat;
- booking write;
- bilo koja API mutacija.

Mutacija bez mreže mora da padne kao mrežna greška. Sistem nikada ne prikazuje lažni poslovni uspeh.

## Nije menjano

- booking domen;
- availability;
- auth model;
- tenant selection;
- staff permissions;
- Product Package registry;
- Product Strategy registry;
- baza;
- RLS;
- migracije;
- email;
- Calendar integracija;
- Network runtime;
- TWA;
- Capacitor;
- `ROADMAP.md`;
- commit ili push.

## Code acceptance

1. Workspace ima poseban manifest;
2. manifest poseduje 192, 512 i maskable ikone;
3. Workspace layout registruje service worker;
4. root scope je eksplicitno opravdan;
5. private odgovori imaju `no-store`;
6. worker ne kešira privatne odgovore;
7. worker ne presreće mutacije;
8. offline fallback je statičan i ne sadrži tenant podatke;
9. Network ostaje contract-only;
10. ciljani lint/testovi, kompletan `npm run check` i staged diff check prolaze.

## Browser acceptance

### Desktop Chromium

- otvoriti `/workspace`;
- potvrditi učitavanje `/workspace.webmanifest`;
- potvrditi aktivan `/ordum-workspace-sw.js`;
- osvežiti stranicu jednom nakon prve registracije;
- potvrditi da browser nudi instalaciju;
- instalirati Workspace;
- potvrditi standalone otvaranje na `/workspace`;
- potvrditi da Studio otvara postojeći `/admin` u istom prozoru;
- DevTools Application → Cache Storage sadrži samo offline HTML i ikone;
- nema tenant HTML, admin, staff ili API odgovora u cache-u.

### Mobile Chromium

- otvoriti `/workspace`;
- dodati/instalirati aplikaciju;
- potvrditi Workspace naziv i ikonu;
- otvoriti instaliranu aplikaciju;
- potvrditi da se launcher prikazuje bez browser chrome-a;
- potvrditi Studio deep link;
- uključiti offline režim i osvežiti `/workspace`;
- potvrditi statični offline ekran bez podataka salona;
- vratiti mrežu i potvrditi normalan Workspace tok.

### Regression

- `/admin` radi online;
- `/staff` radi online;
- booking mutacija bez mreže ne prikazuje success;
- logout i promena tenant-a ne mogu ostaviti privatni odgovor u Cache Storage-u jer se takvi odgovori nikada ne upisuju.

## Sledeći korak

Posle code i browser PASS-a:

1. zaseban `ROADMAP.md` closeout;
2. commit/push i fast-forward u `main`;
3. `CONTENT-FOUNDATION-01`.
