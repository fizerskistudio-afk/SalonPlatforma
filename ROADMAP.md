# Salon Platforma — Product & Engineering Roadmap

**Ažurirano:** 10. jul 2026.  
**Repo:** `fizerskistudio-afk/SalonPlatforma`  
**Aktivna grana:** `backup/theme-core-barber-beta`  
**Radni naziv:** `Salon Platforma`  
**Status:** funkcionalni multi-tenant core je završen; u toku su performance, automatizovani QA i production priprema.

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

## 5A. Aktivni milestone

# CI-FOUNDATION-01

### Implementirano u paketu

- [x] GitHub Actions workflow
- [x] Node.js 20 i npm cache
- [x] `npm ci`
- [x] lint job
- [x] production build job
- [x] concurrency cancellation
- [x] read-only repository permissions
- [x] build-only placeholder environment
- [x] lokalni `npm run check`
- [ ] prvi remote GitHub Actions run
- [ ] potvrđen zelen status na branch commit-u

### Acceptance criteria

- workflow se pokreće na aktivnoj grani, `main` i pull request događajima;
- nema production secrets;
- lint nema error;
- build prolazi;
- rezultat je vidljiv uz commit.

---

## 6. Sledeći milestone-ovi — realan redosled do prvog launch-a

### 1. CI-FOUNDATION-01 — aktivan

- [x] GitHub Actions workflow
- [x] `npm ci`
- [x] `npm run lint`
- [x] `npm run build`
- [x] lokalna `npm run check` komanda
- [ ] prvi branch/PR status check

### 2. TEST-FOUNDATION-01

- [ ] hostname i tenant resolver testovi
- [ ] booking payload validation testovi
- [ ] rate limiter testovi
- [ ] permission matrix owner/manager/staff
- [ ] cross-tenant API testovi
- [ ] booking konflikt testovi
- [ ] Playwright public booking smoke test
- [ ] admin/staff login smoke test

### 3. PUBLISHING-LIFECYCLE-01

- [ ] `draft`
- [ ] `published`
- [ ] `suspended`
- [ ] `archived`
- [ ] draft nije u sitemap-u
- [ ] preview za platform-admin
- [ ] suspendovan tenant ne prima nove rezervacije

### 4. PLATFORM-ADMIN-COMPLETION-01 — minimalni launch scope

- [ ] operativni overview
- [ ] konzistentna navigacija
- [ ] tenant command center
- [ ] objedinjeno kreiranje tenant-a
- [ ] izbor preseta i template-a
- [ ] prvi owner i credentials status
- [ ] publish/suspend kontrole
- [ ] integration health
- [ ] responsive i error/empty/loading QA

### 5. ERROR-RESILIENCE-01

- [ ] root error boundary
- [ ] tenant error boundary
- [ ] admin i staff error boundary
- [ ] smislen `not-found`
- [ ] standardizovan API error format
- [ ] production-safe poruke bez internog error detalja

### 6. DATABASE-PERFORMANCE-01

- [ ] audit stvarnih booking i availability query-ja
- [ ] `EXPLAIN ANALYZE`
- [ ] potrebni indeksi
- [ ] rate-limit bucket cleanup
- [ ] notification delivery retention
- [ ] constraint audit

### 7. MONITORING-AUDIT-01

- [ ] centralno server error praćenje
- [ ] booking failure signal
- [ ] calendar sync failure signal
- [ ] email delivery failure signal
- [ ] auth/rate-limit anomalije
- [ ] platform-admin audit log
- [ ] correlation/request ID
- [ ] bez PII u logovima

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
Remote baseline pre performance commita: 6c14bcc4f46af471a0e29aaf42ce210ea167c942
Poslednji završen milestone: TEMPLATE-BUNDLE-OPTIMIZATION-01
Aktivni milestone: CI-FOUNDATION-01
Lokalna potvrda: lint PASSED, build PASSED
Test režim: ubrzani smoke test po promenjenom toku; master regression kasnije
Prvi sledeći zadatak: commit/push performance izmena, primeniti CI paket i potvrditi prvi Actions run
Obavezno: posle svake izmene ažurirati ROADMAP.md
```
