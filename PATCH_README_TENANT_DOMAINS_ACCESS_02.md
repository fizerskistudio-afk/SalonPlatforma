# TENANT-DOMAINS-ACCESS-02

Ovaj paket zatvara još dva preostala dela tenant domain/access faze:

1. pravi tenant poddomen u platform-admin javnom linku;
2. ponovno slanje aktivacionog linka owneru koji još nije prvi put koristio nalog.

## Menja

- `app/api/platform-admin/businesses/access/route.ts`
- `components/platform-admin/BusinessOwnerAccessManager.tsx`
- `components/platform-admin/BusinessPublicLinkActions.tsx`
- `ROADMAP.md`

## Dodaje

- `app/api/platform-admin/businesses/public-url/route.ts`
- `docs/milestones/TENANT-DOMAINS-ACCESS-02.md`

## Posle raspakivanja

CMD:

```cmd
rmdir /s /q .next
npm run lint
npm run build
npm run dev
```

## Pravi javni URL

Platform-admin command center prvo zadržava path fallback, a zatim kroz zaštićen server endpoint učitava URL koji gradi postojeći hostname resolver.

Lokalno očekivanje:

```text
http://mika-berberin.localhost:3000
```

Umesto:

```text
/salon/mika-berberin
```

## Resend aktivacije

Dugme se prikazuje samo kada:

- owner membership je aktivan;
- owner ima email;
- owner se još nijednom nije prijavio.

Sistem bira:

- `invite` link ako email još nije potvrđen;
- `recovery` link ako je email potvrđen, ali owner još nije koristio nalog.

Link generiše Supabase Admin API, a email šalje postojeći Resend sloj.

Potrebno u `.env.local`:

```env
RESEND_API_KEY=...
PLATFORM_EMAIL_FROM=...
```

Ako koristiš test mode:

```env
EMAIL_TEST_MODE=true
EMAIL_TEST_RECIPIENT=...
```

Tada resend ide na test recipient, ne na owner email.

## Acceptance test

1. Otvori platform-admin detalje za Mika Berberin.
2. Potvrdi da `Javni booking link` postaje:
   `http://mika-berberin.localhost:3000`
3. Klikni `Kopiraj link` i proveri sadržaj clipboard-a.
4. Klikni `Otvori profil` i proveri tenant routing.
5. Na owner access stranici koristi ownera bez `last_sign_in_at`.
6. Klikni odgovarajuće dugme:
   - `Pošalji poziv ponovo`, ili
   - `Pošalji link za lozinku`.
7. Potvrdi uspešnu poruku.
8. Proveri email.
9. Otvori link u browseru gde je platform-admin prijavljen.
10. Activation ekran mora prikazati tačan owner email i Mika Berberin.
11. Platform-admin lozinka ne sme biti promenjena.
12. Posle prve uspešne owner prijave resend dugme nestaje.

## Čišćenje pre push-a

Obriši jednokratni recovery script:

```cmd
del scripts\emergency-set-auth-password.mjs
```
