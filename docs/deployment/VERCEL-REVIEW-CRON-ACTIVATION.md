# Vercel Review Invitation Activation

## Safety model

Activation is intentionally split:

- `01G-B1`: read-only deployed preflight;
- `01G-B2`: one authorized test-mode cron invocation;
- `01G-B3`: production schedule registration and final closeout.

Do not add an active `vercel.json` cron schedule before B2 passes.

## Required production environment for B1

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
CRON_SECRET
REVIEW_PUBLIC_BASE_URL
```

The production Supabase project must be the SalonPlatforma project.

Do not use the StudioBiBi project.

## Required temporary environment for B2

Use test mode first:

```text
EMAIL_DELIVERY_ENABLED=true
EMAIL_TEST_MODE=true
EMAIL_TEST_RECIPIENT=<controlled test mailbox>
EMAIL_DEPLOYMENT_MODE=platform
RESEND_API_KEY=<configured in host dashboard>
PLATFORM_EMAIL_FROM=<verified sender or allowed Resend test sender>
PLATFORM_BUSINESS_EMAIL_ADDRESS=<verified/default sender>
CRON_SECRET=<random secret>
REVIEW_PUBLIC_BASE_URL=https://<production-or-staging-host>
REVIEW_INVITATION_CRON_BATCH_LIMIT=1
```

Do not place these values in Git, chat, screenshots or QA result files.

After changing environment variables, redeploy before testing.

## Vercel authentication behavior

When `CRON_SECRET` exists in the Vercel project, Vercel sends it automatically as:

```text
Authorization: Bearer <CRON_SECRET>
```

The existing review cron route accepts that format.

## Plan-aware schedule

Vercel cron expressions use UTC.

### Hobby

Hobby permits only one invocation per day.

Example activation candidate:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/cron/review-invitations",
      "schedule": "0 8 * * *"
    }
  ]
}
```

### Pro or Enterprise

A frequent invitation schedule may be used after B2 passes.

Example activation candidate:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/cron/review-invitations",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

Do not copy either example into active `vercel.json` until the hosting plan and desired delivery delay are confirmed.

## B2 test data preparation

Create exactly one test booking with:

- a controlled customer name;
- the controlled test email;
- a real tenant business;
- an eligible service and employee;
- completed status;
- no previous review invitation.

Confirm that no unrelated completed bookings are waiting for invitation delivery.

## B2 single-run expectations

The authorized cron response should show:

```text
checked: 1
eligible: 1
sent: 1
failed: 0
```

Then verify:

- one `notification_deliveries` row;
- `template_key=review_invitation`;
- `test_mode=true`;
- one provider message ID;
- one delivered message in the controlled mailbox;
- invitation URL opens;
- token is single-use;
- submitted review links to the completed booking;
- verified visit is true;
- pending review is not public;
- publishing makes it public with the verified badge.

## Deduplication and retry

Repeat the authorized request only after recording the first result.

Expected:

- no second successful delivery for the same invitation;
- no second usable token;
- sent delivery remains deduplicated;
- failed delivery follows bounded retry behavior.

## Production transition

Only after B2 passes:

1. decide Hobby daily or Pro frequent schedule;
2. add active `vercel.json`;
3. keep batch limit conservative for initial launch;
4. redeploy;
5. verify the cron job appears in Vercel project settings;
6. inspect the first scheduled invocation;
7. change `EMAIL_TEST_MODE=false` only after production recipient behavior is approved;
8. record deployment SHA, activation date and non-secret evidence.
