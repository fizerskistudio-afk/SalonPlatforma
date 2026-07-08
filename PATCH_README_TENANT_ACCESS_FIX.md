# TENANT-ACCESS-01 FIX-01

Raspakuj ZIP direktno u root projekta i dozvoli overwrite.

## Menja

- `app/api/platform-admin/businesses/access/route.ts`
- `app/auth/callback/route.ts`
- `app/admin/accept-invite/actions.ts`
- `app/admin/accept-invite/page.tsx`
- `components/admin/AcceptInviteForm.tsx`

## Dodaje

- `docs/milestones/TENANT-ACCESS-01-FIX-01.md`

## Posle raspakivanja

CMD:

```cmd
rmdir /s /q .next
npm run lint
npm run build
npm run dev
```

Ako `.next` ne postoji, CMD poruka nije problem.

## Važno

- Ne koristi stari invite email za acceptance test.
- Kreiraj potpuno novi kontrolisani test email/alias.
- Prvo proveri da lint i build prolaze.
- Zatim prati acceptance test iz milestone dokumenta.
- Ne pushujemo dok ceo auth test ne prođe.
