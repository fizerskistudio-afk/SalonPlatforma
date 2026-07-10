# Salon Platforma

Multi-tenant platforma za javne sajtove, online zakazivanje i upravljanje beauty i wellness biznisima.

> **Status:** aktivan razvoj i production hardening. Core booking, tenant routing, autentikacija, Google Calendar, email notifikacije, SEO i osnovne bezbednosne zaštite postoje, ali platforma još nije javno lansirana.
>
> **Radni naziv:** `Salon Platforma`. Finalni tržišni naziv i domen još nisu izabrani.

## Sadržaj

- [Pregled](#pregled)
- [Glavne mogućnosti](#glavne-mogućnosti)
- [Tehnologije](#tehnologije)
- [Arhitektura](#arhitektura)
- [Uloge i pristup](#uloge-i-pristup)
- [Javne i privatne rute](#javne-i-privatne-rute)
- [Lokalno pokretanje](#lokalno-pokretanje)
- [Environment promenljive](#environment-promenljive)
- [Supabase i migracije](#supabase-i-migracije)
- [Google Calendar](#google-calendar)
- [Email i Resend](#email-i-resend)
- [Tenant domeni](#tenant-domeni)
- [Rate limiting](#rate-limiting)
- [Provera kvaliteta](#provera-kvaliteta)
- [Struktura projekta](#struktura-projekta)
- [Bezbednosni model](#bezbednosni-model)
- [Trenutna ograničenja](#trenutna-ograničenja)
- [Sledeći koraci](#sledeći-koraci)

## Pregled

Platforma omogućava da više nezavisnih salona i drugih beauty/wellness biznisa koristi isti Next.js deployment i istu Supabase infrastrukturu, uz strogo odvajanje podataka po `business_id` vrednosti.

Svaki tenant dobija:

- javni sajt;
- online booking;
- sopstvene usluge, zaposlene i radno vreme;
- owner/manager administraciju;
- ograničeni staff panel;
- Google Calendar povezivanje;
- email notifikacije i podsetnike;
- izbor javnog template-a;
- tenant-specifičan SEO;
- platformski poddomen, uz path fallback.

Platforma nije ograničena samo na frizerske salone. Arhitektura je predviđena za hair, barber, nails, lashes/brows, masaže, depilaciju, laser, solarijum i spa/wellness vertikale.

## Glavne mogućnosti

### Multi-tenant foundation

- tenant model zasnovan na `business_id`;
- Row Level Security u Supabase/Postgres bazi;
- javne path rute `/salon/[businessSlug]`;
- hostname resolver za `<slug>.<platform-domain>`;
- rezervisani platformski poddomeni;
- jedan deployment za platformu i hostovane tenant sajtove;
- cross-tenant audit za javne API-je i privatne podatke.

### Booking

- izbor usluge, zaposlenog, datuma i termina;
- opcija „bilo koji zaposleni“;
- validacija kontakta i booking podešavanja;
- zaštita od duplog zauzimanja termina;
- statusi rezervacije;
- reschedule, cancel i reassignment tokovi;
- tenant-specifična availability provera;
- Google Calendar sinhronizacija kao best-effort proces;
- email notifikacije kao best-effort proces.

### Tenant administracija

- owner, manager i staff uloge;
- profil biznisa;
- radno vreme i raspored;
- zaposleni i usluge;
- galerija i branding;
- rezervacije i klijenti;
- članovi, uloge i direktni kredencijali;
- notification podešavanja i delivery statusi;
- Google Calendar povezivanje;
- staff time-off request/approval tok.

### Platform administracija

Postoje management stranice i backend za:

- pregled i kreiranje biznisa;
- business presete;
- izbor template-a;
- branding i media management;
- owner pristup i kredencijale;
- javne tenant linkove.

Platform-admin proizvod još nije kompletan: overview, objedinjeni onboarding, integration health i konzistentan command-center UX ostaju otvoreni milestone-ovi.

### Template sistem

Trenutno podržani template ključevi:

- `hair-luxury`;
- `hair-editorial`;
- `barber-heritage`.

Template registry odvaja javni prikaz od tenant podataka. Typed template config, section ordering, visibility i versioning planirani su za kasniju fazu.

### SEO

- dinamički tenant title i description;
- canonical URL;
- Open Graph i Twitter metadata;
- host-aware sitemap;
- `robots.txt`;
- `noindex` metadata za privatne stranice;
- `X-Robots-Tag` za admin, staff, platform-admin, auth i API rute;
- privatne rute se ne pojavljuju u sitemap-u.

## Tehnologije

- **Next.js 16** — App Router i server/client komponente;
- **React 19**;
- **TypeScript**;
- **Tailwind CSS 4**;
- **Supabase** — Postgres, Auth i Storage;
- **Google APIs** — OAuth i Calendar integracija;
- **Resend** — transakcioni emailovi i delivery webhook događaji;
- **Vercel** — planirani primarni hosting za platformu i wildcard tenant domene.

Glavne npm komande:

```bash
npm run dev
npm run lint
npm test
npm run build
npm run check
npm run start
```

GitHub Actions CI automatski pokreće `npm ci`, lint, Vitest unit testove i production build. Browser i database integracioni testovi ostaju u narednom QA sloju.

## Arhitektura

```text
Browser / crawler
       |
       v
Next.js proxy + hostname resolver
       |
       +-- root domain ----------------> platform landing / demo hub
       |
       +-- <tenant>.<root-domain> -----> /salon/<tenant>
       |
       +-- /salon/<tenant> ------------> path preview/fallback
       |
       +-- /admin ----------------------> owner/manager panel
       |
       +-- /staff ----------------------> staff panel
       |
       +-- /platform-admin ------------> centralni platform panel
       |
       v
Server Components + Route Handlers + Server Actions
       |
       +-- Supabase Auth
       +-- Supabase Postgres + RLS
       +-- Supabase Storage
       +-- Google Calendar OAuth/API
       +-- Resend API/Webhooks
```

### Ključna pravila

1. Tenant se ne određuje iz proizvoljnog client state-a, već iz validiranog slug-a, hosta ili autorizovanog membership konteksta.
2. Sve privatne operacije moraju biti vezane za autorizovani `business_id`.
3. Service-role/secret Supabase klijent je server-only.
4. Google Calendar i email greške ne smeju poništiti uspešno sačuvan booking.
5. Javni booking i login imaju distribuirani rate limiting u Postgresu.

## Uloge i pristup

### Platform admin

Platform admin pristup je dozvoljen samo autentifikovanim email adresama iz `PLATFORM_ADMIN_EMAILS`.

### Owner

- pun tenant admin pristup;
- upravljanje članovima i ulogama;
- kreiranje/reset direktnih member kredencijala;
- tenant podešavanja i integracije.

### Manager

- tenant admin pristup;
- nema owner-only operacije nad članovima i kredencijalima.

### Staff

- ograničen staff dashboard;
- pristup sopstvenim rezervacijama;
- staff Google Calendar;
- time-off zahtevi;
- nema pristup owner/manager administraciji.

Jedan korisnik može legitimno imati membership u više tenant-a. Cross-tenant zabrana se proverava samo za tenant-e za koje korisnik nema aktivno članstvo.

## Javne i privatne rute

### Javne

| Ruta | Namena |
|---|---|
| `/` | Privremeni platform demo hub |
| `/salon/[businessSlug]` | Javni sajt tenant-a |
| `/api/catalog?businessSlug=...` | Javni tenant katalog |
| `/api/availability?...` | Slobodni termini tenant-a |
| `/api/bookings` | Kreiranje javne rezervacije |
| `/robots.txt` | Robots pravila |
| `/sitemap.xml` | Host-aware sitemap |

### Privatne

| Ruta | Namena |
|---|---|
| `/admin` | Owner/manager administracija |
| `/staff` | Staff panel |
| `/platform-admin` | Centralna platform administracija |
| `/auth/*` | Auth callback i aktivacioni tokovi |
| `/api/admin/*` | Tenant admin API |
| `/api/platform-admin/*` | Platform-admin API |

Privatne rute su blokirane za indeksiranje kroz metadata, `robots.txt` i `X-Robots-Tag`.

## Lokalno pokretanje

### 1. Instalacija

```bash
git clone <repository-url>
cd SalonPlatforma
npm install
```

Za razvoj na aktivnoj grani:

```bash
git checkout backup/theme-core-barber-beta
```

### 2. Environment konfiguracija

Kreiraj `.env.local` u root direktorijumu.

Minimalni Supabase setup:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Kompletna lista promenljivih je u sekciji [Environment promenljive](#environment-promenljive).

### 3. Migracije

Primeni sve SQL fajlove iz:

```text
supabase/migrations/
```

redosledom njihovih numeričkih prefiksa.

Za bazu na kojoj je već bila primenjena prvobitna migration `022`, obavezno primeni i:

```text
023_fix_public_rate_limit_timestamp.sql
```

### 4. Development server

```bash
npm run dev
```

Osnovne lokalne adrese:

```text
http://localhost:3000/
http://localhost:3000/salon/mika-berberin
http://localhost:3000/salon/lumiere-studio
http://localhost:3000/admin
http://localhost:3000/staff
http://localhost:3000/platform-admin
```

Uz lokalni root domain setup možeš koristiti i:

```text
http://mika-berberin.localhost:3000/
http://lumiere-studio.localhost:3000/
```

### 5. Obavezna provera

```cmd
rmdir /s /q .next
npm run lint
npm run build
npm run dev
```

Na macOS/Linux sistemima:

```bash
rm -rf .next
npm run lint
npm run build
npm run dev
```

## Environment promenljive

Ne commituj `.env.local`, service-role/secret ključeve, OAuth secrets, encryption keys ili cron secrets.

### Supabase — obavezno

| Promenljiva | Namena |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable ključ za browser/server session klijent |
| `SUPABASE_SECRET_KEY` | Server-only secret ključ za privilegovane operacije |

`SUPABASE_SECRET_KEY` nikada ne sme biti izložen kroz `NEXT_PUBLIC_*` promenljivu niti importovan u client komponentu.

### Platform i tenant hosting

| Promenljiva | Namena |
|---|---|
| `PLATFORM_ROOT_DOMAIN` | Root authority, npr. `localhost:3000` ili budući domen |
| `PLATFORM_ROOT_PROTOCOL` | `http` ili `https`; lokalno obično `http` |
| `PLATFORM_ADMIN_EMAILS` | Zarezom odvojena allowlista platform-admin email adresa |

Lokalni primer:

```env
PLATFORM_ROOT_DOMAIN=localhost:3000
PLATFORM_ROOT_PROTOCOL=http
PLATFORM_ADMIN_EMAILS=admin@example.com
```

### Rate limiting

| Promenljiva | Namena |
|---|---|
| `PUBLIC_RATE_LIMIT_SECRET` | Server-only salt/secret za hashovanje rate-limit identiteta |

Generisanje:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### Google Calendar

| Promenljiva | Namena |
|---|---|
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_OAUTH_REDIRECT_URI` | Callback URL platforme |
| `GOOGLE_TOKEN_ENCRYPTION_KEY` | Base64 ključ koji se dekodira u tačno 32 bajta |

Lokalni callback primer:

```env
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/admin/google-calendar/callback
```

Generisanje encryption ključa:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Promena `GOOGLE_TOKEN_ENCRYPTION_KEY` nakon čuvanja tokena čini postojeće šifrovane refresh tokene nečitljivim. Rotacija zahteva planiranu migraciju ili ponovno povezivanje kalendara.

### Email i Resend

| Promenljiva | Namena | Podrazumevano ponašanje |
|---|---|---|
| `EMAIL_DELIVERY_ENABLED` | Uključuje stvarno slanje emailova | `false` |
| `EMAIL_TEST_MODE` | Preusmerava poruke na test adresu | `false` |
| `EMAIL_TEST_RECIPIENT` | Primalac u test režimu | prazno |
| `EMAIL_DEPLOYMENT_MODE` | `platform` ili `standalone` | `platform` |
| `RESEND_API_KEY` | Resend API ključ | obavezan kada je delivery uključen |
| `RESEND_API_BASE_URL` | Resend API base URL | `https://api.resend.com` |
| `PLATFORM_EMAIL_FROM` | Platformska From adresa | Resend onboarding adresa u developmentu |
| `PLATFORM_EMAIL_REPLY_TO` | Platformska Reply-To adresa | prazno |
| `PLATFORM_BUSINESS_EMAIL_ADDRESS` | Default business sender adresa | Resend onboarding adresa u developmentu |
| `STANDALONE_EMAIL_FROM` | From za standalone deployment | obavezno u standalone režimu |
| `STANDALONE_EMAIL_REPLY_TO` | Reply-To za standalone deployment | prazno |
| `RESEND_WEBHOOK_SECRET` | Verifikacija Resend/Svix webhook potpisa | webhook je onemogućen bez secret-a |
| `RESEND_WEBHOOK_TOLERANCE_SECONDS` | Dozvoljeno odstupanje timestamp-a | 300 sekundi |

Bezbedan lokalni test primer:

```env
EMAIL_DELIVERY_ENABLED=true
EMAIL_TEST_MODE=true
EMAIL_TEST_RECIPIENT=your-test-address@example.com
EMAIL_DEPLOYMENT_MODE=platform
RESEND_API_KEY=
PLATFORM_EMAIL_FROM=Salon Platforma <onboarding@resend.dev>
PLATFORM_BUSINESS_EMAIL_ADDRESS=onboarding@resend.dev
RESEND_WEBHOOK_SECRET=
```

Resend webhook endpoint:

```text
/api/webhooks/resend
```

### Reminder cron

| Promenljiva | Namena | Podrazumevano ponašanje |
|---|---|---|
| `CRON_SECRET` | Bearer ili `x-cron-secret` zaštita reminder endpoint-a | endpoint vraća 503 bez secret-a |
| `REMINDER_CRON_BATCH_LIMIT` | Maksimalni broj stavki po pozivu | 250, dozvoljeno 1–1000 |

Endpoint:

```text
/api/cron/booking-reminders
```

Generisanje cron secret-a:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### Primer objedinjene `.env.local` konfiguracije

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

# Platform
PLATFORM_ROOT_DOMAIN=localhost:3000
PLATFORM_ROOT_PROTOCOL=http
PLATFORM_ADMIN_EMAILS=

# Security
PUBLIC_RATE_LIMIT_SECRET=

# Google Calendar
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/admin/google-calendar/callback
GOOGLE_TOKEN_ENCRYPTION_KEY=

# Email
EMAIL_DELIVERY_ENABLED=false
EMAIL_TEST_MODE=true
EMAIL_TEST_RECIPIENT=
EMAIL_DEPLOYMENT_MODE=platform
RESEND_API_KEY=
RESEND_API_BASE_URL=https://api.resend.com
PLATFORM_EMAIL_FROM=Salon Platforma <onboarding@resend.dev>
PLATFORM_EMAIL_REPLY_TO=
PLATFORM_BUSINESS_EMAIL_ADDRESS=onboarding@resend.dev
STANDALONE_EMAIL_FROM=
STANDALONE_EMAIL_REPLY_TO=
RESEND_WEBHOOK_SECRET=
RESEND_WEBHOOK_TOLERANCE_SECONDS=300

# Cron
CRON_SECRET=
REMINDER_CRON_BATCH_LIMIT=250
```

## Supabase i migracije

### Pravila

- migracije su izvor istine za database schema promene;
- primenjuju se numeričkim redosledom;
- postojeće primenjene migracije se ne prepravljaju bez odgovarajuće repair migracije;
- svaka tenant tabela mora imati jasan `business_id` model;
- RLS i server-side autorizacija nisu međusobna zamena — koriste se zajedno;
- service-role/secret klijent je dozvoljen samo u server-only kodu.

### Rate-limit migracije

- `022_add_public_rate_limiting.sql` uvodi distribuirane bucket-e i RPC;
- `023_fix_public_rate_limit_timestamp.sql` ispravlja timestamp handling i postojeći deployment.

### Storage

Supabase Storage se koristi za business logo, hero fotografije, galeriju i fotografije zaposlenih. Media mutacije moraju biti tenant-scoped i autorizovane.

## Google Calendar

Platforma podržava:

- salon calendar connection;
- staff/employee calendar connection;
- create, reschedule, cancel i reassignment sinhronizaciju;
- šifrovano čuvanje refresh tokena;
- tenant membership proveru pre OAuth povezivanja;
- best-effort sync koji ne poništava booking ako Google nije dostupan.

OAuth scope uključuje identitet/email i pristup Calendar events operacijama.

Za production deployment obavezno ažurirati:

- Authorized JavaScript origins;
- Authorized redirect URI;
- `GOOGLE_OAUTH_REDIRECT_URI` u produkcionom environment-u;
- Supabase auth redirect allowlist gde je primenljivo.

## Email i Resend

Email sistem podržava:

- customer booking request/confirmation;
- reschedule i cancellation poruke;
- business new-booking poruku;
- 24h i opcioni 2h reminder;
- test režim;
- delivery log;
- deduplikaciju i idempotency;
- retry neuspešnih poruka;
- Resend webhook statuse;
- zaštitu od out-of-order webhook događaja;
- platform, custom-domain i standalone sender resolution.

Email i Calendar integracije su namerno best-effort: uspešno sačuvan booking ostaje uspešan čak i kada spoljašnji provider privremeno nije dostupan.

## Tenant domeni

### Path fallback

Uvek dostupan oblik:

```text
/salon/<business-slug>
```

### Platformsko poddomen mapiranje

Kada je podešen `PLATFORM_ROOT_DOMAIN`:

```text
<business-slug>.<platform-root-domain>
```

se rewrite-uje na:

```text
/salon/<business-slug>
```

Primer:

```env
PLATFORM_ROOT_DOMAIN=localhost:3000
PLATFORM_ROOT_PROTOCOL=http
```

```text
http://mika-berberin.localhost:3000/
```

Rezervisani poddomeni uključuju `www`, `app`, `admin`, `staff`, `platform-admin`, `api`, `booking`, `mail`, `status`, `support`, `help`, `cdn`, `assets` i `static`.

Custom domains i `business_domains` management još nisu implementirani.

## Rate limiting

Distribuirani rate limiting koristi Supabase/Postgres, a ne memoriju pojedinačne serverless instance.

Zaštićeni tokovi uključuju:

- javno kreiranje rezervacije;
- availability upite;
- admin login;
- staff login.

Identiteti se hash-uju uz `PUBLIC_RATE_LIMIT_SECRET`; sirove IP adrese, email adrese i telefoni ne treba da se čuvaju u rate-limit tabeli.

Booking i login koriste fail-closed ponašanje: ako kritični rate-limit storage nije dostupan, zahtev se odbija umesto da zaštita bude tiho zaobiđena. Availability može koristiti blaže fallback ponašanje jer je read-only javni tok.

## Provera kvaliteta

### Lint i build

Pre svakog prihvatanja milestone-a:

```cmd
rmdir /s /q .next
npm run lint
npm run build
```

### Unit testovi

Test runner:

```text
Vitest 4
```

Komande:

```bash
npm test
npm run test:watch
```

Početni unit test scope pokriva hostname/tenant routing, template registry i javnu booking payload validaciju. Testovi ne koriste produkcionu bazu ili spoljašnje servise.

### GitHub Actions CI

Workflow:

```text
.github/workflows/ci.yml
```

Pokreće se na push za `backup/theme-core-barber-beta` i `main`, kao i na pull request događajima.

CI koristi build-only placeholder environment vrednosti, pokreće unit testove i nema pristup produkcionim Supabase, Google ili Resend nalozima.

Lokalna objedinjena provera:

```bash
npm run check
```

### Tenant isolation audit

Audit skripta:

```bash
node scripts/tenant-isolation-audit.mjs
```

Skripta proverava:

- javni katalog svakog tenant-a;
- javni title i tenant rute;
- robots i sitemap;
- cross-tenant availability pokušaje;
- membership i RLS ponašanje za konfigurisane test uloge.

QA kredencijali se čuvaju u lokalnom fajlu:

```text
.env.tenant-isolation.local
```

Taj fajl ne sme biti commitovan.

Shared owner nalog koji legitimno pripada više tenant-a nije cross-tenant curenje. Za dokaz zabrane potreban je makar jedan nalog koji pripada samo jednom tenant-u.

### Ručni smoke test

Najmanje proveriti:

1. javni Mika i Lumière tenant;
2. izbor usluge, zaposlenog, datuma i termina;
3. uspešan booking;
4. slot conflict;
5. owner login;
6. manager permissions;
7. staff login i sopstvene rezervacije;
8. temporary password change;
9. Google Calendar connect/sync;
10. test email i delivery status;
11. `/robots.txt` i `/sitemap.xml`;
12. `X-Robots-Tag` na privatnim rutama.

## Struktura projekta

```text
app/                         Next.js App Router stranice i route handlers
  admin/                     tenant owner/manager UI
  staff/                     ograničeni staff UI
  platform-admin/            centralna administracija
  salon/[businessSlug]/      javna tenant ruta
  api/                       javni i privatni API endpoint-i

components/                  UI komponente
  admin/                     tenant admin komponente
  booking/                   booking flow
  platform-admin/            platform-admin komponente
  templates/                 template renderer i template paketi

lib/                         business logika i integracije
  auth/                      role i session context
  google-calendar/           OAuth, tokeni i sync
  notifications/             email, reminderi i webhook obrada
  security/                  rate limiting i request zaštita
  seo/                       metadata, origin i indexing pravila
  supabase/                  browser, server i admin klijenti
  tenancy/                   hostname i tenant resolver

supabase/migrations/         SQL schema i repair migracije
scripts/                     lokalni audit i patch alati
docs/milestones/             tehničke beleške milestone paketa
public/                      statički asset-i
proxy.ts                     auth/tenant rewrite i response header zaštite
ROADMAP.md                   product i engineering roadmap
```

## Bezbednosni model

### Tenant isolation

- `business_id` je centralna granica podataka;
- RLS ograničava direktne authenticated upite;
- server actions i privatni API-ji proveravaju membership i role;
- foreign tenant UUID ne sme biti dovoljan za pristup ili mutaciju;
- javni API eksplicitno zahteva `businessSlug`;
- service/employee/slot moraju pripadati istom tenant-u;
- audit nije detektovao cross-tenant curenje u prihvaćenom test scenariju.

### Secrets

Nikada ne commitovati:

- `SUPABASE_SECRET_KEY`;
- `PUBLIC_RATE_LIMIT_SECRET`;
- `GOOGLE_OAUTH_CLIENT_SECRET`;
- `GOOGLE_TOKEN_ENCRYPTION_KEY`;
- `RESEND_API_KEY`;
- `RESEND_WEBHOOK_SECRET`;
- `CRON_SECRET`;
- test ili production lozinke.

### Logging

Ne logovati sirove:

- lozinke;
- auth tokene;
- service-role ključeve;
- Google refresh tokene;
- kompletne booking napomene;
- nepotrebne email/telefon vrednosti;
- rate-limit identitete pre hashovanja.

### Privatne stranice

Admin, staff, platform-admin, auth i API rute moraju ostati `noindex`, bez pojavljivanja u sitemap-u.

## Trenutna ograničenja

Sledeće stavke još nisu završene i ne treba ih predstavljati kao gotove:

- početni javni katalog se još optimizuje za SSR;
- nema automatizovanog test suite-a;
- nema GitHub Actions CI pipeline-a;
- nema centralnog error monitoring-a i audit log sistema;
- nema dokumentovane backup/restore procedure;
- platform-admin onboarding i command center nisu završeni;
- nema draft/published/suspended lifecycle-a;
- nema production domena i wildcard Vercel konfiguracije;
- nema custom domain onboarding-a;
- finalni brand nije izabran;
- nema billing/subscription sistema;
- customer self-service cancel/reschedule još nije uveden;
- tenant-specifični PWA manifest još nije kompletan;
- projekat još nije prošao production pilot acceptance.

## Sledeći koraci

Trenutni preporučeni redosled:

1. `PUBLIC-CATALOG-SSR-01`;
2. `TEMPLATE-BUNDLE-OPTIMIZATION-01`;
3. `CI-FOUNDATION-01`;
4. `TEST-FOUNDATION-01`;
5. publishing lifecycle;
6. minimalni platform-admin onboarding completion;
7. error resilience;
8. database performance audit;
9. monitoring i audit log;
10. backup/recovery;
11. privacy/legal dokumentacija;
12. finalni brand i platform landing;
13. production domains i environment;
14. pilot salon acceptance;
15. prvi production launch.

Detaljniji product i engineering plan nalazi se u [`ROADMAP.md`](./ROADMAP.md).

---

**Napomena:** ovaj repozitorijum je trenutno privatan razvojni projekat. Produkcione pristupne podatke, klijentske podatke i secrets ne unositi u dokumentaciju, issue-je, commit poruke ili javne logove.
