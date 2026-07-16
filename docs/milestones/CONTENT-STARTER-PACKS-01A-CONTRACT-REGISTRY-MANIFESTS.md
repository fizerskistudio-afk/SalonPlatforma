# CONTENT-STARTER-PACKS-01A — CONTRACT, REGISTRY AND ALL VERTICAL MANIFESTS

**Datum:** 16. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`

## Cilj

Napraviti jednu zajedničku starter-pack osnovu bez dupliranja sadržaja po temi i bez prerane database primene.

Sistem se deli na:

```text
Universal Core
  + Vertical Manifest
  + Optional Modules
  = Preview-only Starter Pack
```

Theme određuje izgled. Starter pack određuje početni sadržaj, service katalog, staff uloge, booking predloge, intake pitanja i potrebne media slotove.

## Podržane vertikale

01A isporučuje tačno jedan manifest za:

```text
beauty-general
hair-salon
barber
nails
lashes-brows
massage
spa
waxing
laser-hair-removal
solarium
```

Ukupni početni katalog sadrži 106 usluga.

## Universal Core

Svaki preview dobija zajedničke:

- booking defaults koji zahtevaju potvrdu vlasnika;
- cancellation, late arrival, no-show, children/guests, photo consent i health-information draft politike;
- osnovni FAQ;
- hero, about, services, benefits, team, gallery, reviews, booking i contact website draft sekcije;
- SEO template bez keyword spama;
- logo, hero, interior, team, category, gallery i social media slotove.

Universal sadržaj se ne kopira u svaki vertical manifest.

## Vertical manifest

Svaki manifest sadrži:

- kategorije usluga;
- početne usluge;
- staff uloge;
- intake pitanja;
- preporučeno trajanje i buffer;
- pricing mode;
- consultation flag;
- kompatibilne staff uloge;
- room/device resource reference kada je potrebno;
- vertical policies, FAQ, website copy, SEO i media dodatke;
- required, recommended, optional ili unsupported module map.

## Cena i poslovni podaci

Svaka početna usluga ima:

```text
priceStatus = unset
```

01A ne unosi numeričke cene.

Radno vreme, booking defaults, politike, SEO i copy ostaju predlozi ili draft i zahtevaju potvrdu vlasnika.

Starter pack ne kreira:

- izmišljene recenzije;
- izmišljene zaposlene;
- stock fotografije koje se predstavljaju kao stvarni salon;
- medicinska obećanja;
- garancije rezultata;
- automatski objavljen katalog.

## Modul registry

Zajednički module registry pokriva:

- aftercare;
- before/after gallery;
- bridal services;
- brow lamination;
- color consultation;
- consent;
- couples treatments;
- deposits;
- device booking;
- gift cards;
- health intake;
- kids services;
- lash extensions;
- loyalty;
- memberships;
- mens grooming;
- nail art;
- patch test;
- resource booking;
- service packages;
- walk-ins.

Modul može biti required, recommended, optional ili unsupported po vertikali.

## Resource-heavy vertikale

Massage, spa, laser i solarium imaju forward-compatible room/device resurse.

To ne znači da je runtime multi-resource booking već aktiviran.

- massage i spa modeluju treatment/couple room i kapacitete;
- laser modeluje uređaj i tretmansku sobu;
- solarium modeluje ležeći i stojeći uređaj;
- preview prikazuje upozorenje kada aktivacija zavisi od budućeg capability-ja.

## Safety granica

Laser starter pack zahteva health intake, consent, patch test, device booking, resource booking i aftercare module.

Solarium starter pack zahteva health intake, consent i device booking.

Tekstovi ne daju medicinsku dijagnozu, ne garantuju rezultat i ne zamenjuju kvalifikovano osoblje ili lokalna pravila.

## Preview resolver

`resolveStarterPackPreview` radi samo:

```text
preview → select → edit → confirm → apply
```

U 01A implementiran je samo preview deo.

Preview:

- spaja universal i vertical sadržaj;
- automatski bira required module;
- odbija unsupported module;
- vraća duboku kopiju;
- ne menja registry;
- ima `applyAllowed=false`;
- ima `publishAllowed=false`;
- zahteva owner confirmation.

## Sledeći korak

```text
CONTENT-STARTER-PACKS-01B
```

01B dodaje Platform Admin preview, izbor modula, edit i eksplicitno potvrđen apply u aktivni tenant, sa idempotency i zaštitom postojećeg sadržaja.

## ROADMAP proces

01A ne menja `ROADMAP.md`.

V2 application paket usklađuje tačno dva legacy closeout contract testa koja su bila vezana za promenljivu ROADMAP statusnu reč `aktivan`. Testovi zadržavaju proveru stabilnog AI milestone ID-a, bez pinovanja trenutnog statusa.

Posle code PASS-a generiše se zaseban full-file ROADMAP updater iz tačne pushovane AI foundation closeout verzije.

## Non-goals

01A ne dodaje:

- UI;
- API route;
- database migration;
- database insert/update/upsert;
- automatski apply;
- automatski publish;
- billing;
- package mutation;
- live media upload;
- commit ili push.

## Acceptance

- [ ] universal domain contract postoji;
- [ ] module registry postoji;
- [ ] svih 10 vertical manifest-a postoji;
- [ ] svih 106 starter usluga je validno povezano;
- [ ] cene ostaju unset;
- [ ] role, question i resource reference su validne;
- [ ] preview resolver spaja universal i vertical sloj;
- [ ] required modules se automatski biraju;
- [ ] unsupported module se odbija;
- [ ] preview ne mutira registry;
- [ ] nema database ili publishing boundary-ja;
- [ ] ciljani testovi prolaze;
- [ ] TypeScript prolazi;
- [ ] `npm run check` prolazi;
- [ ] ROADMAP nije menjan;
- [ ] nema commita ili push-a.
