# MONITORING-AUDIT-01

**Datum zatvaranja:** 10. jul 2026.  
**Status:** završen u ubrzanom režimu.

## Cilj

Platforma sada ima zajednički PII-safe server monitoring sloj sa stabilnim event kodovima, request correlation signalom i bez raw exception objekata u kritičnim runtime putanjama.

## Završeni scope

### MONITORING-AUDIT-01A

- zajednički monitoring core;
- validacija ili generisanje `X-Request-ID`;
- isti request ID u API logu i response header-u;
- strukturisani jednolinijski JSON zapis;
- error fingerprint bez raw poruke i stack-a;
- automatska redakcija osetljivih context ključeva;
- public booking, availability i rate-limit signali;
- unit testovi redakcije, request ID-a i error fingerprint-a;
- booking/availability header smoke;
- commit `836ab078edfe5a5b31b18d5e832b626080e2ae70`.

### MONITORING-AUDIT-01B closeout

- admin i staff login rate-limit, credentials i membership anomaly signali;
- reminder cron konfiguracija, autorizacija, run rezultat i unexpected failure;
- reminder scan, context i retry signali;
- email delivery i delivery-status update signali;
- booking notification handler i manual retry signali;
- Resend webhook signature, JSON, matching i processing signali;
- salon i employee Google Calendar sync, context i state-update signali;
- request correlation za cron i webhook HTTP putanje;
- source audit bez direktnog `console.error`/`console.warn` u ciljnim modulima;
- završni `npm run check` pokrenut tokom primene paketa.

## Kritične event porodice

- `auth.admin.*`
- `auth.staff.*`
- `calendar.salon.*`
- `calendar.employee.*`
- `notification.delivery.*`
- `notification.booking_*`
- `notification.reminder.*`
- `notification.webhook.*`

## PII politika

Monitoring context ne sadrži:

- ime klijenta;
- email ili telefon;
- booking napomenu;
- adresu ili recipient;
- request payload/body;
- cookie ili authorization header;
- password, token ili secret;
- raw exception message ili stack.

Dozvoljeni su pseudonimni i operativni identifikatori kao `requestId`, `businessId`, `bookingId`, `deliveryId`, `userId`, stabilan machine code i bezlični status/action enum.

## Namerno nije uvedeno

Sledeće stavke nisu potrebne za zatvaranje code audit-a i ostaju production observability backlog:

- Sentry, Datadog ili drugi spoljni provider;
- alert routing i on-call pravila;
- immutable platform-admin audit tabela;
- retention politika monitoring podataka;
- dashboard i formalni SLO pragovi.

Te stavke se rešavaju zajedno sa `PRODUCTION-DOMAINS-ENV-01`, `PRIVACY-LEGAL-01` i pilot launch konfiguracijom, kada postoje stvarni production domen, provider nalozi i retention odluke.

## Acceptance

- [x] `MONITORING-AUDIT-01A` quality gate prošao;
- [x] booking/availability `X-Request-ID` smoke prošao;
- [x] duboki Calendar, notification, webhook, reminder i auth signali implementirani;
- [x] novi monitoring context ne emituje customer PII;
- [x] ciljni moduli ne loguju raw exception objekte direktno;
- [x] nema SQL migracije, nove tabele ili promene poslovne logike;
- [x] završni `npm run check` prolazi pre upisa ovog closeout dokumenta;
- [ ] puni realni Resend/Google/cron/auth regression ostaje u `MASTER-SYSTEM-QA-01`.
