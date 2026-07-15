# PRODUCT-PACKAGES-ENTITLEMENTS-01E-B2 — TENANT ADMIN MUTATION GATES

**Datum:** 15. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`
**Očekivani početni HEAD:** `47694a3aa12d6ff917278150024641536ec54fc9`
**Očekivani staging:** PASS fajlovi iz `01E-A` i `01E-B1`.

## Cilj

Zatvoriti server-side zaobilaznice za premium tenant-admin funkcije koje su u B1 dobile route i navigation gate.

B2 štiti:

- četiri gallery server akcije;
- gallery signed-upload API;
- review moderation server action;
- review owner-reply server action.

UI gate više nije jedina zaštita.

## Shared mutation access

`admin-gates-server.ts` dobija:

```text
loadAdminProductFeatureMutationAccess(featureKey)
```

Rezultat je discriminated union:

```text
allowed = true
→ authenticated admin context
→ package feature je dozvoljen

allowed = false
→ PRODUCT_PACKAGE_REQUIRED
→ kontrolisana poruka
→ minimalni paket iz centralne gate mape
```

Mutation access u B2 proverava `decision.entitled`, a ne puni `decision.allowed`.

Razlog:

- package gate je aktivan;
- permission ostaje zasebna granica;
- integration ostaje zasebna granica;
- legacy i invalid rollout assignment ostaju fail-open.

## Gallery granice

Sledeće akcije moraju proveriti `admin.gallery` pre bilo kog storage ili database rada:

- `createGalleryItemAction`;
- `updateGalleryItemAction`;
- `moveGalleryItemAction`;
- `deleteGalleryItemAction`.

`POST /api/admin/gallery/upload-url` proverava isti feature pre:

- parsiranja body-ja;
- generisanja storage putanje;
- kreiranja signed upload URL-a.

Blokiran upload vraća:

```text
HTTP 403
code = PRODUCT_PACKAGE_REQUIRED
```

Ovo sprečava da tenant bez Digital Studio paketa napravi orphan storage fajl direktnim API pozivom.

## Reviews granice

Sledeće akcije moraju proveriti `admin.reviews` pre validacije i RPC poziva:

- `moderateReviewAction`;
- `updateReviewOwnerReplyAction`.

Tenant ispod Reputation Pro dobija kontrolisan `ok: false` action rezultat bez izvršenja review RPC-a.

## Fail-open rollout

Ostaje postojeći resolver contract:

- `package_key = NULL` → legacy full access;
- invalid assignment → full access uz `requiresAttention`;
- valid assigned package → stvarni entitlement gate.

B2 ne uvodi globalni fail-closed režim.

## Non-goals

B2 ne menja:

- Booking Page osnovne mutation tokove;
- settings mutation;
- staff panel;
- public rendering;
- Google integration state;
- permission matrix;
- Supabase šemu ili podatke;
- billing;
- commit ili push.

## Sledeći korak

`PRODUCT-PACKAGES-ENTITLEMENTS-01E-C — STAFF GATES`

Staff portal, rezervacije, napomene, odsustva i raspored ostaju dostupni od Booking Page paketa.

Lični Google Calendar, employee sync i two-way busy sync dobijaju Operations Pro package gate.

## Acceptance

- [ ] shared mutation helper vraća discriminated access rezultat;
- [ ] sva četiri gallery action ulaza imaju server package gate;
- [ ] signed-upload API vraća 403 pre kreiranja tokena;
- [ ] oba review action ulaza imaju server package gate;
- [ ] blocked mutation ne izvršava DB, storage ili RPC poziv;
- [ ] Digital Studio može da menja galeriju;
- [ ] paket ispod Digital Studio ne može da dobije signed upload URL;
- [ ] Reputation Pro može da moderira reviews;
- [ ] paket ispod Reputation Pro ne može direktno da pozove review mutation;
- [ ] legacy tenant ostaje fail-open;
- [ ] Booking Page osnovni mutation tokovi nisu izmenjeni;
- [ ] `npx tsc --noEmit` prolazi;
- [ ] `npm run check` prolazi;
- [ ] nema migracije, commita ili push-a.
