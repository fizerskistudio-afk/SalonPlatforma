PUBLIC-API-HARDENING-01_FIX-01

Uzrok:
- BookingFlow.tsx ima Windows CRLF zavrsetke redova.
- Prvobitna patch skripta je trazila samo LF marker.
- Booking i availability route su vec patchovani pre pada.

Primena:
1. Raspakuj ovaj FIX u root projekta i potvrdi overwrite.
2. Pokreni:

   APPLY-PUBLIC-API-HARDENING-01_FIX-01.cmd

Skripta je idempotentna. Bezbedno radi nad delimično patchovanim stanjem.
Posle uspeha nastavi sa migracijom 022, PUBLIC_RATE_LIMIT_SECRET, lint i build.
