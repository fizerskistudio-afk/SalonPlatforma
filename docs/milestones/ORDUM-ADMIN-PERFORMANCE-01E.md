# ORDUM-ADMIN-PERFORMANCE-01E — REQUEST PIPELINE AUDIT

## SQL audit zaključak

Svi provereni PostgreSQL planovi imaju execution vreme između približno
0.118 ms i 0.213 ms. Table cache hit je 99.99%, a index cache hit 99.87%.

SQL i disk I/O nisu aktivni admin bottleneck. Seq Scan planovi nad veoma
malim tabelama su jeftini i ne opravdavaju nove indekse.

## Cilj

Izmeriti shared admin request pipeline:

- Supabase server client kreiranje;
- auth claims;
- business membership query;
- business lookup;
- preferred tenant izbor;
- protected layout admin guard;
- product package access;
- review attention badge;
- metadata admin context.

## Ograničenja

Nema promene auth, tenancy, permission, query, cache, baze ili migracije.
Logovanje ostaje opt-in kroz `ADMIN_PERF_DEBUG=1`.

## Sledeća odluka

Production merenje određuje uski refactor shared admin konteksta, layout
dependency lanca ili specijalizovanog dashboard snapshot-a.
