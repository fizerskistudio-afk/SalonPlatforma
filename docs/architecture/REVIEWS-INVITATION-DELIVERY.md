# Review Invitation Issuance and Delivery

## Segment

`DEMO-REVIEWS-FOUNDATION-01C-B`

This segment creates the backend outbox and email-delivery lifecycle for verified review invitations.

The public review form remains in `01C-C`.

## Completion hook

A database trigger reacts only to a real booking transition into `completed`.

It schedules one `review_invitation_jobs` row when:

- the tenant is active and published;
- reviews are enabled;
- verified reviews are enabled;
- the booking has a customer email;
- the booking does not already have a review.

Existing historical completed bookings are intentionally not backfilled.

## Delay

The job `run_after` value is derived from tenant `invitation_delay_hours`.

No bearer token exists while the job is waiting.

This avoids storing a recoverable raw token only to support delayed delivery.

## Claiming

The cron worker calls `claim_due_review_invitation_jobs`.

The RPC:

- is service-role only;
- claims a bounded batch;
- uses `FOR UPDATE SKIP LOCKED`;
- recovers processing jobs abandoned for more than 15 minutes;
- limits automatic attempts to five.

## Token lifecycle

At delivery time the worker generates 32 random bytes and encodes them as base64url.

Only its SHA-256 hash enters `review_invitations`.

The raw token exists only long enough to build the email URL.

If an unsent attempt fails:

1. the pending invitation row is deleted;
2. the job is rescheduled with exponential backoff;
3. the next attempt generates a completely new token.

A sent, opened, used or revoked invitation is never rotated.

## Delivery

Email is sent through the shared `sendNotificationEmail` pipeline.

This preserves:

- tenant sender resolution;
- Resend provider delivery;
- provider idempotency;
- test mode;
- `notification_deliveries` audit;
- PII-safe monitoring.

The template key is `review_invitation`.

## Email languages

The invitation email supports Serbian Latin, Macedonian, Croatian, Albanian, English, German and French.

The tenant default locale selects the copy, with Serbian Latin fallback.

## Public URL

Production should define:

```text
REVIEW_PUBLIC_BASE_URL=https://public-salon-domain.example
```

Fallbacks are `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, `VERCEL_PROJECT_PRODUCTION_URL` and `VERCEL_URL`.

Production URLs must use HTTPS.

The generated path is:

```text
/reviews/invitation/[token]
```

That route is delivered in `01C-C`.

## Cron endpoint

```text
GET or POST /api/cron/review-invitations
Authorization: Bearer <CRON_SECRET>
```

Optional batch configuration:

```text
REVIEW_INVITATION_CRON_BATCH_LIMIT=50
```

Do not activate an external production schedule until the `01C-C` public form is deployed.
