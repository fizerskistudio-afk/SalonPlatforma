# TENANT-ACCESS-01 — First owner access

## Cilj

Platform-admin mora moći da dodeli prvog ownera postojećem tenant-u bez ručnog SQL rada.

## Implementirano u ovom paketu

- nova platform-admin stranica:
  - `/platform-admin/businesses/[businessSlug]/access`
- novi platform-admin API:
  - `POST /api/platform-admin/businesses/access`
  - `PUT /api/platform-admin/businesses/access`
- povezivanje postojećeg Supabase Auth korisnika;
- slanje invite emaila kada korisnik ne postoji;
- owner membership se kreira pre prihvatanja invite-a;
- pregled:
  - email;
  - invite vreme;
  - email confirmation;
  - poslednja prijava;
  - aktivni/deaktivirani membership;
- aktivacija i deaktivacija owner pristupa;
- zaštita poslednjeg aktivnog ownera preko postojeće DB trigger logike;
- optimistička zaštita preko `updated_at`;
- nova `Owner pristup` akcija u tenant command centru.

## Nije deo ovog paketa

- resend invite za već postojećeg nepotvrđenog auth korisnika;
- transfer ownership workflow;
- automatsko uklanjanje starog ownera;
- custom domeni;
- redirect root `/admin` ruta na budući `app` poddomen.

## Security model

- API prihvata samo aktivnog platform super-admina;
- business se učitava po validiranom slugu;
- membership se vezuje za pronađeni business ID;
- owner ne dobija globalni platform-admin pristup;
- tenant admin i dalje učitava business preko `business_members`;
- deaktiviranje poslednjeg aktivnog ownera blokira postojeći DB trigger.

## Ručni acceptance test

1. Otvori:
   `/platform-admin/businesses/mika-berberin`
2. Klikni `Owner pristup`.
3. Unesi test email koji još nema Supabase Auth nalog.
4. Potvrdi:
   - poruka kaže da je invite poslat;
   - owner se pojavljuje kao `Poziv na čekanju`;
   - Supabase Authentication prikazuje novog korisnika;
   - `business_members` ima:
     - business Mika Berberin;
     - role owner;
     - is_active true.
5. Otvori invite iz emaila.
6. Postavi lozinku.
7. Potvrdi da se korisnik preusmerava na `/admin`.
8. Potvrdi da vidi samo podatke Mika Berberin tenant-a.
9. Otvori Lumière admin pod istim nalogom:
   - korisnik ne sme dobiti Lumière podatke.
10. Dodaj drugog test ownera.
11. Deaktiviraj jednog ownera.
12. Pokušaj da deaktiviraš poslednjeg aktivnog ownera:
   - sistem mora vratiti `LAST_ACTIVE_OWNER`.

## Napomena za Supabase Auth

Za local test redirect URL lista mora dozvoliti odgovarajući callback, na primer:

`http://localhost:3000/auth/callback`

Za budući app domen:

`https://app.<platform-domain>/auth/callback`
