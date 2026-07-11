# DEMO-REVIEWS-FOUNDATION-01

## Goal

Create one multi-source review system shared by every theme and tenant.

The system supports:

- direct platform reviews;
- verified reviews after completed bookings;
- Google reviews and the official Google review CTA;
- salon-managed testimonials;
- generated demo reviews restricted to preview;
- moderation and owner replies;
- explicit public source badges.

## Why this precedes theme closeout

Lumière currently renders static review content, while Editorial and Barber still lack review capability.

Finishing individual themes before the shared review contract would create duplicated temporary implementations. The shared review foundation therefore runs after theme architecture and before individual theme closeout milestones.

## Locked sources

1. `platform`
2. `google`
3. `manual-testimonial`
4. `demo`

## Locked statuses

1. `pending`
2. `published`
3. `rejected`
4. `flagged`
5. `archived`

## Trust rules

- direct platform comments are allowed without a booking;
- only platform reviews linked to an eligible booking may show `Verified visit`;
- Google remains externally managed;
- salon testimonials are visibly labelled;
- demo content never becomes production reputation;
- salons may moderate visibility but may not rewrite real customer or Google feedback.

## Segments

### 01A — Domain contract

- [x] source and status types;
- [x] source capability matrix;
- [x] rating and verification invariants;
- [x] public badge kinds;
- [x] production restriction for demo content;
- [x] automated unit tests;
- [x] architecture documentation;
- [x] final `npm run check`.

### 01B — Database and RLS

- [x] review table source;
- [x] tenant review settings source and existing-business backfill;
- [x] provider metadata without stored OAuth secrets;
- [x] booking invitation SHA-256 token hashes without raw tokens;
- [x] indexes and uniqueness;
- [x] same-business and completed-booking validation triggers;
- [x] public published-only and owner/manager RLS source;
- [x] migration contract test;
- [x] read-only verification SQL;
- [x] source file `supabase/migrations/025_reviews_foundation.sql`;
- [x] migration applied to target Supabase database through Supabase CLI;
- [x] database verification returned `PASS`.

### 01C — Public submission

#### 01C-A — Secure submission core

- [x] direct and verified request validation;
- [x] hash-only bearer token processing;
- [x] direct review API source;
- [x] verified invitation context and submit API source;
- [x] service-role-only database RPCs;
- [x] atomic invitation row lock and consume;
- [x] body, honeypot, rate-limit and monitoring boundaries;
- [x] migration and read-only verification source;
- [x] unit and source-contract tests;
- [x] final `npm run check`;
- [x] migration applied to target database;
- [x] database verification returned `PASS`;
- [x] Git checkpoint committed and pushed — `0cc67e58a766d73c281ea6f078fd32f435684c7c`.

#### 01C-B — Invitation issuance

- [x] 256-bit random base64url bearer generation;
- [x] hash-only invitation persistence;
- [x] completed-booking database trigger;
- [x] delayed outbox job from tenant settings;
- [x] concurrent-safe job claim;
- [x] stale worker recovery and bounded retry;
- [x] fresh token rotation after failed unsent attempts;
- [x] shared email delivery, dedupe and audit integration;
- [x] seven-language invitation email;
- [x] CRON_SECRET-protected worker route;
- [x] migration and read-only verification source;
- [x] unit and source-contract tests;
- [x] final `npm run check`;
- [x] migration applied to target database;
- [x] database verification returned `PASS`;
- [ ] Git checkpoint committed and pushed;
- [ ] production cron enabled after 01C-C public form deployment.

#### 01C-C — Public UX

- [ ] direct site review form;
- [ ] verified post-booking form;
- [ ] localized success and error states;
- [ ] responsive and accessibility QA.

### 01D — Admin moderation

- [ ] moderation queue;
- [ ] publish/reject/flag/archive;
- [ ] owner replies for platform reviews;
- [ ] source-safe edit restrictions;
- [ ] owner/manager permissions;
- [ ] attention counters.

### 01E — Google provider

- [ ] Google location settings;
- [ ] official review link;
- [ ] provider adapter;
- [ ] sync metadata;
- [ ] attribution;
- [ ] provider errors and stale state.

### 01F — Catalog and theme integration

- [ ] published reviews in `CatalogData`;
- [ ] remove static review import;
- [ ] shared review card/list;
- [ ] desktop/mobile parity;
- [ ] source filters and badges;
- [ ] Lumière, Editorial and Barber integration.

### 01G — QA closeout

- [ ] seven-language UI;
- [ ] empty/loading/error states;
- [ ] direct submission smoke;
- [ ] verified visit smoke;
- [ ] moderation smoke;
- [ ] Google CTA/provider smoke;
- [ ] cross-tenant regression;
- [ ] production build.
