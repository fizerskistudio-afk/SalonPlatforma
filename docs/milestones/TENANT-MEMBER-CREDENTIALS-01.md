# TENANT-MEMBER-CREDENTIALS-01

## Cilj

Vlasnik salona može bez email zavisnosti da kreira i resetuje direktne kredencijale za manager i staff naloge.

## Implementirano

- novi tenant-owner endpoint:
  - `POST /api/admin/member-credentials`;
- akcije:
  - `create_member`;
  - `reset_member_password`;
- privremena jaka lozinka;
- jednokratni prikaz emaila, lozinke i login URL-a;
- obavezna promena lozinke pri prvoj prijavi;
- manager koristi `/admin/login`;
- staff koristi `/staff/login`;
- staff nalog se pri kreiranju odmah povezuje sa aktivnim zaposlenim;
- postojeći Supabase korisnik se samo povezuje i lozinka mu se ne menja;
- reset je vezan za tačan membership i business;
- tenant owner ne može resetovati nalog koji ima aktivno članstvo u drugom salonu;
- owner nalozi nisu cilj ovog endpointa;
- manager ima read-only pregled, ali ne može kreirati ili resetovati kredencijale.

## Staff password guard

- dodat `/staff/change-password`;
- `/staff` i `/api/staff` su blokirani dok je `must_change_password=true`;
- staff nakon promene lozinke nastavlja na `/staff`;
- ako veza sa zaposlenim nedostaje, standardni tok ga nakon promene šalje na setup-required.

## Migracija

Nema nove migracije. Postojeći `business_members.employee_id` model je dovoljan.

## Acceptance test

1. Prijavi se kao Mika owner.
2. Otvori `/admin/members`.
3. Kreiraj novi manager nalog direktnim kredencijalima.
4. Kopiraj privremenu lozinku i prijavi se kroz `/admin/login`.
5. Potvrdi redirect na `/admin/change-password` i promenu lozinke.
6. Kreiraj novi staff nalog i izaberi aktivnog zaposlenog.
7. Prijavi se kroz `/staff/login`.
8. Potvrdi redirect na `/staff/change-password`.
9. Promeni lozinku i potvrdi pristup samo povezanom staff dashboardu.
10. Resetuj manager i staff lozinku iz owner panela.
11. Potvrdi da stare lozinke više ne rade.
12. Potvrdi da manager ne vidi aktivne credential akcije.
