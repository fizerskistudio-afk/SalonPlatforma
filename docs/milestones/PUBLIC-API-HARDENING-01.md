# PUBLIC-API-HARDENING-01

## Cilj

Zaštititi javni booking i login tok od automatizovanog spama, brute-force pokušaja i prevelikih zahteva bez uvođenja dodatnog eksternog servisa.

## Implementirano

- Postgres-backed distribuirani rate limiting;
- hashovani ključevi bez čuvanja IP adresa, emailova ili telefona;
- booking limit po IP + tenant;
- booking limit po kontaktu + tenant;
- availability limit po IP + tenant;
- admin i staff login brute-force limit;
- obavezan `businessSlug` u javnom booking i availability API-ju;
- JSON Content-Type provera;
- maksimalno 16 KB za booking request body;
- standardni `429`, `Retry-After` i `X-RateLimit-*` headeri;
- fail-closed ponašanje za booking i login;
- fail-open ponašanje za availability kada limiter storage privremeno nije dostupan.

## Baza

Migracija:

`supabase/migrations/022_add_public_rate_limiting.sql`

Dodaje internu tabelu `public_rate_limit_buckets` i service-role RPC `consume_public_rate_limit`.

Tabela ima RLS i nije dostupna `anon` ili `authenticated` rolama.

## Environment

Pre produkcije dodati snažan nasumični secret:

```env
PUBLIC_RATE_LIMIT_SECRET=
```

Ako nije postavljen, server koristi `SUPABASE_SERVICE_ROLE_KEY` kao server-only fallback. U development okruženju postoji lokalni fallback da build i lokalni rad ne budu blokirani.

## Limiti

- booking IP + tenant: 10 zahteva / 10 minuta;
- booking kontakt + tenant: 4 zahteva / 30 minuta;
- availability IP + tenant: 90 zahteva / minut;
- admin login IP: 30 / 15 minuta;
- admin login IP + email: 8 / 15 minuta;
- staff login IP: 30 / 15 minuta;
- staff login IP + email: 8 / 15 minuta.

## Napomena

Ovaj milestone ne uvodi CAPTCHA. Honeypot i adaptivni challenge ostaju kasniji anti-abuse sloj ako realni promet pokaže potrebu.
