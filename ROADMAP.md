# Salon Platforma — Product & Engineering Roadmap

**Ažurirano:** 22. jul 2026.
**Repo:** `fizerskistudio-afk/SalonPlatforma`
**Aktivna grana:** `milestone/ordum-workspace-appshell-01b`
**Radni naziv:** `Salon Platforma`
**Status:** `main` production baseline je `ffce602` sa završenim `ORDUM-WORKSPACE-APPSHELL-01A`. `ORDUM-WORKSPACE-APPSHELL-01B` ima code PASS i funkcionalni desktop/mobile browser PASS na aktivnoj grani: privatni tenant-aware `/workspace` launcher, postojeći admin/staff identity adapteri, registry-backed Studio/Content kartice i noindex granica rade bez admin route rewrite-a, baze, migracije ili PWA izmene. Vizuelni smer je prihvaćen samo kao funkcionalni foundation; budući launcher polish ide ka jednostavnijem Citrix Workspace obrascu. Sledeći konkretan milestone je `ORDUM-DOCUMENTATION-IA-01`, zatim `ORDUM-PWA-FOUNDATION-01`.

> Ovaj dokument je operativni izvor istine za nastavak rada i handoff između chatova. Nezavršene stavke se ne predstavljaju kao završene.

## 0. Trenutni operativni checkpoint — 22. jul 2026.

- [x] `PRODUCT-PACKAGES-ENTITLEMENTS-01` završen i pushovan;
- [x] `PLATFORM-ADMIN-OPERATIONS-01` završen i pushovan;
- [x] `AI-CONTENT-ASSIST-FOUNDATION-01A` domain/provider boundary završen i pushovan;
- [x] `AI-CONTENT-ASSIST-FOUNDATION-01B` guarded invocation i rollout surface policy završeni i pushovani;
- [x] AI prevodi zaključani kao Platform Admin assisted-content alat;
- [x] tenant AI zaključan na Google review reply draft uz povezanu integraciju;
- [x] ciljani AI testovi, kompletan Vitest suite, TypeScript i production build prošli;
- [x] `AI-CONTENT-ASSIST-FOUNDATION-01C-A` auth adapters i request boundary završeni i pushovani;
- [x] `AI-CONTENT-ASSIST-FOUNDATION-01C-B` internal routes i Google review context završeni i pushovani;
- [x] `AI-CONTENT-ASSIST-FOUNDATION-01C-C` controlled runtime smoke i foundation closeout završeni i pushovani — `441a0fa2deb414a8c546b8e1a99b4c39daedc9da`;
- [x] isti Request/Response orchestration koristi production composition root i kontrolisani runtime test;
- [x] runtime pokriva 200/400/401/403/404/413/500/503/504 i stabilan `X-Request-ID`;
- [x] success ostaje draft-only uz obavezno ručno odobrenje;
- [x] nema automatskog content apply-a, Google reply publish-a ili usage write-a;
- [x] pravi usage persistence izdvojen u `AI-CONTENT-ASSIST-USAGE-01`;
- [x] `CONTENT-STARTER-PACKS-01A` universal contract, registry i svih deset vertical manifesta završeni i pushovani — `6261d56e96a685905fe0a00f2357d26aa331104f`;
- [x] 21 zajednički optional/required modul i 106 starter usluga;
- [x] sve 01A starter cene ostaju `unset`, a copy/policies/SEO ostaju draft;
- [x] `CONTENT-STARTER-PACKS-01B` visible Platform Admin builder validiran i staged;
- [x] svih deset packova može da se preview-uje kroz server route;
- [x] Platform Admin može da potvrdi module, uključi/isključi usluge i izmeni naziv, opis, trajanje i cenu;
- [x] server ponovo materijalizuje trusted pack umesto prihvatanja client category/template payload-a;
- [x] apply koristi postojeći atomski `provision_business` RPC;
- [x] stabilan `applyKey` i slug guard sprečavaju dupliranje ili pregazivanje postojećeg tenant-a;
- [x] novi tenant ostaje draft i ne objavljuje se automatski;
- [x] nema nove migracije, browser Supabase write-a, email aktivacije ili cron aktivacije;
- [x] ciljani 01B testovi, TypeScript i kompletan `npm run check` prošli;
- [x] 01B commit i push završeni — `de3351ed09550b39ffea754d0501820e8e7f947c`;
- [x] kontrolisani browser provisioning smoke prošao preko Starter Pack Business Builder-a;
- [x] starter-pack preview API vratio `200`, a atomski provisioning novog Editorial tenant-a `201`;
- [x] kreiran je stalni demo tenant `atelier-editorial-demo` sa `hair-editorial` temom;
- [x] draft public preview ruta `/salon/atelier-editorial-demo?preview=1` radi;
- [x] preview booking guard je potvrđen — booking write ostaje namerno onemogućen u preview režimu;
- [x] `DEMO-THEME-EDITORIAL-01` visual/demo acceptance je ranije završen;
- [x] `DEMO-THEME-EDITORIAL-02` deli desktop i mobile na zasebne, testabilne sekcije;
- [x] Editorial viewport root fajlovi su tanki composition root-ovi;
- [x] Editorial architecture je `modular/modular/passed`;
- [x] shared Reviews contract testovi prate modularne review i navigation granice;
- [x] localized team i gallery empty state ostaju podržani;
- [x] ciljani registry, architecture, Editorial i Reviews testovi, TypeScript i kompletan `npm run check` prošli;
- [x] ručni desktop/browser preview smoke prihvaćen bez blocker-a;
- [x] poznati non-blocker: Builder success kartica ostaje ispod duge forme bez auto-scroll/toast povratne informacije;
- [x] Lumière ostaje vizuelni i arhitektonski referentni standard; Editorial je prihvaćen kao sekundarna tema;
- [x] `DEMO-THEME-BARBER-01` desktop visual closeout ima lokalni code PASS i ručni browser vizuelni PASS;
- [x] Barber Services, Team, Gallery, Reviews i Contact koriste modularne desktop sekcije i zajednički viewport reveal jezik;
- [x] Barber Reviews ostaje na `CatalogReviewsSection` shared adapteru uz izdvojeni editorial variant u `components/reviews`;
- [x] Barber mobile app-shell, booking domen, tenant podaci, baza i migracije nisu menjani;
- [x] trenutni stilizovani lokacijski kadar ostaje pilot baseline i otvara stvarnu Google Maps pretragu;
- [x] Barber closeout commit i push završeni — `a690bd0f055c0541d31c711047d664f5015e38f5`;
- [x] annotated tag `barber-v2-pilot-01` pokazuje na Barber closeout commit;
- [x] `DEMO-THEME-NAILS-01A` uvodi četvrti renderer kao `nails-soft` beta temu sa poštenim `architecture.acceptance=pending` statusom;
- [x] Nails desktop i mobile imaju zasebne tanke composition root-ove i po osam namenski modularnih UI sekcija;
- [x] Nails koristi portfolio-first redosled, sopstveni svetli atelier/lookbook identitet i tenant catalog bez hardkodovanog demo salona;
- [x] shared booking callback-i, Reviews adapter, preview guard, empty states i sedam UI locale-a ostaju u zajedničkim platformskim granicama;
- [x] ciljani Nails/registry/architecture/i18n/Reviews testovi, TypeScript i kompletan Vitest suite `838/838` prošli;
- [x] production build prošao sa privremenim process-only Supabase placeholder env vrednostima i 4 GB Node heap-om; nijedna env vrednost nije upisana u repo;
- [x] objedinjeni `npm run check` prošao sa istim process-only env vrednostima i 4 GB Node heap-om;
- [x] prvi Nails browser pregled potvrdio je functional foundation, ali 01A visual identity nije prihvaćen jer je previše podsećao na rani Barber kompozicioni jezik;
- [x] `DEMO-THEME-NAILS-01B` zamenjuje taj jezik Nail Art Atelier sistemom unutar postojećih modularnih renderer granica;
- [x] 01B uvodi floating header, polish-board hero, nepravilni lookbook, lacquer treatment menu, artist desk, `nails-atelier` Reviews variant i appointment contact card;
- [x] sekcijski brojevi `01 /`–`05 /` i dominant-photo/archive Barber ritam uklonjeni su iz Nails renderer-a;
- [x] 01B kompletan `npm run check` prošao: lint bez error-a, kompletan Vitest suite `839/839`, TypeScript i production build;
- [x] 01B browser pokušaj je dokazao da `atelier-luna-nails` još renderuje privremeni `hair-editorial`, pa poslati screenshotovi nisu Nails acceptance;
- [x] Platform Admin izbor `nails-soft` reprodukovano vraća PostgreSQL `23514` jer DB constraint iz migracije `021` još ne poznaje četvrti template ključ;
- [x] `DEMO-THEME-NAILS-01C-ACTIVATION` priprema uski `032` migration source, read-only verification, rollback runbook i Nails starter-pack wiring;
- [x] korisnik je odobrio i primenio samo migraciju `032`; `atelier-luna-nails` sada stvarno renderuje `nails-soft`;
- [x] prvi stvarni Nails desktop pregled dao je delimični visual PASS za identitet Nail Art Atelier-a;
- [ ] formalni read-only DB verification output za `032` ostaje da se zabeleži;
- [x] 01D desktop density korekcija i ručni desktop visual acceptance završeni;
- [x] 01E source uvodi theme-owned mobile tab navigaciju i home bez page scrolla;
- [x] mobile modular navigation source i code check završeni;
- [x] mobile browser visual acceptance potvrđen;
- [x] desktop-switch CTA položaj prihvaćen kao P2 za prvi kontrolisani live-tenant fix;
- [x] Nails architecture acceptance prebačen na `passed`, dok rollout ostaje `beta`;
- [ ] preview booking guard smoke nije ručno potvrđen u mobile closeout-u;
- [ ] puni live booking, admin calendar, email i cross-tenant regression ostaje u `MASTER-SYSTEM-QA-01`;
- [ ] aktivni operativni milestone: `BARBER-PILOT-ONBOARDING-01`;
- [ ] prvi kontrolisani live theme update posle stabilnog baseline-a: `BARBER-V2-CONTACT-MAP-01`;
- [x] `MAIN-INTEGRATION-AUDIT-01` read-only audit završen; `main` je tačan predak razvojne grane i odobrena je kontrolisana fast-forward integracija.
- [x] kontrolisana fast-forward integracija i kasniji production closeout commit-i završeni; aktivni checkpoint je `96c5bdf029d3e29d1a0ccf8ae56cfbdaad4422ea`;
- [x] `MASTER-SYSTEM-QA-01A-R4` read-only baseline završen — kompletan `npm run check`, sekvencijalni runtime health preflight i Playwright desktop/mobile matrica `18/18` imaju PASS;
- [x] potvrđeni su Ordum landing, Barber i Nails javni tenant, unknown-tenant private/noindex granica, anonymous admin/staff/platform-admin auth boundary i read-only catalog/availability validation;
- [x] R4 nije menjao application source, bazu, migracije, rezervacije, email, tenant lifecycle ili Git istoriju;
- [x] Playwright runtime i završni evidence držani su van repozitorijuma u Windows `%TEMP%\OrdumStudios\master-system-qa\...`;
- [ ] `MASTER-SYSTEM-QA-01B` ostaje za authenticated/mutating production regression: live booking, admin calendar, staff workflow, Google Calendar, production recipient email, cron i puni cross-tenant test;
- [ ] production contact-form Resend smoke, mobile preview booking guard, migration `029` odluka i formalni read-only DB verification output za migraciju `032` ostaju zasebno otvoreni.

- [x] `ORDUM-ADMIN-IA-01A` uvodi centralni typed admin navigation registry i uklanja paralelnu hardkodovanu navigation istinu iz `AdminShell`-a;
- [x] desktop owner/manager panel je grupisan na jasne kategorije i ručni desktop browser acceptance je prihvaćen — kategorije staju na jedan ekran i trenutni UI nema blocker;
- [x] postojeće admin rute, package gate odluke, review attention badge, multi-tenant izbor, auth, booking domen, baza i migracije nisu menjani;
- [x] ciljani ESLint, TypeScript i contract testovi, kao i kompletan `npm run check`, prošli su nakon migracije zastarelih source-contract testova na centralni registry;
- [x] mobile primarna navigaciona infrastruktura `Danas | Kalendar | Klijenti | Više` postoji u source-u;
- [ ] mobile browser acceptance nije izvršen i ostaje eksplicitno odložen za kasniji admin UI/polish ciklus;
- [ ] `PLATFORM-GROWTH-ARCHITECTURE-01` je sledeći konkretan milestone: read-only audit postojeće availability/SQL osnove, discovery/marketplace query contract, SEO/blog content graph, grad–usluga landing stranice i merljiv redirect ka tenant booking toku;
- [ ] Google Business Profile, fiskalizacija, knjigovodstvo, lager i ostale integracije ostaju opcioni budući moduli; sada se ne tretiraju kao hitni launch blocker;
- [ ] dorada platformske landing stranice sledi nakon growth architecture audita, kako bi positioning i CTA pratili stvarne podržane poslovne modele.

- [x] `ORDUM-PRODUCT-LADDER-01A` uvodi odvojene registry-je za feature rollout, komercijalne ponude i Ordum platform level-e bez izmene postojećeg `PRODUCT_PACKAGES` entitlement sloja;
- [x] rollout contract razlikuje `live`, `beta`, `coming_soon`, `research` i `retired`, tako da postojanje tehničkog entitlement-a više nije isto što i javno obećana spremnost funkcije;
- [x] v1 komercijalna ponuda definiše `Ordum Launch Partner` i ograničenu `Founding Partner` ponudu, uz infrastrukturu za subscription, pilot, custom quote, pay-per-lead, commission i hybrid modele;
- [x] platform progression je zaključan kao šest nivoa: Digitalni salon, Growth Platform, Local Discovery, Salon Operations, Business OS i Regionalna mreža;
- [x] Level 1 je označen kao otključan, Level 2 kao aktivan, a kasniji nivoi ostaju zaključani dok ne ispune definisane uslove;
- [x] ciljani ESLint, ciljani Vitest i kompletan `npm run check` prošli su;
- [x] milestone nije menjao landing UI, admin/tenant UI, bazu, migracije, booking, auth, Google Calendar, email runtime ili postojeće tehničke pakete;
- [ ] `PLATFORM-GROWTH-ARCHITECTURE-01` je sledeći konkretan milestone i počinje read-only auditom availability, lokacija, service taxonomy, SEO/sitemap i redirect/attribution osnove;
- [ ] nakon audita sledi `PLATFORM-LANDING-02`, pa blog/content foundation i `SVILAJNAC-DISCOVERY-MVP-01`;
- [ ] cene, statusi i prioriteti ostaju v1 proizvodna odluka i mogu se menjati kada realni klijenti, prodaja ili tehnička ograničenja daju bolji signal.

- [x] `PLATFORM-GROWTH-ARCHITECTURE-01A` završava read-only audit postojećeg tenant catalog, availability, booking, SEO, sitemap i public-route baseline-a;
- [x] potvrđeno je da `get_available_slots` podržava sve eligible zaposlene kada je `employee_id = null`, ali ostaje striktno vezan za jedan `business_id` i jedan tenant `service_id`;
- [x] potvrđeno je da trenutni localized `city/country` tekst i tenant-specifični service UUID/slugs nisu dovoljni za pouzdan cross-tenant discovery bez canonical location i canonical service sloja;
- [x] typed discovery contract zaključava marketplace opt-in, aktivno service mapiranje, earliest-available sortiranje i tenant booking handoff bez paralelnog booking engine-a;
- [x] typed redirect/preselection contract koristi `book`, `serviceId`, `employeeId`, `startsAt` i pseudonymous `ordum_ref`, uz obaveznu buduću server-side revalidaciju termina;
- [x] SEO contract zaključava blog, guide, city i city-service rute, conditional inventory indeksiranje, runtime filtere van canonical URL-a i `noindex` redirect rutu;
- [x] attribution contract ne dozvoljava customer ime, telefon, email, napomenu ili raw IP u growth event dimenzijama;
- [x] ciljani ESLint, ciljani Vitest, kompletan `npm run check` i `git diff --cached --check` prošli su;
- [x] ručni browser acceptance nije primenljiv jer 01A ne uvodi UI, javnu rutu, API runtime, bazu ili migraciju;
- [x] milestone ne uvodi marketplace runtime, blog UI, cross-tenant query, landing izmenu, booking izmenu ili duplicate `/saloni/[businessSlug]` profil;
- [ ] `PLATFORM-GROWTH-ARCHITECTURE-01B` je sledeći konkretan milestone: canonical location registry, canonical service registry, početni `rs:svilajnac` i `barber:musko-sisanje` seed contract i mapping policy bez DB migracije;
- [ ] nakon 01B sledi `PLATFORM-LANDING-02`, zatim `CONTENT-FOUNDATION-01`, `DISCOVERY-DATA-FOUNDATION-01` i `SVILAJNAC-DISCOVERY-MVP-01`.

- [x] `DOCS-ORDUM-README-01` zamenjuje zastareli root README stabilnim Ordum Studios projektnim vodičem;
- [x] README sada razlikuje tehničke pakete, komercijalne ponude i rollout statuse, prikazuje Ordum level mapu i upućuje na versioned Product Ladder i Growth Architecture dokumente;
- [x] uklonjene su zastarele tvrdnje da tržišni naziv i domen nisu izabrani, da je root privremeni demo hub i da je stara `backup/theme-core-barber-beta` grana aktivna;
- [x] dokumentovani su aktuelni tenant/admin/staff/platform-admin/growth slojevi, lokalni setup, QA workflow, security pravila i production domen `ordumstudios.com`;
- [x] docs-only promena ne menja runtime, UI source, booking, bazu, migracije ili provider integracije;
- [x] README payload, interni dokumentacioni linkovi i `git diff --cached --check` validirani su;
- [ ] `PLATFORM-GROWTH-ARCHITECTURE-01B` ostaje aktivni sledeći milestone na grani `milestone/platform-growth-architecture-01b`.

- [x] `PLATFORM-GROWTH-ARCHITECTURE-01B` uvodi source-only canonical registry i mapping policy za prvi Ordum local discovery slice;
- [x] početni canonical location je `rs:svilajnac`, sa Latin i Cyrillic alias resolution podrškom;
- [x] početni canonical service je `barber:musko-sisanje`, sa namerno uskim aliasima za muško šišanje;
- [x] generičko `šišanje` se ne mapira automatski jer je semantički preširoko;
- [x] Serbian lookup normalizacija podržava trim, lowercase, ćirilica→latinica transliteraciju, dijakritike, `đ`→`dj` i stabilan slug format;
- [x] alias pogodak pravi samo `suggested` mapping; ne može automatski da postane `approved` ili discoverable;
- [x] discovery publication zahteva human review, reviewer/timestamp, aktivnu canonical uslugu, tenant opt-in, aktivan i objavljen tenant i aktivnu tenant uslugu;
- [x] ciljani ESLint, ciljani Vitest `7/7`, kompletan `npm run check` i `git diff --cached --check` prošli su;
- [x] ručni browser acceptance nije primenljiv jer 01B ne uvodi UI, javnu rutu, API runtime, bazu ili migraciju;
- [x] milestone ne menja `businesses`, tenant localized lokaciju, `services`, availability, booking, landing, sitemap, admin UI, RLS ili migracije;
- [ ] `PLATFORM-LANDING-02` je sledeći konkretan milestone: landing koristi Product Ladder registry, transparentno prikazuje LIVE/BETA/COMING SOON i vodi ka Launch Partner prodajnom toku;
- [ ] nakon landing closeout-a sledi `CONTENT-FOUNDATION-01`, zatim `DISCOVERY-DATA-FOUNDATION-01` i `SVILAJNAC-DISCOVERY-MVP-01`.

- [x] `PLATFORM-LANDING-02A` uklanja direktno javno predstavljanje internih `PRODUCT_PACKAGES` entitlement paketa i koristi `COMMERCIAL_OFFERS` kao komercijalni izvor istine;
- [x] landing prikazuje `Ordum Launch Partner`, ograničeni `Ordum Founding Partner` i quote-only `Ordum Signature` bez izmišljenih cena ili neproverenih obećanja;
- [x] rollout površina transparentno razdvaja `LIVE`, managed `BETA` i `COMING SOON`; research funkcije nisu predstavljene kao aktivna prodajna garancija;
- [x] svih šest Ordum nivoa renderuje se iz `PLATFORM_LEVELS`, sa `Digitalni salon` kao otključanim, `Growth Platform` kao aktivnim i kasnijim nivoima kao zaključanim;
- [x] nova `#ponude` sekcija zadržava backward-compatible `#paketi` anchor i ne prekida stare deep linkove ili legacy acceptance contract;
- [x] primarni landing showcase je `Heritage Barber Demo` + `Lumière Studio`; `Atelier Luna Nails` ostaje aktivan tenant, ali nije deo primarnog showcase para;
- [x] Lumière koristi shared hostname boundary sa slugom `lumiere-studio` i zaseban luxury editorial preview umesto preimenovane Nails kartice;
- [x] ciljani ESLint, ciljani landing Vitest testovi, kompletan `npm run check` i `git diff --cached --check` prošli su;
- [x] ručni desktop/mobile browser pregled i završni Lumière polish prihvaćeni su bez blocker-a;
- [x] milestone ne menja tenant booking, availability, admin/staff/platform-admin tokove, bazu, RLS, migracije, contact API, Resend runtime ili product-strategy registry vrednosti;
- [x] detaljan implementation i acceptance zapis nalazi se u `docs/milestones/PLATFORM-LANDING-02.md`;
- [ ] sledeći docs-only milestone je `ORDUM-WORKSPACE-NETWORK-ROADMAP-01`: zaključava centralni Workspace AppShell, modularni App Registry, Ordum Network granicu, dve PWA identity površine, role/entitlement model i migracioni put postojećeg `/admin` panela;
- [ ] prvi code milestone nakon novog roadmap-a je `ORDUM-WORKSPACE-APPSHELL-01`: centralni launcher i registry-backed aplikacije, uz `Studio` adapter koji koristi postojeći admin bez velikog route rewrite-a;
- [ ] `ORDUM-PWA-FOUNDATION-01` sledi nakon stabilnog AppShell-a i uvodi odvojene Workspace/Network manifeste, installability, safe caching granice i kasniji TWA/Capacitor put;
- [ ] `CONTENT-FOUNDATION-01`, `DISCOVERY-DATA-FOUNDATION-01` i `SVILAJNAC-DISCOVERY-MVP-01` ostaju važeći pravci i biće uklopljeni u novi Workspace + Network master redosled, ne brišu se niti predstavljaju kao završeni.

- [x] `ORDUM-WORKSPACE-NETWORK-ROADMAP-01` zaključava dve glavne korisničke površine: privatni `Ordum Workspace` i javni `Ordum Network`;
- [x] Workspace koristi jednu aplikaciju za owner/manager/staff i buduće poslovne role; ne pravi se poseban mobilni binary po roli;
- [x] centralni Workspace App Registry određuje route, rollout status, release policy, role, entitlement i dependency uslove;
- [x] postojeći `/admin` ostaje LIVE `Studio` aplikacija i ne prepisuje se u prvom AppShell ciklusu;
- [x] `Content` je prvi planirani novi Workspace modul; `Finance`, `Operations` i `Store` ostaju research dok realni korisnici ne potvrde scope i prioritet;
- [x] Network počinje kao web/PWA discovery i booking-handoff površina, bez paralelnog booking engine-a;
- [x] arhitektura ostaje modularni monolit dok stvarni scaling, provider ili compliance signal ne opravda izdvajanje servisa;
- [x] PWA se uvodi nakon stabilnog AppShell-a kroz zaseban Workspace i Network manifest identitet, sa strogim cache/privacy granicama;
- [x] Android TWA i kasniji Capacitor ostaju progresivni distribucioni put, ne trenutni rewrite;
- [x] tenant podaci ostaju vlasništvo salona, dok canonical taxonomy, discovery indeks, attribution i platform-wide moderation pripadaju Ordum platformi;
- [x] `CONTENT-FOUNDATION-01`, `DISCOVERY-DATA-FOUNDATION-01` i `SVILAJNAC-DISCOVERY-MVP-01` uklopljeni su u širi Workspace + Network redosled;
- [x] detaljan master plan nalazi se u `docs/architecture/ORDUM-WORKSPACE-NETWORK-ROADMAP-01.md`;
- [ ] prvi code milestone je `ORDUM-WORKSPACE-APPSHELL-01A`: source-only app registry, server-side visibility resolver, route contract i testovi bez UI-ja, baze ili migracije;
- [ ] zatim sledi `ORDUM-WORKSPACE-APPSHELL-01B`: tenant-aware `/workspace` launcher i Studio adapter ka postojećem `/admin`;
- [ ] nakon stabilnog shell-a sledi `ORDUM-PWA-FOUNDATION-01`, pa Content, Network shell, discovery data i Svilajnac MVP.

- [x] `ORDUM-WORKSPACE-APPSHELL-01A` uvodi jedan typed source of truth za `studio`, `content`, `finance`, `operations` i `store`;
- [x] `Studio` je jedina LIVE Workspace aplikacija; `Content` je pošteno `COMING SOON`, dok `Finance`, `Operations` i `Store` ostaju `RESEARCH`;
- [x] Workspace role contract koristi postojeće tenant role `owner`, `manager` i `staff`; Platform Admin nije tenant Workspace aplikacija;
- [x] role-specific route contract zadržava postojeće tokove: owner/manager `Studio` vodi na `/admin`, a staff `Studio` na `/staff`;
- [x] registry koristi postojeće Product Strategy rollout/release-policy tipove i postojeći Product Package entitlement sloj umesto paralelnog RBAC ili package sistema;
- [x] owner/manager `Studio` zahteva `booking.management`, a staff `Studio` zahteva `staff.portal`;
- [x] čist visibility resolver razlikuje `available`, `locked` i `hidden` odluke za role, package, dependency, managed beta, coming-soon, research, retired i hidden-release granice;
- [x] research aplikacije su podrazumevano skrivene i mogu se eksplicitno prikazati samo kao zaključan interni signal;
- [x] `server-only` entrypoint priprema budući `/workspace` composition root bez učitavanja Supabase-a, navigacionog redirecta ili nove auth sesije u 01A;
- [x] ciljani ESLint, ciljani Vitest, kompletan `npm run check` i `git diff --cached --check` prošli su u završnom REV3 installer toku;
- [x] ručni browser acceptance nije primenljiv jer milestone ne uvodi `/workspace` rutu, novi UI, manifest, service worker ili runtime ponašanje;
- [x] milestone ne menja `/admin`, `/staff`, booking, availability, customer podatke, bazu, RLS, migracije, Product Package registry ili Product Strategy registry;
- [x] detaljan implementation i acceptance zapis nalazi se u `docs/milestones/ORDUM-WORKSPACE-APPSHELL-01A.md`;
- [ ] sledeći milestone je `ORDUM-WORKSPACE-APPSHELL-01B`: tenant-aware `/workspace` launcher, server-side role/package resolution, Studio adapter ka postojećem `/admin` ili `/staff` i pošten locked/coming-soon prikaz;
- [ ] 01B zahteva desktop i mobile browser acceptance, ali ne radi veliki admin route rewrite, novu bazu ili PWA service worker;
- [ ] nakon stabilnog 01B shell-a sledi `ORDUM-PWA-FOUNDATION-01`.

- [x] `ORDUM-WORKSPACE-APPSHELL-01B` uvodi privatnu `/workspace` rutu i `/workspace/login` selector koji koristi postojeće admin i staff prijavne tokove bez nove lozinke ili paralelne sesije;
- [x] centralni `server-only` Workspace context adapter koristi postojeći `AdminContext`, `StaffContext`, aktivni tenant i `ProductPackageAccess`;
- [x] owner/manager Workspace prikazuje LIVE `Studio` i zaključani `Content` sa poštenim `COMING SOON` statusom;
- [x] staff Workspace prikazuje samo LIVE `Studio`; owner/manager Content kartica i research moduli nisu dostupni staff kontekstu;
- [x] role-specific Studio adapter zadržava postojeće rute: owner/manager vodi na `/admin`, a staff na `/staff`;
- [x] postojeći admin i staff shell imaju eksplicitne `Ordum Workspace` ulaze bez izmene admin navigation registry-ja ili staff permission modela;
- [x] direktni `/workspace` proverava postojeći admin pa staff identity, dok eksplicitni `context=admin|staff` ne prelazi automatski u drugi membership kontekst;
- [x] privremena lozinka, izbor aktivnog salona i staff setup-required guardovi ostaju na postojećim rutama;
- [x] `/workspace` i `/workspace/login` su privatne `noindex, nofollow, noarchive, nosnippet` površine;
- [x] ciljani ESLint, ciljani Vitest, kompletan `npm run check` i `git diff --cached --check` prošli su;
- [x] ručni funkcionalni desktop/mobile browser acceptance prošao je: anonymous redirect/login selector, owner/manager launcher, staff launcher, Studio deep linkovi, Content locked state, public-site link i responsive prikaz rade bez blocker-a;
- [x] trenutni vizuelni dizajn je prihvaćen samo kao funkcionalni foundation, ne kao finalni UX standard;
- [ ] budući Workspace visual polish treba da prati jednostavniji Citrix Workspace smer: kompaktniji app grid, manje hero prostora, jasnija hijerarhija i brži ulaz u aplikacije;
- [x] milestone ne menja booking, availability, bazu, RLS, migracije, Product Package registry, Product Strategy registry, PWA manifest, service worker ili Network runtime;
- [x] detaljan implementation i acceptance zapis nalazi se u `docs/milestones/ORDUM-WORKSPACE-APPSHELL-01B.md`;
- [ ] sledeći milestone je `ORDUM-DOCUMENTATION-IA-01`: skraćuje operativni `ROADMAP.md`, uvodi jasan current-status dokument i premešta završenu istoriju u arhivu bez gubitka milestone evidencije;
- [ ] posle dokumentacionog cleanup-a sledi `ORDUM-PWA-FOUNDATION-01`.

### Pre-closeout implementation checkpoint

```text
35a085f3131825b7160fb862c14778a8052798b5
feat(theme): refine barber visual experience and category media
```

### Potvrđeni Barber release

```text
a690bd0f055c0541d31c711047d664f5015e38f5
feat(theme): complete barber pilot visual experience
tag: barber-v2-pilot-01
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
10. `AI-CONTENT-ASSIST-FOUNDATION-01` — application foundation završen i pushovan;
11. `CONTENT-STARTER-PACKS-01A` — završen i pushovan;
12. `CONTENT-STARTER-PACKS-01B` — visible builder i atomski draft provisioning validirani i staged;
13. `DEMO-THEME-EDITORIAL-01`;
14. `DEMO-THEME-BARBER-01`;
15. `DEMO-THEME-NAILS-01`;
16. `CLIENT-CONTENT-INTAKE-01`;
17. `CLIENT-PREVIEW-SHARING-01`;
18. `PLATFORM-ADMIN-END-TO-END-REVIEW-02`;
19. `DEMO-DATA-LANDING-01`;
20. `MASTER-SYSTEM-QA-01`;
21. `PREVIEW-SOFT-LAUNCH-GATE-01`.

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

### AI-CONTENT-ASSIST-FOUNDATION-01 — završen i pushovan

- [x] 01A domain i provider boundary završen i pushovan;
- [x] 01B guarded invocation i surface policy završeni i pushovani;
- [x] 01C-A auth adapters i request boundary završeni i pushovani — `07e624694878c14412ad5415207e294bd7d25cc7`;
- [x] 01C-B internal routes i Google review context završeni i pushovani — `1cb5987df0b65e1c4205b8052b7c8081720123c7`;
- [x] AI prevodi su u prvom rollout-u samo Platform Admin alat;
- [x] tenant AI je u prvom rollout-u samo Google review reply draft uz povezanu integraciju;
- [x] tenant content translation i non-Google AI reply surface ostaju blokirani;
- [x] tenant scope, surface, package, permission, integration, review source i quota guard;
- [x] task-to-entitlement mapping za content translation i review reply draft;
- [x] Groq server provider sa modelom `openai/gpt-oss-20b`;
- [x] JSON Schema draft output bez reasoning payload-a;
- [x] svaki rezultat zahteva ručnu potvrdu i ne dozvoljava auto-apply;
- [x] private `GROQ_API_KEY` server granica;
- [x] provider sloj bez Supabase write operacija;
- [x] nova `tenant.content.translate` Platform Admin permission;
- [x] Sales, Launch Manager i Super Admin imaju translation permission, IT ostaje read-only;
- [x] tenant Google reply auth koristi isključivo aktivni owner/manager tenant context;
- [x] privremena lozinka i nerešen tenant selection blokiraju AI tok;
- [x] strogi odvojeni translation i review request contracti;
- [x] tenant request ne prihvata business ID, review tekst, task ili request ID;
- [x] 16 KiB body limit i postojeći PII-safe request-ID helper;
- [x] dve fizički odvojene interne rute:
  - `POST /api/platform-admin/ai/content-translation`;
  - `POST /api/admin/reviews/google/reply-draft`;
- [x] nema `/api/admin/ai` niti generic content-assist tenant rute;
- [x] review query zahteva isti `reviewId + business_id`;
- [x] Google connection query zahteva isti `business_id + provider=google`;
- [x] originalni review tekst i source dolaze isključivo iz server-loaded reda;
- [x] non-Google source i disconnected integracija ostaju blokirani u invocation guard-u;
- [x] stabilan HTTP status i response envelope sa `X-Request-ID`;
- [x] 01C-C izdvaja `createAiContentAssistInternalApiHandlers`;
- [x] production `internal-api-server.ts` ostaje server-only composition root sa realnim auth, Supabase, usage, invocation i monitoring adapterima;
- [x] controlled Request/Response runtime proverava stvarni parser, sequencing, status mapping, JSON envelope i request-ID header;
- [x] pokriveni runtime statusi: 200, 400, 401, 403, 404, 413, 500, 503 i 504;
- [x] auth failure zaustavlja review loader;
- [x] missing/cross-tenant review zaustavlja invocation;
- [x] storage i provider greške ne vraćaju raw detalje;
- [x] success ostaje `draft`, `requiresHumanApproval=true` i `autoApplyAllowed=false`;
- [x] ciljani 01C-C testovi, TypeScript i kompletan `npm run check` prošli;
- [x] 01C-C nema content write, Google reply publish, usage increment, migraciju ili live provider smoke;
- [x] application foundation je zatvoren;
- [x] 01C-C commit i push završeni — `441a0fa2deb414a8c546b8e1a99b4c39daedc9da`.

Detaljan 01A zapis: `docs/milestones/AI-CONTENT-ASSIST-FOUNDATION-01A-DOMAIN-PROVIDER-BOUNDARY.md`.

Detaljan 01B zapis: `docs/milestones/AI-CONTENT-ASSIST-FOUNDATION-01B-GUARDED-INVOCATION.md`.

Detaljan 01C-A zapis: `docs/milestones/AI-CONTENT-ASSIST-FOUNDATION-01C-A-AUTH-REQUEST-BOUNDARY.md`.

Detaljan 01C-B zapis: `docs/milestones/AI-CONTENT-ASSIST-FOUNDATION-01C-B-INTERNAL-ROUTES.md`.

Detaljan 01C-C closeout: `docs/milestones/AI-CONTENT-ASSIST-FOUNDATION-01C-C-RUNTIME-CLOSEOUT.md`.

Kontrolisani runtime runbook: `docs/qa/AI-CONTENT-ASSIST-01C-C-RUNTIME-SMOKE.md`.

### AI-CONTENT-ASSIST-USAGE-01 — odložen activation milestone

- [ ] persistence mesečnog usage-a;
- [ ] atomic reservation i increment;
- [ ] concurrency-safe quota enforcement;
- [ ] recovery za provider failure posle reservation-a;
- [ ] usage audit bez raw prompt/review sadržaja;
- [ ] aktivirati pre plaćene produkcione quota primene.

Do tada ostaje eksplicitni `rollout_read_only_zero` režim. Package entitlement se proverava, ali mesečni limit se ne troši i ne predstavlja kao production billing enforcement.

### CONTENT-STARTER-PACKS-01A — završen i pushovan

- [x] jedan zajednički domain contract umesto dupliranja sadržaja po temi;
- [x] universal core za booking defaults, draft politike, FAQ, website sekcije, SEO i media slotove;
- [x] module registry sa 21 modulom i required/recommended/optional/unsupported statusom po vertikali;
- [x] tačno deset starter packova:
  - `beauty-general`;
  - `hair-salon`;
  - `barber`;
  - `nails`;
  - `lashes-brows`;
  - `massage`;
  - `spa`;
  - `waxing`;
  - `laser-hair-removal`;
  - `solarium`;
- [x] ukupno 106 početnih usluga sa kategorijama, staff ulogama, intake pitanjima, trajanjem i bufferima;
- [x] sve usluge imaju `priceStatus=unset`;
- [x] nema numeričkih početnih cena;
- [x] radno vreme, booking defaults, politike, FAQ, SEO i website copy zahtevaju potvrdu vlasnika;
- [x] nema izmišljenih recenzija, zaposlenih ili fotografija;
- [x] massage, spa, laser i solarium imaju forward-compatible room/device resurse bez tvrdnje da je runtime resource booking aktivan;
- [x] laser zahteva health intake, consent, patch test, device/resource booking i aftercare module;
- [x] solarium zahteva health intake, consent i device booking;
- [x] `resolveStarterPackPreview` spaja universal core i vertical manifest;
- [x] required module se automatski bira;
- [x] unsupported module se odbija;
- [x] preview vraća duboku kopiju i ne mutira registry;
- [x] `applyAllowed=false`;
- [x] `publishAllowed=false`;
- [x] nema UI-ja, API rute, migracije, database write-a, apply-a ili publish-a;
- [x] dva legacy closeout testa više ne zavise od promenljive ROADMAP statusne reči `aktivan`;
- [x] ciljani starter-pack i legacy contract testovi prošli;
- [x] TypeScript i kompletan `npm run check` prošli;
- [x] 01A commit i push završeni — `6261d56e96a685905fe0a00f2357d26aa331104f`.

Detaljan zapis: `docs/milestones/CONTENT-STARTER-PACKS-01A-CONTRACT-REGISTRY-MANIFESTS.md`.

### CONTENT-STARTER-PACKS-01B — završen i pushovan

- [x] novi Platform Admin ekran `/platform-admin/businesses/new/starter-pack`;
- [x] ulazna kartica dodata na postojeći `/platform-admin/businesses/new`;
- [x] svih deset 01A vertical packova dostupno kroz server-side preview route;
- [x] required moduli ostaju zaključani;
- [x] recommended i optional moduli mogu da se izaberu;
- [x] svaka starter usluga može da se uključi ili isključi;
- [x] naziv, opis, trajanje i fixed/from/range cena mogu da se potvrde ili izmene;
- [x] podržane početne valute: RSD, EUR i CHF;
- [x] theme se bira iz postojećeg template registry-ja;
- [x] server ne prihvata client category payload ili client template config;
- [x] server ponovo učitava i materijalizuje trusted starter pack;
- [x] apply zahteva eksplicitnu potvrdu Platform Admina;
- [x] provisioning koristi postojeći server-only `provision_business` RPC;
- [x] jedan RPC atomski kreira business, booking settings, kategorije, usluge i template config;
- [x] stabilan `starterPack.applyKey` daje idempotent retry za isti slug;
- [x] postojeći slug sa drugim apply ključem vraća conflict i ne menja tenant;
- [x] nema `.update()` ili `.upsert()` existing-tenant toka;
- [x] novi salon ostaje draft;
- [x] nema automatskog publication status prelaza;
- [x] nema nove migracije;
- [x] nema browser Supabase write-a;
- [x] nema email, cron, review ili AI usage aktivacije;
- [x] V2 installer je uklonio CRLF/LF hash problem i rollback vraća tracked fajl direktno iz `HEAD`;
- [x] V3 installer je uklonio Next ESLint konflikt `module` → `moduleItem`;
- [x] ciljani provisioning i contract testovi prošli;
- [x] TypeScript i kompletan `npm run check` prošli;
- [ ] kontrolisani browser smoke treba da kreira jedan disposable draft tenant i potvrdi workspace + `?preview=1`;
- [x] 01B commit i push završeni — `de3351ed09550b39ffea754d0501820e8e7f947c`.

Detaljan zapis: `docs/milestones/CONTENT-STARTER-PACKS-01B-VISUAL-BUILDER-ATOMIC-PROVISIONING.md`.

### DEMO-THEME-EDITORIAL-01 — visual/demo acceptance validiran i staged

- [x] Hair Editorial ostaje registrovan kao `live`;
- [x] manifest sada iskreno navodi `reviews` sekciju i `supportsReviews=true`;
- [x] desktop renderer zadržava hero, services, team, gallery, reviews, contact i booking akcije;
- [x] mobile renderer zadržava app-like monolith prikaz, booking akcije i desktop switch;
- [x] desktop team sekcija ima localized empty state kada 01B tenant nema zaposlene;
- [x] mobile team sekcija ima localized empty state kada 01B tenant nema zaposlene;
- [x] gallery i shared reviews empty/preview stanja ostaju aktivna;
- [x] Editorial nema hardkodovani Lumière tenant ili Hair Luxury zavisnost;
- [x] Lumière desktop/mobile i zaključani gallery layout nisu menjani;
- [x] registry capability, architecture snapshot i stvarni renderer su usklađeni;
- [x] architecture contract ostaje pošten: `desktop=monolith`, `mobile=monolith`, `acceptance=pending`;
- [x] `isTemplateArchitectureAccepted(hair-editorial)` ostaje `false` dok se theme ne modularizuje;
- [x] visual/demo readiness i architecture acceptance su formalno razdvojeni;
- [x] ciljani registry, architecture, Editorial acceptance i utility testovi prošli;
- [x] TypeScript i kompletan `npm run check` prošli;
- [x] nema nove migracije, database write-a, auto-publish-a ili tenant mutation-a;
- [ ] kontrolisani browser test treba da kreira `Atelier Editorial Demo` kroz Starter Pack Business Builder;
- [ ] proveriti desktop preview, mobile preview i Lumière regression;
- [ ] Editorial commit i push čekaju eksplicitnu autorizaciju.

Detaljan zapis: `docs/milestones/DEMO-THEME-EDITORIAL-01.md`.

Browser runbook: `docs/qa/DEMO-THEME-EDITORIAL-01-ACCEPTANCE.md`.

Operativni pilot track:

```text
BARBER-PILOT-ONBOARDING-01
→ BARBER-V2-CONTACT-MAP-01
```

Paralelni code track:

```text
DEMO-THEME-NAILS-01B
→ DEMO-THEME-NAILS-01C-ACTIVATION
→ DEMO-THEME-NAILS-01D-DESKTOP-DENSITY
→ DEMO-THEME-NAILS-01E-MOBILE-NAVIGATION
→ završni Nails browser acceptance
→ MAIN-INTEGRATION-AUDIT-01
→ kontrolisana merge odluka
→ Nail Studio starter pack i demo tenant
```

Lumière je završena referentna tema, Editorial je drugi vizuelno spreman demo renderer, a Barber je prihvaćen kao pilot tema za prve stvarne salone. Barber mapa ostaje namerno odložena do nekoliko dana stabilnog aktivnog pilota, dok Nails code rad može da napreduje bez menjanja Barber, booking ili database granica.

### DEMO-THEME-BARBER-01 — pilot visual closeout objavljen

- [x] desktop Hero, Services, Team, Gallery, Reviews i Contact vizuelno prihvaćeni;
- [x] Services category navigator i category media ostaju povezani sa postojećim service booking tokom;
- [x] Team koristi dominantni portret, interaktivni roster i employee booking;
- [x] Gallery koristi dominantnu fotografiju, interaktivnu arhivu i kompaktni viewport layout;
- [x] Reviews koriste shared catalog adapter, rating summary, dominantnu recenziju i interaktivni indeks;
- [x] Contact koristi sekciju `05`, adresu, Google Maps link, booking CTA, kontakt i grupisano radno vreme;
- [x] zajednički `useBarberSectionReveal` i reduced-motion podrška koriste se kroz desktop sekcije;
- [x] mobile app-shell nije menjan;
- [x] booking, tenant podaci, baza, migracije i `main` grana nisu menjani;
- [x] ciljani acceptance testovi, Reviews contract testovi, TypeScript i kompletan `npm run check` prošli tokom primene;
- [x] ručni browser vizuelni test prihvaćen bez blocker-a;
- [x] trenutna stilizovana lokacija ostaje namerni pilot baseline;
- [x] commit `a690bd0f055c0541d31c711047d664f5015e38f5`, annotated tag `barber-v2-pilot-01` i push završeni;
- [ ] dva do tri salona iz Svilajnca ulaze u `BARBER-PILOT-ONBOARDING-01`;
- [ ] prava Google mapa ide kroz `BARBER-V2-CONTACT-MAP-01` kao prvi kontrolisani update aktivnog tenant-a.

Detaljan closeout: `docs/milestones/DEMO-THEME-BARBER-01-PILOT-CLOSEOUT.md`.

Pilot runbook: `docs/qa/BARBER-PILOT-ONBOARDING-01-RUNBOOK.md`.

### DEMO-THEME-NAILS-01A — modularna functional foundation implementirana

- [x] `nails-soft` registrovan kao četvrti renderer sa `businessType=nails`;
- [x] registry je tokom 01A pošteno počeo kao `availability=beta` i `architecture.acceptance=pending`;
- [x] desktop i mobile imaju zasebne modularne Header, Hero, Gallery, Services, Team, Reviews i Contact sekcije;
- [x] desktop ima zaseban Footer, a mobile zaseban safe-area BottomNav;
- [x] portfolio-first redosled stavlja stvarne radove ispred cenovnika usluga;
- [x] service i employee booking preselection ostaju povezani na shared callback contract;
- [x] Reviews koristi `CatalogReviewsSection`, a preview booking guard ostaje centralan u `SalonPlatform`;
- [x] Nails labels pokrivaju SR/MK/HR/SQ/EN/DE/FR;
- [x] tenant catalog, branding, empty states i fallback slike rade bez hardkodovanog demo tenant-a;
- [x] ciljani testovi, TypeScript, kompletan Vitest suite i production build prošli u kontrolisanom lokalnom okruženju;
- [x] nema database, migration, auth, tenancy, Barber ili booking domain izmene;
- [ ] ručni desktop/mobile browser acceptance;
- [x] `architecture.acceptance=passed` posle desktop/mobile visual acceptance-a;
- [ ] izlazak iz beta statusa ostaje zasebna rollout odluka posle kontrolisanog live update-a;
- [ ] Nail Studio starter pack preporuka i reprezentativan demo tenant ostaju sledeći paket.

Detaljan zapis: `docs/milestones/DEMO-THEME-NAILS-01.md`.

### DEMO-THEME-NAILS-01B — Nail Art Atelier visual replacement

- [x] postojeći desktop/mobile composition root-ovi i modularne sekcije ostaju granica;
- [x] floating beauty header i asimetrični polish-board hero menjaju rani Barber skelet;
- [x] lookbook koristi nepravilni editorial mosaic, a Services lacquer category selector i treatment menu;
- [x] Team koristi artist desk kompoziciju bez niza ovalnih Barber portreta;
- [x] Reviews ostaje iza `CatalogReviewsSection` i dobija namenski `nails-atelier` shared variant;
- [x] Contact postaje appointment card sa stvarnom adresom, Maps linkom, kontaktom, timezone-om i booking CTA;
- [x] mobile ima iste identitetske principe uz horizontalni lookbook, filtere tretmana i safe-area bottom nav;
- [x] SR/MK/HR/SQ/EN/DE/FR Nails copy je dopunjen bez hardkodovanog tenant sadržaja;
- [x] ciljani registry/architecture/i18n/Reviews testovi `92/92`, Nails acceptance/i18n testovi `9/9`, ciljani ESLint i TypeScript prošli;
- [x] završni `npm run check` (lint bez error-a, kompletan Vitest suite `839/839`, TypeScript i production build);
- [ ] ručni desktop browser acceptance na Nails demo tenant-u;
- [ ] ručni mobile browser acceptance i preview booking guard;
- [x] `architecture.acceptance=passed` nakon ručnog desktop/mobile visual acceptance-a;
- [ ] izlazak iz beta statusa ostaje zasebna rollout odluka.

Detaljan zapis: `docs/milestones/DEMO-THEME-NAILS-01.md`.

### DEMO-THEME-NAILS-01C-ACTIVATION — primenjeno za Nails preview

- [x] browser screenshot identifikovan kao `hair-editorial`, ne `nails-soft` renderer;
- [x] database blocker reprodukovan kao `businesses_template_key_supported_check` / PostgreSQL `23514`;
- [x] pripremljen `032_add_nails_theme_pack.sql` koji dodaje samo `nails-soft` postojećem skupu;
- [x] pripremljeni read-only verification i tenant-safe rollback runbook;
- [x] pending `029_platform_admin_rbac_foundation.sql` ostaje netaknut;
- [x] korisnik je zasebno odobrio primenu samo aktivne migracije `032`;
- [x] budući Nails starter pack preporučuje `nails-soft` umesto privremenog `hair-editorial`;
- [x] ciljani activation/provisioning testovi `31/31`, TypeScript i završni `npm run check` (`848/848` testova i production build);
- [x] uspešan Nails render potvrđuje da tenant više nije blokiran starim template-key constraintom;
- [ ] sačuvati formalni read-only DB verification output;
- [ ] završiti desktop i mobile visual/booking smoke.

DB runbook: `docs/qa/DEMO-THEME-NAILS-01C-DB-RUNBOOK.md`.

### DEMO-THEME-NAILS-01D-DESKTOP-DENSITY — desktop visual PASS

- [x] Nail Art Atelier identitet dobio je delimični ručni visual PASS;
- [x] desktop container sistem spušten je sa `1500px` na kompaktnu `1320px` granicu;
- [x] Hero, Gallery, Team, Reviews i Contact imaju manje naslove, kraći vertikalni ritam i kompaktnije empty state-ove;
- [x] Services više nema `Svi tretmani` filter koji odjednom renderuje do deset kartica;
- [x] prva stvarna kategorija je početni prikaz, a kategorije ostaju direktno interaktivne;
- [x] kompletan katalog ostaje dostupan kroz kompaktni CTA koji otvara postojeći shared booking flow;
- [x] mobile renderer nije menjan u ovom paketu;
- [x] ciljani Nails/activation/provisioning testovi `20/20`, ciljani ESLint i TypeScript `--noEmit`;
- [x] kompletan `npm run check`: lint bez error-a, `848/848` testova, TypeScript i production build;
- [x] ručni desktop browser visual acceptance na `atelier-luna-nails`.

### DEMO-THEME-NAILS-01E-MOBILE-NAVIGATION — mobile visual PASS

- [x] Nails composition root koristi `home`, `portfolio`, `services` i `contact` aktivne prikaze;
- [x] footer navbar menja prikaz kroz state umesto anchor scrolla;
- [x] centralna footer booking akcija ostaje na shared `onBook` callback-u;
- [x] home je zaključan na `100dvh` bez vertikalnog scrolla;
- [x] samo sadržajni tabovi koriste unutrašnji `overflow-y-auto`;
- [x] Gallery + Team ostaju dostupni u Portfolio prikazu, Contact + Reviews u Contact prikazu;
- [x] mobile Services počinje prvom stvarnom kategorijom i nema `Svi tretmani` masovni prikaz;
- [x] ciljani Nails acceptance testovi `8/8`, ciljani ESLint i TypeScript;
- [x] kompletan `npm run check` (lint bez error-a, `848/848` testova, TypeScript i production build);
- [x] ručni mobile browser visual acceptance;
- [ ] ručni preview booking guard smoke.

### DEMO-THEME-NAILS-01F-CLOSEOUT — završeno

- [x] `architecture.acceptance=passed` za modularni desktop i mobile renderer;
- [x] `availability=beta` ostaje rollout granica, ne architecture dug;
- [x] `Pređi na desktop` CTA radi, ali se nalazi pre Reviews sadržaja umesto na samom dnu;
- [x] CTA položaj je prihvaćen kao P2 non-blocker i namerno ostavljen za live-tenant rollout probu;
- [x] budući fix je ograničen na `NAILS-MOBILE-DESKTOP-CTA-LIVE-FIX-01`, bez booking ili database izmene;
- [x] 01F ciljani Nails/registry/architecture testovi `30/30`, TypeScript i kompletan `npm run check` (`848/848` i production build);
- [ ] ručni preview booking guard smoke ostaje otvoren.

Posle mobile PASS-a: zaseban `MAIN-INTEGRATION-AUDIT-01` koji samo meri branch/commit/migration razliku prema `main` i predlaže rollback-safe merge redosled. Bez merge-a, commita ili push-a u samom auditu.

### MAIN-INTEGRATION-AUDIT-01 — read-only PASS; source integration odobrena

- [x] remote `main` checkpoint je `a3b6bfe2de704d135e4b249dc260db08fb90b31f`;
- [x] `main` je tačan predak razvojne grane bez paralelne divergencije: `0 / 62` pre Nails checkpoint-a;
- [x] Nails release kandidat dodaje jedan commit, pa finalni odnos postaje `0 / 63`;
- [x] Nails staged paket pre integration docs dopune ima 39 fajlova i diff `+5515 / -32`;
- [x] finalni source kandidat prema starom `main` obuhvata 581 fajl, `+109978 / -8432`;
- [x] Git topologija dozvoljava isključivo `--ff-only` integraciju bez squashovanja istorije;
- [x] postojeći GitHub CI pokreće lint, test i build, bez Supabase migration komandi;
- [x] nezavisna Qwen evaluacija je uzeta kao production-readiness input: potvrđeni su domain, external observability, backup/restore, legal i Playwright booking E2E gapovi; zastarele su tvrdnje da nema runtime entitlement gate-ova, provisioning-a, monitoring osnove ili četvrte Nails teme;
- [x] source integracija u `main` je odvojena od komercijalnog production-launch gate-a;
- [x] vlasnik je eksplicitno odobrio commit, annotated tag, push razvojne grane, fast-forward `main` i push koji pokreće Vercel deployment;
- [ ] GitHub Actions i Vercel deployment rezultat ne predstavljati kao PASS dok stvarni remote status ne bude potvrđen;
- [ ] formalni read-only DB verification output za `032`, mobile preview booking guard i `MASTER-SYSTEM-QA-01` ostaju otvoreni;
- [ ] pending `029_platform_admin_rbac_foundation.sql` ostaje source-only i ne izvršava se tokom Git integracije.

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
- [x] production domen `ordumstudios.com`
- [ ] logo i favicon
- [ ] tipografija i boje
- [x] početni platform email branding `Ordum Studios` u test režimu

### 11. PLATFORM-LANDING-01

- [x] product brief i mirniji Ordum art direction zaključani
- [x] Qwen koncept pregledan kao nezavisna narativna referenca, bez preuzimanja kič/glow jezika i neproverenih tvrdnji
- [x] modularna desktop/mobile responsive implementacija pripremljena za browser acceptance
- [x] live Barber i Nails tenant kartice koriste shared hostname boundary
- [x] benefit, capability, onboarding i registry-backed pricing sekcije
- [x] FAQ i zaštićen Resend kontakt CTA bez database write-a
- [x] landing SEO naslov, opis, canonical i Ordum site metadata
- [x] inicijalni desktop/mobile visual acceptance potvrđen; landing je prihvaćen kao production baseline
- [ ] production contact-form smoke i potvrđena Resend isporuka
- [ ] P2 brand refinement: finalni Ordum logo, favicon i dodatno usklađivanje vizuelnog identiteta

Detaljan 01A implementation zapis: `docs/milestones/PLATFORM-LANDING-ORDUM-01A.md`.

### 12. PRODUCTION-DOMAINS-ENV-01

- [x] apex `ordumstudios.com` i `www` redirect
- [ ] `app`
- [x] wildcard tenant domeni `*.ordumstudios.com`
- [x] Vercel domain i Production ENV konfiguracija
- [ ] production Supabase odluka/setup
- [ ] production Resend domen, SPF, DKIM i DMARC
  - [x] Resend sender domen, SPF i DKIM verifikovani
  - [x] test booking → Resend → mailbox → webhook → admin delivery status
  - [ ] DMARC politika i finalni reply-to inbox
- [ ] Google OAuth callback URL-ovi
- [ ] cron secret i schedule
  - [x] `CRON_SECRET` konfigurisan bez aktivnog schedule-a
  - [ ] aktivni schedule tek posle kontrolisanog cron E2E testa
- [x] production rate-limit secret
- [ ] preview/production env separation

Detaljan 01B closeout: `docs/milestones/PRODUCTION-DOMAINS-ENV-01B.md`.

- [x] Windows source-contract testovi normalizuju CRLF/LF pre tekstualnih assertion-a

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
- Produkcioni domen je `ordumstudios.com`; finalna pravna i žig provera brenda ostaje otvorena.
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
Aktivna i production grana: main
Production source checkpoint: 96c5bdf029d3e29d1a0ccf8ae56cfbdaad4422ea
Checkpoint subject: feat(platform): launch Ordum Studios landing experience
Release tags: barber-v2-pilot-01, nails-v1-preview-01
Istorijska grana: backup/theme-core-barber-beta je zamrznuta i ne koristi se za novi rad
Razvojni model: kratka milestone grana iz latest main → QA → eksplicitno odobren merge u main
Production domen: https://ordumstudios.com
Tenant wildcard: https://<business-slug>.ordumstudios.com
Barber tenant: https://heritage-barber-demo.ordumstudios.com
Nails tenant: https://atelier-luna-nails.ordumstudios.com
Production email: Resend test-mode E2E PASS; pravi recipient režim nije aktiviran
Webhook: potpisani provider status se vidi kao Poslato Resendu i Isporučeno u admin delivery logu
MASTER-SYSTEM-QA-01A-R4: read-only local production baseline PASS; npm run check + health preflight + Playwright 18/18
MASTER-SYSTEM-QA-01B: pending authenticated/mutating production regression
Cron: secret postoji, aktivni schedule nije uveden
Google Calendar: novi production callback i cross-subdomain auth/cookie granica ostaju otvoreni
DMARC i finalni reply-to inbox: otvoreno
Migration 029: pending; ne koristiti običan supabase db push
Migration 032: primenjena; formalni read-only DB verification output ostaje da se zabeleži
Aktivni docs closeout: MASTER-SYSTEM-QA-01A-R4
Sledeći QA paket: MASTER-SYSTEM-QA-01B — authenticated/mutating production regression
Paralelni production hardening: PRODUCTION-DOMAINS-ENV-01C — email domain hardening i Google OAuth callback odluka
Commercial launch gate: backup/restore + legal + puni master QA + pravi pilot + eksplicitna odluka
```
