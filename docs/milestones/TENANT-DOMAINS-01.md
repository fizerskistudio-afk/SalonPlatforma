# TENANT-DOMAINS-01 — Faza A

## Cilj paketa

Ovaj patch uvodi osnovu za javne tenant poddomene bez promene baze i bez kreiranja Mikinog owner naloga.

- glavni domen otvara privremeni platform demo hub;
- `mika-berberin.<root-domain>` interno se rewrite-uje na `/salon/mika-berberin`;
- `lumiere-studio.<root-domain>` interno se rewrite-uje na `/salon/lumiere-studio`;
- URL u browseru ostaje poddomen;
- postojeće `/salon/[businessSlug]` rute ostaju dostupne;
- Supabase session cookies se kopiraju na rewrite odgovor;
- rezervisani poddomeni se ne tumače kao saloni;
- nepoznat validan tenant slug završava na postojećem salonskom 404 mehanizmu.

## Fajlovi

### Novi

- `lib/tenancy/hostname.ts`
- `docs/env/tenant-domains.env.example`
- `docs/milestones/TENANT-DOMAINS-01.md`

### Zamenjeni

- `proxy.ts`
- `app/page.tsx`
- `ROADMAP.md`

## Instalacija

1. Napravi commit ili backup trenutnog stanja.
2. Raspakuj ZIP direktno u root projekta.
3. Dozvoli overwrite za postojeće fajlove.
4. Dodaj sledeće u `.env.local`:

```env
PLATFORM_ROOT_DOMAIN=localhost:3000
PLATFORM_ROOT_PROTOCOL=http
```

5. Obriši `.next`.
6. Pokreni lint i build.

### PowerShell

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run lint
npm run build
npm run dev
```

## Ručni test

Otvori:

- `http://localhost:3000`
- `http://lumiere-studio.localhost:3000`
- `http://mika-berberin.localhost:3000`
- `http://nepostojeci-salon.localhost:3000`
- `http://app.localhost:3000`
- `http://localhost:3000/salon/mika-berberin`

Očekivano:

- root prikazuje platform demo hub;
- Lumière poddomen prikazuje Lumière;
- Mika poddomen prikazuje Miku;
- nepostojeći tenant daje 404;
- `app` se ne tretira kao salon;
- stara path ruta i dalje radi.

## Rollback

```powershell
git restore ROADMAP.md app/page.tsx proxy.ts
git clean -fd lib/tenancy docs/env docs/milestones
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

Pre `git clean` proveri da u navedenim folderima nema drugih lokalnih fajlova koje želiš da sačuvaš.

## Sledeći paket

`TENANT-ACCESS-01`:

- platform-admin dodeljuje prvog ownera salonu;
- owner invite/status/resend;
- Mika dobija owner membership samo za `mika-berberin`;
- permission i tenant-isolation test checklist.
