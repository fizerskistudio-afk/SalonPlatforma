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
- [x] Git checkpoint committed and pushed — `6512ffa959578bd73e6576c0bb1bd08cc2a45f6c`;
- [ ] production cron enabled after deployed 01C-C browser smoke.

#### 01C-C — Public UX

- [x] direct site review route and form;
- [x] verified post-booking route and form;
- [x] server-side tenant and invitation context guard;
- [x] hash-before-RPC bearer handling;
- [x] shared responsive form;
- [x] accessible native star rating controls;
- [x] honeypot, required and body-length boundaries;
- [x] seven-language UI through central locale and `t()`;
- [x] localized validation, unavailable, rate-limit and conflict states;
- [x] pending and published success states;
- [x] noindex transactional-page boundary;
- [x] loading and unavailable states;
- [x] unit and source-contract tests;
- [x] final `npm run check`;
- [ ] deployed direct and verified browser smoke;
- [x] Git checkpoint committed and pushed — `715a00f296b57343c7e1fbc2fbd6d2bbff289f05`;
- [ ] production invitation cron enabled after deployed smoke.

### 01D — Admin moderation

- [x] moderation queue and status filters;
- [x] publish/reject/flag/archive lifecycle;
- [x] moderation reason requirement and audit trail;
- [x] owner replies for published platform reviews;
- [x] Google replies remain provider-managed;
- [x] customer author/rating/body excluded from admin mutations;
- [x] authenticated owner/manager RPC permission boundary;
- [x] row locks and transition validation;
- [x] sidebar attention counter for pending and flagged;
- [x] responsive loading and empty states;
- [x] migration and read-only verification source;
- [x] unit and source-contract tests;
- [x] final `npm run check`;
- [x] migration applied to target database;
- [x] database verification returned `PASS`;
- [x] moderation browser smoke;
- [x] Git checkpoint committed and pushed — `41f42c93937a836b808c0ad32e8836cf4f7e2f06`.

### 01E — Google provider — deferred post-launch

Launch baseline: manually configured official Google review URL and QR CTA. Full Places or Business Profile provider integration is not an initial StudioBiBi launch blocker.

- [ ] Google location settings;
- [ ] official review link;
- [ ] provider adapter;
- [ ] sync metadata;
- [ ] attribution;
- [ ] provider errors and stale state.

### 01F — Catalog and theme integration

#### 01F-A — Catalog review contract

- [x] published review query in the shared public catalog loader;
- [x] second published-only boundary in the pure mapper;
- [x] tenant review settings and source switches;
- [x] public demo exclusion and authenticated preview rule;
- [x] review item, summary and configuration catalog types;
- [x] platform-only local owner reply output;
- [x] manual Google review URL catalog configuration;
- [x] backward-compatible optional fields during staged theme migration;
- [x] unit and source-contract tests;
- [x] final `npm run check`;
- [x] Git checkpoint committed and pushed — `0e554a7405fd1e801fba9a40a22f10cbd6c7bdc3`.

#### 01F-B — Shared review presentation

- [x] shared fractional star rating;
- [x] shared review card and platform owner reply;
- [x] source and verified-visit badges;
- [x] Google external attribution and official CTA;
- [x] rating average and 1–5 distribution;
- [x] unrated testimonial state;
- [x] empty and long-copy states;
- [x] UTC-stable localized date formatting;
- [x] seven-language central UI labels;
- [x] responsive brand-token shared section;
- [x] accessibility labels, list semantics and progress bars;
- [x] helper unit and source-contract tests;
- [x] final `npm run check`;
- [x] Git checkpoint committed and pushed — `4d056cc642f1f969ea83c8e5145dcf3a5f2ca21c`.

#### 01F-C — Theme integration

- [x] remove static review imports and legacy review type;
- [x] make catalog review fields mandatory;
- [x] pass preview mode through the shared template contract;
- [x] Lumière desktop/mobile integration;
- [x] Editorial desktop/mobile integration;
- [x] Barber desktop/mobile integration;
- [x] desktop review navigation anchors where supported;
- [x] shared mobile content parity without duplicate datasets;
- [x] theme-integration source-contract tests;
- [x] final `npm run check`;
- [x] Git checkpoint committed and pushed — `4a701cd142db8ee19468464a6e2fd7f6990afdab`.

### 01G — QA and launch activation

#### 01G-A — Local launch readiness

- [x] review launch QA matrix;
- [x] evidence/results template;
- [x] six theme/viewport integration paths;
- [x] seven-locale acceptance matrix;
- [x] public, moderation and tenant-isolation smoke procedures;
- [x] launch-readiness source-contract test;
- [x] final `npm run check`;
- [ ] browser and responsive results completed;
- [x] Git checkpoint committed and pushed — `da8816d737e7fda118b31d9f7d3c012449e3491f`.

#### 01G-B1 — Read-only preflight completed locally

- [x] deployed smoke CLI;
- [x] public tenant and catalog contract checks;
- [x] review form and invalid-token checks;
- [x] cron authentication boundary checks;
- [x] sanitized evidence report;
- [x] plan-aware Vercel activation runbook;
- [x] source-contract test;
- [x] final `npm run check`;
- [x] Git checkpoint committed and pushed — `29a0edb168019d36d81864edf7965a7ad40f9cff`;
- [x] local report passed against `http://localhost:3000` and tenant `lumiere-studio`;
- [ ] repeat the same report against the future public production host.

#### 01G-B2 — Controlled local test-mode invitation E2E core PASS

- [x] one eligible completed test booking;
- [x] one authorized cron invocation with batch limit 1;
- [x] one test-mode Resend delivery;
- [x] single-use verified invitation submission;
- [x] pending → moderation → published flow;
- [x] public verified-visit badge;
- [ ] runtime deduplication, retry/backoff and stale-recovery evidence remains in master/production QA.

#### 01G-B3 — Production activation deferred

The review feature is functionally proven on localhost, but production activation is intentionally not claimed. Domain setup, Vercel Pro scheduling and public-host smoke belong to `PRODUCTION-DOMAINS-ENV-01`.

- [ ] deployed direct review smoke;
- [ ] deployed verified invitation smoke;
- [ ] completed booking to Resend delivery production E2E;
- [ ] moderation and cross-tenant production smoke;
- [ ] protected production cron smoke;
- [ ] retry, deduplication and stale recovery;
- [ ] production invitation schedule enabled;
- [ ] final production launch evidence and closeout;
- [x] no premature `vercel.json` or Hobby-grade once-daily scheduler activation.


### 01G — QA closeout

- [ ] seven-language UI;
- [ ] empty/loading/error states;
- [ ] direct submission smoke;
- [ ] verified visit smoke;
- [ ] moderation smoke;
- [ ] Google CTA/provider smoke;
- [ ] cross-tenant regression;
- [ ] production build.
