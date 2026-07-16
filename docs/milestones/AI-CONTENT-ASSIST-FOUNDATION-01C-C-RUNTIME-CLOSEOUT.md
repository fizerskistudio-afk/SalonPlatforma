# AI-CONTENT-ASSIST-FOUNDATION-01C-C — ROUTE RUNTIME SMOKE AND FOUNDATION CLOSEOUT

**Datum:** 16. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`

## Cilj

Potvrditi dve 01C-B interne rute kroz controlled Request/Response runtime i zatvoriti AI content-assist foundation bez database ili provider side effect-a.

## Runtime boundary

01C-C izdvaja:

```text
createAiContentAssistInternalApiHandlers
```

Factory sadrži isti request parsing, auth sequencing, review context sequencing, usage loading, invocation i HTTP response mapping koji koristi production server.

`internal-api-server.ts` ostaje `server-only` composition root i povezuje factory sa postojećim realnim adapterima:

- Platform Admin auth;
- tenant owner/manager auth;
- 16 KiB JSON body reader;
- server-side Google review context loader;
- read-only zero usage adapter;
- guarded invocation service;
- PII-safe monitoring;
- `X-Request-ID`.

## Controlled runtime smoke

Automatizovani test koristi pravi:

- request contract;
- command normalization;
- HTTP status mapping;
- stable JSON envelope;
- browser-like `Request`;
- runtime `Response`;
- request-ID header;
- handler sequencing.

Kontrolisani dependency adapteri zamenjuju samo spoljne auth, Supabase i provider granice.

Pokriveni statusi:

```text
200
400
401
403
404
413
500
503
504
```

Success rezultat ostaje:

```text
status = draft
requiresHumanApproval = true
autoApplyAllowed = false
```

## Security zaključci

- tenant body ne može da prosledi business ID ili review tekst;
- tenant business ID dolazi iz aktivne sesije;
- review context se učitava pre invocation-a;
- auth failure zaustavlja review loader;
- missing ili cross-tenant review zaustavlja invocation;
- storage failure ne vraća raw provider/database detalj;
- request ID ostaje stabilan u header-u i body-ju;
- nema generic tenant AI endpointa;
- production composition ostaje server-only.

## Foundation closeout odluka

Posle 01C-C PASS-a application foundation se smatra završenim:

- domain i provider boundary;
- guarded invocation;
- rollout surfaces;
- auth adapteri;
- strogi request contracti;
- dve odvojene interne rute;
- server-loaded Google review context;
- controlled Request/Response runtime smoke.

Ovo nije tvrdnja da je AI proizvodni UI aktiviran ili da je izvršen live Groq/Google smoke.

## Usage odluka

Pravi persistence, reservation i atomic increment izdvajaju se u:

```text
AI-CONTENT-ASSIST-USAGE-01
```

Ne blokiraju starter packs, content intake ili početak tema.

Dok se usage milestone ne aktivira:

```text
rollout_read_only_zero
```

ostaje eksplicitni režim. Paket entitlement se proverava, ali stvarni mesečni limit se ne troši i ne sme se predstavljati kao production billing enforcement.

Usage persistence mora biti završen pre plaćene produkcione quota aktivacije.

## Sledeći proizvodni korak

```text
CONTENT-STARTER-PACKS-01A
```

Posle starter packs sledi client content intake i preview sharing, zatim Editorial, Barber i Nails tema.

## ROADMAP proces

01C-C ne menja `ROADMAP.md`.

Posle code PASS-a generiše se zaseban full-file ROADMAP updater iz tačne pushovane 01C-B verzije.

## Non-goals

01C-C ne dodaje:

- AI UI;
- content apply;
- Google reply publish;
- database migration;
- usage write;
- billing;
- Google OAuth;
- production provider smoke;
- commit ili push.

## Acceptance

- [ ] runtime factory postoji;
- [ ] production server koristi isti runtime factory;
- [ ] dve postojeće route datoteke ostaju odvojene;
- [ ] controlled Platform Admin success prolazi;
- [ ] controlled tenant Google success prolazi;
- [ ] auth, validation, tenant scope, storage i provider failure scenariji prolaze;
- [ ] `X-Request-ID` je potvrđen;
- [ ] success ostaje draft-only;
- [ ] nema content, reply ili usage write-a;
- [ ] ciljani testovi prolaze;
- [ ] TypeScript prolazi;
- [ ] `npm run check` prolazi;
- [ ] ROADMAP nije menjan;
- [ ] nema commita ili push-a.
