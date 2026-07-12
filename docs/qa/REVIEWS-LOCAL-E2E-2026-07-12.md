# Reviews Local E2E Evidence — 2026-07-12

## Scope

This record documents the controlled localhost verification of the shared verified-review flow. It is not a production deployment approval.

## Build identity

- Branch: `backup/theme-core-barber-beta`
- Baseline commit: `29a0edb168019d36d81864edf7965a7ad40f9cff`
- Host: `http://localhost:3000`
- Tenant: `lumiere-studio`
- Supabase project reference: `uvhwrmaaecjjgtayufcj`

## Passed

1. Read-only preflight returned seven PASS checks.
2. Missing and intentionally wrong cron credentials returned 401.
3. One completed test booking produced an eligible invitation job.
4. One authorized worker invocation delivered one test-mode review invitation.
5. The invitation form accepted one review submission.
6. Reuse of the same invitation token was rejected.
7. The review entered moderation as a platform verified-visit review.
8. Publishing through admin moderation succeeded.
9. The public Lumière page displayed the review with the verified-visit badge.

## Privacy and secret boundary

The record intentionally excludes:

- raw invitation tokens;
- customer or test-recipient email addresses;
- `CRON_SECRET`;
- Resend API keys;
- Supabase service-role credentials.

## Remaining production gates

- public production-host preflight;
- direct-review production E2E;
- cross-tenant production regression;
- runtime retry/backoff and stale-worker evidence;
- Vercel Pro cron registration;
- final production activation evidence.

## Decision

**LOCAL CORE PASS.** Production scheduling is deferred to `PRODUCTION-DOMAINS-ENV-01` after the domain and Vercel Pro plan are available. No `vercel.json` is introduced by this closeout.
