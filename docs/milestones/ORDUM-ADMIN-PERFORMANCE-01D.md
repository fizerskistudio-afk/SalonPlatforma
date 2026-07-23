# ORDUM-ADMIN-PERFORMANCE-01D — SQL AUDIT

## Trenutna slika

Posle 01B normalan `/admin/schedule` je tipično pao sa oko 5.3 s na
oko 0.33–0.63 s.

Pojedinačni schedule pozivi od oko 86–243 ms obuhvataju HTTP, edge,
PostgREST i PostgreSQL. To nije čisto SQL execution vreme.

Zabeležen je i odvojen `AuthRetryableFetchError` sa statusom 525, kao i
hladni `next dev` zahtevi sa velikim proxy/compile vremenom. SQL indeks ne
može rešiti auth/edge SSL ili dev compilation zastoj.

## Postupak

1. Otvori Supabase Dashboard → SQL Editor.
2. Pokreni:
   `docs/performance/ORDUM-ADMIN-PERFORMANCE-01D-SQL-AUDIT.sql`
3. Sačuvaj kompletne rezultate:
   - relevantne table stats;
   - postojeće indekse;
   - index usage;
   - svih šest EXPLAIN planova;
   - cache hit ratios.

## Odluka

- Jednocifreno SQL execution vreme: prioritet je smanjenje Auth/PostgREST
  round-tripova i production benchmark.
- Skup Seq Scan, sort ili veliki broj pročitanih blokova: pravimo ciljanu
  composite/partial index migraciju.
- Svaki indeks mora imati pre/posle EXPLAIN dokaz.
