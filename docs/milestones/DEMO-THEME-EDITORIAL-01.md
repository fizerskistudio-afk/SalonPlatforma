# DEMO-THEME-EDITORIAL-01 — ACCEPTANCE AND STARTER-PACK READINESS

**Datum:** 16. jul 2026.
**Status:** application paket pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`

## Cilj

Zatvoriti postojeći Hair Editorial theme kao drugi vizuelno spreman demo renderer, bez redizajna Lumière referentne teme i bez database izmene.

Hair Editorial već ima desktop i mobile renderer, hero, services, team, gallery, reviews, contact, locale switch i booking akcije.

## Registry usklađivanje

Pre milestone-a renderer prikazuje reviews, ali manifest ima:

```text
supportsReviews=false
sections bez reviews
architecture.acceptance=pending
```

Posle demo acceptance-a manifest mora imati:

```text
availability=live
architecture.desktop=monolith
architecture.mobile=monolith
architecture.acceptance=pending
supportsBooking=true
supportsGallery=true
supportsReviews=true
sections=hero,services,team,gallery,reviews,contact
```

`architecture.acceptance` ostaje `pending` dok se Editorial ne modularizuje. Ovaj milestone potvrđuje vizuelni/demo kvalitet, ne lažira modularnu architecture acceptance granicu.

## Starter Pack Business Builder kompatibilnost

01B može da kreira:

```text
starter pack: hair-salon
theme: hair-editorial
publication: draft
```

Pošto 01B još ne kreira tim i fotografije, Editorial mora podržati hero fallback, starter usluge, prazan team, praznu gallery, reviews empty state, kontakt i preview-safe booking CTA.

## Desktop i mobile acceptance

Desktop zadržava split hero i editorial tipografiju. Mobile zadržava app-like monolith prikaz i safe-area bottom navigation.

Oba viewporta moraju imati:

- services i direktni service booking;
- employee booking kada zaposleni postoji;
- localized team empty state;
- gallery empty state;
- reviews;
- contact;
- bez hardkodovanog tenant-a.

## Lumière granica

DEMO-THEME-EDITORIAL-01:

- ne menja Hair Luxury desktop ili mobile renderer;
- ne menja zaključani Lumière gallery layout;
- ne menja tenant podatke;
- ne objavljuje salon.

## Browser acceptance posle push-a

Starter Pack Business Builder koristi:

```text
business: Atelier Editorial Demo
slug: atelier-editorial-demo
starter pack: hair-salon
theme: hair-editorial
publication: draft
```

Proveravaju se workspace, desktop preview i mobile preview. Disposable tenant se ne kreira tokom installer testa.

## ROADMAP proces

Ovaj code paket ne menja `ROADMAP.md`. Posle code PASS-a pravi se zaseban full-file ROADMAP updater.

## Non-goals

Nema nove teme, migracije, database seed-a, auto-publish-a, email/cron aktivacije, content intake-a, promene `main` grane, commita ili push-a.

## Acceptance

- [ ] manifest je `live`, reviews-capable i pošteno `architecture.pending`;
- [ ] reviews capability odgovara rendereru;
- [ ] desktop i mobile team empty state postoje;
- [ ] booking, gallery, reviews i contact ostaju povezani;
- [ ] Lumière nije menjan;
- [ ] ciljani testovi, TypeScript i `npm run check` prolaze;
- [ ] ROADMAP nije menjan;
- [ ] nema commita ili push-a.
