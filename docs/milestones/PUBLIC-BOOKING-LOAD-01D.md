# PUBLIC-BOOKING-LOAD-01D — Public catalog cache

## Polazni dokaz

`PUBLIC-BOOKING-LOAD-01C` je izolovao javne read putanje:

- svi zahtevi su prošli;
- nije bilo timeout-a ni 429 odgovora;
- direktni `/api/catalog` TTFB p95 dostigao je približno 4 sekunde na 100 concurrent zahteva;
- jedan uncached catalog load radi jedan business query i devet paralelnih Supabase/PostgREST query-ja;
- tenant HTML/RSC odgovor je približno 130 KB i predstavlja zaseban payload problem.

## Cilj segmenta

Smanjiti amplification javnog kataloga bez menjanja booking engine-a, RLS pravila, preview ponašanja ili admin write putanje.

## Promena

Published public catalog dobija:

- Next Data Cache između zahteva;
- TTL od 30 sekundi;
- zajednički cache tag `public-catalog` za buduću ciljanu invalidaciju;
- HTTP catalog odgovor ostaje `no-store, max-age=0`;
- nema drugog CDN freshness sloja;
- `Server-Timing` meri kompletan catalog handler.

## Bezbednosne granice

- cache se koristi samo za `public` load mode;
- platform-admin preview ostaje uncached;
- invalid slug se validira pre ulaska u cross-request cache;
- greške, 404 i invalid input ostaju `no-store`;
- cache ne sadrži private admin podatke;
- ne menjaju se availability ni booking POST;
- nema DB migracije.

## Očekivani efekat

Više istovremenih zahteva za isti published salon više ne bi trebalo da proizvodi po deset downstream Supabase/PostgREST zahteva za svaku posetu.

Prvi miss i revalidation i dalje mogu imati postojeću DB latenciju. Warm requests treba da imaju znatno niži catalog TTFB.

HTTP response caching je namerno odložen dok admin mutation putanje ne dobiju eksplicitnu tenant-aware invalidaciju. Time pre/post load test meri aplikacioni Data Cache umesto mogućeg CDN hita.

## Acceptance

1. source contract prolazi;
2. lint prolazi;
3. unit testovi prolaze;
4. production build prolazi;
5. javni salon, catalog i availability smoke prolaze;
6. posle deploy-a ponavlja se isti `01C` test;
7. nema regresije u preview katalogu;
8. pre/post report ostaje sačuvan pre milestone closeout-a.

## Svesno odloženo

Tenant response od približno 130 KB i njegovo body/stream vreme ostaju zaseban kandidat. Ne smanjujemo locale, template ili catalog payload dok ne izmerimo efekat backend cache-a.
