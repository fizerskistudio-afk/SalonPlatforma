# Ordum Studios

**Digitalna platforma za beauty i wellness biznise.**

Ordum spaja profesionalni tenant sajt, online zakazivanje, tim, administraciju i budući growth/discovery sloj u jednu multi-tenant platformu.

- Production: `https://ordumstudios.com`
- Repository: `fizerskistudio-afk/SalonPlatforma`
- Status: privatni production SaaS u kontrolisanom razvoju
- Production baseline: `main`
- Razvoj: kratke `milestone/*` grane sa obaveznim QA i ROADMAP closeout-om

> Repo je istorijski zadržao naziv `SalonPlatforma`, dok je tržišni i platformski identitet **Ordum Studios**.

## Brzi dokumentacioni ulazi

- [`docs/MANIFESTO.md`](docs/MANIFESTO.md) — ko smo, šta gradimo i koje principe čuvamo;
- [`docs/STATUS.md`](docs/STATUS.md) — šta danas stvarno postoji;
- [`ROADMAP.md`](ROADMAP.md) — aktivni milestone, sledeći redosled i blockeri;
- [`docs/DOCUMENTATION-INDEX.md`](docs/DOCUMENTATION-INDEX.md) — mapa architecture, milestone i history dokumentacije.

## Šta je Ordum

Ordum nije samo booking link i nije generički marketplace profil.

Svaki podržani biznis dobija sopstveni digitalni prostor sa svojim identitetom, sadržajem, uslugama, timom i booking tokom. Svi tenant-i dele isto bezbedno platformsko jezgro, ali zadržavaju odvojene podatke, korisnike, javni sajt i operativni kontekst.

Platforma je trenutno usmerena na beauty i wellness vertikale:

- hair i beauty salone;
- barbershop-ove;
- nail studije;
- lashes i brows;
- masaže i tretmane;
- depilaciju i laser;
- solarijume;
- spa i wellness studije.

Arhitektura nije vezana za jedan dizajn ili jednu vertikalu. Tenant podaci, booking domen i theme renderer-i ostaju odvojeni.

## Product model

Ordum odvaja tri različita pitanja:

1. **Technical package** — koje entitlement-e tenant tehnički ima.
2. **Commercial offer** — kako se vrednost trenutno prodaje i naplaćuje.
3. **Rollout status** — šta je `LIVE`, `BETA`, `COMING SOON` ili `RESEARCH`.

Postojanje tehničkog entitlement-a ne znači automatski da je funkcija spremna za javnu prodajnu garanciju.

Detaljan product contract je u:

- [`docs/product/ORDUM-PRODUCT-LADDER-01.md`](docs/product/ORDUM-PRODUCT-LADDER-01.md)
- [`lib/product-strategy/`](lib/product-strategy/)

## Ordum level mapa

| Level | Naziv | Trenutni status |
|---|---|---|
| 1 | Digitalni salon | Otključan |
| 2 | Growth Platform | Aktivan razvoj |
| 3 | Local Discovery | Zaključan |
| 4 | Salon Operations | Zaključan |
| 5 | Business OS | Zaključan |
| 6 | Regionalna i globalna mreža | Zaključan |

Level-i nisu marketinški rokovi. Svaki nivo se otključava tek kada prethodni ima stabilan tehnički i poslovni signal.

## Rollout status

### LIVE

- profesionalni tenant sajt;
- online booking;
- određeni ili bilo koji raspoloživi zaposleni;
- owner i manager administracija;
- ograničeni staff radni prostor;
- usluge, cene, tim i raspored;
- rezervacije i klijenti;
- galerija i kontrolisani reviews prikaz;
- osnovni tenant SEO;
- platformski onboarding i preview;
- email potvrde kroz production-verified managed setup.

### BETA / managed rollout

- Google Calendar salona;
- kalendari zaposlenih i busy availability;
- review management;
- AI nacrti odgovora na recenzije;
- managed custom domen;
- dodatni jezici;
- novi mobile admin shell.

Beta funkcije se uključuju kontrolisano i nisu automatska prodajna garancija.

### COMING SOON

- nova platformska landing stranica zasnovana na product registry-ju;
- blog i lokalni vodiči;
- canonical location i service taxonomy;
- lokalni discovery;
- prvi slobodan termin preko više eligible tenant-a;
- merljiv redirect u postojeći tenant booking;
- customer self-service cancel/reschedule;
- waitlist;
- SMS i Viber adapteri;
- Google Business Profile;
- napredna growth analitika.

### RESEARCH

- lager i potrošni materijal;
- nabavke i trebovanja;
- oprema i održavanje;
- fiskalizacija;
- knjigovodstvo i SEF;
- plaćanja i depoziti;
- loyalty i članarine;
- multi-location operacije.

Research funkcije nemaju javni rok i ne predstavljaju aktivno obećanje proizvoda.

## Glavne platformske površine

### Tenant platforma

- javni tenant sajt;
- katalog usluga;
- zaposleni i employee-service veze;
- booking settings;
- availability;
- rezervacije;
- klijenti;
- radno vreme i odsustva;
- galerija i reviews;
- tenant branding i theme izbor.

### Tenant administracija

- `owner` i `manager` pristup;
- grupisana Ordum Business OS navigacija;
- rezervacije i klijenti;
- usluge i tim;
- radno vreme;
- sadržaj i digitalno prisustvo;
- podešavanja i članovi;
- package/feature gating;
- review attention stanje.

### Staff workspace

- sopstvene rezervacije;
- dozvoljene booking napomene;
- sopstveni raspored;
- odsustva i slobodni dani;
- ograničen pristup bez tenant-admin privilegija.

### Platform administracija

- tenant lifecycle;
- starter pack provisioning;
- template i branding izbor;
- owner activation i access recovery;
- package i entitlement kontrola;
- platform role/capability model;
- kontrolisani AI-assisted content alati;
- preview pre objavljivanja.

### Growth platforma

Growth sloj se gradi iznad postojećeg tenant jezgra i ne pravi paralelni booking sistem.

Planirani tok:

```text
Ordum pretraga
    |
    +-- canonical grad
    +-- canonical usluga
    +-- datum
    |
    v
eligible tenant-i i mapirane usluge
    |
    v
najraniji raspoloživ termin
    |
    v
merljiv redirect
    |
    v
postojeći tenant booking
```

Arhitektonski contract je u:

- [`docs/architecture/PLATFORM-GROWTH-ARCHITECTURE-01.md`](docs/architecture/PLATFORM-GROWTH-ARCHITECTURE-01.md)
- [`lib/growth/`](lib/growth/)

## Arhitektura

```text
Browser / crawler
       |
       v
Next.js App Router + hostname resolver
       |
       +-- ordumstudios.com ------------> platform landing / growth sloj
       |
       +-- <tenant>.<root-domain> ------> tenant javni sajt
       |
       +-- /salon/<businessSlug> -------> path fallback / preview
       |
       +-- /admin -----------------------> owner / manager
       |
       +-- /staff -----------------------> zaposleni
       |
       +-- /platform-admin -------------> platform operacije
       |
       v
Server Components + Route Handlers + Server Actions
       |
       +-- Supabase Auth
       +-- PostgreSQL + RLS
       +-- Supabase Storage
       +-- server-only service role
       +-- Google Calendar adapteri
       +-- Resend email i webhooks
```

## Ključna arhitektonska pravila

1. Tenant kontekst se određuje iz validiranog hosta, slug-a ili autorizovanog membership-a.
2. Sve privatne operacije moraju biti vezane za autorizovani `business_id`.
3. Service-role i drugi tajni klijenti su server-only.
4. Tenant booking ostaje jedini booking engine.
5. Growth/discovery sloj pronalazi kandidata i vodi korisnika u postojeći tenant booking.
6. Google Calendar i email greške ne poništavaju uspešno sačuvanu rezervaciju.
7. Javni booking ponovo validira salon, uslugu, zaposlenog i termin na serveru.
8. Objavljen tenant nije automatski marketplace kandidat; discovery mora biti opt-in.
9. Customer PII se ne koristi kao growth attribution identitet.
10. Nepostojeće, privatne i preview površine ne smeju biti indeksirane.

## Tech stack

- **Next.js 16.2.9**
- **React 19.2.4**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Supabase**
  - PostgreSQL
  - Auth
  - Storage
  - Row Level Security
- **Google APIs**
  - OAuth
  - Calendar
- **Resend**
  - transakcioni email
  - delivery/webhook evidencija
- **Vitest 4**
- **ESLint 9**
- **Vercel-compatible deployment**

Aktuelne verzije i npm skripte su u [`package.json`](package.json).

## Javne i privatne rute

### Javne

| Ruta | Namena |
|---|---|
| `/` | Ordum platformska landing stranica |
| `/salon/[businessSlug]` | Javni tenant sajt i path fallback |
| `/api/catalog` | Javni tenant katalog |
| `/api/availability` | Tenant-scoped slobodni termini |
| `/api/bookings` | Kreiranje javne rezervacije |
| `/robots.txt` | Robots pravila |
| `/sitemap.xml` | Host-aware sitemap |

### Privatne

| Ruta | Namena |
|---|---|
| `/admin` | Owner i manager administracija |
| `/staff` | Staff workspace |
| `/platform-admin` | Centralna platform administracija |
| `/auth/*` | Auth callback i aktivacioni tokovi |
| `/api/admin/*` | Tenant-admin API |
| `/api/platform-admin/*` | Platform-admin API |

Privatne rute su zaštićene autentikacijom i isključene iz indeksiranja.

## Lokalno pokretanje

### Preduslovi

- Git;
- Node.js verzija kompatibilna sa trenutnim Next.js izdanjem;
- npm;
- pristup odgovarajućem Supabase projektu;
- potrebni provider kredencijali samo za integracije koje se testiraju.

### Instalacija

```bash
git clone <repository-url>
cd SalonPlatforma
npm ci
```

### Environment

Kreiraj `.env.local` u root direktorijumu.

Minimalni lokalni Supabase setup:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Ostale promenljive zavise od površine koja se testira:

- platform root host i tenant domeni;
- platform-admin bootstrap/membership;
- Google OAuth i Calendar;
- Resend i webhook verification;
- cron i internal secrets;
- encryption i signing ključevi;
- monitoring i provider feature flag-ovi.

Nikada ne commituj:

- `.env.local`;
- Supabase service-role/secret vrednosti;
- OAuth client secrets;
- encryption ključeve;
- webhook secrets;
- cron i internal API secrets.

### Development server

```bash
npm run dev
```

Osnovne lokalne adrese:

```text
http://localhost:3000/
http://localhost:3000/admin
http://localhost:3000/staff
http://localhost:3000/platform-admin
http://localhost:3000/salon/<businessSlug>
```

Kada je lokalni root-host setup aktivan, tenant može biti dostupan i preko:

```text
http://<businessSlug>.localhost:3000/
```

## Baza i migracije

SQL migracije se nalaze u:

```text
supabase/migrations/
```

Pravila:

1. Migracije se primenjuju isključivo redosledom numeričkih prefiksa.
2. Nova migracija mora imati jasan scope, verification query i rollback odluku.
3. Source postojanje ne znači da je migracija primenjena u production bazi.
4. DB stanje se proverava read-only upitima pre oslanjanja na novu kolonu, constraint ili RPC.
5. Tenant izolacija i RLS granice moraju ostati eksplicitne.
6. Service-role izvršavanje se koristi samo server-side.
7. Nijedan installer ne primenjuje migraciju bez eksplicitnog odobrenja.

## Quality gates

Glavne komande:

```bash
npm run lint
npm test
npm run build
npm run check
```

`npm run check` pokreće:

```text
ESLint
Vitest
production build
```

Za milestone se, zavisno od scope-a, dodaju:

- ciljani unit i contract testovi;
- TypeScript validation;
- `git diff --cached --check`;
- runtime smoke;
- Playwright desktop/mobile matrica;
- read-only DB verification;
- ručni browser acceptance;
- production health preflight.

## Development workflow

`main` je production baseline.

Rad se obavlja kroz kratke milestone grane:

```text
milestone/<naziv-milestone-a>
```

Obavezni tok:

1. proveri branch, HEAD i čist tracked state;
2. pročitaj `ROADMAP.md`;
3. primeni kontrolisani scope;
4. pokreni ciljane i pune provere;
5. uradi ručni acceptance kada milestone menja UI ili runtime;
6. ažuriraj `ROADMAP.md`;
7. ukloni installer artefakte;
8. pregledaj staged diff;
9. commituj i pushuj tek posle PASS-a;
10. integriši u `main` kontrolisanim fast-forward postupkom kada je odobreno.

Privremeni lokalni artefakti ne ulaze u commit:

```text
APPLY-*.cmd
CLEAN-ONLY-*.cmd
README-<MILESTONE>.txt
MANIFEST-*.json
scripts/apply-*.mjs
payload/
```

## Dokumentacija

### Operativni izvor istine

- [`ROADMAP.md`](ROADMAP.md)

ROADMAP sadrži trenutni checkpoint, završene i otvorene milestone-e, poznata ograničenja i sledeći konkretan korak.

### Product strategy

- [`docs/product/ORDUM-PRODUCT-LADDER-01.md`](docs/product/ORDUM-PRODUCT-LADDER-01.md)
- [`lib/product-strategy/`](lib/product-strategy/)

### Growth i discovery

- [`docs/architecture/PLATFORM-GROWTH-ARCHITECTURE-01.md`](docs/architecture/PLATFORM-GROWTH-ARCHITECTURE-01.md)
- [`lib/growth/`](lib/growth/)

### Milestone dokumenti

- [`docs/milestones/`](docs/milestones/)

### Dodatne arhitektonske oblasti

- tenant i hostname granice: [`lib/tenancy/`](lib/tenancy/)
- javni katalog: [`lib/catalog/`](lib/catalog/)
- booking: [`lib/booking/`](lib/booking/)
- product entitlements: [`lib/product-packages/`](lib/product-packages/)
- template registry: [`lib/templates/`](lib/templates/)
- auth: [`lib/auth/`](lib/auth/)
- monitoring: [`lib/monitoring/`](lib/monitoring/)
- security: [`lib/security/`](lib/security/)

## Trenutni razvojni pravac

Aktivni Level 2 pravac:

```text
Product truth
    ->
Growth architecture
    ->
Canonical location/service registry
    ->
Nova Ordum landing stranica
    ->
Blog i content foundation
    ->
Discovery data foundation
    ->
Svilajnac local discovery MVP
```

Precizan aktivni milestone i HEAD uvek proveri u [`ROADMAP.md`](ROADMAP.md), ne u ovom README-u.

## Security i privatnost

Ordum obrađuje poslovne i customer podatke, pa su bezbednosne granice deo product contract-a:

- tenant izolacija po `business_id`;
- RLS i server-side authorization;
- odvojeni platform-admin i tenant auth konteksti;
- rate limiting na javnim osetljivim tokovima;
- stroga request validacija;
- noindex za privatne i unknown-tenant površine;
- best-effort provider integracije bez rollback-a uspešnog booking-a;
- pseudonymous growth attribution bez customer PII;
- tajne vrednosti nikada ne ulaze u browser bundle ili Git istoriju.

Bezbednosna promena se ne smatra završenom bez testova i odgovarajućeg runtime ili DB verification-a.

## Repository status

Ovo je privatni komercijalni projekat u aktivnom razvoju.

Nije open-source biblioteka i nema dozvolu za neovlašćeno kopiranje, redistribuciju ili deployment.
