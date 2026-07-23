# ORDUM-ADMIN-PERFORMANCE-01H — NON-BLOCKING REVIEW BADGE

## Production dokaz

Posle 01F package access je lokalni snapshot, ali prvi review attention count je
i dalje trajao približno 240.8 ms i držao ceo protected AdminShell pre rendera.

Review badge nije bezbednosna odluka za prikaz osnovnog admin shell-a. Package
gate jeste bezbednosna odluka i ostaje server-side.

## Promena

Protected layout više ne čeka review count.

Layout:

- učita admin context;
- reši package access iz request-scoped snapshot-a;
- izračuna `reviewsEnabled`;
- odmah renderuje AdminShell.

AdminShell:

- počinje sa badge count `0`;
- samo kada je reviews feature dozvoljen, jednom poziva
  `/api/admin/review-attention`;
- koristi `cache: "no-store"` i AbortController;
- greška badge zahteva ne blokira navigaciju ili sadržaj.

API ruta:

- koristi authenticated admin context;
- odbija nevalidnu sesiju, obaveznu promenu lozinke i nerešen tenant izbor;
- ponovo server-side proverava `admin.reviews` package gate;
- tek nakon dozvole izvršava count query;
- odgovor je `private, no-store`.

## Očekivani efekat

- review count više nije deo critical render path-a;
- AdminShell i stranica mogu da se prikažu pre sporog review count-a;
- povremeni review/network outlier ne zamrzava celu admin navigaciju;
- badge se pojavljuje naknadno kada odgovor stigne.

## Ograničenja

- nema baze ili migracije;
- nema polling-a;
- nema cache-a privatnih podataka;
- nema promene review permission ili package gate ponašanja;
- nema commit/push.
