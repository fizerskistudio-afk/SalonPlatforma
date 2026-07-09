# SEO-FOUNDATION-01

## Cilj

Ukloniti demo salon iz globalnog identiteta platforme, obezbediti osnovne javne SEO podatke i sprečiti indeksiranje privatnih površina.

## Urađeno

- neutralni radni naziv `Salon Platforma` u globalnom metadata i manifest sloju;
- uklonjen globalni Lumière keyword i nasleđeni canonical `/`;
- uklonjene globalne social preview reference koje mogu sadržati stari demo brend;
- home stranica dobila sopstveni canonical i social metadata;
- svaki aktivni javni tenant dobija sopstveni title, description, canonical, Open Graph i Twitter metadata;
- sitemap je host-aware:
  - root host sadrži platform landing;
  - tenant poddomen sadrži samo svoj javni salon;
  - dok poddomeni nisu podešeni, root sitemap uključuje aktivne `/salon/<slug>` putanje;
- robots.txt blokira admin, staff, platform-admin, auth i API putanje;
- privatne putanje dobijaju `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`;
- admin i staff layouti imaju metadata robots `noindex`;
- osnovne admin, staff i platform-admin sekcije imaju smislen browser-tab title.

## Nije obuhvaćeno

- finalni naziv i domen;
- tenant-specifične social preview slike;
- lokalni SEO podaci, adresa i JSON-LD za svaki salon;
- published/draft indeksiranje, jer status još nije deo modela.

## Baza

Nema migracije. Poslednja migracija ostaje `021`.
