# Reviews Launch QA

## Segment

`DEMO-REVIEWS-FOUNDATION-01G-A`

This document defines the local and deployed acceptance matrix for the initial review launch.

`01G-A` prepares and validates the QA contract.

`01G-B` performs deployed end-to-end checks and activates the production invitation cron only after every blocking check passes.

## Blocking rule

Do not activate the production review invitation cron while any blocking item in this document is unresolved.

A source-level PASS does not imply that Resend delivery, deployed URLs, DNS, environment variables or production database state are correct.

## Supported UI locales

Every public review state must be checked in:

- `sr-Latn`
- `mk`
- `hr`
- `sq`
- `en`
- `de`
- `fr`

Customer review bodies remain original user content and are not translated.

## Theme and viewport matrix

Check every state in:

| Theme | Desktop | Mobile |
|---|---:|---:|
| Lumière | required | required |
| Editorial | required | required |
| Barber | required | required |

Desktop checks should cover at least:

- 1280×720
- 1440×900
- 1920×1080

Mobile checks should cover at least:

- 360×800
- 390×844
- 430×932

## Review presentation states

### Reviews disabled

Expected:

- review section is absent;
- review anchor does not create a broken interaction;
- no empty-state block is shown;
- no direct or Google CTA is shown.

### Enabled with no published reviews

Expected:

- localized empty state;
- no rating summary;
- direct-review CTA appears only when enabled;
- Google CTA appears only when enabled and configured with HTTPS;
- platform preview shows no active submission CTA.

### One platform review

Expected:

- one card;
- author fallback is stable;
- rating and date are localized;
- long words do not create horizontal overflow;
- customer text uses `dir=auto`.

### Multiple platform reviews

Expected:

- responsive grid;
- stable ordering from catalog;
- rating average and distribution match visible rated reviews;
- card heights may vary without clipping content.

### Verified visit

Expected:

- `Verified visit` trust badge;
- badge is not inferred from customer email or name;
- direct review without invitation never receives the verified badge.

### Manual testimonial

Expected:

- salon-entered testimonial badge;
- null rating displays an unrated-testimonial label;
- unrated testimonial contributes to total visible count;
- unrated testimonial does not affect average or distribution.

### Google review

Expected:

- Google badge;
- provider review link opens in a new tab;
- external link is HTTPS;
- local owner reply is not fabricated;
- official Google leave-review CTA uses configured HTTPS URL.

### Demo review

Expected:

- never visible on the public tenant site;
- visible only in platform preview when demo content is enabled;
- clearly marked as demo content;
- preview mode does not enable review-submission actions.

### Owner reply

Expected:

- displayed only for published platform reviews;
- visually separated from customer text;
- long reply wraps without overflow;
- clearing reply removes the block.

### Long content

Test:

- customer body of at least 1,500 characters;
- owner reply of at least 1,000 characters;
- long unbroken URL-like token;
- mixed Latin and Cyrillic content.

Expected:

- no horizontal scrolling;
- no clipping;
- card remains readable on 360 px width;
- focus indicators remain visible.

## Public submission smoke

### Direct review

1. Open `/reviews/{businessSlug}`.
2. Submit valid review.
3. Confirm success state.
4. Confirm review is `pending`.
5. Confirm it is absent from public catalog.
6. Publish in admin.
7. Confirm it appears publicly without verified-visit badge.

Also check:

- invalid rating;
- missing required fields;
- oversized body;
- honeypot;
- rate-limit response;
- disabled tenant setting.

### Verified invitation review

1. Complete an eligible booking.
2. Confirm one invitation outbox job.
3. Run invitation worker.
4. Confirm one Resend delivery attempt.
5. Open the delivered single-use token URL.
6. Submit review.
7. Confirm review links to the booking and invitation.
8. Confirm `is_verified_visit=true`.
9. Confirm token cannot be reused.
10. Publish in admin.
11. Confirm verified-visit badge appears publicly.

Also check:

- expired token;
- revoked token;
- booking not completed;
- second submission attempt;
- forwarded-link limitation is understood and documented.

## Moderation smoke

Check as owner and manager:

- pending → published;
- pending → rejected with reason;
- pending → flagged with reason;
- published → flagged;
- flagged → published;
- archived → pending;
- forbidden direct published → rejected transition;
- platform owner reply add/edit/remove;
- Google reply remains provider-managed;
- customer rating and text cannot be edited;
- audit events contain no customer review body.

Check as unauthorized or cross-tenant user:

- cannot read other tenant moderation data;
- cannot moderate other tenant review;
- cannot set other tenant owner reply.

## Catalog and tenant isolation smoke

Use at least two tenant businesses.

Expected:

- business A never receives business B reviews;
- summary is calculated from visible business A reviews only;
- pending/flagged/rejected/archived reviews never leak;
- public mode never includes demo reviews;
- review settings are tenant-scoped.

## Deployment checks

Before cron activation confirm:

- public tenant page deployed;
- direct review form deployed;
- invitation token page deployed;
- admin moderation page deployed;
- `RESEND_API_KEY` configured;
- sender domain verified;
- `CRON_SECRET` configured;
- production application URL configured;
- Supabase migrations `025`–`028` applied;
- no StudioBiBi Supabase project is used;
- target project is the SalonPlatforma production project.

## Resend and cron activation

The production cron remains disabled until all previous sections pass.

Activation smoke:

1. Trigger one completed booking.
2. Confirm one outbox job.
3. Call the protected cron route with the correct secret.
4. Confirm exactly one email delivery.
5. Confirm retry does not create duplicate successful delivery.
6. Confirm failed delivery gets bounded retry/backoff.
7. Confirm stale processing recovery.
8. Confirm used invitation cannot send or submit again.

After the successful smoke:

- enable the production schedule;
- record activation date;
- record deployment SHA;
- record tested tenant;
- record Resend message ID without exposing secrets or raw invitation token.

## Launch decision

Reviews are launch-ready only when:

- local `npm run check` passes;
- all theme/viewport checks pass;
- all seven locale checks pass;
- direct submission E2E passes;
- verified invitation E2E passes;
- moderation and cross-tenant checks pass;
- production build and deployment pass;
- protected cron smoke passes;
- no blocking issue remains.

Full Google provider synchronization and provider-side reply management remain post-launch work.
