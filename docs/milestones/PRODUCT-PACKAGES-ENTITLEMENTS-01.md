# PRODUCT-PACKAGES-ENTITLEMENTS-01

**Aktiviran:** 14. jul 2026.
**Status:** 01A contract package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`

## Cilj

Pretvoriti postojeću tehničku infrastrukturu u jasan komercijalni proizvod za beauty i wellness nišu, bez dupliranja autorizacije i bez vezivanja UI komponenti direktno za naziv paketa.

Platforma ima četiri odvojena nivoa odgovornosti:

```text
PUBLIC
→ klijent pregleda salon, usluge, tim, recenzije i rezerviše

TENANT ADMIN
→ owner ili manager vodi poslovanje, sadržaj, integracije i reputaciju

STAFF PANEL
→ zaposleni vidi sopstvene rezervacije i napomene, raspored i odsustva

PLATFORM ADMIN
→ kreira tenant, bira paket, priprema sadržaj i temu, objavljuje i pruža podršku
```

## Četiri nezavisna contracta

### Paket

Komercijalna ponuda koju klijent kupuje.

### Entitlement

Funkcija koju paket omogućava tenant-u.

### Permission

Radnja koju određena korisnička ili platformska rola sme da izvrši.

### Integration state

Stvarno stanje spoljne veze, na primer da li je Google Calendar ili Google Business Profile povezan i zdrav.

Paket ne zamenjuje postojeće platform-admin permissione, owner/manager membership ili staff membership.

## Početni cenovnik

| Paket | Mesečno | Setup | Osnovni limit |
|---|---:|---:|---:|
| Booking Page | 3.490 RSD | 9.900 RSD | 2 bookable člana |
| Digital Studio | 6.990 RSD | 24.900 RSD | 5 bookable članova |
| Operations Pro | 10.990 RSD | 39.900 RSD | 10 bookable članova |
| Reputation Pro | 14.990 RSD | 59.900 RSD | 15 bookable članova |
| Signature | custom | custom | ugovorni limit |

Godišnja pretplata koristi model „plati 10 meseci, koristi 12“, dok setup ostaje zaseban.

## Package composition

### Booking Page

- booking mikrostranica;
- booking management;
- osnovne email potvrde;
- tenant admin;
- staff panel;
- sopstvene rezervacije i dozvoljene napomene;
- raspored, odsustva i slobodni dani;
- osnovna analitika.

### Digital Studio

Sve iz Booking Page paketa, plus:

- kompletan javni sajt;
- branding, galerija, SEO i theme biblioteka;
- custom domen;
- salon Google Calendar sync;
- AI Translate Assist sa ručnim pregledom i potvrdom.

### Operations Pro

Sve iz Digital Studio paketa, plus:

- lični Google Calendar zaposlenog;
- employee calendar sync;
- two-way busy availability;
- napredna analitika;
- vođena migracija;
- prioritetna podrška.

### Reputation Pro

Sve iz Operations Pro paketa, plus:

- Google reviews widget;
- reviews inbox;
- review obaveštenja;
- AI Review Reply Assist;
- ručna potvrda pre objavljivanja svakog odgovora.

### Signature

Sve iz Reputation Pro paketa, plus:

- više lokacija;
- custom limiti;
- custom entitlement ugovor;
- centralni multi-location radni model.

## 01A scope

`PRODUCT-PACKAGES-ENTITLEMENTS-01A` uvodi samo:

- verzionisani package contract;
- stabilne package i entitlement ključeve;
- početne RSD cene i setup cene;
- staff i AI limite po paketu;
- kumulativni upgrade redosled;
- helper funkcije za proveru entitlementa;
- Vitest contract testove.

## 01A non-goals

Ovaj paket namerno ne uvodi:

- database migraciju;
- `package_key` na business zapisu;
- runtime sakrivanje postojećih funkcija;
- API entitlement guard;
- billing ili payment provider;
- Google OAuth promene;
- Groq klijent;
- AI generisanje;
- usage accounting;
- promenu postojećeg role/permission contracta.

Zbog toga 01A ne može da ugasi ili promeni ponašanje postojećih booking, tenant-admin, staff ili platform-admin tokova.

## Sledeći rollback-safe paketi

### 01B — Persistence

- `package_key` i bezbedan default za postojeće tenant-e;
- package assignment audit polja;
- migracija odvojena od aplikacionog contracta;
- bez aktivnog runtime gating-a.

### 01C — Server resolver

- jedan server-only package resolver;
- entitlement provera iz tenant konteksta;
- eksplicitni distinction: package, permission i integration state;
- behavior testovi;
- postojeći tenant-i ostaju funkcionalni tokom rollout-a.

### 01D — Platform-admin package assignment

- izbor paketa pri kreiranju tenant-a;
- promena paketa;
- package summary;
- limit i integration readiness pregled;
- bez billing automatizacije.

### 01E — Tenant i staff gates

- server-side entitlement guard;
- UI prikazuje samo kupljene module;
- upgrade CTA umesto mrtvih linkova;
- staff panel ostaje deo osnovnog Booking Page paketa.

### 01F — AI usage foundation

- Groq provider abstraction;
- AI Translate Assist;
- AI Review Reply Assist;
- mesečne kvote;
- hard spending zaštita;
- audit bez automatskog objavljivanja AI sadržaja.

## 01A acceptance

- [ ] package contract ima eksplicitnu verziju;
- [ ] svi entitlement ključevi su jedinstveni;
- [ ] svaki viši paket je superset prethodnog;
- [ ] staff panel postoji u Booking Page paketu;
- [ ] full site i AI translate počinju od Digital Studio paketa;
- [ ] employee/two-way Calendar počinje od Operations Pro paketa;
- [ ] Google review management i AI reply draft počinju od Reputation Pro paketa;
- [ ] multi-location postoji samo u Signature paketu;
- [ ] ne postoji database, runtime gating ili permission izmena;
- [ ] `npx tsc --noEmit` prolazi;
- [ ] `npm run check` prolazi;
- [ ] installer stage-uje samo svoja tri nova fajla.
