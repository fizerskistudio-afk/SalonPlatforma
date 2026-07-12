# Reviews Catalog Integration

## Segment

`DEMO-REVIEWS-FOUNDATION-01F-A`

This segment adds the public review data contract to the shared tenant catalog.

It intentionally does not redesign theme review sections. Shared presentation and theme integration follow in `01F-B` and `01F-C`.

## Public catalog boundary

The server catalog loader queries reviews by the resolved tenant business ID and requests only `published` rows.

Because the loader uses the server admin client, the mapper repeats the published-only check before returning data. This creates two independent public-visibility boundaries:

1. database query status filter;
2. pure catalog mapper status filter.

## Tenant settings

When `review_settings.reviews_enabled` is false or settings are missing, the loader returns an empty review collection and disabled review configuration.

Source switches are applied as follows:

- `platform`: visible when reviews are enabled;
- `manual-testimonial`: requires `testimonials_enabled`;
- `google`: requires `google_reviews_enabled`;
- `demo`: platform preview only and requires `allow_demo_content`.

Direct and verified submission settings control submission availability, not visibility of already published platform reviews.

## Demo trust boundary

Demo reviews never enter the public catalog.

They may appear only in authenticated platform preview mode when the tenant explicitly allows demo content.

## Catalog shape

The catalog loader populates:

```text
reviews
reviewSummary
reviewConfig
```

The properties remain optional in the shared TypeScript shape during the staged theme migration. The real public loader always populates all three.

They become mandatory after static theme review data is removed in `01F-C`.

## Review item

A public catalog review includes:

- source and trust badge;
- author name and optional provider avatar;
- rating or null for unrated testimonials;
- original review body and language code;
- verified-visit flag;
- optional service and employee IDs;
- provider external URL for Google reviews;
- local owner reply only for platform reviews;
- deterministic published timestamp.

The catalog never translates or rewrites customer review text.

## Rating summary

Summary includes:

- total visible review count;
- rated review count;
- average rating rounded to two decimal places;
- 1–5 rating distribution.

Unrated manual testimonials contribute to total count but not to the average or distribution.

## Google launch baseline

`reviewConfig.googleReviewUrl` exposes only a valid HTTPS URL when Google reviews are enabled.

Full Places or Business Profile synchronization remains post-launch work.

## Review invitation activation

The completed-booking invitation pipeline already exists.

The remaining launch gate is:

```text
completed booking
→ invitation outbox
→ Resend email
→ single-use token form
→ review submission
→ moderation
```

Production cron activation happens only after deployed direct and verified form smoke tests.
