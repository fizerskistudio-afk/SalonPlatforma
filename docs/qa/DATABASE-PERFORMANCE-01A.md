# DATABASE-PERFORMANCE-01A — Runbook

**Tip:** read-only audit  
**Baza:** ciljna Supabase baza  
**Migracija:** nema  
**PII:** ne kopirati booking napomene, email adrese, telefone, tokene ili secrets

## Cilj

Pre bilo kakvog dodavanja indeksa ili cleanup funkcije potrebno je snimiti:

- stvarne veličine i približan broj redova;
- postojeće indekse i njihovu upotrebu;
- dead tuples i autovacuum/analyze stanje;
- booking integritet constraint-e;
- definicije `get_available_slots`, `create_public_booking` i `consume_public_rate_limit`;
- broj aktivnih i isteklih rate-limit bucket-a;
- dostupnost `pg_stat_statements`.

## Pokretanje

U Supabase Dashboard-u otvori **SQL Editor**, zatim pokreni:

```text
docs/qa/DATABASE-PERFORMANCE-01A.sql
```

Fajl je read-only. Ne pravi indeks, ne briše bucket-e i ne menja funkcije.

## Rezultati koje treba sačuvati

Dovoljno je sačuvati ili kopirati:

1. relevantne relacije i veličine;
2. `pg_stat_user_tables`;
3. index inventory;
4. index usage;
5. constraint inventory;
6. tri RPC definicije;
7. rate-limit bucket health i scope distribuciju;
8. informaciju da li je `pg_stat_statements` uključen;
9. `EXPLAIN (ANALYZE, BUFFERS)` za business lookup;
10. `EXPLAIN (ANALYZE, BUFFERS)` za `get_available_slots` sa stvarnim test UUID vrednostima.

## Važna zabrana

Ne pokretati:

```sql
EXPLAIN ANALYZE
SELECT *
FROM public.create_public_booking(...);
```

`ANALYZE` izvršava funkciju i napravio bi stvarnu rezervaciju.

## API latency baseline

Sa pokrenutim lokalnim serverom može se meriti više uzastopnih poziva. Zameni parametre validnim test vrednostima:

```cmd
curl -s -o NUL -w "catalog status=%%{http_code} total=%%{time_total}s
" "http://localhost:3000/api/catalog?businessSlug=mika-berberin"
curl -s -o NUL -w "availability status=%%{http_code} total=%%{time_total}s
" "http://localhost:3000/api/availability?businessSlug=mika-berberin&serviceId=SERVICE_UUID&date=2026-07-11"
```

Pokreni svaki poziv najmanje pet puta. Beleži cold i warm rezultate odvojeno.

## Sledeća faza

`DATABASE-PERFORMANCE-01B` se odobrava tek kada audit pokaže jednu ili više konkretnih potreba:

- nedostajući indeks koji odgovara stvarnom filter/order obrascu;
- sekvencijalni scan koji raste sa podacima;
- rate-limit tabela sa značajnim brojem isteklih bucket-a;
- constraint ili exclusion hot-spot;
- tabela sa visokim dead tuple odnosom;
- potvrđena retention potreba.

Bez dokaza iz audit rezultata nema migracije.
