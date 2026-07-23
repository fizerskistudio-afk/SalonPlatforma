# PUBLIC-BOOKING-LOAD-01B — Read-only load harness

## Cilj

Uvesti ponovljiv, dependency-free load harness za javni tenant i availability read putanju pre bilo kakvog write concurrency testa.

## Uvedeno

- Node-based harness bez dodatne npm zavisnosti;
- podrazumevani nivoi od 25, 50 i 100 concurrent virtualnih sesija;
- GET-only tenant page i availability scenario;
- availability poziva samo deo sesija kako test ne bi veštački udarao zaštitu od 90 zahteva u minuti sa jedne adrese;
- p50, p95, p99, maksimum, status distribucija, timeout i 429 evidencija;
- JSON i Markdown rezultat u `tmp/public-booking-load-01b/`;
- source contract koji zabranjuje booking POST u ovom segmentu.

## Scenario

Svaka virtualna sesija otvara javnu tenant stranicu.

Podrazumevano 20% sesija dodatno traži availability za jednu aktivnu uslugu i prvi datum sa dostupnim terminima.

To predstavlja read-heavy tok i ne kreira rezervacije.

## Pokretanje

```bat
node scripts\performance\public-booking-load-01b.mjs
```

Opcioni parametri:

```bat
set PUBLIC_BOOKING_LOAD_BASE_URL=https://ordumstudios.com
set PUBLIC_BOOKING_LOAD_BUSINESS_SLUG=lumiere-studio
set PUBLIC_BOOKING_LOAD_LEVELS=25,50,100
set PUBLIC_BOOKING_LOAD_TIMEOUT_MS=20000
set PUBLIC_BOOKING_LOAD_AVAILABILITY_RATIO=0.2
```

## Bezbednosne granice

- nema `POST /api/bookings`;
- nema DB write operacija;
- nema service-role credential-a u harness-u;
- ne zaobilazi javni rate limiting;
- ne proglašava booking concurrency potvrđenim.

## Acceptance

- source contract prolazi;
- harness radi bez spoljne load-test zavisnosti;
- meri 25, 50 i 100 concurrent sesija;
- ostavlja kompaktan JSON i Markdown dokaz;
- tracked source ostaje ograničen na harness, test i milestone dokument.

## Sledeći korak

Pokrenuti production read-only load scenario i na osnovu p50/p95/p99 rezultata odrediti:

1. da li tenant/catalog read putanja zahteva optimizaciju;
2. da li availability read putanja zahteva poseban milestone;
3. kako bezbedno organizovati disposable write concurrency test.
