# Salon Platforma — Product & Engineering Roadmap

**Ažurirano:** 7. jul 2026.  
**Repo:** `fizerskistudio-afk/SalonPlatforma`  
**Aktuelni production-ready milestone commit:** `450180e` — Resend delivery webhooks

---

## 1. Vizija proizvoda

Salon Platforma je multi-tenant SaaS za frizerske i beauty salone koji objedinjuje:

- javni salonski sajt;
- online rezervacije;
- admin i staff panele;
- Google Calendar sinhronizaciju;
- email notifikacije i podsetnike;
- upravljanje zaposlenima, uslugama, rasporedom i odsustvima;
- hostovanje salonskih sajtova uz pretplatu;
- povezivanje sopstvenog domena salona;
- export gotovog standalone sajta sa sopstvenim domenom i konfiguracijom.

### Model proizvoda

1. **Platform-hosted SaaS**
   - salon ostaje na infrastrukturi platforme;
   - mesečna ili godišnja pretplata;
   - automatska ažuriranja;
   - salonski poddomen ili sopstveni domen;
   - centralizovane rezervacije, email, kalendari i administracija.

2. **Standalone export**
   - generisani sajt se izvozi kao poseban projekat;
   - koristi sopstveni domen i environment konfiguraciju;
   - može koristiti posebne Supabase/Resend naloge ili ugovoreni managed backend;
   - nema automatska platform updates bez posebnog maintenance paketa.

---

## 2. Završeno

### FOUNDATION — Osnova platforme

- [x] Next.js App Router + TypeScript + Tailwind struktura
- [x] Supabase baza, Auth i Storage
- [x] Multi-tenant poslovni model
- [x] Javni salonski profil
- [x] Javni booking tok
- [x] Validacija termina i zaštita od duplih rezervacija
- [x] Serbian Latin lokalizacija javnog booking toka
- [x] Admin i platform-admin autentikacija

### PLATFORM-ADMIN — Upravljanje salonima

- [x] Pregled i upravljanje salonima
- [x] Izmena poslovnog profila
- [x] Booking pravila i radno vreme
- [x] Upravljanje zaposlenima
- [x] Radno vreme po zaposlenom
- [x] Katalog usluga
- [x] Upravljanje odsustvima
- [x] Upravljanje rezervacijama
- [x] Galerija, logo i branding mediji

### TENANT-ADMIN — Owner/manager/staff sistem

- [x] Članovi salona i role: owner, manager, staff
- [x] Dashboard booking quick actions
- [x] Ograničeni staff dashboard
- [x] Staff vidi samo sopstvene rezervacije
- [x] Staff statusi: confirmed, completed, no-show
- [x] Zahtevi za odsustvo i owner/manager approval
- [x] Automatsko kreiranje time-off zapisa
- [x] Konflikt provere i RLS zaštita

### INTEGRATIONS-01A — Dual Google Calendar

- [x] Zajednički Google Calendar salona
- [x] Sopstveni Google Calendar svakog frizera
- [x] Nezavisna sinhronizacija na oba kalendara
- [x] Kreiranje, pomeranje i otkazivanje događaja
- [x] Reassignment zaposlenog bez duplih događaja
- [x] Google greška ne blokira booking
- [x] OAuth scope validacija i reconnect flow

### NOTIFICATIONS-01 — Transakcioni emailovi

- [x] Email kupcu za primljen zahtev
- [x] Email kupcu za potvrđen termin
- [x] Email kupcu za pomeren termin
- [x] Email kupcu za otkazan termin
- [x] Email salonu za novu rezervaciju
- [x] Resend test mode sa jednim stvarnim primaocem
- [x] Platform, custom-domain i standalone sender resolver
- [x] Delivery log, deduplikacija i idempotency
- [x] Email greška ne blokira booking

### NOTIFICATIONS-02 — Owner kontrole i retry

- [x] `/admin/notifications`
- [x] Master prekidači za customer/business poruke
- [x] Prekidači po email template-u
- [x] Podešavanje notification i reply-to adrese
- [x] Delivery log i status filteri
- [x] Ručni retry za failed/skipped poruke
- [x] Zaštita od ponovnog slanja već poslatih emailova

### NOTIFICATIONS-03 — Automatski podsetnici

- [x] Podsetnik 24 sata pre termina
- [x] Opcioni podsetnik 2 sata pre termina
- [x] Per-salon podešavanja
- [x] Zaštićen cron endpoint
- [x] Deduplikacija podsetnika
- [x] Novi reminder ciklus nakon pomeranja termina
- [x] Samo confirmed rezervacije ulaze u reminder obradu

### NOTIFICATIONS-04 — Resend delivery webhooks

- [x] Verifikacija webhook potpisa
- [x] `email.sent`
- [x] `email.delivered`
- [x] `email.delivery_delayed`
- [x] `email.bounced`
- [x] `email.complained`
- [x] `email.failed`
- [x] `email.suppressed`
- [x] Deduplikacija webhook događaja
- [x] Zaštita od događaja pristiglih van redosleda
- [x] Provider statusi u admin delivery logu

---

## 3. Sledeći milestone

# BRAND-DEPLOY-01 — Brend, domen i produkcioni deployment

### Cilj

Postaviti platformu na sopstveni domen i napraviti stabilnu produkcionu osnovu bez vezivanja aplikacije za klasičan PHP/WordPress hosting.

### Predložena arhitektura domena

- `salonio.rs` — javni marketing sajt platforme
- `app.salonio.rs` — admin, platform-admin i staff aplikacija
- `booking.salonio.rs` — opcioni zajednički booking entry point
- `<slug>.salonio.rs` — salonski sajtovi bez sopstvenog domena
- `mail.salonio.rs` — Resend sending subdomain
- sopstveni domen salona — CNAME/custom-domain povezivanje

> Naziv `Salonio` je radni predlog dok se ne potvrde domen i pravna dostupnost imena.

### Zadaci

- [ ] Finalni izbor naziva platforme
- [ ] Provera i registracija `.rs` domena
- [ ] Provera dostupnosti odgovarajućeg `.com` ili `.app` domena
- [ ] Produkcioni deployment Next.js aplikacije
- [ ] Povezivanje glavnog domena
- [ ] Povezivanje `app` poddomena
- [ ] Wildcard DNS plan za salonske poddomene
- [ ] Produkcioni Supabase environment
- [ ] Produkcioni Resend domen i DNS verifikacija
- [ ] Produkcioni Resend webhook
- [ ] Produkcioni cron za booking reminders
- [ ] Environment separation: local, preview, production
- [ ] Error logging i osnovni monitoring
- [ ] Rate limiting za javni booking i webhook rute
- [ ] Backup i restore procedura
- [ ] Security review environment promenljivih
- [ ] Smoke test svih booking lifecycle tokova

### Definition of Done

- platforma radi na sopstvenom `.rs` domenu;
- admin i javni booking rade u produkciji;
- Google Calendar radi sa produkcionim callback URL-ovima;
- Resend šalje sa verifikovanog domena;
- webhook statusi i reminder cron rade automatski;
- nema development/test secreta u produkciji;
- postoji dokumentovana rollback procedura.

---

## 4. WEBSITE-HOSTING-01 — Hostovani salonski sajtovi

### Cilj

Omogućiti salonima da uz pretplatu dobiju sajt, rezervacije i administraciju na infrastrukturi platforme.

- [ ] Planovi pretplate i feature entitlements
- [ ] Trial period
- [ ] Aktivacija/deaktivacija tenant funkcija
- [ ] Podrazumevani salonski poddomen
- [ ] Custom-domain onboarding
- [ ] DNS instrukcije za vlasnika salona
- [ ] Provera domena i SSL status
- [ ] Theme/template izbor
- [ ] Brand boje, fontovi i layout konfiguracija
- [ ] Draft/published status sajta
- [ ] SEO title, description, Open Graph i sitemap
- [ ] Analytics osnovni pregled
- [ ] Storage kvote za galeriju
- [ ] Subscription grace period i read-only režim

---

## 5. WEBSITE-EXPORT-01 — Standalone export

### Cilj

Izvesti gotov salonski sajt koji može da radi na sopstvenom hostingu i domenu.

- [ ] Export manifest sa business konfiguracijom
- [ ] Generisanje standalone projekta/ZIP paketa
- [ ] `.env.example`
- [ ] Standalone Resend sender konfiguracija
- [ ] Standalone Supabase konfiguracija
- [ ] Migracije potrebne za odvojeni projekat
- [ ] Deployment uputstvo
- [ ] Domain i DNS uputstvo
- [ ] Branding asset export
- [ ] Provera da export ne sadrži platform secrets
- [ ] Licencni i maintenance model
- [ ] Verzija export paketa i update strategija

---

## 6. BILLING-01 — Pretplate i naplata

- [ ] Definicija cenovnih paketa
- [ ] Mesečna i godišnja pretplata
- [ ] Subscription status po salonu
- [ ] Trial i grace period
- [ ] Fakturisanje
- [ ] Ručna evidencija uplata za početnu fazu
- [ ] Payment provider integracija u kasnijoj fazi
- [ ] Platform-admin billing pregled
- [ ] Automatske email notifikacije za obnovu i neuspelu naplatu

---

## 7. CUSTOMER-SELF-SERVICE-01

- [ ] Siguran link za pregled rezervacije
- [ ] Kupac može da otkaže rezervaciju u dozvoljenom roku
- [ ] Kupac može da zatraži pomeranje
- [ ] Potvrda email adrese po potrebi
- [ ] Add-to-calendar link
- [ ] Booking istorija za registrovane kupce
- [ ] Consent i privacy evidencija

---

## 8. OPERATIONS-01

- [ ] Centralni audit log
- [ ] Platform health dashboard
- [ ] Failed integration queue
- [ ] Automatski retry politike
- [ ] Alert za veći broj bounced/complained emailova
- [ ] Alert za Google token failure
- [ ] Data retention politika
- [ ] GDPR/privacy dokumentacija
- [ ] Terms of Service
- [ ] Incident response procedura

---

## 9. QA-LAUNCH-01

- [ ] Playwright kritični booking testovi
- [ ] Owner/manager/staff permission testovi
- [ ] Multi-tenant isolation testovi
- [ ] Mobile responsive QA
- [ ] Accessibility osnovna provera
- [ ] Performance/Lighthouse provera
- [ ] Produkcioni seed salon
- [ ] Pilot sa prvim stvarnim salonom
- [ ] Feedback i bugfix ciklus
- [ ] Public launch checklist

---

## 10. Trenutni prioriteti

1. **Finalizovati naziv i kupiti domen**
2. **Deployovati platformu na produkcioni Next.js hosting**
3. **Povezati Resend domen, webhook i cron**
4. **Uvesti custom domains za hostovane salonske sajtove**
5. **Napraviti subscription/entitlement model**
6. **Napraviti standalone export pipeline**

---

## 11. Tehničke odluke

- Klasičan PHP/WordPress shared hosting nije primarni runtime za platformu.
- Platforma zahteva Node.js/Next.js runtime, environment variables, server routes, webhooks i scheduled cron pozive.
- Supabase ostaje baza, Auth i Storage servis.
- Resend ostaje email provider.
- Google Calendar integracija ostaje best-effort i ne blokira booking.
- Email slanje ostaje best-effort i ne blokira booking.
- Hostovani i standalone modeli koriste isti notification/template sloj, ali različitu sender i deployment konfiguraciju.
- Svi tenant podaci moraju ostati izolovani po `business_id`.

---

## 12. Commit evidencija glavnih završenih milestoneova

- `450180e` — `feat(notifications): track Resend delivery webhooks`
- `34dbdd1` — `feat(notifications): add automated booking reminders`
- `6fbc857` — `feat(notifications): add owner controls and delivery retry`
- `fa2e88c` — `feat(notifications): add transactional booking emails`
- `23c6544` — `feat(integrations): add salon and employee Google calendars`
- `1d92881` — `feat(tenant-admin): add restricted staff dashboard`
- `d0d8b65` — `feat(tenant-admin): add dashboard booking quick actions`
- `cd9e0af` — `feat(tenant-admin): add member and role management`
- `b4a3635` — `feat(platform-admin): add business media management`
