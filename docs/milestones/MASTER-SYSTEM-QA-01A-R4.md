# MASTER-SYSTEM-QA-01A-R4 — Read-only baseline closeout

**Datum:** 21. jul 2026.
**Repo:** `fizerskistudio-afk/SalonPlatforma`
**Grana:** `main`
**Baseline commit:** `96c5bdf029d3e29d1a0ccf8ae56cfbdaad4422ea`
**Status:** PASS

## 1. Cilj

Milestone potvrđuje stabilan read-only production-like baseline pre pokretanja authenticated i mutating master QA toka.

R4 je namerno ograničen na javni rendering, anonymous auth granice i bezbedne API validation zahteve. Nije pravio rezervacije, menjao tenant podatke, slao email, pozivao Calendar write ili pokretao migracije.

## 2. Potvrđeni gate-ovi

- [x] clean `main` checkpoint poravnat sa `origin/main`;
- [x] kompletan `npm run check`;
- [x] production build i lokalni production server;
- [x] sekvencijalni runtime health preflight;
- [x] Playwright sa jednim workerom;
- [x] desktop Chromium/Edge matrica;
- [x] mobile Chromium/Edge matrica;
- [x] ukupno `18/18` Playwright testova.

## 3. Pokriveni tokovi

- [x] Ordum landing render i responsive navigation granice;
- [x] Heritage Barber javni tenant;
- [x] Atelier Luna Nails javni tenant;
- [x] unknown tenant prikazuje tenant-safe not-found i `noindex`;
- [x] anonymous `/admin` auth boundary;
- [x] anonymous `/staff` auth boundary;
- [x] anonymous `/platform-admin` auth boundary;
- [x] catalog API odbija nedostajući tenant scope bez internog curenja;
- [x] availability API odbija nepotpun zahtev bez internog curenja.

## 4. QA harness korekcije tokom ciklusa

Rani R3 pokušaji otkrili su probleme u privremenom QA harness-u, ne product regresije:

1. Windows `.cmd` procesi nisu bili pokrenuti kroz odgovarajući Windows command boundary.
2. Browser download je zamenjen korišćenjem sistemskog Microsoft Edge/Chrome browsera.
3. Landing i robots selektori su suženi na stabilne, semantičke assertion-e.
4. Mobile profil je eksplicitno prebačen na Chromium uređaj.
5. Playwright report/runtime je izmešten iz repozitorijuma nakon što je ESLint ušao u generisani trace vendor bundle.

Finalni R4 drži runtime i evidence van repozitorijuma u:

```text
%TEMP%\OrdumStudios\master-system-qa\R4-...
```

## 5. Integritet repozitorijuma

- [x] application source nije menjan;
- [x] `package.json` i `package-lock.json` nisu menjani;
- [x] ROADMAP nije menjan tokom samog QA run-a;
- [x] baza i migracije nisu menjane;
- [x] nema booking, email, Calendar ili tenant lifecycle write-a;
- [x] QA artefakti su ciljano uklonjeni iz lokalnog repozitorijuma;
- [x] repo je posle cleanup-a potvrđen kao čist;
- [x] QA harness nije commit-ovan ili push-ovan.

## 6. Šta ovaj PASS ne potvrđuje

Ovaj milestone nije puni production launch gate i ne zatvara:

- authenticated owner/manager/staff tokove;
- stvarni live booking mutation i overlap/rate-limit ponašanje;
- admin calendar create/update/cancel tok;
- Google Calendar OAuth i provider write;
- production recipient email režim;
- reminder cron execution;
- authenticated cross-tenant pokušaje;
- production landing contact-form Resend smoke;
- mobile preview booking guard;
- migration `029` odluku;
- formalni read-only DB verification output za primenjenu migraciju `032`.

## 7. Sledeći korak

`MASTER-SYSTEM-QA-01B` treba da bude kontrolisani authenticated/mutating production regression sa unapred definisanim test tenant-om, test korisnicima, cleanup ugovorom i eksplicitnim odobrenjem za svaki provider/database write.

Paralelno ostaje `PRODUCTION-DOMAINS-ENV-01C` za email domain hardening i Google OAuth callback odluku.
