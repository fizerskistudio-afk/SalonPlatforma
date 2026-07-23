# ORDUM-ADMIN-PERFORMANCE-01G — SINGLE TENANT READ

## Production dokaz

Posle 01F, package access u protected layout-u je pao sa 1250.7 ms na
približno 0.1 ms.

Preostali warm admin context stabilno plaća dva sekvencijalna mrežna poziva:

- membership read: približno 70–90 ms;
- business read: približno 73–83 ms;
- ukupni admin context: približno 148–162 ms.

Zabeležen je i prolazni membership outlier od 2130.7 ms.

## Promena

`getAdminContext()` sada koristi jedan authenticated PostgREST embedded read:

- root tabela: `business_members`;
- embedded relacija: `businesses!inner`;
- filter korisnika: `user_id = claims.sub`;
- samo aktivna članstva;
- samo `owner` i `manager` uloge;
- samo aktivni business redovi;
- package assignment se čita u istom odgovoru.

Ne koristi se service-role client za tenant discovery. Postojeći RLS ostaje
aktivna granica pristupa.

## Dodatna konsolidacija

`loadAdminProductFeatureContext()` prvo koristi request-scoped
`admin.productAccess` snapshot. Stari package loader ostaje samo fallback.

## Bezbednosni ugovor

- `getClaims()` ostaje obavezan pre tenant read-a;
- `user_id` dolazi isključivo iz verifikovanog claim-a;
- authenticated Supabase client ostaje query client;
- RLS se ne zaobilazi;
- aktivno članstvo, uloga i aktivan business ostaju obavezni;
- tenant selection i preferred business logika ostaju iste;
- package resolver ponašanje ostaje isto;
- nema baze, migracije, cache-a, retry-ja ili timeout promene.

## Očekivani efekat

- admin context: sa približno 150–160 ms prema jednom mrežnom round-trip-u,
  očekivano približno 75–95 ms;
- jedan manje PostgREST request po zaštićenoj admin navigaciji;
- jedan manje package request na feature-gated admin stranicama;
- manja izloženost prolaznim edge/network outlierima.
