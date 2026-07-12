# Shared Review Presentation

## Segment

`DEMO-REVIEWS-FOUNDATION-01F-B`

This segment creates the reusable public review presentation layer.

It does not yet replace theme review sections. Theme wiring and removal of legacy static review imports happen in `01F-C`.

## Shared components

The presentation layer contains:

- `ReviewStars`
- `ReviewTrustBadge`
- `ReviewCard`
- `ReviewSummary`
- `SharedReviewsSection`

All components use the shared brand CSS variables and accept the current runtime locale.

## Trust presentation

Every review card exposes the catalog trust contract:

- platform review;
- verified visit;
- Google review;
- salon-entered testimonial;
- synthetic demo preview.

Verified visit is visually distinct from a normal platform review.

The card never infers trust from customer names or email addresses. It renders the badge already resolved by the catalog contract.

## Customer text

Customer review text is rendered as original plain text with:

```text
white-space preservation
word breaking
dir=auto
```

The presentation layer never translates, edits or truncates the stored review body.

## Owner replies

Local owner replies are rendered in a clearly separated salon-response block.

The catalog contract already limits local replies to platform reviews. The shared card does not fabricate provider replies.

## Google attribution

Google reviews may expose a safe HTTPS external review link.

The card and section use:

```text
target=_blank
rel=noopener noreferrer
```

The launch CTA uses the manually configured official Google review URL. Full provider synchronization remains post-launch work.

## Rating summary

The summary supports:

- locale-aware average formatting;
- fractional star display;
- rated review count;
- 1–5 distribution;
- progressbar accessibility semantics.

Unrated testimonials are displayed without artificial stars and do not affect the rating average.

## Empty state and actions

When reviews are enabled but none are published, the section displays a localized empty state.

Depending on tenant settings, the section may expose:

- a direct platform review action;
- an official Google review action.

Both actions are disabled in platform preview mode.

## Date stability

Review dates use `Intl.DateTimeFormat` with a fixed UTC timezone.

This prevents server/client date shifts and hydration mismatches.

## Theme boundary

`01F-B` is presentation-only.

`01F-C` will:

1. replace static imports;
2. make catalog review fields mandatory;
3. connect Lumière desktop/mobile;
4. connect Editorial desktop/mobile;
5. connect Barber desktop/mobile;
6. complete responsive and seven-language visual QA.
