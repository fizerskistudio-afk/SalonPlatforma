# TEMPLATE-BUNDLE-OPTIMIZATION-01

**Status:** implementacija pripremljena; čeka lokalni lint, build i acceptance test.

## Cilj

Smanjiti početni JavaScript javnog tenant sajta bez menjanja SSR sadržaja, izgleda template-a ili booking ponašanja.

## Pre izmene

- `TemplateRenderer.tsx` statički je importovao svih šest desktop/mobile template komponenti.
- `SalonPlatform.tsx` statički je importovao oba booking modala i ceo `BookingFlow` lanac.
- Booking modal komponenta bila je montirana i kada je `isOpen=false`, iako sama vraća `null`.

## Implementirano

- svaki template/viewport koristi `next/dynamic` i zaseban chunk;
- samo aktivni template renderer se renderuje i učitava;
- SSR ostaje uključen za aktivni template;
- desktop i mobile booking modal koriste client-only dynamic import;
- booking modal se ne renderuje niti učitava pre prvog otvaranja;
- nema novih npm paketa;
- generički milestone ZIP pattern `/*-01*.zip` dodat je u `.gitignore`;
- katalog SSR i početni tenant HTML nisu menjani.

## Obavezna provera

```cmd
rmdir /s /q .next
npm run lint
npm run build
npm run dev
```

Otvoriti:

```text
http://localhost:3000/salon/mika-berberin
http://localhost:3000/salon/lumiere-studio
```

Proveriti:

1. nema hydration warning-a;
2. oba tenant-a prikazuju isti template i sadržaj kao pre;
3. nema početnog `/api/catalog` zahteva;
4. pre otvaranja booking-a u Network tabu nema booking modal/flow chunk zahteva;
5. prvi klik na booking učitava odgovarajući booking chunk i modal se normalno otvara;
6. izbor usluge, zaposlenog, datuma i termina radi;
7. desktop/mobile override i auto viewport rade;
8. `node scripts\tenant-isolation-audit.mjs` prolazi.

## Metrike

Upisati nakon lokalne potvrde:

```text
Build: PENDING
Lint: PENDING
Mika desktop: PENDING
Mika mobile: PENDING
Lumière desktop: PENDING
Lumière mobile: PENDING
Booking lazy-load: PENDING
Tenant isolation audit: PENDING
```


## FIX-01 — viewport origin consistency

### Uzrok

`localhost:3000` i `<tenant>.localhost:3000` su različiti browser origin-i i ne dele localStorage. Trajno sačuvan desktop/mobile override zato je mogao da proizvede različit prikaz istog tenant-a.

### Promena

- view override više se ne čuva trajno;
- ručni switch važi za trenutnu montiranu stranicu;
- server određuje initial viewport iz request headera;
- hydration koristi isti početni snapshot kao SSR;
- realni viewport posle hydration-a ostaje source of truth u auto režimu.

### Status

`PENDING` — čeka lokalni lint, build, path/subdomain QA i tenant audit.


## FIX-02 — React static component lint

### Detektovano

Production build je prošao, ali lint je prijavio jedan novi error:

```text
react-hooks/static-components
Cannot create components during render
```

Ostala 24 unosa su warning-i iz postojećeg koda i nisu uvedeni ovim milestone-om.

### Uzrok

`getActiveTemplate()` je tokom rendera vraćao referencu na React komponentu, a zatim je ta lokalna referenca renderovana kao `<ActiveTemplate />`.

### Promena

- dynamic komponente ostaju deklarisane van render funkcije;
- helper sada vraća gotov JSX element;
- `TemplateRenderer` renderuje `{content}`;
- bundle splitting i lazy loading ponašanje ostaju isto.

### Status

- Build pre FIX-02: PASSED
- Lint pre FIX-02: FAILED — 1 error, 24 warnings
- Završni lint/build: PENDING
