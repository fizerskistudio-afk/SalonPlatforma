# Reviews Launch QA Results

## Build identity

- Branch:
- Commit SHA:
- Deployment URL:
- Deployment date:
- Tester:
- Tenant slug:
- Supabase project reference:

## Automated checks

- [ ] `npm run check`
- [ ] tests
- [ ] lint
- [ ] production build
- [ ] review launch-readiness contract
- [ ] no legacy static review source

## Theme matrix

### Lumière

- [ ] desktop
- [ ] mobile
- [ ] reviews disabled
- [ ] empty
- [ ] one review
- [ ] multiple reviews
- [ ] verified visit
- [ ] testimonial
- [ ] Google
- [ ] demo preview
- [ ] owner reply
- [ ] long content

### Editorial

- [ ] desktop
- [ ] mobile
- [ ] reviews disabled
- [ ] empty
- [ ] one review
- [ ] multiple reviews
- [ ] verified visit
- [ ] testimonial
- [ ] Google
- [ ] demo preview
- [ ] owner reply
- [ ] long content

### Barber

- [ ] desktop
- [ ] mobile
- [ ] reviews disabled
- [ ] empty
- [ ] one review
- [ ] multiple reviews
- [ ] verified visit
- [ ] testimonial
- [ ] Google
- [ ] demo preview
- [ ] owner reply
- [ ] long content

## Locale matrix

- [ ] sr-Latn
- [ ] mk
- [ ] hr
- [ ] sq
- [ ] en
- [ ] de
- [ ] fr

## Submission and moderation

- [ ] direct review E2E
- [ ] verified invitation E2E
- [ ] token single-use
- [ ] moderation transitions
- [ ] owner reply
- [ ] immutable customer content
- [ ] audit privacy
- [ ] cross-tenant rejection

## Deployment and delivery

- [ ] public routes deployed
- [ ] admin route deployed
- [ ] Resend sender verified
- [ ] required environment configured
- [ ] protected cron smoke
- [ ] deduplication
- [ ] retry/backoff
- [ ] stale recovery
- [ ] production schedule enabled

## Evidence

Record links, screenshots, timestamps and non-secret identifiers here.

Do not record:

- raw invitation tokens;
- Supabase service-role keys;
- `CRON_SECRET`;
- Resend API keys;
- private customer data beyond what is strictly needed for the test.

## Controlled local E2E evidence — 2026-07-12

- Environment: local development host only (`http://localhost:3000`)
- Branch: `backup/theme-core-barber-beta`
- Baseline commit before this evidence update: `29a0edb168019d36d81864edf7965a7ad40f9cff`
- Tenant: `lumiere-studio`
- Supabase project reference: `uvhwrmaaecjjgtayufcj`
- Email mode: delivery enabled, test mode enabled, controlled test recipient configured
- Secrets, recipient address and raw invitation token: intentionally not recorded

### Read-only preflight result

- [x] platform root returned 200
- [x] tenant public page returned 200
- [x] catalog review contract returned 200
- [x] direct review page returned 200 and noindex metadata was present
- [x] invalid invitation page returned 200 and noindex metadata was present
- [x] cron without credentials returned 401
- [x] cron with intentionally wrong credentials returned 401
- [x] authorized cron was not called by the preflight script
- [x] preflight script sent no email and performed no database mutation

### Controlled invitation E2E result

- [x] booking notification emails were delivered in test mode
- [x] completed booking created an eligible review invitation job
- [x] one authorized worker invocation processed the controlled job
- [x] review invitation email arrived at the controlled test mailbox
- [x] invitation form opened successfully
- [x] review submission consumed the invitation once
- [x] repeated token use was rejected
- [x] submitted review entered moderation as a platform verified-visit review
- [x] moderation published the review
- [x] public Lumière page displayed the review with the verified-visit badge

### Not yet claimed

- [ ] public production-host smoke
- [ ] direct-review production E2E
- [ ] cross-tenant production regression
- [ ] runtime retry/backoff evidence
- [ ] stale-worker recovery evidence
- [ ] production cron schedule

Decision: **LOCAL CORE PASS / PRODUCTION ACTIVATION DEFERRED**. The scheduler remains part of `PRODUCTION-DOMAINS-ENV-01` after domain and Vercel Pro activation.

## Issues

| ID | Severity | Area | Description | Status |
|---|---|---|---|---|

## Decision

- [ ] PASS — production review invitations may be enabled
- [ ] FAIL — production cron remains disabled

Approved by:

Date:
