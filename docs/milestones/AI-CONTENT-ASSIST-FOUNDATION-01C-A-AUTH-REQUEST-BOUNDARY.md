# AI-CONTENT-ASSIST-FOUNDATION-01C-A — AUTH ADAPTERS AND REQUEST BOUNDARY

**Datum:** 16. jul 2026.
**Status:** application package pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`

## Cilj

Uvesti dve odvojene auth granice i stroge request contracte pre dodavanja konkretnih internih API ruta.

01C-A ne uvodi opšti AI endpoint.

## Rollout površine

```text
platform_admin_content_translation
tenant_google_review_reply
```

### Platform Admin translation

Platform-admin translation adapter:

- koristi postojeći `getPlatformAdminAccess`;
- zahteva novu permission `tenant.content.translate`;
- dozvoljava Sales, Launch Manager i Super Admin uloge;
- IT ostaje read-only i nema AI translation permission;
- gradi samo `platform_admin_content_translation` actor;
- ciljni `businessId` mora proći strogi request contract.

### Tenant Google review reply

Tenant review adapter:

- koristi postojeći `getAdminContext`;
- dozvoljava samo owner/manager context;
- business ID uzima isključivo iz aktivnog tenant contexta;
- ne prihvata business ID iz request body-ja;
- blokira privremenu lozinku;
- blokira nerešen multi-tenant selection;
- gradi samo `tenant_google_review_reply` actor.

## Request contract

Platform Admin translation body prihvata samo:

```text
businessId
sourceLocale
targetLocale
sourceText
context?
tone?
```

Klijent ne sme da prosledi `task`, `requestId`, actor podatke ili provider podatke.

Tenant Google review reply body prihvata samo:

```text
reviewId
targetLocale
tone?
```

Klijent ne sme da prosledi business ID, review source, review text, source locale, task, request ID ili actor podatke.

Review tekst, source, source locale, business ID i Google integration state učitavaju se server-side u 01C-B.

## Request body i request ID

- maksimalni body je 16 KiB;
- proveravaju se i `Content-Length` i stvarni UTF-8 byte count;
- prazan ili invalid JSON vraća stabilan 400 contract;
- oversized body vraća 413;
- request ID koristi postojeći PII-safe monitoring helper;
- request body se ne loguje.

## Usage rollout adapter

01C-A uvodi eksplicitni privremeni režim:

```text
rollout_read_only_zero
```

Loader vraća:

```text
period = calendar_month
used = 0
```

Ovo omogućava package quota odluku bez prerane baze ili counter write-a.

Pravo usage persistence i atomic increment ostaju poseban milestone.

## ROADMAP proces

ROADMAP update je zaseban manual docs korak.

01C-A ne menja `ROADMAP.md`, ne rekonstruiše ga i ne vezuje testove za promenljive statusne rečenice.

Posle uspešnog code PASS-a koristi se zaseban `ROADMAP-UPDATE-AI-CONTENT-ASSIST-01C-A.md` copy/paste dokument.

## Non-goals

01C-A ne dodaje:

- Next.js API rutu;
- Google review database loader;
- Google OAuth ili sync;
- usage tabelu;
- counter increment;
- content apply;
- review publish;
- UI;
- commit ili push.

## Sledeći korak

`AI-CONTENT-ASSIST-FOUNDATION-01C-B — INTERNAL ROUTES AND GOOGLE REVIEW CONTEXT`

01C-B dodaje dve fizički odvojene POST rute:

```text
POST /api/platform-admin/ai/content-translation
POST /api/admin/reviews/google/reply-draft
```

Tenant ruta server-side učitava review i provider connection, potvrđuje isti business, `source=google` i `status=connected`, pa tek onda poziva postojeći invocation service.

## Acceptance

- [ ] nova Platform Admin permission postoji;
- [ ] Sales/Launch Manager/Super Admin imaju translation permission;
- [ ] IT nema translation permission;
- [ ] platform adapter gradi samo translation actor;
- [ ] tenant adapter gradi samo Google reply actor;
- [ ] tenant body nema business ID ili review text;
- [ ] client-controlled task i request ID su odbijeni;
- [ ] body-size i request-ID boundary postoje;
- [ ] usage adapter je read-only;
- [ ] nema API rute ili database write-a;
- [ ] ciljani testovi prolaze;
- [ ] TypeScript prolazi;
- [ ] `npm run check` prolazi;
- [ ] ROADMAP update je pripremljen kao zaseban manual docs korak;
- [ ] nema commita ili push-a.
