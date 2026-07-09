# TENANT-CREDENTIALS-01

## Cilj

Platform administrator može da kreira owner nalog bez zavisnosti od email isporuke i da eksplicitno generiše novu privremenu lozinku tačno izabranom owner membership-u.

## Implementirano

- poseban platform-admin credential endpoint;
- kreiranje novog potvrđenog Supabase Auth korisnika;
- serverski generisana privremena lozinka;
- jednokratni prikaz emaila, lozinke i login URL-a;
- novi nalog dobija `app_metadata.must_change_password = true`;
- prva prijava vodi na `/admin/change-password`;
- admin stranice i `/api/admin` ostaju blokirani dok se lozinka ne promeni;
- uspešna promena lozinke uklanja obavezni status i osvežava sesiju;
- reset postojeće lozinke zahteva eksplicitni izbor owner membership-a;
- reset proverava membership ID, business ID i owner ulogu;
- postojeći auth korisnik se samo povezuje sa tenantom i njegova lozinka se ne menja automatski;
- postojeći email invite i resend tok ostaje dostupan kao rezervna opcija.

## Bez nove migracije

Ovaj paket ne menja bazu. Status obavezne promene lozinke čuva se u Supabase Auth `app_metadata`.

Poslednja migracija ostaje `021`. Sledeća migracija ostaje rezervisana kao `022` za prvi naredni paket koji zaista zahteva promenu baze.

## Bezbednosni model

- credential endpoint zahteva aktivnog platform administratora;
- privremena lozinka se ne upisuje u aplikacionu bazu;
- API odgovor koristi `no-store` i lozinka se prikazuje samo u trenutnom browser state-u;
- reset nije moguć samo na osnovu user ID-a ili emaila;
- membership mora pripadati konkretnom salonu i imati owner ulogu;
- deaktiviran owner se prvo mora ponovo aktivirati;
- postojeći owner nalog nikada se ne resetuje tokom običnog kreiranja/povezivanja;
- admin proxy blokira administraciju dok JWT nosi `must_change_password = true`.

## Ručni acceptance test

1. Otvori platform-admin access stranicu za test tenant.
2. U sekciji `Direktni credential pristup` unesi potpuno novi test email.
3. Potvrdi da se jednokratno prikazuju:
   - email;
   - privremena lozinka;
   - `/admin/login` URL.
4. Kopiraj kredencijale i zatvori panel.
5. Osveži stranicu i potvrdi da se lozinka više ne prikazuje.
6. Otvori incognito prozor i prijavi se privremenom lozinkom.
7. Potvrdi redirect na `/admin/change-password`.
8. Pokušaj ručno da otvoriš `/admin` pre promene:
   - mora ponovo vratiti change-password stranicu.
9. Postavi novu lozinku od najmanje 10 karaktera.
10. Potvrdi ulazak u admin tenant-a.
11. Odjavi se i potvrdi da privremena lozinka više ne radi.
12. Potvrdi da nova lozinka radi.
13. Na platform-admin stranici izaberi isti owner u reset select-u.
14. Eksplicitno potvrdi reset.
15. Potvrdi da je prikazana nova privremena lozinka i da prethodna lozinka više ne radi.
16. Proveri postojećeg Mika ownera bez klika na reset:
   - njegova lozinka mora ostati nepromenjena.
17. Unesi email već postojećeg auth korisnika koji nema membership za test tenant:
   - nalog treba samo povezati;
   - response ne sme prikazati niti promeniti njegovu lozinku.

## Rollback

- obriši `/api/platform-admin/businesses/credentials`;
- obriši `BusinessOwnerCredentialManager`;
- ukloni credential panel sa access stranice;
- vrati prethodne verzije `lib/auth/admin.ts`, `lib/supabase/proxy.ts`, `proxy.ts` i login action-a;
- obriši `/admin/change-password`.
