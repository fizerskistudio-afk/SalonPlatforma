# DEMO-THEME-LUMIERE-01

## Repository identity

- Repository: `https://github.com/fizerskistudio-afk/SalonPlatforma`
- Working tree: `https://github.com/fizerskistudio-afk/SalonPlatforma/tree/backup/theme-core-barber-beta`
- Branch: `backup/theme-core-barber-beta`
- Baseline before 01B: `982b5f1fcf6779f0c183eaaa023b0d891d425ed3`

## Goal

Lock Lumière as the reference acceptance baseline for Editorial and Barber without expanding the launch scope.

## Final launch decision

### Desktop / full site

The full desktop experience keeps the shared review section, including:

- rating summary;
- verified-visit trust badge;
- review source labels;
- owner replies;
- direct/Google review actions when enabled.

### Mobile app-shell

The Lumière mobile app-shell is booking-first and intentionally does **not** render the full review section.

The launch mobile shell remains focused on:

- salon identity;
- hero content;
- booking;
- services;
- team;
- contact.

A compact review teaser, reviews sheet or `Više` tab belongs to `POST-LAUNCH-MOBILE-SOCIAL-PROOF-01`.

## Desktop composition

Locked order:

1. Header
2. Hero
3. Services
4. Team
5. Gallery
6. Shared catalog reviews
7. Contact
8. Footer

## Gallery decision

The Lumière catalog currently contains seven gallery images.

Only the first desktop tile is featured with a two-row span. The remaining six tiles fill a balanced 3 + 3 layout around it.

The former second featured tile at index 5 was removed because it created a visual gap that looked like missing images.

Mobile remains a simple two-column gallery without desktop row spans.

## Mobile composition

Dedicated app shell with:

- home;
- services;
- team;
- contact;
- bottom navigation;
- booking entry points from the header, home and service/team cards.

## Content closeout

The code supports seven locales. The remaining SR/DE/FR work is tenant content entry, not a booking-modal code defect.

Use:

`docs/qa/LUMIERE-CONTENT-SR-DE-FR.md`

to populate:

- tagline;
- hero description;
- category names;
- every active service name;
- optional service descriptions.

The booking flow reads the same catalog content and will display the localized values after they are saved in admin.

## Final gate

- source contract passes;
- `npm run check` passes;
- SR/DE/FR content is populated;
- desktop gallery smoke passes;
- mobile app-shell remains review-free and booking-first;
- final commit and push complete.
