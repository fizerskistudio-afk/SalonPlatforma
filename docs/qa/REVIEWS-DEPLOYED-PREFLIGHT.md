# Reviews Deployed Preflight

## Segment

`DEMO-REVIEWS-FOUNDATION-01G-B1`

This is the read-only deployed portion of the review launch closeout.

It must pass before any authorized review invitation cron request is made.

## Command

```cmd
npm run qa:reviews:deployed -- --base-url https://YOUR-DEPLOYMENT --business-slug YOUR-TENANT-SLUG
```

Example:

```cmd
npm run qa:reviews:deployed -- --base-url https://example.vercel.app --business-slug lumiere-studio
```

Do not pass:

- `CRON_SECRET`;
- Supabase secret/service-role keys;
- Resend API keys;
- raw review invitation tokens.

The B1 script never reads those values.

## Read-only checks

The script checks:

1. platform root returns `200`;
2. `/salon/{businessSlug}` returns `200`;
3. `/api/catalog` returns the mandatory catalog review contract;
4. direct review page returns `200` and `noindex`;
5. invalid invitation page returns `200` and `noindex`;
6. review invitation cron without credentials returns `401`;
7. review invitation cron with an intentionally incorrect credential returns `401`.

The script does not:

- submit a review;
- create or complete a booking;
- call the cron route with a valid credential;
- process an outbox job;
- send an email;
- change database data;
- enable a Vercel schedule.

## Output

A sanitized JSON report is written to:

```text
tmp/reviews-qa/
```

The report contains:

- tested deployment URL;
- tested business slug;
- status code;
- selected non-secret headers;
- duration;
- pass/fail state;
- non-sensitive catalog counts.

It does not store response bodies, customer data, tokens or credentials.

## Failure interpretation

### Root or tenant route does not return 200

Deployment is not ready or deployment protection is blocking public traffic.

### Catalog route does not return 200

Check:

- production Supabase project;
- migrations `025`–`028`;
- tenant publication state;
- tenant slug;
- server environment variables.

### Catalog review contract is incomplete

The deployment likely does not contain the expected `01F-A` through `01F-C` commit chain.

### Cron returns 503 without credentials

`CRON_SECRET` is not configured in the deployed environment.

Configure it and redeploy before repeating B1.

### Cron returns 200 without credentials

Blocking security failure. Do not continue to B2.

### Cron returns 401

Expected. This confirms that the route is present and protected.

## B2 entry criteria

Proceed to `01G-B2` only when:

- B1 report is fully green;
- production environment is using the SalonPlatforma Supabase project;
- email delivery is enabled in test mode;
- test recipient is controlled by the tester;
- review invitation batch limit is `1`;
- a single eligible completed test booking exists;
- no unrelated eligible invitation jobs are queued.
