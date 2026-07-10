# ERROR-RESILIENCE-01

**Datum pripreme:** 10. jul 2026.  
**Status:** `ERROR-RESILIENCE-01A` je završen u ubrzanom režimu; lokalni quality gate i availability API smoke testovi su prošli.

## Cilj

Uvesti kontrolisane fallback ekrane za neočekivane runtime greške i 404 stanja, standardizovati osnovni API error ugovor i ukloniti curenje internih Supabase/RPC/exception detalja iz javnog availability endpoint-a.

## ERROR-RESILIENCE-01A scope

### Route error boundaries

- root `app/error.tsx`;
- root-layout fallback `app/global-error.tsx`;
- tenant `app/salon/[businessSlug]/error.tsx`;
- salon admin `app/admin/(protected)/error.tsx`;
- staff `app/staff/(protected)/error.tsx`;
- platform-admin `app/platform-admin/error.tsx`.

Segmentni error fallbackovi koriste Next.js 16.2 `unstable_retry()` za ponovno učitavanje pogođenog segmenta. UI ne prikazuje `error.message`; opciono prikazuje samo Next error digest kao referencu za server logove.

### Not-found sloj

- globalni `app/not-found.tsx`;
- tenant-safe `app/salon/[businessSlug]/not-found.tsx`.

Tenant 404 ne pokušava da učita ili prikaže nepotvrđen tenant branding, naziv ili druge podatke.

### Zajednički UI

- `components/system/RouteErrorState.tsx`;
- `components/system/NotFoundState.tsx`.

### API error ugovor

`lib/api/http.ts` uvodi zajednički helper sa ugovorom:

```json
{
  "ok": false,
  "message": "Bezbedna korisnička poruka.",
  "code": "STABLE_MACHINE_CODE"
}
```

Helper podrazumevano postavlja `Cache-Control: no-store` i podržava dodatne headere, uključujući rate-limit headere.

### Availability hardening

`app/api/availability/route.ts`:

- više ne vraća `businessError.message`, RPC `error.message` ni neočekivani exception message klijentu;
- interne greške ostaju u server logu;
- svi error odgovori imaju `ok`, `message` i stabilan `code`;
- rate-limit odgovor zadržava rate-limit headere;
- success odgovor i postojeća tenant/publication pravila ostaju funkcionalno ista.

## Stabilni availability kodovi

```text
BUSINESS_SLUG_REQUIRED
INVALID_BUSINESS_SLUG
SERVICE_ID_REQUIRED
INVALID_SERVICE_ID
DATE_REQUIRED
INVALID_DATE
INVALID_EMPLOYEE_ID
RATE_LIMITED
BUSINESS_QUERY_FAILED
BUSINESS_NOT_FOUND
AVAILABILITY_QUERY_FAILED
UNKNOWN_AVAILABILITY_ERROR
```

## Security i tenancy odluke

- nema database migracije;
- nema izmene RLS politika;
- nema izmene auth ili role logike;
- nema izmene tenant resolvera;
- business lookup ostaje ograničen na eksplicitan slug, `is_active = true` i `publication_status = published`;
- kompletan tenant isolation audit nije obavezan za ovaj paket, ali ostaje deo `MASTER-SYSTEM-QA-01`.

## Acceptance kriterijumi

- [x] error i not-found fajlovi su implementirani u paketu;
- [x] zajednički API helper i unit testovi su implementirani u paketu;
- [x] availability raw error detalji su uklonjeni iz response body-ja;
- [x] `npm run lint` — PASSED lokalno;
- [x] `npm test` — PASSED lokalno;
- [x] `npm run build` — PASSED lokalno;
- [x] `npm run check` — PASSED lokalno;
- [x] availability validation error smoke test — PASSED (`BUSINESS_SLUG_REQUIRED`);
- [x] availability invalid slug smoke test — PASSED (`INVALID_BUSINESS_SLUG`);
- [x] availability unknown tenant smoke test — PASSED (`BUSINESS_NOT_FOUND`);
- [x] potvrđeno da availability error odgovori nemaju raw Supabase/RPC/exception detalje;
- [ ] vizuelni custom globalni i tenant-safe 404 smoke nije zasebno zabeležen — odloženo u `MASTER-SYSTEM-QA-01`;
- [ ] responsive/error-state detaljni regression — odložen u `MASTER-SYSTEM-QA-01`.

## ERROR-RESILIENCE-01B

**Status:** implementiran u paketu; čeka lokalni quality gate i ciljane API smoke testove.

### Scope

- `lib/api/http.ts` dobija zajednički `jsonResponse` uz postojeći `jsonError`;
- booking i catalog rute koriste zajednički helper bez promene postojećih statusa i machine kodova;
- admin member-credentials helper postaje re-export zajedničkog sloja;
- platform-admin credentials wrapper zadržava stroži no-cache policy, ali delegira zajedničkom helperu;
- platform-admin access, public-url, publication i theme rute više nemaju lokalne duplicate `jsonError` implementacije.

### Compatibility i security

- booking rate-limit odgovor zadržava sve rate-limit headere;
- catalog error odgovori zadržavaju `Cache-Control: no-store, max-age=0`;
- platform-admin credentials odgovori zadržavaju `Cache-Control: no-store, no-cache, must-revalidate` i `Pragma: no-cache`;
- success response strukture nisu menjane;
- nema izmene auth, role, tenant resolver, RLS ili Supabase query logike;
- nema database migracije.

### ERROR-RESILIENCE-01B acceptance

- [x] zajednički `jsonResponse` i prošireni unit testovi implementirani u paketu;
- [x] ciljne lokalne duplicate helper implementacije uklonjene;
- [x] source-level audit ciljnih ruta prolazi u apply skripti;
- [ ] `npm run lint`;
- [ ] `npm test`;
- [ ] `npm run build`;
- [ ] `npm run check`;
- [ ] booking validation/rate-limit smoke;
- [ ] catalog validation/unknown tenant smoke;
- [ ] platform-admin auth/no-cache smoke.
