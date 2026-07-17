# BARBER-V2-SERVICES-CATEGORY-MEDIA

## Scope

- One image belongs to a service category, never to an individual service.
- `service_categories` gains `image_url` and `image_position`.
- Salon admin edits URL and crop in the existing category dialog.
- Public catalog maps the fields tenant-safely.
- Barber desktop Services uses full-bleed category layers with opacity/scale crossfade.
- Five Unsplash images are theme fallbacks selected by slug keyword or category index.
- Mobile Services is unchanged.
- The migration is staged only and is not executed by the installer.

## Browser acceptance

- [ ] Every demo category displays a relevant fallback image.
- [ ] Category click changes services and backdrop together.
- [ ] No black flash appears during transition.
- [ ] Text remains readable across all fallback images.
- [ ] Admin saves a custom HTTP/HTTPS URL and object-position.
- [ ] Invalid URL and crop values are rejected.
- [ ] Category without a custom URL uses theme fallback.
- [ ] Service preselection and mobile Services remain unchanged.

## Migration sequencing

- Category media is migration `031`.
- Canonical migration file: `031_service_category_media.sql`.
- Migration `029` remains unapplied.
- Migration `029` must not be applied from the Barber theme branch.
- Migration `029` returns to the execution plan only after the project returns to the `main` roadmap.
- This rename package does not execute any database migration.

## Full viewport Services and preview indicator

- Desktop Services uses `min-height: calc(100dvh - 5rem)`.
- The category backdrop owns the full viewport below the desktop header.
- Categories with more content can still expand the section naturally.
- The following Team section is not visible before scrolling beyond Services.
- The platform preview indicator is outside the theme composition.
- Its visible form is a small vertical `PREVIEW` tab on the right viewport edge.
- The full booking-disabled explanation remains available through `aria-label` and `title`.
- The preview booking guard itself is unchanged.
- Canonical category-media migration remains `031_service_category_media.sql`.
- Migration `029` remains unapplied until return to the `main` roadmap.

### Browser acceptance

- [ ] Desktop Services fills the viewport below the header.
- [ ] Team/Barbers is not visible at the bottom of the Services viewport.
- [ ] Category image remains full-bleed to the bottom edge.
- [ ] Category switching and booking preselection remain unchanged.
- [ ] The preview marker no longer overlaps the theme composition.
- [ ] The right-edge preview tab does not block pointer interaction.
