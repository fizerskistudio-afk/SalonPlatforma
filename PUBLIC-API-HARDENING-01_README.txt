PUBLIC-API-HARDENING-01

1. Raspakuj paket u root projekta i potvrdi overwrite.
2. Pokreni:

   APPLY-PUBLIC-API-HARDENING-01.cmd

3. Primeni Supabase migraciju:

   supabase/migrations/022_add_public_rate_limiting.sql

4. U .env.local dodaj PUBLIC_RATE_LIMIT_SECRET.
   Secret možeš generisati komandom:

   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

5. Pokreni:

   rmdir /s /q .next
   npm run lint
   npm run build
   npm run dev

VAŽNO:
- Migraciju primeni pre login/booking testa.
- Patch skripta je idempotentna; drugi put će prijaviti da su fajlovi već patchovani.
- Posle uspešnog commita scripts/apply-public-api-hardening.mjs i APPLY cmd mogu ostati kao dokumentacija milestone-a ili se ukloniti u kasnijem cleanup-u.
