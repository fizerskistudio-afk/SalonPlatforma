# DEMO-THEME-NAILS-01C — DB aktivacioni runbook

**Status:** korisnik je odobrio i primenio samo `032`; formalni read-only verification output još nije zabeležen

**Migration source:** `supabase/migrations/032_add_nails_theme_pack.sql`

**Read-only verification:** `supabase/verification/verify_nails_theme_pack.sql`

## Problem

Aplikacioni registry poznaje `nails-soft`, ali postojeći database constraint `businesses_template_key_supported_check` iz migracije `021` dozvoljava samo `hair-luxury`, `hair-editorial` i `barber-heritage`.

Pokušaj promene tenant teme zato vraća PostgreSQL kod `23514`. Neuspešan statement je atomski rollbackovan; tenant ostaje na prethodnom template ključu.

## Granice

- ne koristiti običan `supabase db push`;
- ne pomerati niti primenjivati `supabase/pending/029_platform_admin_rbac_foundation.sql`;
- ne primenjivati `032` bez zasebnog eksplicitnog odobrenja;
- pre odluke proveriti stvarni lokalni i remote migration history;
- ovaj paket ne menja booking, auth, tenancy, service, employee ili review podatke;
- `032` menja samo dozvoljeni skup vrednosti postojećeg `businesses.template_key` CHECK constrainta.

## Obavezni read-only dokaz

Pre izvršenja zabeležiti rezultat migration history provere i u ciljnoj bazi pokrenuti:

```sql
select
  pg_constraint.conname,
  pg_constraint.convalidated,
  pg_get_constraintdef(pg_constraint.oid) as definition
from pg_constraint
where pg_constraint.conrelid =
    'public.businesses'::regclass
  and pg_constraint.contype = 'c'
  and pg_get_constraintdef(pg_constraint.oid)
    ilike '%template_key%';
```

Pre primene očekivani rezultat bio je jedan constraint bez `nails-soft`. Posle primene definicija mora sadržati sva četiri podržana ključa. Ako rezultat odstupa, ne raditi dodatni push ili repair dok se razlika ne pregleda.

## Kontrolisana primena — izvršena po zasebnom odobrenju

Korisnik je potvrdio da je samo `032` bila aktivna za primenu i zasebno je odobrio njen push. Uspešan `nails-soft` render potvrđuje da stari constraint više ne blokira tenant, ali nije zamena za čuvanje formalnog verification outputa.

Ne ponavljati push. Sledeći DB korak je isključivo read-only sadržaj `verify_nails_theme_pack.sql`.

Verification je PASS samo ako vrati:

```text
nails_theme_pack_status = PASS
```

## Post-apply smoke

1. U Platform Admin Theme ekranu za `atelier-luna-nails` izabrati `Nails Soft`.
2. Potvrditi da API vraća success, bez PostgreSQL `23514`.
3. Otvoriti draft preview i uraditi hard refresh.
4. Potvrditi `[data-nails-atelier="hero"]` i odsustvo Editorial oznake `01 / USLUGE`.
5. Proveriti service i employee booking preselection, ali ne objavljivati tenant.

## Rollback plan

Pre rollback-a nijedan tenant ne sme koristiti `nails-soft`:

```sql
select id, slug, template_key
from public.businesses
where template_key = 'nails-soft';
```

Ako postoje redovi, prvo ih kroz postojeći Platform Admin Theme tok vratiti na prethodno podržanu temu. Tek zatim, uz zasebno odobrenje, constraint se može vratiti:

```sql
begin;

alter table public.businesses
  drop constraint if exists businesses_template_key_supported_check;

alter table public.businesses
  add constraint businesses_template_key_supported_check
  check (
    template_key in (
      'hair-luxury',
      'hair-editorial',
      'barber-heritage'
    )
  );

commit;
```

Rollback SQL nije automatski deo installera i ne izvršava se bez posebne odluke.
