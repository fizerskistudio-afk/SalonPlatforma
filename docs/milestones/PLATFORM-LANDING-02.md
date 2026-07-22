# PLATFORM-LANDING-02

## Status

`02A` menja platformski landing iz tehničkog package prikaza u registry-backed product truth površinu.

## Problem prethodnog baseline-a

Landing je javno prikazivao interne `PRODUCT_PACKAGES` entitlement pakete kao komercijalne ponude.

To je stvaralo tri rizika:

1. tehnički paket je izgledao kao tržišna ponuda;
2. BETA mogućnosti su izgledale kao standardno uključene funkcije;
3. `operations_pro` copy je prikazivao naprednu analitiku i druge stavke bez oslanjanja na rollout status.

## Novi izvor istine

Landing sada koristi:

- `COMMERCIAL_OFFERS` za javne ponude;
- `PRODUCT_ROLLOUT_FEATURES` za LIVE/BETA/COMING SOON;
- `PLATFORM_LEVELS` za šest Ordum nivoa.

`PRODUCT_PACKAGES` ostaje tehnički entitlement sloj i ne prikazuje se kao javni cenovnik.

## Javni komercijalni model

### Ordum Launch Partner

- aktivna primarna ponuda;
- setup i mesečna cena dolaze iz commercial registry-ja;
- do pet bookable članova;
- LIVE funkcije se prikazuju iz rollout registry-ja;
- managed BETA opcije imaju poseban disclaimer.

### Ordum Founding Partner

- ograničena ponuda;
- client limit i price lock dolaze iz registry-ja;
- ne tvrdi da je mesto trenutno dostupno;
- CTA traži proveru Founding mesta.

### Ordum Signature

- quote-only;
- ne prikazuje izmišljenu mesečnu cenu;
- vodi ka individualnoj proceni.

## Rollout transparentnost

Landing prikazuje tri javne grupe:

- `LIVE`;
- `BETA`;
- `COMING SOON`.

`RESEARCH` nije deo javnog landing obećanja u 02A.

BETA se opisuje kao managed rollout, a COMING SOON kao pravac koji nije uključen u aktivnu cenu ili rok.

## Platform level mapa

Landing prikazuje svih šest nivoa iz `PLATFORM_LEVELS`:

1. Digitalni salon;
2. Growth Platform;
3. Local Discovery;
4. Salon Operations;
5. Business OS;
6. Regionalna i globalna mreža.

Statusi `unlocked`, `active` i `locked` dolaze direktno iz registry-ja.

Level nije marketinški rok i ne otključava se samo zato što je prikazan.

## Demo showcase odluka

Landing ističe dva najzrelija javna primera:

- `Heritage Barber Demo`;
- `Lumière Studio`.

`Atelier Luna Nails` ostaje aktivan tenant i validan vertikalni primer, ali nije deo primarnog landing showcase para u 02A.

Lumière koristi shared hostname boundary sa slugom `lumiere-studio`; preview dobija zaseban luxury editorial identitet i nije samo preimenovana nail kartica.

## Ne-menjani sistemi

`02A` ne menja:

- tenant sajtove;
- tenant booking;
- availability;
- admin ili staff UI;
- platform-admin;
- bazu ili migracije;
- contact API;
- Resend runtime;
- hostname resolver;
- demo tenant URL contract;
- product strategy registry vrednosti.

## QA

Code acceptance zahteva:

- ciljani ESLint;
- ciljani Vitest;
- kompletan `npm run check`;
- staged diff check.

Pošto milestone menja javni UI, finalni closeout zahteva i ručni desktop/mobile browser acceptance.

## Browser acceptance matrica

### Desktop

- hero i CTA;
- status kartice;
- live demo kartice;
- tri komercijalne ponude;
- šest platform nivoa;
- FAQ;
- kontakt forma.

### Mobile

- header CTA;
- hero bez horizontalnog overflow-a;
- status kartice u jednoj koloni;
- offer kartice u jednoj koloni;
- level kartice u jednoj koloni;
- kontakt forma i footer.

## Sledeći korak

Posle code PASS-a i browser acceptance-a:

1. ROADMAP closeout;
2. commit i push;
3. fast-forward u `main`;
4. `CONTENT-FOUNDATION-01`.
