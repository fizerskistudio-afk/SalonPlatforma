# CONTENT-STARTER-PACKS-01B — VISUAL BUILDER AND ATOMIC BUSINESS PROVISIONING

**Datum:** 16. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`

## Cilj

Pretvoriti 01A registry u vidljiv Platform Admin tok kojim se pravi stvarni draft tenant bez ručnog database rada.

01B dodaje novi ekran:

```text
/platform-admin/businesses/new/starter-pack
```

Tok je:

```text
business identity
→ starter pack
→ module selection
→ service edit
→ price confirmation
→ theme selection
→ atomic provisioning
→ workspace / public preview
```

## Vidljiv rezultat

Nakon 01B možemo kroz UI da kreiramo realne demo biznise:

- Lumière — `hair-salon` + `hair-luxury`;
- Editorial — `hair-salon` + `hair-editorial`;
- Barber — `barber` + `barber-heritage`;
- Nails — `nails` + privremeni `hair-editorial`, a zatim pravi Nails theme u `DEMO-THEME-NAILS-01`.

Cilj nije da Nails trajno koristi Hair Editorial, već da 01B ne blokira kreiranje tenant podataka dok se četvrti theme dovršava.

## Preview

Platform Admin bira jednu od deset 01A vertikala.

Server vraća:

- universal + vertical preview;
- required/recommended/optional module listu;
- kompletan početni service draft;
- preporučeni trenutno dostupni theme;
- upozorenja iz 01A granice.

Preview ostaje preview-only i ne piše u bazu.

## Edit granica

Pre apply-a Platform Admin može da:

- uključi ili isključi svaku uslugu;
- izmeni naziv i opis;
- izmeni trajanje;
- izabere fixed/from/range cenu;
- unese cenu ili raspon;
- uključi optional/recommended module;
- izabere jedan od trenutno registrovanih theme packova;
- unese osnovni identitet, kontakt, lokaciju, valutu i timezone.

Svaka izvorna usluga mora biti eksplicitno poslata kao aktivna ili isključena.

## Apply granica

Apply koristi postojeći server-only:

```text
provision_business
```

RPC atomski kreira:

- business;
- booking settings;
- service categories;
- services;
- template key/config;
- starter-pack metadata.

01B ne dodaje novu migraciju i ne menja postojeći RPC.

## Idempotency

Browser generiše stabilan `applyKey` za pripremljen preview.

Server pre RPC-a proverava slug:

- ako slug ne postoji, provisioning može da počne;
- ako isti slug postoji sa istim `starterPack.applyKey`, vraća se postojeći rezultat bez dupliranja;
- ako slug postoji sa drugim apply ključem, vraća se `409 BUSINESS_SLUG_EXISTS`;
- race-condition duplicate se proverava ponovo posle `23505`.

Postojeći tenant se ne update-uje, ne upsert-uje i ne pregazi.

## Publication granica

Novi salon ostaje draft.

01B:

- ne objavljuje salon;
- ne menja publication status;
- ne šalje email;
- ne aktivira review cron;
- ne aktivira AI usage;
- ne kreira izmišljene zaposlene, recenzije ili fotografije.

Javni prikaz se otvara samo kroz postojeći Platform Admin preview URL sa `?preview=1`.

## Sadržaj koji ostaje za intake

01B primenjuje business, booking i catalog osnovu.

Sledeći `CLIENT-CONTENT-INTAKE-01` pokriva:

- stvarni about/hero/SEO tekst;
- stvarno radno vreme;
- članove tima;
- originalne fotografije;
- društvene mreže;
- potvrđene politike;
- dodatne jezike;
- finalnu cenu i content reviziju po potrebi.

## Theme redosled posle 01B

```text
DEMO-THEME-EDITORIAL-01
→ DEMO-THEME-BARBER-01
→ DEMO-THEME-NAILS-01
```

Lumière ostaje referentni već zaključan theme.

Posle ove tri teme imamo četiri različita vidljiva demo biznisa i prelazimo na Platform Admin E2E, demo podatke i master QA.

## Bezbednosne granice

- preview zahteva `tenant.preview.read`;
- apply zahteva `tenant.create`;
- browser nema Supabase client ili direktan write;
- server ponovo materijalizuje pack iz trusted registry-ja;
- ne prihvata client category payload;
- ne prihvata client template config;
- service key mora postojati u izabranom packu;
- svaka usluga mora biti poslata tačno jednom;
- required moduli se automatski vraćaju;
- unsupported modul se odbija;
- cena, trajanje i tekst imaju server-side limite;
- request body ima size limit;
- raw database greška se ne vraća browseru.

## ROADMAP proces

01B ne menja `ROADMAP.md`.

Posle code PASS-a pravi se zaseban full-file ROADMAP updater.

## Non-goals

01B ne dodaje:

- novi DB schema;
- postojeći-tenant catalog merge;
- content overwrite;
- automatski publish;
- zaposlene;
- media upload;
- translation UI;
- payment/billing;
- production email ili cron;
- commit ili push.

## Acceptance

- [ ] novi visible Starter Pack Business Builder postoji;
- [ ] svih deset packova se mogu preview-ovati;
- [ ] module selection radi;
- [ ] required module ne može biti isključen;
- [ ] usluga može biti editovana ili isključena;
- [ ] cena i trajanje se server-side validiraju;
- [ ] theme može biti izabran iz trenutnog registry-ja;
- [ ] apply zahteva eksplicitnu potvrdu;
- [ ] apply koristi postojeći atomski RPC;
- [ ] isti applyKey ne duplira salon;
- [ ] postojeći slug sa drugim apply ključem vraća 409;
- [ ] salon ostaje draft;
- [ ] nema browser Supabase write-a;
- [ ] ciljani testovi prolaze;
- [ ] TypeScript prolazi;
- [ ] `npm run check` prolazi;
- [ ] ROADMAP nije menjan;
- [ ] nema commita ili push-a.
