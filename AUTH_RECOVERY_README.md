# AUTH-RECOVERY-01

Ovaj paket služi samo za lokalni recovery Supabase Auth korisnika.

## Upotreba

Raspakuj ZIP u root projekta, tako da dobiješ:

`scripts/emergency-set-auth-password.mjs`

U CMD terminalu iz root foldera pokreni:

```cmd
node scripts\emergency-set-auth-password.mjs
```

Unesi:

1. email naloga kome treba postaviti lozinku;
2. novu lozinku od najmanje 10 karaktera.

Script učitava:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

iz `.env.local`.

## Redosled

1. Prvo postavi lozinku novom Mika owner nalogu.
2. Otvori incognito/private browser.
3. Prijavi taj nalog na `/admin/login`.
4. Potvrdi da vidi Mika tenant.
5. Svoj platform-admin nalog trenutno koristi slučajno unetu lozinku.
6. Po potrebi ponovo pokreni script i vrati željenu lozinku svom nalogu.

## Bezbednost

- Script ne sadrži secret.
- Service-role ključ ostaje u `.env.local`.
- Lozinka se vidi dok je unosiš u terminal.
- Obriši script pre finalnog produkcionog push-a:

```cmd
del scripts\emergency-set-auth-password.mjs
```
