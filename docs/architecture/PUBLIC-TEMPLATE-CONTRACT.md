# Public Template Contract

## Status

Contract version: `1`

Reference implementation: `hair-luxury` / Lumière.

This contract defines the boundary every public theme must satisfy before it can be considered complete. It does not require themes to share the same visual design.

## Root renderers

Every registered theme has:

- one desktop renderer;
- one mobile renderer;
- the shared `PublicTemplateProps` boundary;
- no direct booking API calls inside presentation sections;
- no tenant resolution or catalog fetching outside the shared catalog context.

The root renderer is a composition layer. It must not become the permanent home of every visual section.

## Shared callback boundary

The public theme receives:

- `locale`;
- `onLocaleChange`;
- `onBook`;
- `onBookService`;
- `onBookEmployee`;
- `onSwitchToDesktop`.

Themes may decide where and how these actions appear, but they may not replace their meaning.

## Desktop contract

A completed desktop theme is composed from focused sections or feature components:

- header/navigation;
- hero;
- services;
- team;
- gallery;
- reviews;
- contact;
- footer;
- explicit loading, empty and error presentation where relevant.

A large root file that directly owns all sections is recorded as `monolith`, even when it is visually complete.

## Mobile contract

Mobile is a dedicated experience, not a narrowed desktop page.

A completed mobile theme has:

- a dedicated mobile renderer;
- a mobile shell or modular mobile sections/screens;
- mobile navigation;
- reachable service and employee booking actions;
- sticky or persistent booking access where the design requires it;
- safe-area handling;
- controlled horizontal overflow;
- an explicit desktop switch action when supported.

## Data and tenant boundary

Themes render data from the shared catalog contract:

- business branding and contact data;
- localized content;
- categories and services;
- employees;
- gallery;
- reviews;
- working and booking capabilities supplied by the platform.

Theme code must not hardcode a real tenant as its data source.

## Booking boundary

All themes must preserve:

- general booking;
- service preselection by service ID;
- employee preselection by employee ID;
- the common booking modal/engine;
- platform validation and availability rules.

A theme is not allowed to implement an independent booking engine.

## Internationalization

A completed theme:

- uses the central `t()` fallback;
- supports all `UI_LOCALE_CODES`;
- does not expose content-only locales as ready system UI;
- localizes public labels, accessibility labels and state messages;
- is visually checked for long translated text during its theme closeout.

## Architecture states

Desktop:

- `modular`;
- `monolith`.

Mobile:

- `app-shell`;
- `modular`;
- `monolith`.

Acceptance:

- `reference` — accepted reference architecture;
- `pending` — contract not yet satisfied;
- `passed` — accepted after theme closeout.

The registry must describe the current truth. A theme is never marked modular merely because modularization is planned.

## Target folder shape

A theme may temporarily use legacy locations, but the target composition is:

```text
components/templates/<theme>/
  <Theme>DesktopTemplate.tsx
  <Theme>MobileTemplate.tsx
  desktop/
    Header.tsx
    Hero.tsx
    Services.tsx
    Team.tsx
    Gallery.tsx
    Reviews.tsx
    Contact.tsx
    Footer.tsx
  mobile/
    MobileShell.tsx
    MobileHeader.tsx
    screens-or-sections/
  shared/
  <theme>-utils.ts
```

Exact component names may follow the visual language of the theme. The separation of responsibilities is mandatory.

## Current baseline

- Hair Luxury/Lumière: modular desktop, mobile app shell, reference acceptance.
- Hair Editorial: desktop and mobile monoliths, pending.
- Barber Heritage: desktop and mobile monoliths, pending and still beta.

Editorial and Barber are modularized only inside their dedicated theme milestones to keep visual and booking regressions isolated.
