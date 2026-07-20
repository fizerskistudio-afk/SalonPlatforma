# DEMO-THEME-NAILS-01 — MODULAR NAILS RENDERER

**Datum:** 20. jul 2026.
**Aktivni paket:** `DEMO-THEME-NAILS-01F-CLOSEOUT`
**Status:** `01C` je aktivirao `nails-soft`, `01D` je dobio desktop visual PASS, a `01E` mobile visual PASS za theme-owned tab navigaciju i početnu bez page scrolla. Architecture acceptance prelazi na `passed`; registry ostaje `beta` do kontrolisanog live-tenant update-a i šireg preview booking smoke-a.
**Branch:** `backup/theme-core-barber-beta`

## Cilj

Napraviti četvrti javni renderer kao zaseban portfolio-first Nail Studio identitet, bez prepakivanja Barber ili Editorial layouta i bez promene booking, tenant, auth ili database granica.

Nails tema koristi postojeći `PublicTemplateProps` contract, tenant catalog, centralni i18n, shared Reviews adapter i centralni preview booking guard.

## Vizuelni identitet 01B — Nail Art Atelier

- floating beauty header umesto pune trake;
- asimetrični polish-board hero umesto Barber split hero skeleta;
- nepravilni lookbook bez dominant-photo + archive kompozicije;
- lacquer category selector i treatment menu umesto generičkog card grida;
- artist desk sa asimetričnim kartama umesto niza ovalnih portreta;
- namenski `nails-atelier` Reviews variant iza `CatalogReviewsSection` adaptera;
- appointment card Contact umesto numerisane Barber contact kompozicije;
- mlečna podloga, berry akcent i lacquer swatches;
- portfolio se prikazuje pre cenovnika usluga;
- fotografije radova nose veći vizuelni prioritet od generičkog salonskog copy-ja;
- manicure, gel, nail art i pedicure ostaju stvarni catalog sadržaj, ne hardkodovani demo podaci.

Sekcijske oznake `01 /` do `05 /`, veliki simetrični serif headeri i ovalni card/archive ritam uklonjeni su iz Nails renderer-a. Acceptance test zaključava da se taj nasleđeni kompozicioni jezik ne vrati.

## Modularna arhitektura

Desktop i mobile imaju zasebne composition root fajlove i zasebne module za:

- Header;
- Hero;
- Portfolio / Gallery;
- Services;
- Team;
- Reviews;
- Contact;
- Footer ili mobile bottom navigation.

Root rendereri ostaju tanki i povezuju podatke iz `useCatalogData` sa namenskim sekcijama. Nails kod ne uvozi Lumière, Editorial ili Barber renderer module.

## Funkcionalne granice

- general booking CTA koristi `onBook`;
- service kartice koriste `onBookService`;
- nail artist kartice koriste `onBookEmployee`;
- preview booking ostaje blokiran centralno u `SalonPlatform`;
- Reviews ostaje na `CatalogReviewsSection` adapteru;
- empty states postoje za services, team, gallery i reviews;
- svih sedam spremnih UI locale-a imaju Nails labels;
- mobile ima namenski layout i safe-area bottom navigation, nije samo sužen desktop.

## Registry stanje

Tokom `01B`:

```text
key=nails-soft
businessType=nails
availability=beta
version=2
architecture.desktop=modular
architecture.mobile=modular
architecture.acceptance=passed
supportsBooking=true
supportsGallery=true
supportsReviews=true
```

`passed` beleži završene modularne desktop/mobile code granice i ručni visual acceptance. `beta` ostaje odvojena rollout odluka i ne predstavlja se kao produkcioni release.

## 01B browser povratna informacija

01A visual identity je ocenjen kao previše sličan ranom Barber pravcu, pa je 01B zamenio taj sistem. Pokušaj browser pregleda 01B na tenant-u `atelier-luna-nails` ipak nije renderovao Nails kod: Nail starter pack je još birao `hair-editorial`.

Ručni izbor `nails-soft` kroz Platform Admin Theme API vratio je PostgreSQL `23514` za `businesses_template_key_supported_check`. Neuspešan statement je rollbackovan i tenant je ostao na prethodnoj temi. Zbog toga screenshot Editorial renderera nije Nails visual acceptance i 01B browser stavke ostaju otvorene.

## 01C activation granica

- `supabase/migrations/032_add_nails_theme_pack.sql` dodaje samo `nails-soft` postojećem template-key constraintu;
- `supabase/verification/verify_nails_theme_pack.sql` je read-only dokaz sa eksplicitnim PASS markerom;
- Nail starter pack preporuka prelazi sa privremenog `hair-editorial` na `nails-soft`;
- source contract zaključava DB ključeve, read-only verification, pending `029` granicu i rollback runbook;
- migration source se ne izvršava u code installeru;
- korisnik je zasebno odobrio i primenio samo aktivnu migraciju `032`;
- uspešan `nails-soft` render potvrđuje uklanjanje activation blocker-a;
- formalni read-only DB verification output još treba sačuvati;
- ne ponavljati DB push niti dirati pending `029` granicu.

## 01D desktop density

Prvi stvarni `nails-soft` screenshotovi potvrđuju sopstveni Nail Art Atelier identitet, ali i preveliku campaign-page skalu:

- desktop sadržaj koristi kompaktnu `1320px` granicu umesto `1500px`;
- Hero, Gallery, Services, Team, Reviews i Contact dobijaju manje naslove i kraći vertikalni ritam;
- veliki empty state paneli više ne zauzimaju skoro ceo viewport;
- `Svi tretmani` se uklanja kao filter koji renderuje do deset service kartica;
- prva stvarna kategorija postaje početni Services prikaz;
- donji kompaktni CTA otvara shared booking flow sa kompletnim katalogom;
- nema nove public services rute i nema dupliranja catalog/preview/booking granica;
- mobile kod ostaje netaknut u `01D`.

Ručni desktop visual PASS za `01D` potvrđen je 20. jula 2026.

## 01E mobile navigation

`DEMO-THEME-NAILS-01E-MOBILE-NAVIGATION` koristi postojeće mobile module kao stvarne prikaze:

- Nails mobile ostaje namenski theme renderer, bez generic `MobileAppShell` import-a;
- početna je zaključana na jedan viewport bez vertikalnog scrolla;
- footer navbar menja aktivni `home`, `portfolio`, `services` ili `contact` prikaz umesto anchor scrolla;
- centralna footer akcija i dalje otvara postojeći shared booking flow;
- Portfolio prikaz sadrži galeriju i artist desk, Contact prikaz kontakt i Reviews;
- samo sadržajni prikazi imaju unutrašnji `overflow-y-auto` scroll;
- Services i na mobile-u počinje prvom stvarnom kategorijom, bez masovnog `Svi tretmani` prikaza;
- locale switch, service/employee booking, Reviews preview guard i desktop switch ostaju povezani na postojeće callback granice.

Posle mobile browser PASS-a radi se završni Nails acceptance, pa zaseban read-only audit razlike razvojne grane prema `main`. Merge, commit i push ostaju posebne eksplicitne odluke.

## 01F closeout i namerno odloženi live fix

Ručni mobile visual PASS potvrđen je 20. jula 2026. sa jednim prihvaćenim P2 non-blocker-om:

- `Pređi na desktop` CTA je trenutno iza Contact kartice, a ispred Reviews sadržaja;
- željena završna pozicija je na samom dnu Contact prikaza, posle Reviews;
- CTA ostaje funkcionalan i ne blokira navigaciju, booking niti tenant podatke;
- pozicija se namerno ne menja u closeout-u;
- fix se čuva kao prvi mali kontrolisani live-tenant theme update radi provere rollout, QA i rollback toka.

Predloženi budući paket: `NAILS-MOBILE-DESKTOP-CTA-LIVE-FIX-01`. Nema database ili migration izmene.

Nail Studio starter pack i reprezentativan demo tenant ostaju deo završnog Nails closeout-a, bez automatskog publish-a.

## Non-goals

- nema izvršavanja database ili Supabase migracije u code installeru;
- nema promene izvan uskog `businesses.template_key` constraint source-a;
- nema promene booking, auth ili tenancy domena;
- nema Barber Contact Map update-a;
- nema automatskog publish-a;
- nema promene `main` grane;
- nema commita, taga ili push-a bez zasebne autorizacije.

## Acceptance

- [x] modularni desktop renderer;
- [x] modularni mobile renderer;
- [x] portfolio-first redosled;
- [x] service i employee booking preselection;
- [x] shared Reviews i preview guard;
- [x] locale i empty-state contract testovi;
- [x] ciljani Vitest testovi;
- [x] TypeScript `--noEmit`;
- [x] `npm run check` (lint + `838/838` testova + TypeScript + production build);
- [x] 01B Nail Art Atelier visual replacement;
- [x] 01B desktop i mobile uklanjaju Barber sekcijske brojeve i archive ritam;
- [x] 01B koristi namenski shared `nails-atelier` Reviews variant;
- [x] 01B ciljani registry/architecture/i18n/Reviews testovi (`92/92`);
- [x] 01B Nails acceptance/i18n testovi (`9/9`);
- [x] 01B ciljani ESLint i TypeScript;
- [x] 01B kompletan `npm run check` (lint bez error-a, kompletan Vitest suite `839/839`, TypeScript i production build);
- [x] 01C activation blocker reprodukovan kao PostgreSQL `23514` na postojećem template-key constraintu;
- [x] 01C migration source, read-only verification i rollback runbook pripremljeni;
- [x] Nail starter pack preporuka prebačena na `nails-soft` u source-u;
- [x] 01C kompletan code check (lint bez error-a, kompletan Vitest suite `848/848`, TypeScript i production build);
- [x] korisnik odobrio i primenio samo migraciju `032`; tenant sada renderuje `nails-soft`;
- [x] prvi stvarni desktop pregled dao delimični PASS za Nails vizuelni identitet;
- [x] 01D desktop density source implementiran bez mobile izmene;
- [x] Services category-first prikaz i shared-booking CTA implementirani;
- [ ] formalni read-only DB verification output za `032`;
- [x] 01D ciljani Nails/activation/provisioning testovi `20/20`, ciljani ESLint i TypeScript;
- [x] 01D kompletan `npm run check` (lint bez error-a, `848/848` testova, TypeScript i production build);
- [x] 01D desktop browser visual acceptance;
- [x] 01E theme-owned mobile tab navigation source;
- [x] 01E home viewport bez vertikalnog page scrolla;
- [x] 01E category-first mobile Services;
- [x] 01E ciljani Nails acceptance testovi (`8/8`), ciljani ESLint i TypeScript;
- [x] 01E kompletan `npm run check` (lint bez error-a, `848/848` testova, TypeScript i production build);
- [x] 01E mobile browser visual acceptance;
- [x] poznati desktop-switch CTA položaj klasifikovan kao namerno odloženi P2 live fix;
- [x] architecture acceptance prebačen na `passed` uz zadržan `beta` rollout status;
- [x] 01F ciljani Nails/registry/architecture testovi (`30/30`), TypeScript i kompletan `npm run check` (`848/848` i production build);
- [ ] ručni preview booking guard smoke.
