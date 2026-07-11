# Salon Platforma — Product & Engineering Roadmap

**Ažurirano:** 10. jul 2026.  
**Repo:** `fizerskistudio-afk/SalonPlatforma`  
**Aktivna grana:** `backup/theme-core-barber-beta`  
**Radni naziv:** `Salon Platforma`  
**Status:** funkcionalni multi-tenant core je završen; aktivna je privremena DEMO-PRODUCTION-READY obilaznica pre nastavka originalnog production roadmapa.

> Ovaj dokument je operativni izvor istine za nastavak rada i handoff između chatova. Nezavršene stavke se ne predstavljaju kao završene.

---

## 1. Pravilo rada od 9. jula 2026.

Posle svake prihvaćene izmene ili hotfix-a obavezno ažuriramo ovaj dokument u istom commit-u ili neposredno sledećem docs commit-u.

Svaki upis mora da sadrži:

1. naziv milestone-a ili hotfix-a;
2. šta je promenjeno;
3. rezultat lint/build provere;
4. rezultat ručnog testa;
5. poznata ograničenja ili odluke;
6. sledeći konkretan korak.

ZIP instaleri, `APPLY-*.cmd`, root package README fajlovi i `scripts/apply-*.mjs` su privremeni lokalni artefakti. Posle uspešne primene se brišu i ne commituju.

Definition of Done za tehnički paket:

```text
1. kod primenjen
2. .next obrisan
3. npm run lint prošao
4. npm run build prošao
5. ručni acceptance test prošao
6. ROADMAP.md ažuriran
7. privremeni installer fajlovi obrisani
8. ciljani commit i push
```

### Ubrzani test režim do završnog master QA ciklusa

- lint i production build ostaju obavezni za svaki code milestone;
- ručno se proverava samo direktno promenjeni tok;
- tenant isolation audit ostaje obavezan za auth, tenancy, public API i database izmene;
- kompletan booking, admin, staff, Calendar, email i cross-tenant regression radi se u `MASTER-SYSTEM-QA-01`;
- odloženi testovi se evidentiraju, ne predstavljaju se kao već izvršeni.

---

## 2. Vizija proizvoda

Gradimo jednu multi-tenant platformu za beauty i wellness biznise koja obezbeđuje:

- javni tenant sajt;
- online rezervacije;
- owner, manager i staff administraciju;
- centralni platform-admin;
- usluge, zaposlene, radno vreme, odsustva i klijente;
- Google Calendar integraciju;
- transakcione emailove i podsetnike;
- platformske poddomene i kasnije custom domene;
- više vertikala i javnih template-a;
- hostovani SaaS, a kasnije kontrolisani standalone export.

Prve vertikale su hair i barber. Arhitektura je predviđena i za nails, lashes/brows, masaže, spa, depilaciju, laser i solarijum.

---

## 3. Trenutni tehnički baseline

### Foundation i multi-tenancy

- [x] Next.js 16 App Router, React 19, TypeScript i Tailwind CSS 4
- [x] Supabase Postgres, Auth i Storage
- [x] tenant model zasnovan na `business_id`
- [x] Row Level Security kao drugi sloj izolacije
- [x] path ruta `/salon/[businessSlug]`
- [x] hostname resolver i lokalni `*.localhost` tenant poddomeni
- [x] rezervisani platformski poddomeni
- [x] nepoznat tenant vraća 404
- [x] tenant isolation audit bez detektovanog cross-tenant curenja
- [x] legitimni multi-tenant owner nalog podržan i pravilno tretiran u auditu

### Booking

- [x] tenant-specifičan katalog, usluge, zaposleni i radno vreme
- [x] izbor usluge, zaposlenog, datuma i termina
- [x] opcija „bilo koji zaposleni“
- [x] validacija booking podataka
- [x] zaštita od duplog zauzimanja termina
- [x] create, reschedule, cancel, status i reassignment tokovi
- [x] Google Calendar i email rade kao best-effort procesi i ne poništavaju booking

### Auth i tenant pristup

- [x] owner, manager i staff uloge
- [x] tenant member i role management
- [x] direktno kreiranje member kredencijala
- [x] privremena lozinka i obavezna promena lozinke
- [x] owner/manager admin panel
- [x] ograničeni staff panel
- [x] staff pristup sopstvenim rezervacijama
- [x] time-off request i approval tok

### Integracije i notifikacije

- [x] Google Calendar salona
- [x] Google Calendar zaposlenog
- [x] transakcioni customer i business emailovi
- [x] delivery log, retry, deduplikacija i idempotency
- [x] 24h i opcioni 2h booking podsetnici
- [x] Resend webhook statusi
- [x] zaštita od out-of-order provider događaja

### Javni template i SEO sloj

- [x] template registry
- [x] `hair-luxury`
- [x] `hair-editorial`
- [x] `barber-heritage`
- [x] tenant metadata, canonical, Open Graph i Twitter metadata
- [x] host-aware sitemap
- [x] robots i `X-Robots-Tag` zaštita privatnih ruta
- [x] neutralni privremeni naziv `Salon Platforma`

### Security i dokumentacija

- [x] public booking rate limiting
- [x] public availability rate limiting
- [x] admin i staff login brute-force zaštita
- [x] hashovani rate-limit identiteti bez čuvanja raw IP/email/telefona
- [x] fail-closed login i booking kada limiter storage nije dostupan
- [x] fail-open availability kada limiter storage nije dostupan
- [x] SQL timestamp hotfix migration `023`
- [x] kompletan projektni `README.md`

---

## 4. Poslednji završeni milestone

# PUBLIC-CATALOG-SSR-01 — završen

### Implementirano

- [x] zajednički server-side catalog loader
- [x] javna tenant stranica dobija kompletan katalog pre rendera
- [x] metadata i page dele request-cache loader
- [x] početni `CatalogProvider` dobija `initialCatalog`
- [x] uklonjen početni client fetch ka `/api/catalog`
- [x] `reload()` ostaje client fallback
- [x] `/api/catalog` zahteva eksplicitan `businessSlug`
- [x] javni salon više ne prikazuje globalni „Salon Platforma“ loading splash
- [x] uklonjen hydration mismatch u review datumima
- [x] determinističko SSR/client formatiranje review datuma i ocene

### Prihvaćeno ponašanje

- početni HTML sadrži stvarne tenant podatke;
- nema početnog `/api/catalog` browser zahteva;
- tenant sadržaj se ne menja tokom hydration-a;
- cold server request može kratko čekati bez generičkog splash ekrana;
- API ostaje dostupan za eksplicitni reload i integracione provere.

### Poslednji potvrđeni commit pre ovog roadmap update-a

```text
556a85f10e38c774d3cbae7dc1f7d7474f438c6c
fix(ssr): stabilize localized review formatting
```

---

## 5. Poslednji završeni performance milestone

# TEMPLATE-BUNDLE-OPTIMIZATION-01 — završen u ubrzanom režimu

### Implementirano

- [x] svih šest template/viewport renderera podeljeno u dynamic chunk-ove
- [x] aktivni template zadržava SSR
- [x] booking modal i `BookingFlow` učitavaju se tek pri otvaranju
- [x] path i tenant poddomen koriste konzistentan početni viewport
- [x] trajni cross-origin view override uklonjen iz localStorage-a
- [x] React `static-components` lint error uklonjen
- [x] završni `npm run lint` prošao
- [x] završni `npm run build` prošao

### Poznati kvalitetni dug

- lint trenutno završava bez error-a, uz 24 postojeća warning-a;
- detaljno Network poređenje chunk-ova i kompletan public booking regression prebačeni su u završni master QA;
- direktni viewport i booking smoke test ostaju deo prvog narednog ručnog pregleda.

---

## 5A. CI i test foundation

# CI-FOUNDATION-01 — implementiran

- [x] GitHub Actions workflow
- [x] Node.js 20 i npm cache
- [x] `npm ci`
- [x] lint
- [x] production build
- [x] read-only permissions
- [x] placeholder build env
- [x] ispravljen concurrency expression
- [x] unit test korak dodat u workflow
- [ ] prvi potvrđen zeleni remote run

# TEST-FOUNDATION-01 — završen u ubrzanom režimu

### Implementirano u paketu

- [x] Vitest konfiguracija
- [x] hostname normalization testovi
- [x] root, tenant, reserved i external resolver testovi
- [x] tenant public URL testovi
- [x] template registry i fallback testovi
- [x] booking payload validator izdvojen iz route-a
- [x] validni booking payload normalization testovi
- [x] glavni booking payload error kodovi
- [x] `npm test`
- [x] `npm run test:watch`
- [x] `npm run check` = lint + test + build
- [x] lokalni unit test run
- [x] završni lint
- [x] završni build
- [x] booking validator smoke test
- [ ] prvi potvrđen zeleni CI run sa test korakom

### Odloženo za prošireni QA sloj

- rate limiter testovi;
- permission matrix;
- cross-tenant API testovi;
- booking conflict/database testovi;
- Playwright public booking;
- admin/staff login smoke test.

---

## 5B. Aktivna obilaznica — DEMO-PRODUCTION-READY-01

Originalni milestone redosled u nastavku ostaje važeći. Privremeno se pauzira pre `BACKUP-RECOVERY-01` kako bi se završio production-like demo koji može pouzdano da predstavi kompletan proizvod.

### Zaključani redosled obilaznice

1. `DEMO-I18N-01` — zajednički UI jezici i uklanjanje legacy translation slojeva;
2. `DEMO-THEME-ARCHITECTURE-01` — isti modularni desktop/mobile contract za svaku temu;
3. `DEMO-THEME-LUMIERE-01` — detaljan closeout referentne teme;
4. `DEMO-THEME-EDITORIAL-01` — modularizacija i završetak;
5. `DEMO-THEME-BARBER-01` — modularizacija, polish i izlazak iz beta statusa;
6. `DEMO-THEME-NAILS-01`;
7. `DEMO-THEME-WELLNESS-01`;
8. `DEMO-THEME-BEAUTY-01`;
9. `DEMO-DATA-LANDING-01`;
10. `DEMO-DEPLOY-QA-01`.

Detaljan scope i granica između demo readiness-a i pravog production launch-a nalaze se u `docs/milestones/DEMO-PRODUCTION-READY-01.md`.

### DEMO-I18N-01A — završen

- [x] `sr-Latn` dodat u formalni UI readiness contract;
- [x] tenant `LocalizedText` ostao kompatibilan sa legacy MK/SQ/EN sadržajem;
- [x] globalni readiness test uveden;
- [x] završni `npm run check`.

### DEMO-I18N-01B — CORE UI 7 završen

- [x] eksplicitni `UI_LOCALE_CODES`: SR, MK, HR, SQ, EN, DE i FR;
- [x] kompletan zajednički UI preveden na svih sedam jezika;
- [x] booking, navigation, empty state i accessibility globalni tekstovi pokriveni;
- [x] HR/DE/FR označeni kao `uiTranslationReady`;
- [x] readiness test zahteva svih sedam jezika za svaki globalni translation leaf;
- [x] source audit potvrđuje 105 translation leaf-ova po jeziku;
- [x] završni `npm run check`.

### DEMO-I18N-01C — sledeći

- [ ] Editorial template labele na svih sedam jezika;
- [ ] Barber template labele na svih sedam jezika;
- [ ] ukloniti duplicate template `translate()` helper funkcije;
- [ ] prebaciti teme na zajednički `t()` fallback;
- [ ] audit hardkodovanih javnih UI tekstova;
- [ ] kompletan jezički smoke kroz booking i sve tri postojeće teme.

---

## 6. Sledeći milestone-ovi — realan redosled do prvog launch-a

### 1. CI-FOUNDATION-01 — implementiran

- [x] GitHub Actions workflow
- [x] install, lint, unit test i build koraci
- [x] lokalna `npm run check` komanda
- [ ] potvrditi prvi zeleni remote run

### 2. TEST-FOUNDATION-01 — aktivan

- [x] hostname i tenant resolver unit testovi
- [x] template registry unit testovi
- [x] booking payload validation unit testovi
- [ ] rate limiter testovi — odloženo
- [ ] permission matrix owner/manager/staff — odloženo
- [ ] cross-tenant API testovi — odloženo
- [ ] booking konflikt testovi — odloženo
- [ ] Playwright public booking smoke test — master QA
- [ ] admin/staff login smoke test — master QA

### 3. PUBLISHING-LIFECYCLE-01 — implementiran u ubrzanom režimu

- [x] database status model
- [x] legacy backfill aktivnih tenant-a na `published`
- [x] novi tenant default `draft`
- [x] `draft`, `published`, `suspended`, `archived`
- [x] samo published tenant ulazi u public catalog
- [x] draft/suspended/archived nisu u sitemap-u
- [x] availability i booking zahtevaju published status
- [x] platform-admin status kontrole
- [x] autentifikovani platform-admin preview
- [x] preview booking je onemogućen
- [x] unit testovi status pravila
- [ ] live verifikacija migration `024` — odloženo u MASTER-SYSTEM-QA-01
- [x] završni `npm run check`
- [ ] osnovni lifecycle smoke test — odloženo u MASTER-SYSTEM-QA-01

### 4. PLATFORM-ADMIN-COMPLETION-01 — završen u ubrzanom režimu

- [x] stvarni operativni overview iz baze
- [x] lifecycle i upcoming booking brojači
- [x] attention queue
- [x] globalni configuration health
- [x] konzistentna sidebar navigacija
- [x] tenant command center readiness
- [x] povezivanje postojećeg onboarding wizard-a
- [x] preset i template onboarding ostaju objedinjeni
- [x] owner pristup uključen u readiness
- [x] publish/suspend kontrole povezane sa command centrom
- [x] partial query error stanje
- [x] empty dashboard stanje
- [x] unit testovi readiness logike
- [x] završni `npm run check`
- [x] osnovni dashboard/tenant smoke test preko lokalnog servera (`/platform-admin` i `/platform-admin/businesses/mika-berberin`)
- [x] commit `2cbec52789468353b60a35998aa35c072b3087a3`
- [x] push na `origin/backup/theme-core-barber-beta`
- [ ] GitHub Actions `Lint, test and build` run nije potvrđen za ovaj commit
- [ ] puni responsive i error/loading regression — MASTER-SYSTEM-QA-01

### 5. ERROR-RESILIENCE-01 — završen u ubrzanom režimu

#### ERROR-RESILIENCE-01A — završen u ubrzanom režimu

- [x] root i global error boundary
- [x] tenant error boundary
- [x] admin, staff i platform-admin error boundary
- [x] globalni i tenant-safe `not-found`
- [x] zajednički API error helper i unit testovi
- [x] availability endpoint koristi stabilan `{ ok, message, code }` format
- [x] availability 500 odgovori ne vraćaju interne Supabase/RPC/exception detalje
- [x] završni `npm run check` — PASSED lokalno
- [x] availability API smoke: validation, invalid slug i unknown tenant — PASSED
- [ ] vizuelni globalni/tenant 404 i puni error-state regression — `MASTER-SYSTEM-QA-01`

#### ERROR-RESILIENCE-01B — završen u ubrzanom režimu

- [x] zajednički `jsonResponse` dodat u `lib/api/http.ts`
- [x] booking i catalog error helper migracija
- [x] admin member-credentials helper konsolidacija
- [x] platform-admin credentials i business API helper konsolidacija
- [x] source-level audit ciljnih ruta bez lokalnih duplicate implementacija
- [x] završni `npm run check` — PASSED lokalno
- [x] commit i push — `e50b7de48acf8c7e50acda424c57a43c01732561`
- [ ] ciljani booking/catalog/platform-admin runtime smoke nije zasebno zabeležen — `MASTER-SYSTEM-QA-01`

### 6. DATABASE-PERFORMANCE-01 — završen bez migracije

- [x] read-only audit pokrenut nad ciljnom Supabase bazom
- [x] availability plan: 18 termina / 37.182 ms
- [x] booking i availability runtime proseci u prihvatljivom opsegu
- [x] booking GiST overlap indeks i exclusion constraint potvrđeni
- [x] rate-limit tabela: 8 redova / 56 kB
- [x] nema opravdanja za novi indeks, cleanup ili RPC rewrite
- [x] `time_off` range GiST ostaje future watch item
- [x] `DATABASE-PERFORMANCE-01B` migracija trenutno nije potrebna

### 7. MONITORING-AUDIT-01 — završen u ubrzanom režimu

#### MONITORING-AUDIT-01A

- [x] centralni PII-safe monitoring core
- [x] booking, availability i rate-limit strukturisani signali
- [x] correlation/request ID u javnim API odgovorima
- [x] unit testovi redakcije, request ID-a i error fingerprint-a
- [x] završni `npm run check`
- [x] booking/availability response-header smoke
- [x] commit i push — `836ab078edfe5a5b31b18d5e832b626080e2ae70`

#### MONITORING-AUDIT-01B closeout

- [x] duboki salon i employee Google Calendar signali
- [x] notification delivery, booking handler i retry signali
- [x] Resend webhook correlation i processing signali
- [x] reminder cron, scan, context i retry signali
- [x] admin/staff auth i login rate-limit anomalije
- [x] ciljni moduli bez direktnog raw `console.error` / `console.warn`
- [x] završni `npm run check` pokrenut tokom primene
- [ ] puni realni provider/cron/auth regression — `MASTER-SYSTEM-QA-01`

#### Production observability backlog — nije blocker ovog audita

- [ ] spoljni provider i alert routing — `PRODUCTION-DOMAINS-ENV-01`
- [ ] immutable platform-admin audit log — production security backlog
- [ ] retention i formalni SLO pragovi — `PRIVACY-LEGAL-01` / pilot

### 8. BACKUP-RECOVERY-01

- [ ] Supabase backup plan
- [ ] database restore procedura
- [ ] storage restore procedura
- [ ] secrets recovery procedura
- [ ] tenant deletion recovery plan
- [ ] probni restore

### 9. PRIVACY-LEGAL-01

- [ ] politika privatnosti
- [ ] uslovi korišćenja
- [ ] retention politika
- [ ] zahtev za ispravku/brisanje podataka
- [ ] cookie politika kada analytics bude uveden
- [ ] controller/processor odgovornosti

### 10. BRAND-FOUNDATION-01

- [ ] finalno ime
- [ ] pravna i domain provera
- [ ] domen
- [ ] logo i favicon
- [ ] tipografija i boje
- [ ] platform email branding

### 11. PLATFORM-LANDING-01

- [ ] product brief
- [ ] Qwen desktop/mobile koncept
- [ ] implementacija odobrenog dizajna
- [ ] demo tenant kartice
- [ ] benefit i feature sekcije
- [ ] FAQ i CTA
- [ ] landing SEO sadržaj

### 12. PRODUCTION-DOMAINS-ENV-01

- [ ] apex i `www`
- [ ] `app`
- [ ] wildcard tenant domeni
- [ ] Vercel konfiguracija
- [ ] production Supabase odluka/setup
- [ ] production Resend domen, SPF, DKIM i DMARC
- [ ] Google OAuth callback URL-ovi
- [ ] cron secret i schedule
- [ ] production rate-limit secret
- [ ] preview/production env separation

### 13. PILOT-ACCEPTANCE-01

- [ ] jedan pravi pilot salon
- [ ] realni podaci, zaposleni, usluge i slike
- [ ] owner i staff nalog
- [ ] pravi Google Calendar
- [ ] pravi emailovi
- [ ] desktop/mobile booking
- [ ] nedelja realnog korišćenja
- [ ] lista produkcionih problema i konačan launch gate

---

## 7. Posle prvog launch-a

- [ ] customer cancel/reschedule link
- [ ] add-to-calendar za klijenta
- [ ] customer istorija
- [ ] billing, planovi, entitlements, trial i grace period
- [ ] custom domain onboarding
- [ ] tenant-specifični PWA
- [ ] privacy-safe analytics i booking funnel
- [ ] napredni typed theme config
- [ ] section ordering i visibility
- [ ] nove beauty/wellness vertikale
- [ ] resource booking za sobe, krevete, kabine i uređaje
- [ ] standalone export

---

## 8. Poznate tehničke odluke i ograničenja

- Jedan Next.js deployment služi platformu i hostovane tenant sajtove.
- Supabase ostaje baza, Auth i Storage.
- Tenant izolacija ostaje zasnovana na `business_id`, autorizacionom kontekstu i RLS-u.
- Jedan korisnik može legitimno pripadati više tenant-a.
- Service/secret Supabase klijent je server-only.
- Google Calendar i email su best-effort i ne blokiraju uspešno sačuvan booking.
- Javni booking i login koriste distribuirani Postgres rate limiter.
- Migration `023_fix_public_rate_limit_timestamp.sql` je obavezna za baze koje su ranije primenile prvobitni `022`.
- `/api/catalog` više nema default tenant fallback i zahteva `businessSlug`.
- Review datumi na javnom sajtu koriste determinističko formatiranje umesto runtime `Intl` rezultata.
- Globalni `app/loading.tsx` ostaje za platform/private rute; `app/salon/loading.tsx` sprečava platformski splash na tenant ruti.
- View override je session-only; path i tenant poddomen ne dele localStorage, pa trajna preferencija nije deo javnog runtime ugovora.
- Public salon SSR dobija početni viewport hint iz request headera da bi hydration krenuo sa istim rendererom.
- Finalni tržišni brend još nije usvojen; `ORDO` je kandidat, ne finalna odluka.
- Klasičan PHP/WordPress hosting nije primarni runtime platforme.

---

## 9. Workspace pravila

### Trajno ostaje

```text
README.md
ROADMAP.md
docs/
supabase/migrations/
scripts/tenant-isolation-audit.mjs
app/
components/
lib/
public/
```

### Briše se posle primene paketa

```text
APPLY-*.cmd
*_README.txt
root milestone ZIP fajlovi
root privremeni PUBLIC-*/TENANT-*/PROJECT-* milestone dokumenti
scripts/apply-*.mjs
```

### Ne briše se

```text
.env.local
.env.tenant-isolation.local
scripts/tenant-isolation-audit.mjs
supabase/migrations/022_add_public_rate_limiting.sql
supabase/migrations/023_fix_public_rate_limit_timestamp.sql
docs/milestones/
docs/env/
```

Environment fajlovi ostaju lokalni i ignorisani kroz `.gitignore`.

---

## 10. Handoff za sledeći chat

```text
Repo: fizerskistudio-afk/SalonPlatforma
Grana: backup/theme-core-barber-beta
Poslednji potvrđeni remote commit pre CORE UI 7 paketa: f08a2fc29ec3f9e3955e05eec64c0fe166670601
Poslednji završen milestone: DEMO-I18N-01A
Aktivni milestone: DEMO-I18N-01C
Obilaznica: DEMO-PRODUCTION-READY-01, bez brisanja originalnog roadmapa
Implementirano u paketu: zajednički sistemski UI na SR/MK/HR/SQ/EN/DE/FR
Prvi sledeći zadatak: template-specifične Editorial i Barber labele i zajednički t() helper
Povratak na originalni roadmap: posle DEMO-DEPLOY-QA-01, od BACKUP-RECOVERY-01
```
