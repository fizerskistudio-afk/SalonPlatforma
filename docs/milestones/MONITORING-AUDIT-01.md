# MONITORING-AUDIT-01

**Datum pripreme:** 10. jul 2026.  
**Status:** `MONITORING-AUDIT-01A` je implementiran u paketu i čeka lokalni quality gate.

## Cilj

Uvesti zajednički server monitoring sloj pre povezivanja spoljnog error-tracking servisa. Prvi korak mora da obezbedi stabilne event kodove, request correlation i PII-safe error signal bez menjanja poslovne logike.

## MONITORING-AUDIT-01A scope

- zajednički monitoring core;
- validacija ili generisanje `X-Request-ID`;
- isti request ID u strukturisanom logu i HTTP response header-u;
- JSON log zapis sa `timestamp`, `level` i stabilnim `event` kodom;
- error fingerprint bez raw poruke i stack-a;
- automatska redakcija osetljivih context ključeva;
- booking create failure signal;
- booking rate-limit anomaly signal;
- availability query i rate-limit signal;
- Google Calendar sync signal iz public booking putanje;
- booking-created notification failure signal;
- centralizovani rate-limit storage failure signal.

## Event kodovi u 01A

- `booking.business_query.failed`
- `booking.create.rejected`
- `booking.create.failed`
- `booking.create.invalid_result`
- `booking.rate_limit.blocked`
- `booking.rate_limit.unavailable`
- `booking.unexpected`
- `availability.business_query.failed`
- `availability.query.failed`
- `availability.rate_limit.blocked`
- `availability.rate_limit.unavailable`
- `availability.unexpected`
- `calendar.booking_sync.failed`
- `calendar.booking_sync.succeeded`
- `calendar.booking_sync.unexpected`
- `notification.booking_created.failed`
- `rate_limit.key_creation.failed`
- `rate_limit.storage.failed`
- `rate_limit.storage.empty_result`

## PII politika

Monitoring context ne sme da sadrži:

- customer ime;
- email;
- telefon;
- booking napomenu;
- adresu;
- recipient vrednost;
- request payload ili body;
- cookie ili authorization header;
- password, token ili secret;
- raw exception message ili stack.

Dozvoljeni context primeri:

- `requestId`;
- `businessSlug`;
- `businessId`;
- `bookingId`;
- stabilan machine/error code;
- rate-limit scope;
- boolean status;
- bezlični action enum.

## Van scope-a

- nema Sentry, Datadog ili drugog spoljnog providera;
- nema nove baze ili monitoring tabele;
- nema SQL migracije;
- nema platform-admin audit log tabele;
- nema globalne migracije svih postojećih `console.*` poziva;
- nema promene auth, tenancy, RLS ili booking logike.

## Sledeće faze

### MONITORING-AUDIT-01B

- Google Calendar sync moduli van public booking rute;
- notification delivery/retry/webhook duboke putanje;
- admin/staff auth anomalije;
- cron/reminder monitoring.

### MONITORING-AUDIT-01C

- platform-admin immutable audit log dizajn;
- retention i pristup audit podacima;
- provider adapter i produkcioni alerting;
- dashboard/SLO pragovi.

## Acceptance

- [x] monitoring core i unit testovi implementirani u paketu;
- [x] raw error message i stack se ne emituju kroz novi logger;
- [x] public booking, availability i rate-limit putanje koriste strukturisane evente;
- [x] response dobija `X-Request-ID`;
- [x] source audit ne nalazi `console.error` u tri ciljna fajla;
- [ ] `npm run lint`;
- [ ] `npm test`;
- [ ] `npm run build`;
- [ ] `npm run check`;
- [ ] booking/availability response header smoke;
- [ ] strukturisani log smoke bez PII.
