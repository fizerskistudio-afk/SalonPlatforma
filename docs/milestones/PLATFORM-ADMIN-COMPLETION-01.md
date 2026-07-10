# PLATFORM-ADMIN-COMPLETION-01

**Datum pripreme:** 10. jul 2026.  
**Status:** implementiran u paketu; čeka `npm run check` i osnovni smoke test.

## Cilj

Pretvoriti platform-admin iz skupa odvojenih ekrana u minimalni operativni kontrolni centar spreman za prvi launch.

## Implementirano

### Operativni overview

Dashboard više ne prikazuje statične razvojne module. Učitava stvarne podatke iz:

- `businesses`;
- `business_members`;
- `bookings`.

Prikazuje:

- ukupan broj tenant-a;
- published tenant-e;
- draft tenant-e;
- tenant-e koji zahtevaju pažnju;
- pending/confirmed rezervacije u narednih sedam dana;
- poslednje kreirane tenant-e.

### Attention queue

Tenant ulazi u operativnu listu kada:

- čeka objavu;
- suspendovan je;
- nema aktivnog owner-a;
- objavljen je bez kontakt podataka;
- objavljen je bez eksplicitnog template-a.

Archived tenant bez drugih problema ne stvara operativni alert.

### System health

Dashboard proverava samo prisustvo konfiguracije, bez prikazivanja vrednosti:

- Supabase server;
- Google OAuth i token encryption;
- Resend email delivery;
- reminder cron;
- public rate-limit secret.

### Navigacija

- dashboard je aktivan samo na root platform-admin ruti;
- Saloni ostaju aktivni na tenant detail i management rutama;
- Novi salon je aktivan na wizard/review rutama;
- dodato je `aria-current`.

### Tenant command center

Detalj tenant-a dobija onboarding readiness checklistu:

- kontakt;
- booking settings;
- aktivna kategorija;
- aktivna usluga;
- aktivan zaposleni;
- radno vreme;
- aktivan owner.

Checklist stavke vode direktno na ekran gde se problem rešava.

## Poznate odluke

- nema nove database migracije;
- nema billing-a;
- nema napredne analitike;
- health proverava konfiguraciju, ne poziva spoljašnje provajdere;
- kompletan responsive/error/empty regression ostaje za `MASTER-SYSTEM-QA-01`.

## Acceptance criteria

- dashboard učitava stvarne podatke;
- partial query error ne ruši celu stranicu;
- tenant detail prikazuje readiness;
- nedostajući owner vodi na Access ekran;
- sidebar pravilno označava tenant child rute;
- `npm run check` prolazi;
- osnovni platform-admin smoke test prolazi.
