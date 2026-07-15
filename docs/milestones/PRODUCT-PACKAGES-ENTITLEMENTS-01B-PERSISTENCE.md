# PRODUCT-PACKAGES-ENTITLEMENTS-01B — PERSISTENCE

**Aktiviran:** 15. jul 2026.
**Status:** migration contract pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`
**Zavisi od:** staged `PRODUCT-PACKAGES-ENTITLEMENTS-01A`.

## Cilj

Dodati minimalan database persistence sloj za komercijalni paket tenant-a bez aktiviranja runtime entitlement gating-a i bez promene ponašanja postojećih salona.

## Bezbedan rollout model

Novi `businesses.package_key` je namerno nullable.

```text
package_key = NULL
→ legacy / još nije eksplicitno dodeljen paket
→ sve postojeće funkcije ostaju dostupne tokom rollout-a

package_key = booking_page | digital_studio | operations_pro | reputation_pro | signature
→ eksplicitno dodeljen komercijalni paket
→ runtime resolver i gating dolaze tek u sledećim paketima
```

Migracija nema default paket, ne ažurira postojeće redove i ne uvodi `NOT NULL`.

Time se izbegava:

- slučajno spuštanje postojećeg demo tenant-a na niži paket;
- zaključavanje postojećih Calendar ili Reviews funkcija;
- mešanje package contracta sa owner/manager/staff rolama;
- mešanje kupljene funkcije sa stvarnim Google connection stanjem.

## Nova polja

### `package_key`

Jedan od stabilnih ključeva iz `PRODUCT_PACKAGE_KEYS`, ili `NULL` tokom rollout-a.

### `package_contract_version`

Verzija package registry contracta koja je važila pri poslednjoj dodeli.

### `package_assigned_at`

Vreme poslednje eksplicitne dodele ili promene paketa.

### `package_assigned_by_user_id`

Auth user id platform operatora koji je izvršio poslednju dodelu.

U ovoj fazi nema foreign key veze, kako rollout ne bi zavisio od aktivacije database platform-admin membershipa.

## Constraint contract

Database prihvata samo:

- `booking_page`;
- `digital_studio`;
- `operations_pro`;
- `reputation_pro`;
- `signature`;
- `NULL` kao privremeno legacy/unassigned stanje.

`package_contract_version`, kada postoji, mora biti veći od nule.

## Non-goals

01B ne uvodi:

- runtime package resolver;
- UI package selector;
- API entitlement guard;
- skrivanje tenant-admin ili staff ruta;
- upgrade CTA;
- billing;
- payment provider;
- usage accounting;
- Groq API;
- Google integration promene;
- automatsku dodelu paketa postojećim salonima;
- automatsku primenu migracije na Supabase.

## Sledeći paket — 01C

`PRODUCT-PACKAGES-ENTITLEMENTS-01C — SERVER RESOLVER` uvodi:

- server-only package assignment tip;
- `NULL` → legacy full-access rollout ponašanje;
- package entitlement resolver;
- odvojene rezultate za:
  - kupljen entitlement;
  - korisničku permission;
  - integration connection state;
- behavior testove;
- bez UI gating-a dok resolver ne bude potvrđen.

## Acceptance

- [ ] migracija dodaje samo četiri package assignment polja;
- [ ] `package_key` ostaje nullable;
- [ ] nema default vrednosti;
- [ ] nema backfill `UPDATE`;
- [ ] nema `SET NOT NULL`;
- [ ] check constraint prihvata tačno pet registry ključeva i `NULL`;
- [ ] nema promene `business_members`, role ili Google integration tabela;
- [ ] contract testovi prolaze;
- [ ] `npx tsc --noEmit` prolazi;
- [ ] `npm run check` prolazi;
- [ ] installer čuva staged 01A fajlove;
- [ ] installer stage-uje samo svoja tri nova fajla;
- [ ] nema commita, push-a ili Supabase apply koraka.
