# Public Template Acceptance Matrix

## Purpose

This matrix is the shared launch gate for every public theme. A theme-specific milestone may add stricter checks, but it may not remove these checks.

| Capability | Lumière baseline | Editorial target | Barber target | Acceptance evidence |
|---|---|---|---|---|
| Desktop renderer | Present | Required | Required | Source and build |
| Mobile renderer | App shell | Required | Required | Source and build |
| Modular desktop | Reference | Required | Required | Architecture audit |
| Dedicated mobile experience | Reference | Required | Required | Architecture audit |
| Tenant branding | Present | Required | Required | Demo tenant smoke |
| Seven UI languages | Present | Required | Required | Automated i18n smoke |
| Central `t()` fallback | Present | Present | Present | Unit/source test |
| General booking CTA | Present | Required | Required | Manual booking smoke |
| Service preselection | Present | Required | Required | Callback smoke |
| Employee preselection | Present | Required | Required | Callback smoke |
| Services | Present | Required | Required | Content/empty state |
| Team | Present | Required | Required | Content/empty state |
| Gallery | Present | Required | Required | Content/empty state |
| Reviews | Present | Missing | Missing | Content/empty state |
| Contact | Present | Required | Required | Missing-field smoke |
| Loading state | Required | Required | Required | Runtime smoke |
| Empty state | Required | Required | Required | Runtime smoke |
| Error state | Required | Required | Required | Runtime smoke |
| Keyboard/focus | Required | Required | Required | Manual accessibility smoke |
| Responsive overflow | Required | Required | Required | Browser QA |
| Production build | Required | Required | Required | `npm run check` |
| Manual booking smoke | Required | Required | Required | Theme closeout |

## Acceptance rules

A theme may be marked `passed` only when:

1. desktop is modular;
2. mobile is `app-shell` or modular;
3. all shared callbacks preserve their contract;
4. reviews capability exists, including empty state;
5. all seven system UI languages pass automated checks;
6. theme-specific browser QA is complete;
7. booking is manually verified with general, service and employee entry points;
8. lint, tests and production build pass.

## Current status

| Theme | Registry architecture | Acceptance |
|---|---|---|
| Hair Luxury/Lumière | modular + app-shell | reference |
| Hair Editorial | monolith + monolith | pending |
| Barber Heritage | monolith + monolith | pending |

The matrix records current truth. Planned work is not counted as completed work.
