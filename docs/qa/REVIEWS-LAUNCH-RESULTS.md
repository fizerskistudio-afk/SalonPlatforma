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

## Issues

| ID | Severity | Area | Description | Status |
|---|---|---|---|---|

## Decision

- [ ] PASS — production review invitations may be enabled
- [ ] FAIL — production cron remains disabled

Approved by:

Date:
