# DEMO-PRODUCTION-READY-01

**Aktiviran:** 11. jul 2026.  
**Status:** aktivna privremena obilaznica originalnog roadmapa.  
**Bazni commit:** `0e7fcb269afb169e69bfd64fada57b4068c98ce4`

## Zašto postoji obilaznica

Funkcionalni multi-tenant core je dovoljno razvijen da dalji rad ne mora prvo da prolazi kroz svaki production-infrastructure milestone. Pre nastavka originalnog redosleda završava se demonstraciona verzija koja se može pouzdano prikazati potencijalnom salonu, partneru ili investitoru.

Originalni roadmap se ne briše, ne prepisuje i ne proglašava završenim. `BACKUP-RECOVERY-01`, pravni dokumenti, finalni brand, production domeni i puni pilot ostaju obavezni pre pravog komercijalnog launch-a.

## Cilj obilaznice

Dobiti stabilan production-like demo sa:

- završenim i međusobno konzistentnim javnim temama;
- istim desktop/mobile template contract-om;
- završenim osnovnim UI jezicima;
- realističnim demo tenantima i sadržajem;
- kompletnim booking tokom na desktopu i telefonu;
- jasnim platform landingom i demo izborom;
- deployment konfiguracijom pogodnom za javno predstavljanje;
- ciljanim master QA prolazom.

## Zaključani template standard

Svaka tema mora da ima:

- zaseban desktop renderer;
- zaseban mobile renderer;
- modularne desktop sekcije;
- namenski mobile shell ili modularne mobile ekrane;
- zajednički booking contract;
- service i employee preselection;
- tenant branding i sadržaj iz kataloga;
- hero, services, team, gallery, reviews i contact capability;
- loading, empty i error stanja;
- jedan zajednički i18n sistem;
- responsive i booking acceptance test.

Mobile prikaz nije samo sužen desktop layout.

## Demo track

### DEMO-I18N-01

- [x] `sr-Latn` dodat u formalni UI readiness contract;
- [x] legacy tenant sadržaj ostao kompatibilan kroz opcione content jezike i fallback;
- [x] eksplicitni početni UI paket: SR, MK, HR, SQ, EN, DE i FR;
- [x] kompletan globalni UI preveden na svih sedam jezika;
- [x] navigation, booking, contact, empty state i accessibility globalni tekstovi pokriveni;
- [x] readiness test zahteva sedam jezika za svaki globalni translation leaf;
- [x] HR/DE/FR označeni kao `uiTranslationReady`;
- [x] 14 Editorial i 26 Barber template labela prevedeno na sedam jezika;
- [x] Editorial i Barber duplicate translate helperi uklonjeni;
- [x] svi postojeći template renderer/util pozivi koriste centralni `t()`;
- [x] template translation readiness test i source audit;
- [x] automatizovani audit preostalih sistemskih i accessibility fallback tekstova;
- [x] booking/customer runtime translation smoke na sedam jezika;
- [x] Lumière, Editorial i Barber desktop/mobile source contract smoke;
- [x] locale fallback i ready-only language switcher runtime test;
- [x] detaljan QA zapis u `docs/qa/DEMO-I18N-01D-RUNTIME-SMOKE.md`;
- [ ] vizuelni browser pregled teksta i realno klikanje ostaju u pojedinačnim theme closeout-ima i `DEMO-DEPLOY-QA-01`.

### DEMO-THEME-ARCHITECTURE-01

- [x] dokumentovan file/folder i renderer contract;
- [x] Hair Luxury/Lumière potvrđen kao referentna arhitektura;
- [x] architecture status formalizovan u template registry-ju;
- [x] zajednička acceptance matrica za sve teme;
- [x] Editorial i Barber registrovani kao stvarni monoliti dok ne prođu svoje milestone-ove;
- [ ] Hair Editorial razbijen iz desktop/mobile monolita u `DEMO-THEME-EDITORIAL-01`;
- [ ] Barber Heritage razbijen iz desktop/mobile monolita u `DEMO-THEME-BARBER-01`.

### DEMO-THEME-LUMIERE-01

- [ ] detaljan desktop pregled;
- [ ] detaljan mobile pregled;
- [ ] svi UI jezici i fallback ponašanje;
- [ ] booking, empty, loading i error stanja;
- [ ] finalni responsive polish.

### DEMO-THEME-EDITORIAL-01

- [ ] modularni desktop;
- [ ] modularni mobile;
- [ ] reviews capability;
- [ ] i18n konsolidacija;
- [ ] finalni responsive i booking QA.

### DEMO-THEME-BARBER-01

- [ ] modularni desktop;
- [ ] modularni mobile;
- [ ] reviews capability;
- [ ] i18n konsolidacija;
- [ ] finalni visual polish;
- [ ] prelazak iz beta statusa tek posle acceptance-a.

### DEMO-THEME-NAILS-01

- [ ] zaseban nails vizuelni sistem;
- [ ] isti desktop/mobile contract;
- [ ] portfolio-first galerija;
- [ ] manicure, gel, nail art i pedicure demo sadržaj.

### DEMO-THEME-WELLNESS-01

- [ ] massage/spa vizuelni sistem;
- [ ] tretmani, trajanje i terapeuti;
- [ ] isti desktop/mobile contract.

### DEMO-THEME-BEAUTY-01

- [ ] lashes, brows, facial i beauty studio baza;
- [ ] preset pristup za različite beauty niše;
- [ ] isti desktop/mobile contract.

### STUDIOBIBI-PILOT-01

- [ ] novi Studio Bi&Bi tenant na zajedničkoj platformi;
- [ ] izabrana jedna završena platform theme;
- [ ] usluge prepisane i organizovane u zasebne kategorije;
- [ ] zaposleni, radno vreme, sadržaj i galerija uneseni kroz zajednički model;
- [ ] shared admin, booking, Calendar, email, monitoring i RLS;
- [ ] production baza bez automatskog pauziranja;
- [ ] preview QA pre povezivanja domena;
- [ ] `studiobibi.mk` DNS cutover sa rollback prozorom;
- [ ] najmanje nedelju dana realnog pilot rada.

Detaljan scope: `docs/milestones/STUDIOBIBI-PILOT-01.md`.

### DEMO-DATA-LANDING-01

- [ ] reprezentativan demo tenant za svaku završenu vertikalu;
- [ ] realistične usluge, zaposleni, galerija i reviews;
- [ ] platform landing sa demo tenant karticama;
- [ ] jasni CTA i feature objašnjenje.

### DEMO-DEPLOY-QA-01

- [ ] javni preview deployment;
- [ ] demo-safe environment konfiguracija;
- [ ] desktop/mobile booking smoke za svaki demo tenant;
- [ ] auth/admin/staff osnovni smoke;
- [ ] SEO, 404, loading i error pregled;
- [ ] cross-tenant regression;
- [ ] finalni demo launch gate.

## Šta nije deo obilaznice

Obilaznica ne zatvara:

- backup i proverljiv restore;
- privacy/legal dokumentaciju;
- finalno tržišno ime i pravnu proveru;
- production email domen i DNS autentikaciju;
- pravi Google OAuth production setup;
- nedelju realnog pilot korišćenja;
- billing i subscription sistem.

Nakon demo launch gate-a rad se vraća na originalni roadmap od `BACKUP-RECOVERY-01`.
