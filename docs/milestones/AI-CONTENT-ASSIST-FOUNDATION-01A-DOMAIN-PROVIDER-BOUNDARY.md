# AI-CONTENT-ASSIST-FOUNDATION-01A — DOMAIN AND PROVIDER BOUNDARY

**Datum:** 15. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`
**Početno stanje:** clean working tree, prazan staging i lokalni HEAD identičan remote branch HEAD-u.

## Cilj

Zaključati bezbedan AI domain contract i provider-neutralnu server granicu pre dodavanja API rute, UI-ja, quota persistence-a ili content write toka.

## Podržani zadaci

01A formalizuje dva postojeća product entitlement slučaja:

```text
content_translation → ai.content_translation
review_reply_draft → ai.review_reply_drafts
```

Provider ne odlučuje da li tenant ili actor sme da koristi zadatak.

Entitlement, permission, tenant scope i quota provere moraju se izvršiti u budućem invocation service sloju pre poziva provideru.

## Draft-only invariant

Svaki uspešan rezultat ima zaključane vrednosti:

```text
status = draft
requiresHumanApproval = true
autoApplyAllowed = false
```

Provider rezultat nikada nije write instrukcija.

Nijedan 01A modul ne menja tenant sadržaj, recenziju, package assignment ili quota stanje.

## Input granica

Provider dobija samo eksplicitno prosleđen tekstualni zahtev:

- task;
- request ID bez PII zahteva;
- source i target locale;
- source text;
- opcioni ograničeni context;
- tone.

Provider request nema:

- business ID;
- actor user ID ili email;
- Supabase credential;
- kompletan tenant record;
- booking ili customer objekat;
- automatski učitan sadržaj iz baze.

Source text je ograničen na 8.000 karaktera, context na 2.000, a request ID na 128 karaktera.

## Groq kao prvi provider

Prvi server provider koristi:

```text
provider: groq
endpoint: https://api.groq.com/openai/v1/chat/completions
model: openai/gpt-oss-20b
env: GROQ_API_KEY
```

Model i endpoint su zaključani u centralnom contract modulu.

Implementacija koristi ugrađeni `fetch`; novi npm SDK nije potreban.

## Structured output

Groq request zahteva:

- JSON Schema response format;
- tačno jedno `draftText` polje;
- `additionalProperties: false`;
- reasoning effort `low`;
- `include_reasoning: false`;
- bez markdown-a i dodatnih objašnjenja.

Raw chain-of-thought se ne zahteva, ne vraća kroz domain rezultat i ne čuva.

## Provider failure granica

Javni provider error contract koristi stabilne kodove:

```text
AI_PROVIDER_NOT_CONFIGURED
AI_PROVIDER_REQUEST_FAILED
AI_PROVIDER_RESPONSE_INVALID
AI_PROVIDER_TIMEOUT
```

Greške ne uključuju:

- API key;
- provider response body;
- raw source text;
- customer ili tenant podatke.

## Server-only granica

Sledeći moduli imaju `server-only` marker:

```text
config-server.ts
groq-provider-server.ts
provider-registry-server.ts
```

`GROQ_API_KEY` se čita samo u server config modulu.

Ne postoji `NEXT_PUBLIC_GROQ_*` promenljiva.

## ROADMAP realignment

01A u istom checkpointu:

- označava `PLATFORM-ADMIN-OPERATIONS-01` kao završen i pushovan;
- usklađuje istorijski Operations closeout contract;
- označava AI foundation kao aktivan;
- beleži 01A kao lokalno završen tek posle PASS-a;
- ostavlja 01A commit/push pending do eksplicitne autorizacije.

## Non-goals

01A ne dodaje:

- API rutu;
- platform-admin ili tenant-admin UI;
- database tabelu ili migraciju;
- quota persistence;
- rate limiting;
- content write/apply servis;
- prompt history;
- raw provider response storage;
- autonomous agent tok;
- web search ili provider tools;
- commit ili push.

## Sledeći korak

`AI-CONTENT-ASSIST-FOUNDATION-01B — GUARDED INVOCATION SERVICE`

Planirani scope:

- tenant i actor context;
- entitlement + permission provera;
- package request limit contract;
- request-level monitoring bez source teksta;
- provider invocation bez database write-a;
- stabilan API result envelope;
- i dalje bez automatskog apply-a.

## Acceptance

- [ ] task-to-entitlement mapping postoji;
- [ ] locale, length i request validation prolaze;
- [ ] draft-only invariant je zaključan testom;
- [ ] Groq endpoint i model su centralizovani;
- [ ] JSON Schema output i hidden reasoning su zaključani;
- [ ] provider config i network sloj su server-only;
- [ ] samo `GROQ_API_KEY` se koristi;
- [ ] provider sloj nema Supabase write;
- [ ] Operations ROADMAP i istorijski contract su realignovani;
- [ ] ciljani Vitest testovi prolaze;
- [ ] `npx tsc --noEmit` prolazi;
- [ ] `npm run check` prolazi;
- [ ] nema migracije, database write-a, commita ili push-a.
