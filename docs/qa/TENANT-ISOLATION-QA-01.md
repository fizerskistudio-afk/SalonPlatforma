# TENANT-ISOLATION-QA-01

## Cilj

Potvrditi da javni routing, Supabase RLS i tenant članstva ne dozvoljavaju da korisnik jednog salona pročita privatne podatke drugog salona.

Audit je namerno **read-only**. Ne kreira, ne menja i ne briše rezervacije ili tenant podatke.

## Automatizovane provere

`scripts/tenant-isolation-audit.mjs` proverava:

- `/api/catalog` vraća traženi tenant;
- `/salon/<slug>` vraća 200 i tenant-specifičan `<title>`;
- `robots.txt` blokira privatne sekcije;
- `sitemap.xml` ne sadrži admin, staff, platform-admin ili API rute;
- usluga jednog tenant-a ne može da vrati termine kroz drugi tenant;
- test korisnik ima očekivanu ulogu i membership;
- test korisnik nema aktivno članstvo drugog test tenant-a;
- privatne tabele ne vraćaju redove drugog `business_id`-a;
- staff membership ima `employee_id` kada se staff kredencijali koriste.

## Priprema

1. Pokrenuti aplikaciju:

```cmd
npm run dev
```

2. Napraviti lokalni QA env fajl:

```cmd
copy docs\env\tenant-isolation.env.example .env.tenant-isolation.local
```

3. U `.env.tenant-isolation.local` upisati najmanje Mika i Lumière owner kredencijale.

Fajl sadrži lozinke i ne sme se commitovati.

Audit automatski učitava Supabase URL i `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` iz postojećeg `.env.local`. Podržan je i legacy naziv `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Pokretanje

```cmd
node scripts\tenant-isolation-audit.mjs
```

Uspešan audit se završava porukom:

```text
Tenant isolation audit je prošao bez detektovanog cross-tenant curenja.
```

Ako postoji `FAIL`, proces vraća exit code `1`.

## Ručni acceptance test

Automatizovani audit ne zamenjuje pregled aplikacionih dozvola.

### Mika owner

- prijaviti se na `/admin/login`;
- proveriti da shell prikazuje Mika Berberin;
- otvoriti dashboard, rezervacije, klijente, usluge, tim, galeriju, raspored, članove, notifikacije i podešavanja;
- potvrditi da se nigde ne pojavljuju Lumière privatni podaci;
- potvrditi da javni link vodi na Mika tenant.

### Lumière owner

Ponoviti isti tok i potvrditi da se ne pojavljuju Mika privatni podaci.

### Manager

- može da koristi dozvoljene tenant admin sekcije;
- ne može da kreira/resetuje direktne kredencijale;
- ne može da menja owner-only podatke;
- ne može da otvori `/platform-admin`.

### Staff

- ulazi isključivo na `/staff`;
- vidi samo svoje rezervacije i svoj kalendar;
- ne može da otvori `/admin`;
- ne može da čita ili menja druge zaposlene;
- ne može da otvori `/platform-admin`.

## Tumačenje SKIP rezultata

`SKIP` je očekivan kada:

- opciona tabela ne postoji u trenutnoj šemi;
- direktan SELECT nad tabelom nije dozvoljen ulozi;
- nisu uneti manager/staff kredencijali.

`SKIP` nije dokaz prolaska te stavke; označava da je potreban ručni ili drugi integracioni test.
