# ORDUM-ADMIN-PERFORMANCE-01F — PACKAGE CONTEXT

## Dokaz iz production merenja

Production request-pipeline audit je pokazao:

- warm `admin.context.claims`: približno 3–6 ms;
- warm `admin.context.memberships`: približno 74–90 ms;
- warm `admin.context.businesses`: približno 75–83 ms;
- prvi `admin.layout.productAccess`: 1250.7 ms;
- `admin.layout.reviewAttention`: 99.7 ms.

PostgreSQL execution vreme za proverene upite ostalo je približno
0.118–0.213 ms, pa dodatni package latency nije SQL execution problem nego
odvojeni Auth/PostgREST/HTTP round-trip.

## Promena

Postojeći admin business lookup sada bira i package assignment kolone:

- `package_key`;
- `package_contract_version`;
- `package_assigned_at`;
- `package_assigned_by_user_id`.

`getAdminContext()` iz istog business reda gradi
`BusinessProductAccessSnapshot`.

Protected admin layout prvo koristi snapshot iz admin konteksta. Postojeći
`loadProductPackageAccessForBusinessId()` ostaje samo kao kompatibilni fallback
za testove, mock kontekste ili stariji pozivni kod koji ne prosledi snapshot.

## Bezbednosni i funkcionalni ugovor

- auth claims ostaju nepromenjeni;
- membership RLS query ostaje nepromenjen;
- aktivni business filter ostaje nepromenjen;
- tenant selection ostaje nepromenjen;
- package resolver i invalid-assignment ponašanje ostaju isti;
- review badge query se i dalje preskače kada paket ne uključuje reviews;
- nema baze, migracije, retry-ja ili cache promene.

## Očekivani efekat

- jedan manje package-access PostgREST request na prvom renderu protected
  admin layout-a;
- `admin.layout.productAccess` treba da padne na približno lokalno
  resolution vreme;
- prvi admin render više ne treba da plaća zabeleženih 1250.7 ms za dupli
  business/package lookup.

## Sledeće

Posle browser i production timing PASS-a, sledeći kandidat je objedinjavanje
sekvencijalnih membership + business tenant read poziva, uz poseban dokaz da
RLS i multi-tenant izolacija ostaju netaknuti.
