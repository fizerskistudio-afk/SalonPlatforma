# PLATFORM-LANDING-ORDUM-01A

**Datum:** 21. jul 2026.
**Status:** code PASS i inicijalni desktop/mobile visual PASS; spremno za release commit.

## Cilj

Zameniti privremeni root demo hub profesionalnim Ordum Studios landing iskustvom koje jasno predstavlja stvarni proizvod i vodi zainteresovani studio ka kontrolisanom kontaktu.

## Implementirano

- route-scoped ivory, ink i restrained-brass vizuelni identitet;
- modularna responsive kompozicija sa header, hero, capability, demo, process, pricing, FAQ, contact i footer segmentima;
- stvarni `heritage-barber-demo` i `atelier-luna-nails` linkovi kroz `buildTenantPublicUrl`;
- Booking Page, Digital Studio i Operations Pro cene i granice direktno iz product package registry-ja;
- server metadata i Ordum site fallback;
- kontakt forma sa server validation, 12 KB body granicom, honeypot zaštitom i postojećim distribuiranim rate limitom;
- Resend slanje kroz postojeći notification config: test mode koristi skriveni `EMAIL_TEST_RECIPIENT`, a production mode `PLATFORM_BUSINESS_EMAIL_ADDRESS`;
- email prima visitor adresu samo kao `replyTo`; nema database write-a i nema izlaganja primaoca klijentu;
- reduced-motion i responsive granice.

## Non-goals

- nema izmene booking, auth, tenancy, admin ili tenant theme renderera;
- nema baze i migracije;
- nema analytics/cookie sistema;
- nema izmišljene metrike, popusta, rokova ili funkcionalnosti izvan registry-ja;
- nema automatskog commita, taga ili push-a.

## QA stanje

- `git diff --check`: PASS;
- ciljani validation i landing acceptance testovi: `6/6` PASS;
- TypeScript: PASS;
- lint: PASS bez error-a; postojeća repo upozorenja ostaju van scope-a;
- production build: PASS sa process-only placeholder Supabase vrednostima i 4 GB Node heap-om;
- kompletan `npm run check`: PASS — lint, `854/854` Vitest testova i production build;
- inicijalni desktop/mobile visual acceptance: PASS;
- production contact smoke još nije predstavljen kao PASS.

## Browser acceptance

- desktop 1440 px i 1280 px;
- mobile 390 px;
- navigacioni anchor-i i live demo linkovi;
- forma: validation, success i error stanje;
- Resend test-mode delivery;
- reduced motion i keyboard fokus.

## Prihvaćeni P2 backlog

- finalni Ordum logo i favicon;
- dodatno usklađivanje vizuelnog identiteta nakon prvog production baseline-a;
- production kontakt forma i Resend delivery smoke posle deploy-a.
