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

- [x] `sr-Latn` dodat u formalni `UiLocale` contract;
- [x] `sr-Latn` označen kao spreman sistemski UI jezik;
- [x] test kompletnosti globalnih `sr-Latn`, `mk`, `sq` i `en` UI prevoda;
- [ ] audit template-specifičnih hardkodovanih labela;
- [ ] konsolidacija `t()`, editorial i barber translate helpera;
- [ ] nemački UI prevod;
- [ ] booking modal, empty/error/loading i accessibility tekstovi provereni po jeziku.

### DEMO-THEME-ARCHITECTURE-01

- [ ] dokumentovan file/folder template contract;
- [ ] Hair Luxury/Lumière potvrđen kao referentna arhitektura;
- [ ] Hair Editorial razbijen iz desktop/mobile monolita;
- [ ] Barber Heritage razbijen iz desktop/mobile monolita;
- [ ] zajednička acceptance matrica za sve teme.

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
