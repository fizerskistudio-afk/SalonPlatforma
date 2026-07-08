# Beauty & Wellness Platform — Product & Engineering Roadmap

**Ažurirano:** 8. jul 2026.  
**Repo:** `fizerskistudio-afk/SalonPlatforma`  
**Status:** aktivan razvoj; roadmap je izvor istine zajedno sa `main` granom.  
**Radni naziv platforme:** nije izabran.

---

## 1. Vizija

Gradimo multi-tenant platformu za beauty i wellness biznise:

- javni sajt svakog biznisa;
- online rezervacije;
- owner, manager i staff administracija;
- centralni platform-admin;
- usluge, zaposleni, raspored, odsustva i klijenti;
- Google Calendar;
- transakcioni emailovi i podsetnici;
- salonski poddomeni i kasnije custom domeni;
- više poslovnih vertikala i vizuelnih template sistema;
- hostovani SaaS i kasnije kontrolisani standalone export.

Platforma nije ograničena na frizerske salone. Planirane vertikale uključuju hair, barber, nails, lashes/brows, masaže, depilaciju, laser, solarijum i spa/wellness.

---

## 2. Način rada

### Product i arhitektura — korisnik + ChatGPT

- definišemo cilj, workflow, podatke, dozvole i edge case-ove;
- radimo reviziju postojećeg koda;
- delimo posao na male milestone pakete;
- svaki tehnički paket stiže kao ZIP spreman za raspakivanje u root;
- posle svakog paketa obavezni su brisanje `.next`, lint, build i ručni test.

### UI/UX — Qwen

Qwen koristimo samo kada postoji odobren funkcionalni brief.

Tok:

1. ChatGPT priprema precizan prompt i acceptance criteria.
2. Korisnik prosleđuje prompt Qwenu.
3. Zajedno pregledamo Qwen rezultat.
4. Po potrebi šaljemo ciljanu korekciju.
5. Tek odobrena verzija ulazi u kod i testiranje.

### Engineering cleanup — Codex

Codex ne uvodimo kao zamenu za product odluke niti kao generator dizajna.

Uvodimo ga kada:

- kritični tokovi budu funkcionalno stabilni;
- platform-admin i tenant routing budu završeni;
- postoje odobreni Qwen dizajni;
- želimo refactor, uklanjanje duplikata, testove, accessibility i završno pakovanje.

---

## 3. Stvarno završeno

### Foundation

- [x] Next.js App Router, TypeScript i Tailwind
- [x] Supabase baza, Auth i Storage
- [x] multi-tenant model po `business_id`
- [x] javni salonski profil i booking
- [x] validacija termina i zaštita od duplih rezervacija
- [x] lokalizacija booking toka
- [x] path tenant ruta `/salon/[businessSlug]`
- [x] template registry sa `hair-luxury` i `hair-editorial`
- [x] business preseti za hair salon i barbershop

### Tenant admin i staff

- [x] owner, manager i staff role
- [x] admin stranice za profil, radno vreme, zaposlene, usluge, galeriju i rezervacije
- [x] članovi i role management
- [x] ograničeni staff dashboard
- [x] staff pristup sopstvenim rezervacijama
- [x] time-off request i approval tok

### Integracije

- [x] Google Calendar salona
- [x] Google Calendar zaposlenog
- [x] create, reschedule, cancel i reassignment sinhronizacija
- [x] integracione greške ne blokiraju booking

### Email i podsetnici

- [x] customer i business transakcioni emailovi
- [x] platform, custom-domain i standalone sender resolver
- [x] delivery log, retry, deduplikacija i idempotency
- [x] 24h i opcioni 2h podsetnici
- [x] Resend webhook statusi i zaštita od out-of-order događaja

---

## 4. Nije završeno i ne sme se predstavljati kao završeno

### Platform-admin

Backend i pojedinačne management stranice postoje, ali proizvod nije kompletan.

Nedostaje:

- [ ] stvarni overview sa operativnim podacima i upozorenjima
- [ ] konzistentna globalna navigacija
- [ ] tenant command center informacijska arhitektura
- [ ] kompletan onboarding/provisioning workflow
- [ ] dodela prvog ownera postojećem ili novom salonu
- [ ] invite status, resend i transfer ownership
- [ ] templates/presets biblioteka kao pravi management modul
- [ ] integration health i platform settings
- [ ] ujednačen UI sistem, loading/empty/error states i responsive QA

### Public hosting

- [ ] glavni domen odvojen od demo salona
- [ ] tenant poddomeni
- [ ] `app` poddomen
- [ ] custom domeni
- [ ] published/draft status
- [ ] tenant-specifični SEO metadata i sitemap

### Engineering kvalitet

- [ ] automatizovani testovi kritičnih tokova
- [ ] GitHub Actions CI
- [ ] rate limiting i anti-abuse javnog bookinga
- [ ] kompletan env contract i README
- [ ] centralni monitoring i audit log
- [ ] backup/restore procedura

---

# 5. Aktivni milestone

# TENANT-DOMAINS-01 — Javni tenant poddomeni

## Cilj

Odvojiti platformu od pojedinačnog demo salona i omogućiti da svaki tenant koristi svoj platformski poddomen iz jednog Next.js deploymenta.

### Faza A — Routing foundation

- [x] root `/` više ne prikazuje Lumière — lokalno prihvaćeno
- [x] root prikazuje privremeni platform demo hub — lokalno prihvaćeno
- [x] hostname resolver
- [x] reserved subdomain lista
- [x] `<slug>.<platform-domain>` rewrite na `/salon/<slug>`
- [x] Supabase session cookies ostaju sačuvani pri rewrite-u
- [x] nepoznat tenant vraća 404
- [x] stare `/salon/[slug]` rute ostaju kao fallback
- [x] local test preko `*.localhost`
- [x] prikaz pravog poddomena u platform-admin javnom linku — paket pripremljen

### Faza B — Tenant access

- [x] platform-admin UI i backend za dodelu prvog ownera salonu — paket pripremljen
- [x] owner email/invite/account status prikaz — paket pripremljen
- [x] resend/activation link za ownera koji još nije prvi put ušao — paket pripremljen
- [x] aktivacija i deaktivacija owner pristupa — paket pripremljen
- [x] Mika dobija owner membership za `mika-berberin` — lokalno potvrđeno
- [ ] Mika vidi samo podatke svog salona
- [ ] Lumière owner vidi samo Lumière
- [ ] owner access lint/build i završni ručni acceptance test
- [x] invite aktivacija vezana za konkretan email i tenant
- [x] zaštita od promene lozinke pogrešnoj aktivnoj sesiji

### Faza C — Production domains

Radi se tek nakon izbora imena i domena.

- [ ] apex domen
- [ ] `www`
- [ ] `app`
- [ ] wildcard `*.<domain>`
- [ ] Vercel domain konfiguracija
- [ ] produkcioni smoke test

### Definition of Done

- glavni domen otvara platformu;
- Lumière i Mika rade na odvojenim poddomenima;
- nijedan hostname ne može da učita pogrešan tenant;
- Mikin owner nalog postoji i izolovan je na njegov business;
- direktna path ruta ostaje dostupna za preview i fallback.

---

## 6. Sledeći milestoneovi — redosled

### 2. PLATFORM-LANDING-01 — Demo/prodajni sajt platforme

Qwen milestone nakon završene Tenant Domains faze A.

- [ ] product brief
- [ ] Qwen desktop i mobile koncept
- [ ] review i korekcije
- [ ] implementacija odobrenog dizajna
- [ ] demo tenant kartice
- [ ] jasna prezentacija platforme
- [ ] privremeni neutralni branding dok se ne izabere ime

### 3. PLATFORM-ADMIN-COMPLETION-01

- [ ] audit svih postojećih platform-admin ekrana
- [ ] navigation i business command center
- [ ] overview sa stvarnim podacima
- [ ] onboarding i provisioning consolidation
- [ ] owner access management
- [ ] templates/presets workspace
- [ ] integration health
- [ ] Qwen dizajn ključnih ekrana
- [ ] funkcionalna integracija i QA

### 4. PLATFORM-DESIGN-SYSTEM-01

- [ ] admin design tokens
- [ ] layout primitives
- [ ] forms, tables, statusi i feedback states
- [ ] modal/drawer standardi
- [ ] mobile i accessibility pravila
- [ ] javni template config tipovi

### 5. VERTICAL-CORE-01

- [ ] proširen business vertical registry
- [ ] capabilities po vertikali
- [ ] typed template config
- [ ] section ordering i visibility
- [ ] service variants i addons
- [ ] resource model osnova
- [ ] onboarding izbor vertikale

### 6. BARBER-01

- [ ] završiti barber preset
- [ ] Qwen barber template/design variant
- [ ] Mika kao kompletan demo tenant
- [ ] booking/admin end-to-end QA

### 7. NAILS-BEAUTY-01

- [ ] nails, lashes i brows preseti
- [ ] varijante usluge i addons
- [ ] portfolio po zaposlenom
- [ ] Qwen odgovarajući javni template

### 8. WELLNESS-RESOURCES-01

- [ ] masaže i spa preset
- [ ] sobe, kreveti i oprema kao resursi
- [ ] buffer vreme
- [ ] intake/consent formulari
- [ ] paketi tretmana

### 9. EQUIPMENT-BOOKING-01

- [ ] depilacija i laser
- [ ] solarijum i booking uređaja/kabine
- [ ] paketi minuta/kredita
- [ ] servisno blokiranje opreme

### 10. PRODUCTION-HARDENING-01

- [ ] `.env.example` i environment matrica
- [ ] novi README
- [ ] CI lint/build/test
- [ ] rate limiting
- [ ] monitoring
- [ ] backup/restore
- [ ] security review
- [ ] Playwright kritični tokovi

### 11. BRAND-DEPLOY-01

- [ ] finalno ime
- [ ] pravna i domain provera
- [ ] registracija domena
- [ ] produkcioni Supabase
- [ ] produkcioni Resend domen/webhook
- [ ] cron
- [ ] wildcard domeni
- [ ] Google callback URL-ovi

### 12. HOSTING-BILLING-01

- [ ] planovi i entitlements
- [ ] trial i grace period
- [ ] subscription status
- [ ] ručna evidencija uplata u početnoj fazi
- [ ] kasnija payment provider integracija
- [ ] custom-domain onboarding

### 13. CUSTOMER-SELF-SERVICE-01

- [ ] siguran booking link
- [ ] customer cancel/reschedule request
- [ ] add-to-calendar
- [ ] consent i privacy evidencija
- [ ] customer istorija

### 14. STANDALONE-EXPORT-01

- [ ] export manifest
- [ ] generisani ZIP projekta
- [ ] odvojena env konfiguracija
- [ ] deployment i DNS uputstvo
- [ ] zaštita platform secrets
- [ ] maintenance i update strategija

---

## 7. Pravilo prioriteta

Ne otvaramo sledeći veliki milestone dok aktivni milestone nema:

1. implementiran kod;
2. obrisan `.next`;
3. čist lint;
4. uspešan build;
5. ručni acceptance test;
6. zabeležene greške i odluku da li je paket prihvaćen.

Dizajn ne ulazi u implementaciju dok Qwen rezultat nije pregledan i odobren. Codex ne ulazi u širok refactor dok kritična funkcionalnost nije stabilna.

---

## 8. Tehničke odluke

- jedan Next.js deployment služi platformu i hostovane tenant sajtove;
- Supabase ostaje baza, Auth i Storage;
- tenant izolacija ostaje zasnovana na `business_id` i RLS-u;
- platformski poddomen u prvoj fazi koristi `business.slug`;
- custom domeni kasnije dobijaju posebnu `business_domains` evidenciju;
- Google Calendar i email ostaju best-effort i ne blokiraju booking;
- hostovani i standalone modeli dele core logiku, ali imaju različit deployment i sender setup;
- klasičan PHP/WordPress hosting nije primarni runtime platforme.
