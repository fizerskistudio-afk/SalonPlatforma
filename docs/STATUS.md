# Ordum Studios — Current Status

**Ažurirano:** 22. jul 2026.
**Production baseline:** `main` @ `1343df48`
**Trenutni sledeći milestone:** `ORDUM-PWA-FOUNDATION-01`

## Executive snapshot

Ordum je privatni production SaaS u kontrolisanom razvoju. Platforma danas može da objavi odvojen tenant sajt, primi online rezervaciju, vodi usluge, tim, dostupnost i klijente, i da omogući owner/manager i staff radne tokove.

Novi `Ordum Workspace` postoji kao privatni launcher poslovnih aplikacija. `Studio` koristi postojeći stabilni `/admin` ili `/staff` runtime. `Content` je vidljiv samo kao `COMING SOON`, a research moduli nisu predstavljeni kao gotovi.

## Šta je danas operativno

### Public tenant

- tenant hostname i path fallback;
- više theme renderer-a;
- localized katalog usluga;
- tim, galerija, reviews i kontakt;
- online booking sa preview guard granicom;
- tenant SEO i noindex zaštita privatnih/unknown površina.

### Booking i operacije

- usluge i kategorije;
- zaposleni i employee-service veze;
- radno vreme, odsustva i dostupnost;
- rezervacije i klijenti;
- owner/manager kalendar;
- ograničeni staff pregled i sopstveni raspored;
- email potvrde kroz kontrolisani provider setup.

### Platform Admin

- tenant lifecycle;
- starter-pack provisioning;
- template i branding izbor;
- owner activation i access recovery;
- package/entitlement kontrola;
- preview pre objavljivanja;
- kontrolisani AI-assisted draft alati.

### Product platform

- odvojeni technical package, commercial offer i rollout registry;
- šest Ordum platform nivoa;
- canonical location/service source foundation;
- Workspace App Registry i server-side visibility resolver;
- tenant-aware Workspace launcher;
- Growth i Workspace/Network architecture dokumenti.

## Role i identity granice

- `owner` i `manager` koriste postojeći admin kontekst;
- `staff` koristi zaseban ograničeni kontekst;
- Platform Admin ostaje odvojen control plane;
- customer/Network identity još nije uveden;
- ista email adresa jednog dana može imati više konteksta, ali session intent i privilegije moraju ostati eksplicitni.

## Rollout pregled

| Oblast | Status |
|---|---|
| Tenant sajt i booking | LIVE |
| Owner/manager Studio | LIVE |
| Staff workspace | LIVE |
| Ordum Workspace launcher | LIVE foundation |
| Google Calendar i review alati | Managed BETA |
| Content aplikacija | COMING SOON |
| Network discovery | PLANNED |
| Store catalog | PLANNED nakon discovery osnove |
| Finance i Operations | RESEARCH |
| Billing i payment | Nedovršeno |
| Monitoring, audit i restore dokaz | Nedovršeno |

## Kvalitet i poznate granice

- poslednji Workspace milestone ima ciljani lint/test i kompletan `npm run check` PASS;
- funkcionalni desktop/mobile browser acceptance je prihvaćen;
- launcher dizajn je samo foundation i kasnije ide ka kompaktnijem Citrix Workspace obrascu;
- puni mutating production regression nije zatvoren;
- backup/restore, monitoring, audit log, billing i payment nisu launch-ready;
- legalni dokumenti i onboarding checklist ostaju obavezni pre prvog komercijalnog klijenta.

## Tehnološki pravac

- Next.js App Router ostaje glavni runtime;
- Supabase Auth, PostgreSQL/RLS i Storage ostaju data/auth osnova;
- arhitektura ostaje modularni monolit;
- server-side auth, tenancy, package i permission granice su obavezne;
- PWA dolazi pre TWA/Capacitor distribucije;
- Network koristi postojeći tenant booking handoff, ne drugi booking engine;
- mikroservisi se ne uvode bez stvarnog scaling, compliance ili provider signala.

## Sledeća odluka

`ORDUM-PWA-FOUNDATION-01` treba da dokaže da Workspace može biti instalabilan bez keširanja osetljivih tenant podataka ili simuliranja poslovnih mutacija offline.

Detalji redosleda su u root [`ROADMAP.md`](../ROADMAP.md).
