# PRODUCT-PACKAGES-ENTITLEMENTS-01E-D — UPGRADE UX AND MATRIX

**Datum:** 15. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`
**Očekivani početni HEAD:** `47694a3aa12d6ff917278150024641536ec54fc9`
**Očekivani staging:** 36 PASS fajlova iz `01E-A`, `01E-B1`, `01E-B2`, `01E-C1` i `01E-C2`.

## Cilj

Završiti runtime package-gating UX i dokazati ponašanje svih pet paketa, legacy rollout režima i platform-admin preview toka.

D ne uvodi nove feature gate granice. Konsoliduje i proverava ono što je aktivirano u A–C2.

## Shared upgrade guidance

Novi `upgrade-guidance.ts` postaje jedini izvor za:

- naziv zaključane funkcije;
- opis funkcije;
- trenutni package label;
- minimalni potrebni paket;
- `PRODUCT_PACKAGE_REQUIRED` poruku;
- tenant-admin i staff continuity copy.

Admin i staff locked screen zadržavaju različit vizuelni ton, ali više ne računaju package podatke zasebno.

Admin i staff server gate koriste istu requirements poruku kao UI.

## Runtime matrica

Test matrica pokriva:

| Paket | Admin core | Galerija | Staff Calendar | Employee sync | Reviews |
| --- | --- | --- | --- | --- | --- |
| Booking Page | da | ne | ne | ne | ne |
| Digital Studio | da | da | ne | ne | ne |
| Operations Pro | da | da | da | da | ne |
| Reputation Pro | da | da | da | da | da |
| Signature | da | da | da | da | da |

Dodatno se proverava:

- legacy `package_key = NULL` ostaje full access;
- nepoznat package key ostaje invalid-assignment fail-open;
- nepodržana contract verzija ostaje invalid-assignment fail-open;
- package blocker ima prioritet nad permission i integration blockerom;
- permission blocker ima prioritet nad integration blockerom;
- javna Booking Page funkcija postoji u svakom dodeljenom paketu.

## Upgrade UX

Locked admin i staff stranice:

- koriste isti guidance contract;
- prikazuju stvarni trenutni paket;
- prikazuju minimalni potreban paket;
- čuvaju osnovne booking/staff mogućnosti;
- imaju bezbedan povratak;
- nemaju lažni `/billing` ili `/upgrade` link.

## Platform-admin preview

Platform-admin tenant stranica i dalje:

- gradi javni tenant URL;
- dodaje `?preview=1`;
- prosleđuje preview URL publication kontrolama;
- paralelno prikazuje package manager;
- nije povezana sa tenant-admin ili staff auth gate helperima.

Package assignment zato ne lomi operativni preview tok.

## Source-contract migracija

Raniji B1, B2 i C1 source-contract testovi se ažuriraju da proveravaju novi shared guidance helper umesto stare implementacione pojedinosti:

- direktan `getProductFeatureUpgradeCandidates` u komponenti;
- lokalno čitanje `minimumPackage` u admin server helperu.

Auth, route, mutation i server boundary asercije ostaju nepromenjene.

## Non-goals

D ne menja:

- package assignment;
- billing;
- public feature rendering;
- Google integration stanje;
- permission matrix;
- Supabase šemu ili podatke;
- ROADMAP;
- commit ili push.

## Sledeći korak

`PRODUCT-PACKAGES-ENTITLEMENTS-CLOSEOUT-01`

Closeout paket treba da:

1. izvrši završni package smoke;
2. ažurira `ROADMAP.md`;
3. potvrdi kompletan staged diff;
4. pripremi jedan package-gating checkpoint commit;
5. push izvrši samo uz eksplicitnu autorizaciju.

## Acceptance

- [ ] shared upgrade guidance postoji;
- [ ] admin locked screen koristi guidance;
- [ ] staff locked screen koristi guidance;
- [ ] admin mutation poruka koristi guidance;
- [ ] staff server poruka koristi guidance;
- [ ] svih pet package matrica prolazi;
- [ ] legacy i invalid assignment ostaju fail-open;
- [ ] blocker precedence ostaje stabilan;
- [ ] preview URL ostaje `?preview=1`;
- [ ] platform-admin preview wiring ostaje funkcionalan;
- [ ] nema mrtvog billing/upgrade linka;
- [ ] `npx tsc --noEmit` prolazi;
- [ ] `npm run check` prolazi;
- [ ] nema migracije, commita ili push-a.
