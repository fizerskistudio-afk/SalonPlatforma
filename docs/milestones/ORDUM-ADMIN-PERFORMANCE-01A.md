# ORDUM-ADMIN-PERFORMANCE-01A

## Cilj

Uvesti merljivu admin performance osnovu i ukloniti prvi potvrđeni
server-side waterfall bez promene auth, tenancy, booking ili package ponašanja.

## Promene

- `ADMIN_PERF_DEBUG=1` uključuje server timing logove;
- protected admin dobija instant `loading.tsx`;
- service i employee booking lookup izvršavaju se paralelno;
- timing log ne sadrži korisničke ili booking podatke;
- nema baze, migracije, cache promene, commit-a ili push-a.

## Merenje

```bat
set ADMIN_PERF_DEBUG=1
npm run dev
```

Navigirati kroz admin i sačuvati `[ADMIN_PERF]` redove iz server terminala.
