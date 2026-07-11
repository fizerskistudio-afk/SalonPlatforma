# Reviews Database Foundation

## Scope

This schema is the persistence and tenant-security foundation for the shared review system.

It does not yet expose public submission or admin moderation mutations. Those flows are added through reviewed server APIs/RPCs in the following segments.

## Tables

### `review_settings`

One row per business.

Controls:

- global review visibility;
- direct platform collection;
- verified visit collection;
- testimonials;
- Google display;
- moderation;
- rating summary;
- preview/demo content;
- invitation delay and expiry;
- official Google review URL.

Existing businesses are backfilled. A business insert trigger creates defaults for future tenants.

### `review_provider_connections`

Stores non-secret provider metadata:

- provider;
- connection status;
- Google account/location IDs;
- place ID;
- sync metadata and errors.

OAuth tokens and provider secrets are intentionally not stored in this table.

### `review_invitations`

One invitation per completed booking.

Stores only:

- SHA-256 `token_hash`;
- business and booking identity;
- delivery channel and status;
- expiry and lifecycle timestamps;
- delivery attempt metadata.

A raw invitation token is never stored in the database.

### `reviews`

Stores the four domain sources:

- `platform`;
- `google`;
- `manual-testimonial`;
- `demo`.

The table supports booking, invitation, customer, service and employee context while preserving explicit source and trust boundaries.

## Verified-visit invariant

A verified review requires:

1. source `platform`;
2. non-null booking;
3. non-null invitation;
4. completed booking;
5. same `business_id`;
6. usable invitation for the same booking.

Booking customer, service and employee context is copied by the validation trigger. Callers do not get to invent verified context.

## Cross-tenant protection

Triggers reject:

- invitation/booking tenant mismatch;
- review/booking tenant mismatch;
- review/invitation tenant mismatch;
- customer, service or employee from another business;
- identity changes after insertion.

## Demo boundary

A `demo` review may be published only when the tenant explicitly enables `allow_demo_content`.

This supports preview tenants without silently turning generated text into production reputation.

## Google boundary

Google rows require an external review ID and are uniquely keyed per business.

Provider metadata remains separate from first-party review content. Provider secrets are deferred to the secure integration segment.

## RLS and grants

Public users can select only published reviews for active businesses with reviews enabled.

Authenticated owner/manager members can:

- read all reviews for their business;
- read invitations;
- read provider metadata;
- read and update tenant review settings.

Review, invitation and provider mutations remain server-only until the submission/moderation provider APIs are implemented.

## Apply and verify

The migration source must first pass `npm run check`.

After commit, it is applied to the target Supabase environment through the established migration process.

Then execute:

```text
supabase/verification/verify_reviews_foundation.sql
```

The verification script is read-only and returns `PASS` only when tables, RLS, policies, hash-only tokens and settings backfill are present.
