# DEMO-THEME-EDITORIAL-02 — MODULAR ARCHITECTURE CLOSEOUT

**Datum:** 16. jul 2026.
**Branch:** `backup/theme-core-barber-beta`
**Referentni standard:** Lumière / `hair-luxury`

## Cilj

Dovesti Hair Editorial do istog arhitektonskog standarda koji postavlja Lumière, bez menjanja Editorial vizuelnog identiteta.

Pre ovog milestone-a Editorial je bio vizuelno spreman, ali je imao dva velika monolith viewport renderera:

```text
desktop=monolith
mobile=monolith
acceptance=pending
```

Posle milestone-a stanje mora biti:

```text
desktop=modular
mobile=modular
acceptance=passed
```

## Lumière standard

Lumière ostaje referentna tema zato što ima:

- tanak viewport adapter;
- modularan desktop composition root;
- namenski optimizovan mobile renderer;
- zajednički booking contract;
- centralni locale i review sistem;
- tenant-neutralan sadržaj;
- odvojene i testabilne sekcije;
- dinamičko učitavanje samo aktivnog template/viewport paketa kroz `TemplateRenderer`.

Editorial ne kopira Lumière dizajn ili njegove module. Kopira arhitektonski princip.

## Desktop modularizacija

`HairEditorialDesktopTemplate.tsx` postaje tanak composition root.

Izdvojeni moduli:

1. `EditorialDesktopHeader`;
2. `EditorialDesktopHeroSection`;
3. `EditorialDesktopServicesSection`;
4. `EditorialDesktopTeamSection`;
5. `EditorialDesktopGallerySection`;
6. `EditorialDesktopReviewsSection`;
7. `EditorialDesktopContactSection`;
8. `EditorialDesktopFooter`.

Desktop zadržava isti section ID, booking callback, empty state, content limit i editorial layout.

## Mobile modularizacija

`HairEditorialMobileTemplate.tsx` postaje tanak composition root.

Izdvojeni moduli:

1. `EditorialMobileHeader`;
2. `EditorialMobileHeroSection`;
3. `EditorialMobileServicesSection`;
4. `EditorialMobileTeamSection`;
5. `EditorialMobileGallerySection`;
6. `EditorialMobileReviewsSection`;
7. `EditorialMobileContactSection`;
8. `EditorialMobileBottomNav`.

Mobile ostaje namenski viewport, a ne skupljeni desktop. Zadržava safe-area navigaciju, touch booking CTA, horizontalni team carousel i desktop switch.

## Optimizacija

`TemplateRenderer` već dinamički učitava samo aktivni template i viewport.

Unutar aktivnog Editorial viewporta sekcije se učitavaju kao stabilan composition graph. Namerno se ne uvodi dodatni async waterfall za svaku sekciju.

Dobijamo:

- manji i čitljiviji composition root;
- jasne dependency granice;
- lakše source-contract testiranje;
- izolovanije buduće izmene;
- bez dodatnih mrežnih waterfall zahteva;
- bez dupliranja booking, locale ili review logike.

## Starter Pack Business Builder

Editorial ostaje kompatibilan sa 01B Starter Pack Business Builder tokom draft preview toka.

Podržani su:

- hero fallback bez slike;
- starter services;
- team empty state;
- gallery empty state;
- shared reviews preview state;
- contact podaci;
- preview-safe booking granica.

## Architecture acceptance

Manifest postaje:

```text
availability=live
architecture.desktop=modular
architecture.mobile=modular
architecture.acceptance=passed
supportsBooking=true
supportsGallery=true
supportsReviews=true
```

`isTemplateArchitectureAccepted(hair-editorial)` mora vratiti `true`.

## Ne menja se

- Lumière renderer i zaključani gallery layout;
- Barber renderer;
- booking engine;
- database;
- migracije;
- tenant podaci;
- publication status;
- email ili cron;
- `ROADMAP.md`;
- `main` grana.

## Acceptance

- [x] desktop root je composition-only;
- [x] mobile root je composition-only;
- [x] svih osam desktop modula postoji;
- [x] svih osam mobile modula postoji;
- [x] booking callback granica je očuvana;
- [x] i18n i reviews koriste shared sistem;
- [x] empty states su očuvani;
- [x] safe-area mobile navigacija je očuvana;
- [x] manifest je `modular/modular/passed`;
- [x] architecture helper prihvata Editorial;
- [x] ciljani testovi prolaze;
- [x] TypeScript prolazi;
- [x] kompletan `npm run check` prolazi;
- [x] ROADMAP nije menjan;
- [x] commit i push nisu pokrenuti.

## Browser smoke — 16. jul 2026.

Potvrđeno:

- Starter Pack Business Builder preview API: `200`;
- atomski tenant provisioning: `201`;
- demo tenant: `atelier-editorial-demo`;
- template: `hair-editorial`;
- draft public preview radi preko `?preview=1`;
- preview booking write je namerno blokiran;
- desktop Editorial prikaz je ručno pregledan i prihvaćen bez blocker-a;
- generisan je koherentan demo visual set i tenant je zadržan kao stalni Editorial demo studio.

Nije predstavljeno kao završeno:

- puni live booking completion;
- admin calendar confirmation;
- email delivery;
- cross-tenant regression;
- Lumière full browser regression.

Poznati non-blocker:

- Starter Pack Builder uspešno kreira tenant, ali success kartica ostaje ispod duge forme bez automatskog scroll-a ili toast potvrde.

Sledeći korak:

- `DEMO-THEME-BARBER-01`, po Lumière modularnom standardu.
