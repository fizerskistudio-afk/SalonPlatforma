# AI Content Assist 01C-C — Controlled Runtime Smoke

**Datum:** 16. jul 2026.
**Scope:** dve interne AI rute.
**Režim:** automatizovani controlled Request/Response runtime bez pravog provider ili database write-a.

## Rute

```text
POST /api/platform-admin/ai/content-translation
POST /api/admin/reviews/google/reply-draft
```

## Zašto controlled runtime

Cilj 01C-C nije da troši pravi Groq zahtev, menja tenant sadržaj ili objavi Google odgovor.

Isti HTTP orchestration koji koristi production server izvršava se kroz `createAiContentAssistInternalApiHandlers`, ali sa kontrolisanim dependency adapterima:

- auth success i failure;
- server-loaded Google review context;
- read-only usage snapshot;
- invocation success i stabilni blocker rezultati;
- request-ID response header;
- sanitized internal error logging.

Production `internal-api-server.ts` povezuje isti factory sa realnim auth, Supabase context, usage, invocation i monitoring adapterima.

## Automatizovani scenariji

- Platform Admin translation 200 draft;
- tenant Google review reply 200 draft;
- zabrana client-injected business ID i review teksta;
- tenant unauthenticated 401;
- cross-tenant ili missing review 404;
- review context storage unavailable 503;
- integration blocker 403;
- provider timeout 504;
- oversized body 413;
- unexpected internal failure 500;
- svaki odgovor zadržava stabilan request ID;
- success draft zahteva human approval i ima `autoApplyAllowed=false`.

## Write granica

Smoke ne izvršava:

- content apply;
- Google reply publish;
- review owner-reply mutation;
- usage reservation ili increment;
- Supabase migration;
- OAuth promenu;
- produkcioni provider poziv.

## Kasniji live activation smoke

Tek kada postoje kontrolisan tenant, povezana Google Reviews integracija i eksplicitna dozvola:

1. proveriti Platform Admin translation draft sa realnim `GROQ_API_KEY`;
2. proveriti tenant Google review reply draft nad odabranom Google recenzijom;
3. potvrditi da nijedan rezultat nije automatski sačuvan ili objavljen;
4. potvrditi provider failure i timeout monitoring bez raw sadržaja;
5. aktivirati usage persistence pre stvarnog plaćenog quota enforcement-a.

Live activation nije deo 01C-C application paketa.
