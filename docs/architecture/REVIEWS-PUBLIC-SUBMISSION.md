# Reviews Public Submission

## Segment

`DEMO-REVIEWS-FOUNDATION-01C-A`

This segment implements the secure backend boundary for direct and verified platform reviews.

It does not yet issue invitation tokens, send invitation emails, or render the public review forms.

## Public endpoints

### `POST /api/reviews`

Accepts a direct unverified platform review:

- business slug;
- author display name;
- integer rating from 1 to 5;
- body from 2 to 2000 characters;
- optional supported language code;
- hidden honeypot field.

The route applies:

- 12 KiB JSON body limit;
- tenant-address rate limit;
- global-address rate limit;
- request correlation ID;
- PII-safe monitoring;
- server-only database RPC.

### `GET /api/reviews/invitations/[token]`

Resolves a verified-review bearer token and returns only non-sensitive visit context:

- business name and slug;
- default locale;
- booking start;
- localized service name;
- employee name;
- expiry time.

Customer name, email and phone are not returned.

### `POST /api/reviews/invitations/[token]`

Submits a verified review through an active invitation.

The route never sends the raw token to the database. It validates the base64url bearer and sends only its SHA-256 hash.

## Database RPC boundary

All three RPCs are:

- `SECURITY DEFINER`;
- explicit `search_path`;
- revoked from `public`, `anon` and `authenticated`;
- executable only by `service_role`.

Public API routes call them through the existing server-only Supabase admin client.

## Direct review rules

`submit_direct_review(jsonb)`:

- resolves an active published tenant;
- requires reviews and direct reviews to be enabled;
- never accepts booking or verified-visit identity from the caller;
- derives moderation status from tenant settings;
- publishes immediately only when moderation is disabled.

## Verified review rules

`submit_verified_review(text, jsonb)`:

- resolves only the SHA-256 token hash;
- locks the invitation row with `FOR UPDATE`;
- requires an unused, unrevoked, unexpired invitation;
- requires a completed booking;
- requires the active published tenant and verified reviews to be enabled;
- inserts the review and consumes the invitation atomically;
- relies on the 01B trigger to copy customer, service and employee identity from the booking.

Concurrent submissions cannot legitimately consume the same invitation twice.

## Abuse boundary

The API uses the shared database-backed HMAC rate limiter.

Direct review limits:

- 3 attempts per tenant/address in 30 minutes;
- 10 attempts per address globally in 24 hours.

Verified review limits:

- 5 attempts per address/token in 1 hour;
- 6 attempts per token in 1 hour;
- 30 link-context reads per address/token in 15 minutes.

Rate-limit storage failure is closed for review submission.

## Privacy boundary

Monitoring metadata may include:

- request ID;
- public tenant slug;
- review ID;
- moderation status;
- event and error code.

It must not include:

- raw invitation token;
- review body;
- author name;
- customer email;
- customer phone.

## Next segments

### 01C-B

- secure invitation issuance;
- cryptographically random raw token generation;
- booking-completion integration;
- delivery lifecycle and email request.

### 01C-C

- direct review form;
- verified review form;
- seven-language success and error states;
- theme entry points and responsive UX.
