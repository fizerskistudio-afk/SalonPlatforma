# PUBLIC-BOOKING-LOAD-01C — Route isolation

## Cilj

Razdvojiti latency javne tenant stranice na tri merljive površine:

1. kompletan tenant SSR page;
2. direktni public catalog endpoint;
3. availability endpoint.

## Razlog

`PUBLIC-BOOKING-LOAD-01B` je potvrdio 100% read uspeh bez timeout-a i 429 odgovora, ali je tenant page p95 porastao do približno 4,7 sekundi na 100 concurrent sesija.

Tenant page p95 je bio praktično jednak ukupnom p95, zbog čega je tenant SSR/catalog putanja označena kao primarni bottleneck kandidat.

## Uvedeno

- dve merne runde;
- naizmeničan redosled tenant/catalog ruta radi smanjenja warm-order pristrasnosti;
- 25, 50 i 100 concurrent tenant/catalog zahteva;
- 5, 10 i 20 availability zahteva kroz ograničeni 20% profil;
- TTFB, body i total duration merenje;
- route-specific p50, p95, p99, maksimum, status, timeout i 429;
- automatska klasifikacija:
  - `catalog-dominant`;
  - `tenant-shell-template-overhead-significant`;
  - `mixed`.

## Bezbednost

- koristi samo GET;
- ne poziva `/api/bookings`;
- ne kreira rezervacije;
- ne menja bazu;
- ne zaobilazi rate limiting;
- ne menja production konfiguraciju.

## Acceptance

- source contract prolazi;
- tenant, catalog i availability imaju odvojene metrike;
- postoje najmanje dve merne runde;
- TTFB je odvojen od body transfer vremena;
- rezultat ostaje u `tmp/public-booking-load-01c/`;
- sledeća optimizacija se bira iz izmerenog route classification rezultata.

## Sledeći korak

- `catalog-dominant` → audit broja catalog PostgREST round-trip-ova i objedinjavanje stabilnog tenant read modela;
- `tenant-shell-template-overhead-significant` → uklanjanje zasebnog template/business round-trip-a i SSR shell audit;
- `mixed` → najmanji bezbedan rez u oba sloja, zatim ponovljeno isto merenje.
