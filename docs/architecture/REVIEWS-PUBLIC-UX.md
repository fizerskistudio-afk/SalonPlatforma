# Reviews Public UX

## Segment

`DEMO-REVIEWS-FOUNDATION-01C-C`

This segment completes the public form layer for direct and verified platform reviews.

It does not add a database migration.

## Routes

### Direct review

```text
/reviews/[businessSlug]
```

The server verifies:

- valid slug syntax;
- active business;
- published business;
- global reviews enabled;
- direct reviews enabled.

The client submits only through:

```text
POST /api/reviews
```

### Verified review

```text
/reviews/invitation/[token]
```

The server:

1. validates the bearer shape;
2. hashes it with SHA-256;
3. sends only the hash to `get_review_invitation_context`;
4. returns no customer email or phone to the client.

The client submits only through:

```text
POST /api/reviews/invitations/[token]
```

The raw bearer remains in the browser URL because it is the capability link, but it is never stored or logged by the application.

## Shared form

Both routes use one shared client component.

The form includes:

- display name;
- accessible 1–5 star radio group;
- review body with 2,000-character maximum;
- hidden honeypot;
- disabled submitting state;
- localized validation and API errors;
- pending and immediately-published success states;
- link back to the salon;
- verified-visit details without customer PII.

## Languages

The public review UI supports:

1. Serbian Latin;
2. Macedonian;
3. Croatian;
4. Albanian;
5. English;
6. German;
7. French.

Copy selection uses the central locale registry and central `t()` fallback.

## Error handling

Server error codes are mapped to user-facing localized copy.

The UI does not display raw provider or database errors.

Covered states include:

- invalid required fields;
- invalid or expired invitation;
- already submitted verified review;
- direct reviews disabled;
- rate limited;
- temporary protection failure;
- unexpected submission failure;
- unavailable server-loaded context.

## Accessibility

The form includes:

- semantic labels and fieldset;
- native radio controls;
- visible keyboard focus;
- `aria-live` error and success regions;
- reduced-motion-safe spinner;
- minimum touch target sizing;
- responsive single-column layout;
- no color-only status meaning.

## SEO and privacy

Both review routes are `noindex`, `nofollow`, and `noarchive`.

Review submission pages are transactional surfaces, not public reputation pages.

## Remaining activation boundary

The invitation cron remains disabled until:

- this source is deployed;
- direct form browser smoke passes;
- verified form browser smoke passes;
- the deployed `REVIEW_PUBLIC_BASE_URL` points to the host serving these routes.

Theme review CTAs and published review rendering remain in catalog/theme integration.
