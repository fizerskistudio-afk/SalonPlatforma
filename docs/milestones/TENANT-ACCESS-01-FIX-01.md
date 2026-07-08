# TENANT-ACCESS-01-FIX-01

## Problem

Prethodni activation flow je menjao lozinku trenutno aktivnoj Supabase sesiji i učitavao prvo aktivno članstvo korisnika.

Ako je platform-admin već bio prijavljen u istom browseru, bilo je moguće otvoriti invite i promeniti lozinku pogrešnom nalogu.

## Rešenje

Platform-admin owner invite sada u callback `next` putanju upisuje:

- `businessSlug`;
- `inviteEmail`.

Auth callback:

- pre obrade invite linka odjavljuje samo trenutnu lokalnu sesiju;
- ne odjavljuje druge uređaje;
- zatim razmenjuje auth kod/token i kreira invite sesiju.

Activation stranica:

- proverava da session email odgovara invite emailu;
- proverava da session user ima aktivno članstvo tačno za tenant iz invite linka;
- prikazuje email i salon pre unosa lozinke;
- blokira i lokalno odjavljuje pogrešan nalog.

Server action ponavlja iste provere pre `updateUser({ password })`.

## Kompatibilnost

Stari generički invite linkovi bez `businessSlug` i `inviteEmail` ostaju u legacy režimu dok njihov generator ne prebacimo na isti strogi format.

Platform-admin owner invite koristi strogi režim odmah.

## Acceptance test

Koristi novi kontrolisani email koji još ne postoji u Supabase Auth.

1. Uloguj se kao platform-admin u normalnom browser prozoru.
2. Otvori Mikin `Owner pristup`.
3. Kreiraj owner poziv za novi test email.
4. Nemoj ručno da se odjavljuješ iz normalnog prozora.
5. Otvori invite link u istom browseru.
6. Callback mora ukloniti samo prethodnu lokalnu sesiju i aktivirati pozvani nalog.
7. Activation ekran mora jasno prikazati:
   - novi test email;
   - Mika Berberin;
   - ulogu Vlasnik.
8. Postavi lozinku.
9. Posle redirect-a `/admin` mora prikazivati samo Mika tenant.
10. `/platform-admin` ne sme biti dostupan tom nalogu.
11. Ponovo se prijavi kao platform-admin i potvrdi da njegova lozinka nije promenjena.

## Recovery script

Nakon uspešnog acceptance testa obriši jednokratni recovery script:

```cmd
del scripts\emergency-set-auth-password.mjs
```
