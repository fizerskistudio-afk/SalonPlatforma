# Review Theme Integration

## Segment

`DEMO-REVIEWS-FOUNDATION-01F-C`

This segment replaces all public static review presentation with the shared catalog-backed review system.

## Integration adapter

`CatalogReviewsSection` is the only theme-facing data adapter.

It reads:

- `business.slug`
- `reviews`
- `reviewSummary`
- `reviewConfig`

from `useCatalogData()` and passes them to `SharedReviewsSection`.

Themes do not calculate ratings, infer trust or read review settings directly.

## Preview boundary

`previewMode` is part of `PublicTemplateProps` and is passed from `SalonPlatform` through `TemplateRenderer` into every theme.

This keeps direct-review and Google-review actions disabled in authenticated platform preview while preserving review presentation.

## Theme placement

### Lumière

- desktop: between gallery and contact;
- mobile: after the home hero inside the home composition;
- existing desktop `#reviews` navigation remains valid.

### Editorial

- desktop: between gallery and contact with `#editorial-reviews`;
- desktop header receives a reviews anchor;
- mobile: between gallery and contact without changing the five-slot bottom navigation.

### Barber

- desktop: between gallery and contact with `#reviews`;
- desktop header receives a reviews anchor;
- mobile: between gallery and contact while preserving the sticky booking action.

## Static review removal

The following legacy sources are deleted:

```text
lib/contentData.ts
components/desktop/ReviewsSection.tsx
```

The legacy `Review` type is removed from `lib/types.ts`.

No public theme may import static review content after this segment.

## Catalog hardening

The staged optional catalog fields become mandatory:

```text
reviews
reviewSummary
reviewConfig
```

The server catalog loader already populates all three in every successful public or preview response.

## Mobile parity

Mobile themes use the same:

- published review collection;
- trust badges;
- owner replies;
- rating summary;
- empty state;
- review actions;
- locale labels.

No separate mobile review dataset or rating calculation exists.

## Completion boundary

After this segment, review feature development is complete for the initial launch.

`01G` remains the QA and deployment closeout:

- seven-language visual smoke;
- direct and verified submission smoke;
- moderation smoke;
- review invitation cron activation smoke;
- cross-tenant regression;
- production build and deploy checks.
