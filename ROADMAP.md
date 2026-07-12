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
3. `DEMO-REVIEWS-FOUNDATION-01` — shared platform, Google, testimonial i preview review sistem;
4. `DEMO-THEME-LUMIERE-01` — detaljan closeout referentne teme;
5. `DEMO-THEME-EDITORIAL-01` — modularizacija i završetak;
6. `DEMO-THEME-BARBER-01` — modularizacija, polish i izlazak iz beta statusa;
7. `DEMO-THEME-NAILS-01`;
8. `DEMO-THEME-WELLNESS-01`;
9. `DEMO-THEME-BEAUTY-01`;
10. `STUDIOBIBI-PILOT-01` — prvi realni hair-salon tenant na zajedničkoj infrastrukturi;
11. `DEMO-DATA-LANDING-01`;
12. `DEMO-DEPLOY-QA-01`.

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

### DEMO-I18N-01C — TEMPLATE I18N 7 završen

- [x] 14 Editorial template labela na SR/MK/HR/SQ/EN/DE/FR;
- [x] 26 Barber template labela na SR/MK/HR/SQ/EN/DE/FR;
- [x] uklonjena oba duplicate template `translate()` helpera;
- [x] Editorial i Barber desktop/mobile rendereri koriste centralni `t()`;
- [x] util funkcije za cenu, kategoriju i lokaciju koriste centralni fallback;
- [x] dodat template translation readiness test;
- [x] source audit potvrđuje 40 labela × 7 jezika i odsustvo lokalnog helpera;
- [x] završni `npm run check`.

### DEMO-I18N-01D — RUNTIME LANGUAGE SMOKE završen

- [x] svih 105 globalnih UI leaf-ova runtime provereno na sedam jezika;
- [x] booking i customer translation contract runtime provereni;
- [x] Lumière desktop/mobile wrapper source contract provereni;
- [x] Editorial desktop/mobile label i centralni `t()` contract provereni;
- [x] Barber desktop/mobile label i centralni `t()` contract provereni;
- [x] language switcher filtrira samo UI-ready tenant jezike;
- [x] stabilan SR/MK/HR/SQ/EN/DE/FR redosled i compact select prag provereni;
- [x] fallback redosled i current-locale fallback provereni;
- [x] preostali Barber logo/gallery hardkodovani accessibility fallback uklonjen;
- [x] automatizovani source audit i završni `npm run check`.

### DEMO-THEME-ARCHITECTURE-01A — CONTRACT završen

- [x] dokumentovan zajednički desktop/mobile file i renderer contract;
- [x] formalizovan architecture status u template registry-ju;
- [x] Lumière označen kao referentna modularna arhitektura;
- [x] Editorial i Barber iskreno označeni kao desktop/mobile monoliti;
- [x] definisana zajednička acceptance matrica;
- [x] zaključan shared booking, i18n i tenant boundary;
- [x] dodat architecture unit test;
- [x] StudioBiBi planiran kao clean tenant launch posle svih tema;
- [x] završni `npm run check`.

### DEMO-REVIEWS-FOUNDATION-01A — DOMAIN CONTRACT završen

- [x] zaključani izvori: platform, Google, manual testimonial i demo;
- [x] zaključani moderation statusi;
- [x] direktan platform review dozvoljen bez booking veze;
- [x] verified-visit dozvoljen samo za platform review sa booking vezom;
- [x] Google ostaje externally managed provider;
- [x] manual testimonial ima poseban trust badge;
- [x] generisani demo review ograničen na preview;
- [x] source capability i invariant unit testovi;
- [x] detaljan contract i milestone dokument;
- [x] završni `npm run check`.

### DEMO-REVIEWS-FOUNDATION-01B — MIGRATION SOURCE spreman

- [x] potvrđen postojeći booking lifecycle i `completed` status;
- [x] potvrđen postojeći `business_members` owner/manager model;
- [x] dodat `review_settings` tenant model;
- [x] dodat multi-source `reviews` model;
- [x] dodat hash-only booking review invitation model;
- [x] dodat Google provider metadata model bez OAuth tajni;
- [x] dodati same-business i completed-booking triggeri;
- [x] zaključani RLS, public published-only read i owner/manager read;
- [x] dodati indeksi i uniqueness pravila;
- [x] dodat migration contract test;
- [x] dodat read-only database verification SQL;
- [x] migration source: `supabase/migrations/025_reviews_foundation.sql`;
- [x] završni `npm run check`.

### DEMO-REVIEWS-FOUNDATION-01B — završen

- [x] commitovan i pushovan migration source — `3b46863dbf51ac598fd8727970553a407ed9dc08`;
- [x] primeniti migraciju 025 na ciljnu Supabase bazu preko Supabase CLI-ja;
- [x] pokrenut `supabase/verification/verify_reviews_foundation.sql`;
- [x] database verification vratila `PASS` i tenant settings backfill je potvrđen;
- [x] database i Git closeout završeni;

### DEMO-REVIEWS-FOUNDATION-01C — aktivan

#### DEMO-REVIEWS-FOUNDATION-01C-A — SECURE SUBMISSION CORE source spreman

- [x] direct i verified request validacija;
- [x] sedam dozvoljenih review language kodova;
- [x] hash-only bearer token obrada;
- [x] direct public review API ruta;
- [x] verified invitation context i submission API ruta;
- [x] server-only SECURITY DEFINER RPC granica;
- [x] atomic invitation row lock i single-use consume;
- [x] request body, honeypot i dual rate-limit granica;
- [x] PII-safe monitoring i request ID;
- [x] unit i source-contract testovi;
- [x] migration source: `supabase/migrations/026_reviews_public_submission.sql`;
- [x] read-only database verification source;
- [x] završni `npm run check`.
- [x] migracija 026 primenjena i database verification vratila `PASS`;
- [x] Git checkpoint, commit i push — `0cc67e58a766d73c281ea6f078fd32f435684c7c`.

#### DEMO-REVIEWS-FOUNDATION-01C-B — INVITATION ISSUANCE source spreman

- [x] 256-bitni random base64url bearer token;
- [x] hash-only invitation persistence;
- [x] completed-booking database trigger;
- [x] odloženi outbox job preko `invitation_delay_hours`;
- [x] concurrent-safe claim sa `FOR UPDATE SKIP LOCKED`;
- [x] stale processing recovery i maksimalno pet pokušaja;
- [x] retry sa potpuno novim tokenom i exponential backoff-om;
- [x] shared Resend delivery, dedupe i audit integracija;
- [x] sedmojezični review invitation email;
- [x] zaštićena cron ruta preko postojećeg `CRON_SECRET`;
- [x] migration source: `supabase/migrations/027_review_invitation_delivery.sql`;
- [x] read-only database verification source;
- [x] unit i source-contract testovi;
- [x] završni `npm run check`;
- [x] migracija 027 primenjena i database verification vratila `PASS`;
- [x] Git checkpoint, commit i push — `6512ffa959578bd73e6576c0bb1bd08cc2a45f6c`;
- [ ] aktivirati production cron tek posle deploy/browser smoke potvrde 01C-C forme.

#### DEMO-REVIEWS-FOUNDATION-01C-C — PUBLIC UX source spreman

- [x] direct review ruta `/reviews/[businessSlug]`;
- [x] verified review ruta `/reviews/invitation/[token]`;
- [x] server-side tenant i invitation context provera;
- [x] raw invitation bearer se hashira pre database RPC-a;
- [x] zajednička responsive review forma;
- [x] accessible 1–5 star radio kontrola;
- [x] honeypot, required i 2.000-character granice;
- [x] sedam UI jezika preko centralnog locale registry-ja i `t()`;
- [x] lokalizovana validation, rate-limit, unavailable i conflict stanja;
- [x] pending i published success stanja;
- [x] noindex/nofollow/noarchive privacy granica;
- [x] loading, unavailable i submit state coverage;
- [x] unit i source-contract testovi;
- [x] završni `npm run check`;
- [ ] direct i verified browser smoke na deployovanom hostu;
- [x] Git checkpoint, commit i push — `715a00f296b57343c7e1fbc2fbd6d2bbff289f05`;
- [ ] production cron aktivacija tek posle deploy/browser smoke potvrde.

### DEMO-REVIEWS-FOUNDATION-01D — ADMIN MODERATION source spreman

- [x] moderation audit tabela bez kopiranja customer review teksta;
- [x] owner/manager permission provera u SECURITY DEFINER RPC sloju;
- [x] row-lock status moderation;
- [x] pending/published/rejected/flagged/archived transition matrica;
- [x] obavezan razlog za reject/flag/archive;
- [x] zabrana direktnog published → rejected prelaza;
- [x] platform owner reply set/remove;
- [x] Google reply ostaje provider-managed;
- [x] originalni author/rating/body nisu deo admin mutation operacija;
- [x] admin moderation queue i status filteri;
- [x] source i verified-visit trust badge prikaz;
- [x] latest moderation reason i booking/service/employee kontekst;
- [x] sidebar attention badge za pending + flagged;
- [x] responsive loading i empty states;
- [x] migration source: `supabase/migrations/028_review_moderation.sql`;
- [x] read-only database verification source;
- [x] unit i source-contract testovi;
- [x] završni `npm run check`;
- [x] migracija 028 primenjena i database verification vratila `PASS`;
- [x] moderation browser smoke prošao;
- [x] Git checkpoint, commit i push — `41f42c93937a836b808c0ad32e8836cf4f7e2f06`.

### REVIEW-INVITATION-LAUNCH-01 — pre-launch aktivacija

Postojeći invitation sistem se ne razvija ponovo. Preostaje production aktivacija nakon deploy smoke potvrde.

- [x] completed booking trigger i invitation outbox source;
- [x] Resend review invitation template i delivery pipeline;
- [x] single-use hash-only token forma i submission tok;
- [ ] deployovan direct i verified review form smoke;
- [ ] aktivirati production review-invitations cron;
- [ ] end-to-end smoke: completed booking → outbox → Resend email → token forma → review submit → moderation;
- [ ] potvrditi delivery log, deduplikaciju i retry ponašanje.

### DEMO-REVIEWS-FOUNDATION-01F-A — CATALOG REVIEW CONTRACT source spreman

- [x] backward-compatible CatalogReview contract;
- [x] review summary i 1–5 distribution contract;
- [x] review settings i Google URL catalog config;
- [x] public loader query zahteva status=published;
- [x] pure mapper ponovo zahteva published status;
- [x] public katalog isključuje demo sadržaj;
- [x] platform preview demo zahteva allow_demo_content;
- [x] testimonials i Google source settings se poštuju;
- [x] owner reply izlazi samo za platform reviews;
- [x] unrated testimonials ne ulaze u rating prosek;
- [x] realni public loader uvek popunjava review contract;
- [x] legacy statički Review tip ostaje samo do 01F-C migracije tema;
- [x] unit i source-contract testovi;
- [x] završni `npm run check`;
- [x] Git checkpoint, commit i push — `0e554a7405fd1e801fba9a40a22f10cbd6c7bdc3`.

### DEMO-REVIEWS-FOUNDATION-01F-B — SHARED REVIEW PRESENTATION source spreman

- [x] shared fractional ReviewStars;
- [x] shared source i verified-visit trust badge;
- [x] shared responsive ReviewCard;
- [x] originalni customer tekst bez prevođenja ili prepisivanja;
- [x] platform owner reply u odvojenom salon-response bloku;
- [x] bezbedan Google external attribution link;
- [x] locale-aware rating i UTC-stable date formatting;
- [x] shared rating average i 1–5 distribution;
- [x] unrated testimonial prikaz bez lažnih zvezdica;
- [x] localized empty state;
- [x] direct platform i official Google review CTA;
- [x] preview mode ne aktivira review CTA;
- [x] dvadeset review translation leaf-ova na sedam UI jezika;
- [x] brand-token responsive shared section;
- [x] helper unit i source-contract testovi;
- [x] završni `npm run check`;
- [x] Git checkpoint, commit i push — `4d056cc642f1f969ea83c8e5145dcf3a5f2ca21c`.

### DEMO-REVIEWS-FOUNDATION-01F-C — THEME INTEGRATION source spreman

- [x] CatalogReviewsSection theme adapter;
- [x] previewMode prosleđen kroz PublicTemplateProps;
- [x] Lumière desktop real catalog reviews;
- [x] Lumière mobile review parity;
- [x] Editorial desktop/mobile real catalog reviews;
- [x] Editorial desktop reviews navigation anchor;
- [x] Barber desktop/mobile real catalog reviews;
- [x] Barber desktop reviews navigation anchor;
- [x] uklonjen legacy static contentData;
- [x] uklonjen legacy desktop ReviewsSection;
- [x] uklonjen legacy Review tip;
- [x] CatalogData review polja postala obavezna;
- [x] theme-integration source contract;
- [x] završni `npm run check`;
- [ ] Git checkpoint, commit i push.

### DEMO-THEME-LUMIERE-01 — spreman za closeout

- [ ] potvrditi desktop kompoziciju i sekcije;
- [ ] potvrditi mobile app-shell kompoziciju i navigaciju;
- [x] povezati shared reviews catalog i mobile parity;
- [ ] proveriti booking entry point-e i state coverage;
- [ ] izvršiti sedmojezični vizuelni i responsive closeout;
- [ ] zaključati Lumière kao acceptance baseline za naredne teme.

---

### POST-LAUNCH-ADMIN-I18N-01 — odloženo

Aktivirati tek nakon stabilnog StudioBiBi launch-a i prodaje prva 2–3 sajta, kada prihod može da finansira dalju infrastrukturu.

- [ ] oznaka „nedostaje prevod“ po polju i jeziku;
- [ ] progress kompletnosti po jeziku;
- [ ] „kopiraj iz podrazumevanog jezika“;
- [ ] pregled stvarne fallback vrednosti pre objave;
- [ ] AI predlog prevoda isključivo uz ručnu potvrdu;
- [ ] nije blocker za inicijalni launch, StudioBiBi pilot ili prve komercijalne sajtove.

### POST-LAUNCH-GOOGLE-REVIEWS-01 — odloženo

- [ ] inicijalni launch koristi ručno podešen zvanični Google review URL/QR CTA;
- [ ] Places API read-only rating/count razmotriti u prvom update-u;
- [ ] puni Business Profile OAuth sync i replies tek posle prvih prihoda;
- [ ] bez review gating-a, podsticaja ili lažnih recenzija.

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
Poslednji potvrđeni remote commit pre REVIEWS 01B CLOSEOUT-a: 3b46863dbf51ac598fd8727970553a407ed9dc08
Poslednji završen milestone: DEMO-REVIEWS-FOUNDATION-01B
Aktivni milestone: DEMO-REVIEWS-FOUNDATION-01C PUBLIC SUBMISSION
Obilaznica: DEMO-PRODUCTION-READY-01, bez brisanja originalnog roadmapa
Implementirano u paketu: review settings, reviews, invitation hashes, provider metadata, trust triggeri, RLS i verification SQL
Prvi sledeći zadatak: direct i verified public review submission API
Lumière: nastavlja se posle shared reviews foundation-a
StudioBiBi: posle svih theme milestone-ova, pre DEMO-DATA-LANDING-01
Povratak na originalni roadmap: posle DEMO-DEPLOY-QA-01, od BACKUP-RECOVERY-01
```
