# DEMO-PRODUCTION-READY-01

**Aktiviran:** 11. jul 2026.
**Realignovan:** 13. jul 2026.
**Status:** aktivna platform-admin i client-preview obilaznica originalnog production roadmapa.
**Checkpoint za realignment:** `9d6ff6cfa0dec51ede96106b246223e16fed6fde`

## Zašto postoji obilaznica

Funkcionalni multi-tenant core je dovoljno razvijen da dalji rad ne mora prvo da prolazi kroz svaki production-infrastructure milestone. Pre nastavka originalnog production redosleda završava se stabilan client-preview proizvod koji može pouzdano da predstavi kompletan sistem potencijalnom salonu, partneru ili investitoru.

Originalni roadmap se ne briše i ne proglašava završenim. Backup i restore, privacy/legal, finalni brand, production domeni i environment, production email/cron aktivacija i pravi pilot ostaju obavezni pre komercijalnog booking launch-a.

## Ažurirani cilj obilaznice

Platform-admin mora da omogući sledeći merljivi tok:

```text
nov klijent
→ poslovni tip ili starter pack
→ osnovni podaci i jezici
→ branding i slike
→ usluge, cene i trajanja
→ zaposleni i radno vreme
→ izbor završene teme
→ desktop/mobile preview
→ bezbedan eksterni preview link
→ klijentski feedback
→ korekcija i novi preview
```

Kada su klijentski podaci i slike unapred pripremljeni, prvi deljivi preview treba da bude moguć za najviše 30–45 minuta, bez ručnog database upisa, ručnog menjanja URL-a ili tenant-specifičnog code forka.

## Dve odvojene launch granice

### Preview soft launch

- služi za izradu i deljenje klijentskih preview sajtova;
- draft tenant može da se pregleda kroz kontrolisan pristup;
- preview je `noindex`, `nofollow` i `noarchive`;
- booking mutation i review submit su onemogućeni;
- `EMAIL_TEST_MODE=true`;
- production email i review invitation cron nisu aktivirani;
- sistem se ne predstavlja kao live production booking platforma.

### Komercijalni booking launch

Dolazi kasnije i zahteva backup/restore, legal dokumente, finalni brand, production domene i env, produkcioni email/Calendar/cron smoke, pravi pilot i najmanje nedelju dana dokumentovanog realnog korišćenja.

## Završena osnova na checkpointu

### DEMO-I18N-01 — završen

- [x] zajednički UI paket SR/MK/HR/SQ/EN/DE/FR;
- [x] centralni locale registry i tenant-aware fallback;
- [x] Editorial i Barber template labeli na sedam UI jezika;
- [x] Services i Team editori više nisu ograničeni na MK/SQ/EN;
- [x] `ADMIN-LOCALES-DYNAMIC-01A` PASS;
- [x] `ADMIN-LOCALES-DYNAMIC-01B` PASS;
- [x] legacy `LocalizedText` ostaje kompatibilan i ne refaktoriše se u ovoj fazi.

### DEMO-THEME-ARCHITECTURE-01 — contract završen

- [x] zajednički desktop/mobile renderer contract;
- [x] shared booking, i18n i tenant granice;
- [x] Lumière je referentna modularna arhitektura;
- [x] Editorial i Barber ostaju iskreno označeni prema stvarnom acceptance stanju do svojih closeout milestone-ova.

### DEMO-REVIEWS-FOUNDATION-01 — foundation završen

- [x] platform, Google, testimonial i preview/demo review sources;
- [x] review settings, RLS, submission, invitation i moderation osnova;
- [x] direct i verified lokalni tok;
- [x] shared catalog i theme integracija;
- [x] lokalni invitation E2E PASS;
- [x] desktop/full public teme zadržavaju kompletan reviews sistem;
- [x] Lumière mobile app-shell ostaje bez pune reviews sekcije;
- [ ] production domain/browser smoke;
- [ ] production review email i cron aktivacija;
- [ ] production dedupe/retry/stale-recovery evidence.

Production aktivacija je prebačena u production infrastructure track i nije blocker preview soft launch-a.

### DEMO-THEME-LUMIERE-01 — završen

- [x] desktop i mobile acceptance;
- [x] podržani locale sadržaj popunjen;
- [x] shared reviews na desktop/full public sajtu;
- [x] booking entry point-i;
- [x] galerija završena i layout zaključan;
- [x] mobile app-shell bez reviews sekcije;
- [x] završni lint, test, TypeScript i production build PASS.

Ne menjati Lumière galerijski layout tokom platform-admin, Editorial, Barber ili Nails rada. Mobile social proof ostaje u `POST-LAUNCH-MOBILE-SOCIAL-PROOF-01`.

### PLATFORM-ADMIN-REVIEW-01 — read-only audit završen

Audit je potvrdio:

- relativni `/salon/[slug]` link u inicijalnom platform-admin renderu;
- client-side public URL resolver tek posle hydration-a;
- tenant-host private rute bez canonical root-host politike;
- publish mutation bez readiness enforcement-a;
- odvojeno menjanje `publication_status` i `is_active`;
- nepotpun owner/bookability readiness;
- fragmentisan tenant workspace;
- nedostatak platform-admin behavior/integration testova;
- potrebu za starter-pack i client-preview workflow-om.

`PLATFORM-ADMIN-PUBLIC-URL-01`, korektivni `01A`, odvojeni platform-admin login i RBAC foundation su završeni. Application-side auth/RBAC closeout prethodi lifecycle/publication enforcement-u, dok database aktivacija ostaje odložena do završene četiri teme i spremnog domena.

## Zaključani template standard

Svaka završena tema mora da ima:

- zaseban desktop renderer;
- zaseban mobile renderer ili namenski mobile shell;
- modularne sekcije;
- zajednički booking contract;
- service i employee preselection;
- tenant branding i sadržaj iz kataloga;
- hero, services, team, gallery, reviews i contact capability gde odgovara vertikali;
- loading, empty i error stanja;
- centralni i18n sistem;
- responsive i booking acceptance test;
- istinit `availability` i `acceptance` status u registry-ju.

Mobile prikaz nije samo sužen desktop layout.

## Realignovan milestone redosled

### Faza A — platform-admin pouzdanost

#### 1. PLATFORM-ADMIN-PUBLIC-URL-01 — završeno

- server-resolved canonical public i preview URL;
- ispravan `href` u prvom renderu;
- uklanjanje hydration resolvera kao uslova ispravnosti;
- canonical private-route host politika;
- root-host, tenant-host, pre/post hydration i API-failure test matrica.

Korektivni `PLATFORM-ADMIN-PUBLIC-URL-01A` je uklonio dev-only canonical redirect petlju bez vraćanja hydration zavisnosti ili relativnog public link fallback-a.

#### 2. PLATFORM-ADMIN-AUTH-BOUNDARY-01 — završeno

- zaseban `/platform-admin/login` bez `business_members` owner/manager provere;
- odvojeni forbidden i local logout tokovi;
- platformski auth redirecti više ne završavaju na tenant-admin `/admin` rutama;
- bezbedan `next` parametar ograničen na `/platform-admin` rute;
- poseban rate-limit i monitoring namespace;
- postojeći `PLATFORM_ADMIN_EMAILS` ostaje privremeni fail-closed rollout izvor;
- nema database migracije ni RBAC aktivacije u ovom milestone-u;
- incognito login, `super_admin` prikaz i local logout runtime smoke PASS.

#### 3. PLATFORM-ADMIN-RBAC-FOUNDATION-01 — završeno

- capability registry i server-side permission guard;
- početne role: `super_admin`, `sales`, `launch_manager` i `it`;
- Sales može da kreira, menja i deli preview, ali nema publish/unpublish dozvolu;
- Launch manager ima eksplicitnu publish dozvolu uz readiness i confirmation gate;
- IT ima monitoring, incident i tehnički read pristup bez podrazumevanog content/publish pristupa;
- platform membership model odvojen od tenant `business_members`;
- nema department UI-ja; kasniji department sloj grupiše role bez menjanja permission contracta;
- zaštita poslednjeg aktivnog super-admina i zabrana self-elevation-a;
- DB migracija, bootstrap članstva i aktivacija ostaju odvojeni koraci uz eksplicitno odobrenje.

#### 4. PLATFORM-ADMIN-AUTH-RBAC-CLOSEOUT-01 — aktivan

- centralni `legacy`, `hybrid` i `database` membership resolver;
- `legacy` ostaje podrazumevan i ne poziva pending RPC;
- `hybrid` čuva allowlisted super-admin nalog kao break-glass tokom migracije;
- `database` fail-uje zatvoreno i nema allowlist fallback;
- login action i zaštićene stranice koriste isti resolver;
- same-origin auth callback politika;
- uklanjanje platform-admin → tenant-admin shell prečice;
- behavior testovi za rollout i lockout zaštitu;
- bez database, email, cron ili production aktivacije.

#### 5. PLATFORM-ADMIN-LIFECYCLE-READINESS-01

- jedan lifecycle servis;
- technical, content, booking, owner-access, preview i production readiness;
- server-side publish gate;
- blocker poruke sa direktnim CTA;
- uklanjanje nezavisne `is_active` kontrole iz profile editora;
- optimistička konkurentnost i minimalni lifecycle audit event.

#### 6. PLATFORM-ADMIN-WORKSPACE-01

- tenant shell i responsive navigacija;
- Pregled, Branding, Tema, Pristup i Operacije;
- Operacije podmeni: Katalog, Tim, Radno vreme i booking, Blokade, Rezervacije i Reviews;
- tanji Overview sa jednim sledećim korakom;
- očuvanje svih postojećih akcija tokom migracije.

#### 7. PLATFORM-ADMIN-ACCESS-RECOVERY-01

- owner access state machine;
- invited, password-pending, active i disabled stanja;
- recovery za `must_change_password` parcijalni failure;
- domen-idempotentan invitation resend;
- platform-admin login nezavisan od tenant owner membershipa;
- izbor aktivnog tenant-a za legitimnog multi-tenant owner-a.

#### 8. PLATFORM-ADMIN-OPERATIONS-01

- integracija ili uklanjanje legacy staff-setup toka;
- zajednički tenant loader i mutation contract;
- obavezan optimistic concurrency za bookings i lifecycle;
- kompletni empty/loading/error/success tokovi;
- reviews operativni link ili platform-admin pregled;
- bez mrtvih linkova, skrivenih akcija i ručne URL navigacije.

### Faza B — client-preview factory

#### 9. CONTENT-STARTER-PACKS-01A

- verzionisani starter-pack format;
- stabilni category/service ključevi;
- prevodi, početne cene i trajanja;
- preview diff i izbor jezika;
- `skip_existing` / do-not-overwrite default;
- idempotentan transakcijski import;
- import provenance;
- prvi Hair & Beauty pack sa Lumière preporukom.

Premium Editorial, Classic Barber i Nail Studio pack dodaju se uz odgovarajuće theme closeout milestone-ove.

#### 10. CLIENT-CONTENT-INTAKE-01

- vođeni unos identiteta, kontakta, lokacije i društvenih mreža;
- izbor sadržajnih jezika;
- logo, hero, galerija i team slike;
- kategorije, usluge, cene i trajanja;
- zaposleni, assignments i osnovno radno vreme;
- izbor teme i content completeness checklist;
- prvi preview bez prolaska kroz nepovezane ekrane.

#### 11. CLIENT-PREVIEW-SHARING-01

- expiring i revocable eksterni preview pristup;
- hash-only token ili ekvivalentna server-side sigurnosna granica;
- `noindex`, `nofollow`, `noarchive`;
- onemogućen booking i review submit;
- desktop/mobile preview;
- copy i revoke kontrole iz tenant Overview-a;
- bez pristupa drugim tenantima ili platform-admin podacima.

### Faza C — završetak tema

#### 12. DEMO-THEME-EDITORIAL-01

- modularni desktop i mobile;
- shared reviews i sedam UI jezika;
- tenant catalog/branding bez hardkodovanog demo sadržaja;
- booking preselection;
- responsive, loading, empty i error QA;
- Premium Editorial starter pack;
- acceptance se menja iz `pending` tek posle stvarnog QA.

#### 13. DEMO-THEME-BARBER-01

- modularni desktop i mobile;
- finalni Barber visual polish;
- realni catalog, team, gallery i reviews podaci;
- booking i preselection;
- sedam UI jezika;
- Classic Barber starter pack;
- izlazak iz beta statusa tek posle acceptance-a.

#### 14. DEMO-THEME-NAILS-01

- zaseban nails vizuelni sistem;
- portfolio-first galerija;
- manicure, gel, nail art i pedicure sadržaj;
- isti desktop/mobile/booking contract;
- Nail Studio starter pack;
- reprezentativan nails demo tenant.

`DEMO-THEME-WELLNESS-01` i `DEMO-THEME-BEAUTY-01` dolaze posle prvih client-preview iskustava i nisu blocker preview soft launch-a.

### Faza D — ponovni pregled i launch gate

#### 15. PLATFORM-ADMIN-END-TO-END-REVIEW-02

- prolazak stvarnog toka od novog klijenta do deljivog preview-a;
- merenje vremena izrade;
- uklanjanje mrtvih i suvišnih stranica;
- spajanje ponovljenih akcija;
- finalna responsive/accessibility optimizacija;
- potvrda da nije potrebna ručna database intervencija.

#### 16. DEMO-DATA-LANDING-01

- reprezentativni Lumière, Editorial, Barber i Nails tenant-i;
- realistične usluge, zaposleni, galerije i dozvoljen demo review sadržaj;
- platform landing sa demo karticama;
- jasan CTA za client preview;
- demo sadržaj se ne predstavlja kao stvarni customer dokaz.

#### 17. MASTER-SYSTEM-QA-01

- platform-admin, owner/admin i staff smoke;
- desktop/mobile public i booking smoke;
- lifecycle, preview, suspend i reactivate;
- tenant isolation i cross-tenant API regression;
- long names, mnogo jezika i veliki katalog;
- loading, error, empty i disabled stanja;
- accessibility i SEO/noindex;
- lint, test, TypeScript i production build;
- pregled kompletnog diff-a.

#### 18. PREVIEW-SOFT-LAUNCH-GATE-01

Gate je PASS samo kada:

- draft tenant može da se kreira bez ručnog database rada;
- starter-pack import je idempotentan;
- client content intake vodi do preview-a za najviše 30–45 minuta;
- canonical public URL je potvrđen u stvarnom browseru;
- eksterni preview link je expiring, revocable i tenant-isolated;
- preview booking i review submit su onemogućeni;
- Lumière, Editorial, Barber i Nails prolaze desktop/mobile smoke;
- platform-admin end-to-end review je završen;
- `MASTER-SYSTEM-QA-01` je PASS;
- `EMAIL_TEST_MODE=true` i production cron ostaje neaktivan;
- stvarni završni command i browser izlazi su pregledani.

## Šta nije deo preview soft launch-a

Preview obilaznica ne zatvara:

- backup i proverljiv restore;
- privacy/legal dokumentaciju;
- finalno tržišno ime i pravnu proveru;
- production domen i DNS konfiguraciju;
- production Resend domen, SPF, DKIM i DMARC;
- production Google OAuth setup;
- production review invitation cron;
- live customer booking tvrdnju;
- billing i subscription sistem;
- nedelju realnog pilot korišćenja.

## Povratak na production roadmap

Posle `PREVIEW-SOFT-LAUNCH-GATE-01` obavezni redosled je:

1. `BACKUP-RECOVERY-01`;
2. `PRIVACY-LEGAL-01`;
3. `BRAND-FOUNDATION-01`;
4. `PRODUCTION-DOMAINS-ENV-01`;
5. `REVIEW-INVITATION-LAUNCH-01`;
6. `STUDIOBIBI-PILOT-01`;
7. najmanje nedelju dana realnog pilot rada;
8. finalni production launch gate.

StudioBiBi se gradi kao čist tenant na zajedničkoj platformi. Stari StudioBiBi application code, database struktura i Supabase projekat se ne koriste.
