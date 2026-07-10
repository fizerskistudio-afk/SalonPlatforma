# CI-FOUNDATION-01

**Datum pripreme:** 10. jul 2026.  
**Status:** implementiran lokalno; čeka prvi GitHub Actions run.

## Cilj

Automatski pokrenuti osnovnu proveru kvaliteta na svakom push-u ka aktivnoj razvojnoj grani i \`main\` grani, kao i na pull request događajima.

## Implementirano

- GitHub Actions workflow \`.github/workflows/ci.yml\`;
- read-only repository permissions;
- concurrency cancellation za zastarele run-ove;
- Node.js 20;
- npm dependency cache;
- \`npm ci\`;
- \`npm run lint\`;
- \`npm run build\`;
- timeout od 20 minuta;
- build-only placeholder environment vrednosti;
- bez pristupa produkcionom Supabase, Google ili Resend nalogu;
- lokalna komanda \`npm run check\`.

## Bezbednosna odluka

CI placeholder vrednosti nisu tajne i ne predstavljaju pristupne podatke. One postoje samo da bi Next.js build mogao da validira environment contract bez povezivanja na stvarne spoljašnje servise.

Integracioni testovi koji zahtevaju bazu, autentifikaciju, Google Calendar ili Resend biće uvedeni odvojeno i koristiće namensko test okruženje.

## Ubrzani režim rada

Do završnog master QA ciklusa:

1. lint i production build ostaju obavezni za svaki code milestone;
2. ručno se proverava samo direktno promenjeni tok;
3. tenant isolation audit se pokreće za auth, tenancy, public API i database izmene;
4. široki booking/admin/integration regression test se odlaže za \`MASTER-SYSTEM-QA-01\`;
5. svaki poznati odloženi test mora ostati zapisan u \`ROADMAP.md\`.

## Acceptance criteria

- workflow se pojavljuje u GitHub Actions;
- \`npm ci\` prolazi;
- lint završava bez error-a;
- production build prolazi;
- workflow nema production secrets;
- push ili PR jasno prikazuje status provere.

## Prvi run

Čeka commit i push paketa.
