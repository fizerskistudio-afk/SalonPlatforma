# TEST-FOUNDATION-01

**Datum pripreme:** 10. jul 2026.  
**Status:** prihvaćen lokalno — tests, lint, build i smoke test prošli; čeka samo potvrdu remote CI run-a.

## Cilj

Uvesti brz unit test sloj koji proverava kritične čiste funkcije bez baze, browsera i spoljašnjih servisa.

## Implementirano

- Vitest `4.1.9`;
- `vitest.config.ts`;
- `npm test`;
- `npm run test:watch`;
- `npm run check` sada pokreće lint, unit testove i build;
- CI `Test` korak;
- ispravljen GitHub Actions concurrency izraz;
- hostname normalization testovi;
- tenant/root/reserved/external hostname resolver testovi;
- tenant public URL testovi;
- template registry i fallback testovi;
- booking payload validacija izdvojena u `lib/booking/public-validation.ts`;
- booking API koristi isti testirani validator;
- testovi svih glavnih booking payload error kodova.

## Scope odluka

Ovaj milestone ne uvodi bazu, Supabase mock, React component tests ili browser automation.

Odloženo za naredni QA sloj:

- rate limiter storage i failure-mode testovi;
- owner/manager/staff permission matrix;
- cross-tenant route/API testovi;
- booking conflict i database RPC testovi;
- Playwright public booking;
- admin/staff login smoke test.

## CI hotfix

Prvobitni CI workflow imao je literalni backslash u `concurrency.group` GitHub izrazu. Ovaj paket ga menja u važeći `${{ github.workflow }}` / `${{ github.ref }}` izraz i dodaje unit test korak.

## Acceptance criteria

- `npm install` ažurira `package-lock.json`;
- `npm test` prolazi;
- `npm run lint` prolazi bez error-a;
- `npm run build` prolazi;
- `npm run check` pokreće sva tri koraka;
- CI nakon push-a pokreće install, lint, test i build;
- booking API ponašanje i error kodovi ostaju isti.


## Lokalna potvrda

- `npm test`: PASSED
- `npm run lint`: PASSED
- `npm run build`: PASSED
- booking validator smoke test: PASSED
