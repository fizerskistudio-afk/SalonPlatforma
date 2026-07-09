TENANT-ISOLATION-QA-01_FIX-01

Ispravka dodaje podršku za NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
koji koristi trenutni projekat. Raspakuj ZIP u root i potvrdi overwrite.

Zatim ponovo pokreni:
  node scripts\tenant-isolation-audit.mjs

Nije potrebna migracija niti npm install.
