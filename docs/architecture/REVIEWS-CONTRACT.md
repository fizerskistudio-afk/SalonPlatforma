# Reviews Domain Contract

## Purpose

Reviews are a shared multi-tenant platform capability. They are not owned by an individual theme.

Every finished theme consumes the same public review contract and visually presents the source and trust level without pretending that all feedback has the same origin.

## Supported sources

### `platform`

Feedback submitted through the Salon Platforma public review form.

A platform review may be:

- an ordinary direct site review;
- a verified-visit review linked to a completed booking.

The salon may moderate visibility and reply, but may not rewrite the customer body or rating.

### `google`

Feedback loaded through an approved Google provider integration.

Google remains the source of truth. The platform may display, sync and hide an item from its own public page, but it may not rewrite the Google body or rating.

The public Google review CTA opens the official provider flow. It does not submit a Google review through our API.

### `manual-testimonial`

A testimonial entered by the salon.

It must be clearly labelled as a salon-provided testimonial. It is not a verified customer review and may have no star rating.

The salon may edit or archive it.

### `demo`

Synthetic content used only for:

- theme preview;
- onboarding;
- layout testing;
- language and overflow testing.

Demo content is clearly labelled and may not be published as production customer feedback.

## Moderation statuses

- `pending` — submitted and awaiting moderation;
- `published` — publicly visible;
- `rejected` — reviewed and not accepted;
- `flagged` — requires attention;
- `archived` — retained but not active.

Only `published` is part of the public catalog.

## Verified visit rules

A review may be marked as a verified visit only when:

1. the source is `platform`;
2. it is linked to a real booking;
3. the booking belongs to the same business;
4. the booking has reached the completion rule defined by the booking lifecycle;
5. the review invitation token is valid and unused.

A direct platform review without a booking remains allowed, but it does not receive the verified-visit badge.

Google, manual testimonials and demo reviews are never marked as Salon Platforma verified visits.

## Rating rules

- platform, Google and demo reviews require an integer rating from 1 to 5;
- a manual testimonial may omit the rating;
- a salon may never alter the rating of a platform or Google review.

## Public badges

The UI must distinguish:

- `Platform review`;
- `Verified visit`;
- `Google`;
- `Salon testimonial`;
- `Demo content`.

Badge text is localized through the shared translation system.

## Generated content boundary

The platform may generate:

- preview reviews;
- review-request email or SMS copy;
- QR card copy;
- empty-state copy;
- prompts that help a real customer write useful feedback.

The platform must not generate and publish fictional customer experiences as real production reviews.

A live salon with no ratings may use:

- the review empty state;
- direct platform review collection;
- verified post-booking review links;
- a Google review CTA;
- clearly labelled manual testimonials.

## Data ownership

Platform reviews are first-party platform records.

Google reviews are externally managed provider records.

Manual testimonials belong to the salon content layer.

Demo reviews belong to preview data and are never part of production reputation.

## Theme contract

Every accepted theme eventually provides:

- desktop reviews;
- mobile reviews;
- source badges;
- published-only rendering;
- empty state;
- loading state;
- provider error state;
- general Google review CTA when configured;
- responsive handling for long author names and text;
- localized labels on all seven UI languages.

## Planned implementation sequence

### `DEMO-REVIEWS-FOUNDATION-01A`

- domain types;
- source capabilities;
- invariant validation;
- source badges;
- contract tests;
- architecture and roadmap documentation.

### `DEMO-REVIEWS-FOUNDATION-01B`

- database schema;
- indexes;
- RLS;
- tenant settings;
- booking invitation token model;
- migration verification.

### `DEMO-REVIEWS-FOUNDATION-01C`

- public review submission API;
- direct review flow;
- verified booking-token flow;
- validation, rate limiting and abuse protection.

### `DEMO-REVIEWS-FOUNDATION-01D`

- owner/manager moderation queue;
- publish, reject, flag and archive;
- platform owner replies;
- audit-safe permissions.

### `DEMO-REVIEWS-FOUNDATION-01E`

- Google provider settings;
- official review CTA;
- provider sync adapter;
- attribution and source links;
- provider failure handling.

### `DEMO-REVIEWS-FOUNDATION-01F`

- shared catalog mapping;
- removal of static review data;
- common desktop/mobile review components;
- Lumière integration followed by Editorial and Barber.

### `DEMO-REVIEWS-FOUNDATION-01G`

- seven-language UI;
- empty/loading/error states;
- cross-tenant tests;
- manual submission, moderation and provider smoke.
