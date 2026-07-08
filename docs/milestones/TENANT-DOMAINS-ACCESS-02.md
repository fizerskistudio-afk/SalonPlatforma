# TENANT-DOMAINS-ACCESS-02

## Javni tenant link

`BusinessPublicLinkActions` sada dobija pravi URL kroz zaštićen platform-admin endpoint.

Endpoint koristi:

- `PLATFORM_ROOT_DOMAIN`
- `PLATFORM_ROOT_PROTOCOL`
- postojeći `buildTenantPublicUrl`

Ako konfiguracija nedostaje, ostaje `/salon/[slug]` fallback.

## Ponovno slanje owner aktivacije

Supabase klijentski `auth.resend` ne podržava invite emailove. Zato tok koristi:

1. `auth.admin.generateLink`;
2. `type: invite` za nepotvrđen email;
3. `type: recovery` za potvrđen email bez prve prijave;
4. postojeći `sendResendEmail` transport.

Akcioni link se ne vraća browseru niti loguje.

## Ograničenja

- resend nije dostupan owneru koji je već imao `last_sign_in_at`;
- za takvog korisnika kasnije dodajemo standardni forgot-password tok;
- platform-admin mora biti autorizovan;
- membership mora pripadati konkretnom business-u i imati owner ulogu;
- deaktiviran membership mora prvo biti aktiviran;
- nema nove migracije baze.
