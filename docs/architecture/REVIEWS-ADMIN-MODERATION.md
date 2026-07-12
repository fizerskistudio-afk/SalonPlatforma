# Reviews Admin Moderation

## Segment

`DEMO-REVIEWS-FOUNDATION-01D`

This segment adds tenant-admin moderation without granting direct review mutation privileges.

## Permission boundary

Only active `owner` or `manager` memberships for the review tenant may change moderation status, set or remove a local platform owner reply, and read the moderation audit.

Authenticated users retain no direct `UPDATE` privilege on `reviews`.

## Status lifecycle

Allowed transitions:

- `pending` → `published`, `rejected`, `flagged`, `archived`;
- `published` → `flagged`, `archived`;
- `rejected` → `pending`, `archived`;
- `flagged` → `published`, `rejected`, `archived`;
- `archived` → `pending`.

A published review is not directly rejected. It is first flagged when it needs investigation.

## Moderation reasons

A reason of at least three characters is required when moving a review to `rejected`, `flagged`, or `archived`.

The interface explicitly states that a negative rating alone is not a valid rejection reason.

## Customer content integrity

Admin moderation operations never accept or update author name, rating, review body, review language, verified-visit identity, booking identity, or invitation identity.

The only mutable public-facing fields in this segment are status and platform owner reply.

## Owner replies

Local owner replies are supported only when `source = platform` and `status = published`.

Google replies remain provider-managed and are deferred with the Google provider integration.

Manual testimonials and demo content do not support owner replies.

## Audit

Every status change and reply change creates one `review_moderation_events` row.

Audit metadata stores operational facts, not customer review text or full reply text.

## Admin interface

Route:

```text
/admin/reviews
```

The shared admin navigation shows an attention badge equal to:

```text
pending + flagged
```

## Verification

Run:

```text
supabase/verification/verify_review_moderation.sql
```

Expected status:

```text
PASS
```
