# PRODUCTION-DOMAINS-ENV-01B — Domain i Resend test-mode closeout

Datum potvrde: 2026-07-21

## Cilj

Ovaj paket beleži prvi kontrolisani production domain i email runtime PASS bez aktiviranja pravog recipient režima, cron schedule-a ili novih database migracija.

Source checkpoint tokom provere:

```text
main
4e23d5f7902e7f3b1521e5825c0fd10e1955904c
feat(theme): add modular nails atelier experience
```

## Potvrđeni domeni

```text
https://ordumstudios.com
https://www.ordumstudios.com
https://heritage-barber-demo.ordumstudios.com
https://atelier-luna-nails.ordumstudios.com
```

Potvrđeno je:

- apex vraća HTTP 200;
- `www` završava na canonical apex URL-u;
- wildcard tenant hostname interno koristi postojeću `/salon/[businessSlug]` granicu;
- Barber tenant vraća HTTP 200 i tenant-specifičan metadata naslov;
- Nails tenant vraća HTTP 200 i tenant-specifičan metadata naslov;
- path fallback `/salon/[businessSlug]` ostaje deo postojećeg ugovora.

## Production ENV granica

Vercel Production environment koristi:

```text
PLATFORM_ROOT_DOMAIN
PLATFORM_ROOT_PROTOCOL
NEXT_PUBLIC_SITE_URL
REVIEW_PUBLIC_BASE_URL
PUBLIC_RATE_LIMIT_SECRET
CRON_SECRET
```

Secret vrednosti nisu zapisane u repozitorijumu, ovom dokumentu, QA outputu niti installer paketu.

Preview i Production Supabase/Google separation ostaje otvorena stavka. `GOOGLE_OAUTH_REDIRECT_URI` nije menjan u ovom paketu.

## Resend konfiguracija

Production email ostaje u kontrolisanom test režimu:

```text
EMAIL_DELIVERY_ENABLED=true
EMAIL_TEST_MODE=true
EMAIL_DEPLOYMENT_MODE=platform
RESEND_WEBHOOK_TOLERANCE_SECONDS=300
```

Konfigurisani su private provider key, kontrolisani test recipient i webhook signing secret, ali njihove vrednosti nisu zabeležene.

Potvrđeni runtime tok:

1. kreirana je jedna kontrolisana test rezervacija;
2. aplikacija je kreirala notification delivery zapise;
3. Resend je prihvatio poruke;
4. poruke su fizički stigle u kontrolisani mailbox;
5. admin delivery log prikazuje `Poslato Resendu`;
6. potpisani webhook je obradio provider događaj;
7. admin delivery log prikazuje `Isporučeno`.

Javni webhook endpoint odbija nepotpisani payload sa HTTP 400 i porukom `Invalid webhook signature.` To potvrđuje da je signing secret aktivan bez izlaganja njegove vrednosti.

## PASS odluka

`PRODUCTION-DOMAINS-ENV-01B`: **PASS**.

PASS obuhvata:

- apex, `www` i wildcard tenant routing;
- production URL ENV contract;
- Resend test-mode slanje;
- fizičku isporuku u kontrolisani mailbox;
- webhook correlation i admin delivery status.

PASS ne znači da je production email u pravom recipient režimu aktiviran.

## Windows QA portability

Prvi Windows `npm run check` otkrio je da dva postojeća source-contract testa porede višelinijske fragmente samo sa LF separatorima, dok `readFileSync` na lokalnom checkout-u vraća CRLF. Runtime implementacija i očekivani ugovori bili su prisutni; pad je bio isključivo line-ending zavisan.

Test harness sada normalizuje CRLF i usamljeni CR na LF pre assertion-a u:

- `lib/product-packages/admin-gates-server-contract.test.ts`;
- `lib/platform-admin/business-package-route-contract.test.ts`.

Runtime package gate i platform-admin route fajlovi nisu menjani.

## Non-goals i otvorene stavke

- `EMAIL_TEST_MODE=false` nije dozvoljen ovim paketom;
- aktivni reminder ili review invitation cron schedule nije uveden;
- DMARC politika i finalni reply-to inbox nisu zatvoreni;
- Google OAuth production callback nije menjan;
- cross-subdomain Google OAuth session/cookie tok nije potvrđen;
- Supabase migracije nisu pokretane;
- migration `029` ostaje pending;
- master booking, admin, staff, cross-tenant i lifecycle regression ostaje u `MASTER-SYSTEM-QA-01`.

## Sledeći kontrolisani paket

`PRODUCTION-DOMAINS-ENV-01C`:

- potvrda Resend SPF/DKIM evidencije bez secret vrednosti;
- početna DMARC monitoring politika;
- odluka o finalnom reply-to inboxu;
- pregled Google OAuth callback i cross-subdomain auth/cookie granice pre bilo kakve ENV promene;
- bez aktivnog cron schedule-a dok kontrolisani cron E2E ne prođe.
