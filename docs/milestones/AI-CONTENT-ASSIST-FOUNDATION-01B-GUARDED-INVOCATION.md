# AI-CONTENT-ASSIST-FOUNDATION-01B — GUARDED INVOCATION AND SURFACE POLICY

**Datum:** 15. jul 2026.
**Status:** recovery paket pripremljen za lokalnu proveru.
**Branch:** `backup/theme-core-barber-beta`
**Početno stanje:** tačno 14 staged 01A fajlova; neuspešno primenjeni 01B ostaje nestage-ovan.

## Cilj

Dodati server invocation granicu koja pre provider poziva proverava tenant scope, rollout surface, task permission, product entitlement, integration stanje, review source i mesečni package limit.

## Zaključana rollout odluka

AI infrastruktura ostaje generička, ali početna izloženost je ograničena na dve površine:

```text
platform_admin_content_translation
tenant_google_review_reply
```

### Platform Admin prevodi

`content_translation` je u prvom rollout-u dostupan samo platform-admin operateru koji priprema sadržaj klijenta.

Tenant owner/manager ne dobija generalno AI translate dugme.

Package entitlement i mesečni limit i dalje određuju da li je assisted translation uključen u uslugu klijenta.

### Tenant Google review reply

`review_reply_draft` je u prvom rollout-u dostupan samo:

- owner/manager tenant actoru;
- unutar Google Reviews toka;
- za review source `google`;
- kada je Google Reviews integracija povezana;
- uz `reviews.reply.draft` permission;
- uz `ai.review_reply_drafts` entitlement;
- uz raspoloživ mesečni limit.

Platform review, manual testimonial i demo review ne dobijaju AI reply dugme u prvom rollout-u.

## Guard redosled

```text
tenant_scope
surface
package
permission
integration
review_source
quota
provider
```

Provider se ne poziva ako bilo koji prethodni guard blokira zahtev.

## TypeScript recovery

Prethodni 01B pokušaj je prosledio `NormalizedAiContentAssistRequest` direktno provider interface-u, iako normalized `context` može biti `null`, dok provider request prihvata `string | undefined`.

Recovery uvodi eksplicitni `toProviderRequest()` mapper:

```text
null context → omitted context property
string context → provider context
```

01A provider contract se ne menja.

## Package quota contract

Quota period ostaje `calendar_month`.

Limit dolazi iz postojećeg package registry-ja:

```text
aiTranslationRequestsPerMonth
aiReviewDraftsPerMonth
```

01B prima read-only usage snapshot i ne pravi tabelu, counter increment ili reservation write.

Legacy i invalid assignment ostaju unlimited tokom rollout-a.

## Monitoring

Dozvoljeni metadata:

- request ID;
- business ID;
- actor type;
- rollout surface;
- task;
- locale;
- character counts;
- package mode/key;
- quota;
- provider/model;
- token counts;
- stabilan error code.

Nisu dozvoljeni source/context tekst, actor ID, email, customer podaci, raw provider response ili API key.

## Recovery zaštita

Recovery installer:

- zahteva postojeći tačan 14-file 01A staged checkpoint;
- ne menja niti resetuje 01A index;
- rekonstruiše ROADMAP od staged 01A verzije;
- uklanja `payload/` i `installer/` pre TypeScript provere;
- stage-uje 01B tek posle testova, TypeScript-a i build-a;
- na failure-u uklanja samo 01B i vraća ROADMAP worktree na staged 01A;
- nema remote HEAD proveru;
- nema database write, commit ili push.

## Non-goals

01B ne dodaje:

- API rutu;
- tenant ili platform-admin UI;
- Supabase migraciju;
- usage persistence;
- content apply;
- Google reply publish;
- prompt/response storage;
- commit ili push.

## Sledeći korak

`AI-CONTENT-ASSIST-FOUNDATION-01C — AUTH ADAPTERS AND INTERNAL API`

01C mora napraviti dva odvojena adaptera:

```text
Platform Admin translation endpoint
Tenant Google review reply endpoint
```

Ne uvodi se opšti tenant AI endpoint.

## Acceptance

- [ ] postojećih 14 staged 01A fajlova ostaje zaštićeno;
- [ ] `context: null` TypeScript problem je uklonjen;
- [ ] support `payload/` nije uključen u TypeScript proveru;
- [ ] platform-admin translation surface prolazi;
- [ ] tenant translation surface je blokiran;
- [ ] tenant Google reply zahteva povezanu integraciju;
- [ ] non-Google review source je blokiran;
- [ ] package, permission i quota guard prolaze;
- [ ] provider se ne poziva kada je zahtev blokiran;
- [ ] monitoring nema source text ili actor ID;
- [ ] draft-only invariant ostaje;
- [ ] ciljani testovi, TypeScript i `npm run check` prolaze;
- [ ] nema database write-a, commita ili push-a.
