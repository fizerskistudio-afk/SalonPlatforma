# ORDUM-ADMIN-PERFORMANCE-01C

## Kontekst

`ORDUM-ADMIN-PERFORMANCE-01B` je smanjio normalan `/admin/schedule`
sa približno 5.3 s na približno 0.33–0.52 s.

Posle dužeg background/idle stanja zabeležen je jedan sporadičan zahtev:

- ukupno približno 42 s;
- završio je greškom employees query-ja;
- postojeći generic error nije sačuvao Supabase code/message/details/hint.

## Cilj

Dodati preciznu, opt-in dijagnostiku bez promene runtime ponašanja.

## Promene

- pojedinačni timing za:
  - business;
  - employees;
  - working hours;
  - time off;
- paralelno izvršavanje četiri query-ja ostaje nepromenjeno;
- pri grešci i `ADMIN_PERF_DEBUG=1` loguju se samo:
  - query label;
  - code;
  - message;
  - details;
  - hint;
- korisnik i dalje dobija postojeću bezbednu generic poruku;
- nema dodatnih retry-ja, timeout-a, cache promene, baze ili migracije.

## Acceptance

- kompletan `npm run check` prolazi;
- normalan schedule ostaje funkcionalan;
- `[ADMIN_PERF]` pokazuje trajanje svakog query-ja;
- `[ADMIN_PERF_ERROR]` postoji samo kada query vrati grešku;
- log ne sadrži klijentske, booking ili auth podatke.
