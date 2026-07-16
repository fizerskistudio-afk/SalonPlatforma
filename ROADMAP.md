# Salon Platforma — Product & Engineering Roadmap

**Ažurirano:** 16. jul 2026.
**Repo:** `fizerskistudio-afk/SalonPlatforma`  
**Aktivna grana:** `backup/theme-core-barber-beta`  
**Radni naziv:** `Salon Platforma`  
**Status:** multi-tenant core, Reviews foundation, platform-admin access recovery, runtime product package gates i platform-admin Operations su završeni; `AI-CONTENT-ASSIST-FOUNDATION-01A` i `01B` su pushovani, `01C` je aktivan, a `01C-A` je validiran i staged.

> Ovaj dokument je operativni izvor istine za nastavak rada i handoff između chatova. Nezavršene stavke se ne predstavljaju kao završene.

## 0. Trenutni operativni checkpoint — 16. jul 2026.

- [x] `PRODUCT-PACKAGES-ENTITLEMENTS-01` završen i pushovan;
- [x] `PLATFORM-ADMIN-OPERATIONS-01` završen i pushovan;
- [x] `AI-CONTENT-ASSIST-FOUNDATION-01A` domain/provider boundary završen i pushovan;
- [x] `AI-CONTENT-ASSIST-FOUNDATION-01B` guarded invocation i rollout surface policy završeni i pushovani;
- [x] AI prevodi zaključani kao Platform Admin assisted-content alat;
- [x] tenant AI zaključan na Google review reply draft uz povezanu integraciju;
- [x] ciljani AI testovi, kompletan Vitest suite, TypeScript i production build prošli;
- [x] `AI-CONTENT-ASSIST-FOUNDATION-01C-A` auth adapters i request boundary validirani i staged;
- [x] AI contract testovi odvojeni od promenljivih ROADMAP statusnih rečenica;
- [x] ROADMAP update prebačen u zaseban full-file docs updater;
- [ ] `AI-CONTENT-ASSIST-FOUNDATION-01C-B — INTERNAL ROUTES AND GOOGLE REVIEW CONTEXT` je sledeći korak;
- [ ] 01C-A commit i push čekaju eksplicitnu autorizaciju;
- [ ] nema opšteg tenant AI endpointa niti automatskog content/review apply-a.

### Poslednji potvrđeni implementation checkpoint

```text
13494f95a9b55aeb59f83c267c28d35fd5d5a4ba
feat(ai): add guarded content assist foundation
```

---

## 1. Pravilo rada od 9. jula 2026.

Posle svake prihvaćene izmene ili hotfix-a obavezno ažuriramo ovaj dokument u istom commit-u ili neposredno sledećem docs commit-u.

Od 16. jula 2026. code instaleri više ne menjaju niti rekonstruišu `ROADMAP.md`. Posle potvrđenog code PASS-a generiše se zaseban full-file ROADMAP updater zasnovan na tačnoj trenutnoj verziji dokumenta. Updater proverava baseline hash, menja samo `ROADMAP.md` i dodaje ga postojećem staged checkpointu.

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
6. code installer završen bez izmene ROADMAP-a
7. zaseban full-file ROADMAP updater primenjen i stage-ovan
8. privremeni installer fajlovi obrisani
9. ciljani commit i push
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

## 4. Istorijski milestone zapis

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

### Realignovan redosled obilaznice od 15. jula 2026.

Završeni foundation milestone-ovi ostaju važeći. Operativni cilj ostaje da platform-admin od pripremljenih podataka i slika napravi bezbedan klijentski preview za najviše 30–45 minuta, bez ručnog database rada.

1. `PLATFORM-ADMIN-PUBLIC-URL-01` — završen;
2. `PLATFORM-ADMIN-AUTH-BOUNDARY-01` — završen;
3. `PLATFORM-ADMIN-RBAC-FOUNDATION-01` — završen;
4. `PLATFORM-ADMIN-AUTH-RBAC-CLOSEOUT-01` — završen;
5. `PLATFORM-ADMIN-LIFECYCLE-READINESS-01` — završen;
6. `PLATFORM-ADMIN-WORKSPACE-01` — završen;
7. `PLATFORM-ADMIN-ACCESS-RECOVERY-01` — završen;
8. `PRODUCT-PACKAGES-ENTITLEMENTS-01` — završen i pushovan;
9. `PLATFORM-ADMIN-OPERATIONS-01` — završen i pushovan;
10. `AI-CONTENT-ASSIST-FOUNDATION-01` — aktivan; 01A + 01B pushovani, 01C-A validiran i staged, 01C-B sledeći;
11. `CONTENT-STARTER-PACKS-01A`;
12. `CLIENT-CONTENT-INTAKE-01`;
13. `CLIENT-PREVIEW-SHARING-01`;
14. `DEMO-THEME-EDITORIAL-01`;
15. `DEMO-THEME-BARBER-01`;
16. `DEMO-THEME-NAILS-01`;
17. `PLATFORM-ADMIN-END-TO-END-REVIEW-02`;
18. `DEMO-DATA-LANDING-01`;
19. `MASTER-SYSTEM-QA-01`;
20. `PREVIEW-SOFT-LAUNCH-GATE-01`.

`DEMO-THEME-WELLNESS-01` i `DEMO-THEME-BEAUTY-01` ostaju posle preview soft launch-a, kako nove vertikale ne bi blokirale proveru stvarnog client-preview prodajnog toka. `STUDIOBIBI-PILOT-01` ostaje production pilot posle backup, legal, domain i production environment gate-ova.

Detaljan scope i granica između demo readiness-a i pravog production launch-a nalaze se u `docs/milestones/DEMO-PRODUCTION-READY-01.md`.

### PRODUCT-PACKAGES-ENTITLEMENTS-01 — završen i pushovan

- [x] zaključano pet kumulativnih paketa: Booking Page, Digital Studio, Operations Pro, Reputation Pro i Signature;
- [x] centralni entitlement registry, persistence contract i server resolver;
- [x] package assignment kroz platform-admin uz optimistic concurrency;
- [x] tenant-admin route, navigation, mutation i signed-upload gate;
- [x] staff route, OAuth, callback, action i automatic employee sync gate;
- [x] package, permission i integration ostaju odvojene odluke;
- [x] legacy full access i invalid assignment ostaju fail-open tokom rollout-a;
- [x] shared upgrade guidance bez mrtvih billing/upgrade linkova;
- [x] svih pet paketa pokriveno runtime test matricom;
- [x] platform-admin preview ostaje javni tenant preview sa `?preview=1`;
- [x] završni TypeScript, ciljani package smoke i `npm run check`;
- [x] ciljani Git commit i push završeni na radnoj grani.

Detaljan closeout zapis: `docs/milestones/PRODUCT-PACKAGES-ENTITLEMENTS-CLOSEOUT-01.md`.

### PLATFORM-ADMIN-OPERATIONS-01 — završen i pushovan

- [x] server-only operational read model bez direktnih dashboard Supabase upita;
- [x] owner, contact, template, package i upcoming booking signali;
- [x] critical, warning i info attention severity;
- [x] dedicated `/platform-admin/operations` workspace;
- [x] bookmarkable attention, launch, published i all views;
- [x] search, lifecycle, severity i package-state filteri;
- [x] guarded lifecycle quick actions koriste postojeći publication API;
- [x] permission, transition, readiness, optimistic-concurrency i audit granice ostaju server-side;
- [x] shared lifecycle action i confirmation copy;
- [x] automatizovani runtime permission/transition smoke;
- [x] završni TypeScript, ciljani Operations testovi i `npm run check`;
- [ ] browser lifecycle smoke ostaje eksplicitan kontrolisani test jer menja tenant podatke;
- [x] ciljani Git commit i push završeni na radnoj grani.

Detaljan closeout zapis: `docs/milestones/PLATFORM-ADMIN-OPERATIONS-01D-CLOSEOUT.md`.

Kontrolisani runtime runbook: `docs/qa/PLATFORM-ADMIN-OPERATIONS-01D-RUNTIME-SMOKE.md`.

### AI-CONTENT-ASSIST-FOUNDATION-01 — aktivan

- [x] 01A domain i provider boundary završen i pushovan;
- [x] 01B guarded invocation i surface policy završeni i pushovani;
- [x] AI prevodi su u prvom rollout-u samo Platform Admin alat;
- [x] tenant AI je u prvom rollout-u samo Google review reply draft uz povezanu integraciju;
- [x] tenant content translation i non-Google AI reply surface ostaju blokirani;
- [x] tenant scope, surface, package, permission, integration, review source i quota guard;
- [x] 01B završen bez API rute, quota persistence-a i content write-a;
- [x] task-to-entitlement mapping za content translation i review reply draft;
- [x] Groq server provider sa modelom `openai/gpt-oss-20b`;
- [x] JSON Schema draft output bez reasoning payload-a;
- [x] svaki rezultat zahteva ručnu potvrdu i ne dozvoljava auto-apply;
- [x] private `GROQ_API_KEY` server granica;
- [x] provider sloj bez Supabase write operacija;
- [x] 01A završen bez API rute, quota persistence-a i automatskog upisa;
- [x] ciljani testovi, TypeScript i `npm run check`;
- [x] 01A + 01B ciljani Git commit i push završeni na radnoj grani;
- [x] 01C-A auth adapters i request boundary validirani i staged;
- [x] nova `tenant.content.translate` Platform Admin permission;
- [x] Sales, Launch Manager i Super Admin imaju translation permission, IT ostaje read-only;
- [x] tenant Google reply auth koristi isključivo aktivni tenant context;
- [x] privremena lozinka i nerešen tenant selection blokiraju AI tok;
- [x] strogi odvojeni translation i review request contracti;
- [x] tenant request ne prihvata business ID, review tekst, task ili request ID;
- [x] 16 KiB body limit i postojeći PII-safe request-ID helper;
- [x] privremeni read-only usage adapter `rollout_read_only_zero`;
- [x] AI foundation contract testovi čitaju stabilne milestone dokumente umesto promenljivih ROADMAP statusa;
- [x] 01C-A završen bez API rute, Google review loadera ili database write-a;
- [ ] 01C-A commit i push čekaju eksplicitnu autorizaciju.

Detaljan 01A zapis: `docs/milestones/AI-CONTENT-ASSIST-FOUNDATION-01A-DOMAIN-PROVIDER-BOUNDARY.md`.

Detaljan 01B zapis: `docs/milestones/AI-CONTENT-ASSIST-FOUNDATION-01B-GUARDED-INVOCATION.md`.

Detaljan 01C-A zapis: `docs/milestones/AI-CONTENT-ASSIST-FOUNDATION-01C-A-AUTH-REQUEST-BOUNDARY.md`.

Sledeći korak: `AI-CONTENT-ASSIST-FOUNDATION-01C-B — INTERNAL ROUTES AND GOOGLE REVIEW CONTEXT`.

01C-B uvodi dve fizički odvojene interne rute — Platform Admin translation i tenant Google review reply — bez opšteg tenant AI endpointa i bez automatskog apply-a. Tenant reply ruta server-side učitava review i Google provider connection pre invocation-a.

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
- [x] StudioBiBi planiran kao clean production pilot posle preview soft launch-a i production infrastructure gate-ova;
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

### DEMO-REVIEWS-FOUNDATION-01C — source i lokalni launch tok završeni

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
- [x] Git checkpoint, commit i push — `4a701cd142db8ee19468464a6e2fd7f6990afdab`.

### DEMO-REVIEWS-FOUNDATION-01G-A — LOCAL LAUNCH READINESS source spreman

- [x] review launch QA matrica;
- [x] evidence/results template bez tajni;
- [x] Lumière, Editorial i Barber desktop/mobile coverage;
- [x] sedam UI jezika u QA contractu;
- [x] disabled, empty, verified, testimonial, Google, demo, owner reply i long-content scenariji;
- [x] direct i verified submission smoke procedura;
- [x] moderation i cross-tenant smoke procedura;
- [x] source-level launch-readiness contract;
- [x] završni `npm run check`;
- [ ] browser i responsive smoke popunjen u results dokumentu;
- [x] Git checkpoint, commit i push — `da8816d737e7fda118b31d9f7d3c012449e3491f`.

### DEMO-REVIEWS-FOUNDATION-01G-B1 — READ-ONLY PREFLIGHT završen lokalno

- [x] read-only deployed smoke CLI;
- [x] platform root i tenant page provera;
- [x] deployed catalog review contract provera;
- [x] direct review i invalid-token noindex provera;
- [x] missing/wrong cron credential mora dati 401;
- [x] sanitized lokalni JSON evidence;
- [x] Vercel plan-aware activation runbook;
- [x] README review cron env dokumentacija;
- [x] source-contract test;
- [x] završni `npm run check`;
- [x] Git checkpoint, commit i push — `29a0edb168019d36d81864edf7965a7ad40f9cff`;
- [x] green preflight report prošao na `http://localhost:3000` za `lumiere-studio`;
- [ ] isti preflight ponoviti na javnom production hostu u `PRODUCTION-DOMAINS-ENV-01`.

### DEMO-REVIEWS-FOUNDATION-01G-B2 — CONTROLLED LOCAL TEST-MODE INVITATION E2E core PASS

- [x] test-mode email env potvrđen bez upisivanja tajni u evidence;
- [x] batch limit postavljen na 1;
- [x] tačno jedan eligible completed test booking;
- [x] jedan autorizovan cron poziv;
- [x] tačno jedan Resend test-mode delivery;
- [x] invitation token forma i single-use potvrđeni;
- [x] verified review submit → pending → moderation → published;
- [x] javni verified-visit badge potvrđen;
- [ ] runtime dedupe, retry/backoff i stale recovery evidence ostaje za production/master QA.

### DEMO-REVIEWS-FOUNDATION-01G-B3 — PRODUCTION AKTIVACIJA odložena do infrastrukture

- [ ] deployovan public tenant i review routes smoke;
- [ ] direct review production E2E;
- [ ] completed booking → outbox → Resend email → token forma → verified review production E2E;
- [ ] moderation i cross-tenant production smoke;
- [ ] protected cron single-run production smoke;
- [ ] deduplikacija, retry/backoff i stale recovery potvrđeni;
- [ ] production invitation schedule aktiviran;
- [ ] activation evidence upisan bez tajni;
- [ ] finalni production review foundation closeout;
- [x] scheduler aktivacija prebačena u `PRODUCTION-DOMAINS-ENV-01` posle domena i Vercel Pro plana;
- [x] `vercel.json` se ne dodaje prerano na Hobby planu.

### DEMO-THEME-LUMIERE-01B — FINAL POLISH završen

- [x] desktop kompozicija i redosled sekcija zaključani source contractom;
- [x] mobile app-shell, tabovi i bottom navigation zaključani source contractom;
- [x] desktop/full-site shared reviews ostaju aktivne;
- [x] puna review sekcija uklonjena iz booking-first mobile app-shella;
- [x] mobile social-proof teaser odložen u post-launch backlog;
- [x] desktop galerija balansirana za sedam slika — samo prva pločica je featured;
- [x] desktop i mobile booking entry point-i zaključani source contractom;
- [x] sedam podržanih locale kodova uključeno u closeout contract;
- [x] SR/DE/FR content worksheet dokumentovan;
- [x] funkcionalni browser QA pre polish-a potvrđen;
- [x] završni `npm run check`;
- [x] SR/DE/FR i ostali podržani Lumière sadržaj unet kroz tenant-aware admin locale sistem;
- [x] kratki post-polish desktop gallery i mobile app-shell smoke;
- [x] finalni Lumière commit i acceptance baseline PASS;
- [x] Lumière demo tema zvanično završena;
- [x] galerijski layout zaključan i ne menja se tokom platform-admin rada;
- [x] mobile app-shell ostaje bez pune reviews sekcije;
- [x] desktop/full public site zadržava kompletan reviews sistem.

Post-launch backlog: `POST-LAUNCH-MOBILE-SOCIAL-PROOF-01` — opcioni diskretni review teaser ili `Više` tab, tek nakon launch-a.

### PLATFORM-ADMIN-REVIEW-01 — READ-ONLY audit završen

- [x] mapirane sve platform-admin stranice, API rute, loaderi i shared komponente;
- [x] auditovani tenant lifecycle, readiness, publication, access i mutation tokovi;
- [x] auditovani authorization, tenant scoping, noindex, responsive i accessibility slojevi;
- [x] potvrđen uzrok Lumière public URL problema bez trećeg naslepog patcha;
- [x] potvrđeno da inicijalni platform-admin DOM koristi relativni `/salon/[slug]` fallback pre hydration resolvera;
- [x] potvrđeno da tenant-host platform-admin zato može otvoriti `/salon/[slug]` na pogrešnom hostu;
- [x] potvrđeno da publish API trenutno ne sprovodi readiness gate;
- [x] potvrđena duplirana lifecycle kontrola preko `publication_status` i `is_active`;
- [x] predložena tenant information architecture: Pregled, Branding, Tema, Pristup i Operacije;
- [x] `PLATFORM-ADMIN-PUBLIC-URL-01` i korektivni `01A` završeni;
- [x] canonical public linkovi više ne zavise od hydration resolvera;
- [x] `PLATFORM-ADMIN-AUTH-BOUNDARY-01` runtime smoke PASS;
- [x] capability-based `PLATFORM-ADMIN-RBAC-FOUNDATION-01` installer i runtime PASS;
- [x] `PLATFORM-ADMIN-AUTH-RBAC-CLOSEOUT-01` završen i pushovan na radnu granu (`1f059c3`);
- [x] `PLATFORM-ADMIN-LIFECYCLE-READINESS-01` završen i pushovan na radnu granu (`79952de`);
- [ ] aktivan `PLATFORM-ADMIN-WORKSPACE-01`;
- [ ] database membership aktivacija ostaje zaseban eksplicitno odobren korak.

### Client-preview soft launch granica

Preview soft launch nije production booking launch. Pre ovog gate-a sistem mora da omogući:

- kreiranje draft tenant-a bez ručnog database rada;
- idempotentan starter-pack import;
- unos klijentskog brandinga, slika, usluga, cena, trajanja, zaposlenih i radnog vremena;
- canonical tenant URL;
- expiring i revocable eksterni preview pristup;
- `noindex`, `nofollow` i `noarchive` preview granicu;
- onemogućen booking i review submit u preview režimu;
- desktop/mobile preview za Lumière, Editorial, Barber i Nails;
- završni platform-admin funkcionalni pregled i `MASTER-SYSTEM-QA-01`.

Do preview soft launch-a ostaju zaključane odluke:

- `EMAIL_TEST_MODE=true`;
- production email i review invitation cron nisu aktivirani;
- Lumière galerijski layout se ne menja;
- `POST-LAUNCH-MOBILE-SOCIAL-PROOF-01` ostaje odložen;
- legacy `LocalizedText` u `lib/types.ts` ostaje zbog kompatibilnosti.

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

## 6. Originalni production roadmap posle preview soft launch-a

Stavke u ovom odeljku ostaju važeće kao istorijski i production hardening plan. Aktivni redosled do preview soft launch-a definisan je u odeljku 5B. Posle `PREVIEW-SOFT-LAUNCH-GATE-01` rad se vraća na obavezne backup, legal, brand, production environment i pilot gate-ove.

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
Poslednji pushovani AI implementation checkpoint: 13494f95a9b55aeb59f83c267c28d35fd5d5a4ba
Checkpoint tag: checkpoint/pre-platform-admin-review-2026-07-13
Poslednji završen chapter: PLATFORM-ADMIN-OPERATIONS-01
Reviews foundation: završena lokalna i source osnova; production email/cron aktivacija odložena
Lumière: završena referentna tema; galerijski layout zaključan
Admin locales: ADMIN-LOCALES-DYNAMIC-01A i 01B PASS
Aktivni milestone: AI-CONTENT-ASSIST-FOUNDATION-01C
Lokalni checkpoint: 01C-A PASS i staged; commit/push pending
Sledeći korak: 01C-B internal routes + server-side Google review context
Sledeći redosled: AI 01C-B → AI foundation closeout → starter packs → content intake → shareable preview
Teme posle platform-admin preview osnove: Editorial → Barber → Nails
Preview soft launch: bez produkcionog emaila, review crona i live booking tvrdnje
Main gate: kompletan platform-admin + Lumière/Editorial/Barber/Nails + domen + RBAC DB aktivacija + master QA + eksplicitna dozvola
Production track posle preview gate-a: backup → legal → brand → domains/env → StudioBiBi pilot
```
