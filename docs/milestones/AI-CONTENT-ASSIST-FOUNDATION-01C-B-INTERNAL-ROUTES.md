# AI-CONTENT-ASSIST-FOUNDATION-01C-B — INTERNAL ROUTES AND GOOGLE REVIEW CONTEXT

**Datum:** 16. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`

## Cilj

Dodati dve fizički odvojene interne POST rute iznad postojećeg guarded invocation service-a.

```text
POST /api/platform-admin/ai/content-translation
POST /api/admin/reviews/google/reply-draft
```

Ne uvodi se opšti tenant AI endpoint.

## Platform Admin translation ruta

Ruta:

- koristi 01C-A body i request-ID granicu;
- server-side proverava platform-admin sesiju;
- zahteva `tenant.content.translate`;
- task je zaključan na `content_translation`;
- surface je zaključan na `platform_admin_content_translation`;
- učitava read-only usage snapshot;
- poziva postojeći `invokeAiContentAssistForBusiness`;
- vraća samo draft i stabilan quota/error envelope;
- ne upisuje prevedeni sadržaj.

## Tenant Google review reply ruta

Browser sme da pošalje samo:

```text
reviewId
targetLocale
tone?
```

Review tekst nikada ne dolazi iz browser body-ja.

Server:

1. učitava aktivni owner/manager tenant context;
2. koristi business ID isključivo iz sesije;
3. učitava review po `reviewId + business_id`;
4. učitava `review_provider_connections` po `business_id + provider=google`;
5. gradi source text iz server-loaded review reda;
6. prosleđuje stvarni review source i integration state postojećem guard sloju;
7. poziva provider samo ako package, permission, integration, review source i quota prođu.

Cross-tenant review ID se ponaša kao not found.

## Locale granica

Kada review ima podržan `language_code`, on postaje source locale.

Ako provider language nedostaje ili nije podržan, koristi se izabrani target locale kao bezbedan fallback. To ne menja originalni review tekst.

## HTTP contract

- validacija body-ja: 400;
- tenant scope mismatch: 404;
- surface, permission, package, integration ili review source: 403;
- quota exhausted: 429;
- provider request/response failure: 502;
- access/provider config unavailable: 503;
- provider timeout: 504;
- neočekivani interni failure: stabilan 500 bez raw detalja;
- svaki odgovor dobija `X-Request-ID`;
- provider response body, source text, actor ID i credential se ne vraćaju niti loguju.

## Read-only granica

01C-B ne dodaje:

- content translation write;
- Google reply publish;
- owner reply mutation;
- usage increment ili reservation;
- database migraciju;
- Google OAuth;
- UI;
- generic tenant AI route;
- commit ili push.

## ROADMAP proces

01C-B ne menja `ROADMAP.md`.

Posle code PASS-a generiše se zaseban full-file ROADMAP updater iz tačne trenutne verzije dokumenta.

## Sledeći korak

`AI-CONTENT-ASSIST-FOUNDATION-01C-C — ROUTE RUNTIME SMOKE AND FOUNDATION CLOSEOUT`

01C-C proverava obe rute u kontrolisanom runtime-u bez automatskog content apply-a ili Google publish-a, zatim priprema closeout i odluku o usage persistence milestone-u.

## Acceptance

- [ ] stari `installer/` i `payload/` ostaci bezbedno uklonjeni;
- [ ] dve fizički odvojene POST rute postoje;
- [ ] nema generic tenant AI endpointa;
- [ ] platform route zahteva platform permission;
- [ ] tenant route koristi samo aktivni tenant business ID;
- [ ] review tekst se učitava server-side;
- [ ] review i provider connection query imaju business filter;
- [ ] non-Google source ostaje blokiran u invocation guard-u;
- [ ] disconnected Google integration ostaje blokirana;
- [ ] stabilan HTTP i request-ID envelope;
- [ ] nema content/reply/usage write-a;
- [ ] ciljani testovi prolaze;
- [ ] TypeScript prolazi;
- [ ] `npm run check` prolazi;
- [ ] ROADMAP nije menjan;
- [ ] nema commita ili push-a.
