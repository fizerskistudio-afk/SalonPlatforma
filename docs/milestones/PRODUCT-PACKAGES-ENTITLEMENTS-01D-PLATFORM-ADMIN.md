# PRODUCT-PACKAGES-ENTITLEMENTS-01D — PLATFORM-ADMIN ASSIGNMENT

**Aktiviran:** 15. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`
**Zavisi od:** staged `01A`, `01B` i `01C`.

## Cilj

Omogućiti platform timu da na tenant overview-u vidi i eksplicitno dodeli komercijalni paket, bez aktiviranja tenant/staff runtime entitlement gating-a.

## Permission model

Uvode se dve zasebne platform-admin dozvole:

```text
tenant.package.read
tenant.package.write
```

Raspodela:

| Rola | Read | Write |
|---|---:|---:|
| super_admin | da | da |
| sales | da | da |
| launch_manager | da | da |
| it | da | ne |

Sales može da izabere paket tokom onboarding i preview pripreme. Launch manager može da potvrdi ili promeni paket pre objave. IT vidi package i integration kontekst, ali ne menja komercijalni ugovor.

## Overview model

Tenant overview dobija jednu package karticu sa:

- trenutnim package stanjem;
- legacy full-access objašnjenjem dok paket nije dodeljen;
- contract verzijom;
- vremenom poslednje dodele;
- izborom jednog od pet registry paketa;
- mesečnom i setup cenom;
- početnim staff i AI limitima;
- read-only prikazom kada rola nema write permission.

## Mutation contract

`PATCH /api/platform-admin/businesses/package`

Request:

```json
{
  "businessSlug": "demo-salon",
  "packageKey": "digital_studio",
  "expectedUpdatedAt": "..."
}
```

Server obavezno proverava:

- aktivnu platform-admin sesiju;
- `tenant.package.write`;
- validan business slug;
- registry package key;
- actor user id;
- `expectedUpdatedAt`;
- business `updated_at` pre update-a;
- business `updated_at` i u samom update query-ju.

Update upisuje:

- `package_key`;
- `package_contract_version`;
- `package_assigned_at`;
- `package_assigned_by_user_id`.

## Rollout granica

01D uvodi application kod koji čita kolone iz migracije `030`.

Zato nakon PASS installera sledi:

```text
primena migracije 030
→ SQL verification
→ restart dev servera
→ platform-admin package runtime smoke
```

Pre primene migracije 030 ne treba otvarati tenant overview koji učitava package context.

## Non-goals

01D ne uvodi:

- tenant-admin ili staff UI gating;
- API entitlement guard;
- billing;
- payment provider;
- automatic upgrade/downgrade;
- package cancellation;
- `NULL` assignment kroz UI;
- Google integration promene;
- Groq API;
- automatsku primenu migracije;
- commit ili push.

## Sledeći korak

Posle migration/runtime potvrde:

`PRODUCT-PACKAGES-ENTITLEMENTS-01E — TENANT AND STAFF GATES`

Taj paket treba postepeno da uključi server-side entitlement guardove i upgrade CTA, bez mrtvih linkova i bez skrivanja osnovnog staff panela.

## Acceptance

- [ ] platform policy ima dedicated package read/write permissions;
- [ ] Sales i Launch manager mogu da dodeljuju paket;
- [ ] IT ima read-only package pristup;
- [ ] tenant overview prikazuje package card;
- [ ] legacy tenant je jasno označen i nije automatski downgrade-ovan;
- [ ] mutation koristi optimistic concurrency;
- [ ] mutation upisuje actor, timestamp i contract version;
- [ ] nijedna tenant/staff ruta još nije entitlement-gated;
- [ ] staged 01A–01C fajlovi ostaju netaknuti;
- [ ] `npx tsc --noEmit` prolazi;
- [ ] `npm run check` prolazi;
- [ ] nema database apply, commita ili push-a.
