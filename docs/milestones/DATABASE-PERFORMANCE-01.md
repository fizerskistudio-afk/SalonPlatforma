# DATABASE-PERFORMANCE-01

**Datum pripreme:** 10. jul 2026.  
**Status:** završen bez performance migracije; audit nije pokazao opravdan hot-spot za schema promenu.

## Cilj

Izmeriti stvarne booking, availability i rate-limit hot-spotove pre dodavanja indeksa, cleanup funkcija ili retention politike.

## Poznate aplikacione putanje

### Public booking

`app/api/bookings/route.ts`:

1. troši dva distribuirana rate-limit bucket-a;
2. radi published business lookup po `slug`, `is_active` i `publication_status`;
3. poziva `create_public_booking`;
4. nakon uspešnog write-a čeka Google Calendar i notification best-effort obradu.

### Availability

`app/api/availability/route.ts`:

1. troši availability rate-limit bucket;
2. radi isti published business lookup;
3. poziva `get_available_slots`.

### Rate limiting

`public_rate_limit_buckets` koristi:

- primary key `(scope, key_hash, window_started_at)`;
- indeks nad `expires_at`;
- probabilistički cleanup sa verovatnoćom `0.01` po pozivu;
- expiry postavljen jedan dan posle kraja prozora.

Ovakav cleanup može biti sasvim dovoljan pri malom obimu, ali odluka mora da se zasniva na stvarnom broju isteklih redova i veličini tabele.

## DATABASE-PERFORMANCE-01A scope

- read-only inventory relevantnih tabela, veličina i procenjenih redova;
- table/index usage statistika;
- dead tuple i maintenance signal;
- index i constraint inventory;
- definicije ključnih RPC funkcija;
- rate-limit bucket health;
- `pg_stat_statements` availability;
- bezbedni `EXPLAIN` template-i;
- API latency baseline u lokalnom okruženju.

## Rezultat audita

- availability plan: 18 termina za 37.182 ms;
- `pg_stat_statements` availability prosek: 24.59 ms kroz 44 poziva;
- `create_public_booking` prosek: 34.94 ms kroz 20 poziva;
- rate-limit RPC prosek: 9.66 ms kroz 12 poziva;
- rate-limit tabela: 8 redova, 4 aktivna, 4 istekla, ukupno 56 kB;
- booking overlap već koristi partial GiST indeks i exclusion constraint;
- employee/service, working-hours i business lookup imaju odgovarajuće indekse;
- sekvencijalni scan-ovi su očekivani zbog veoma malih tabela;
- `time_off` range GiST ostaje future watch item, bez opravdanja pri 2 live reda;
- `DATABASE-PERFORMANCE-01B` migracija trenutno nije potrebna.

## Van scope-a

- nema SQL migracije;
- nema kreiranja ili brisanja indeksa;
- nema automatskog brisanja rate-limit bucket-a;
- nema izmene booking ili availability funkcije;
- nema izmene auth, tenancy ili RLS pravila;
- nema production write testa;
- nema `EXPLAIN ANALYZE` nad `create_public_booking`.

## Acceptance

- [x] app query hot-spotovi mapirani;
- [x] read-only SQL audit dodat;
- [x] runbook i bezbednosna ograničenja dokumentovani;
- [x] audit pokrenut nad ciljnom Supabase bazom;
- [x] rezultati pregledani bez PII/secrets;
- [x] business lookup plan snimljen;
- [x] availability RPC plan snimljen;
- [x] rate-limit growth procenjen;
- [x] index i exclusion constraint pokrivenost potvrđena;
- [x] zaključeno da `DATABASE-PERFORMANCE-01B` migracija trenutno nije potrebna.
