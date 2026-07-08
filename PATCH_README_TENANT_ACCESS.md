# TENANT-ACCESS-01 PATCH

Ovaj ZIP se raspakuje direktno u root Next.js projekta.

## Sadržaj

- `app/api/platform-admin/businesses/access/route.ts`
- `app/platform-admin/businesses/[businessSlug]/access/page.tsx`
- `components/platform-admin/BusinessOwnerAccessManager.tsx`
- `components/platform-admin/BusinessPublicLinkActions.tsx`
- `lib/platform-admin/business-access.ts`
- `lib/platform-admin/business-access-server.ts`
- `docs/milestones/TENANT-ACCESS-01.md`
- `ROADMAP.md`

## Pre raspakivanja

```cmd
git status
```

Pošto trenutno ne pushujemo live Vercel granu, samo proveri da tačno znaš koje lokalne izmene postoje.

## Posle raspakivanja

```cmd
rmdir /s /q .next
npm run lint
npm run build
npm run dev
```

Ako `.next` ne postoji, CMD poruka nije problem.

## Prvi test bez stvarnog invite-a

1. Otvori platform-admin.
2. Otvori Mika Berberin tenant.
3. Potvrdi da postoji dugme `Owner pristup`.
4. Otvori novu access stranicu.
5. Potvrdi da se stranica učitava bez greške.

## Test sa emailom

Pre korišćenja stvarnog emaila proveri Supabase Auth redirect URL:

```text
http://localhost:3000/auth/callback
```

Zatim unesi kontrolisani test email.

Detaljan acceptance test je u:

`docs/milestones/TENANT-ACCESS-01.md`

## Rollback

Ovaj paket nema migraciju baze.

Za rollback vrati prethodne verzije:

- `components/platform-admin/BusinessPublicLinkActions.tsx`
- `ROADMAP.md`

i obriši nove fajlove:

- `app/api/platform-admin/businesses/access/route.ts`
- `app/platform-admin/businesses/[businessSlug]/access/page.tsx`
- `components/platform-admin/BusinessOwnerAccessManager.tsx`
- `lib/platform-admin/business-access.ts`
- `lib/platform-admin/business-access-server.ts`
- `docs/milestones/TENANT-ACCESS-01.md`
