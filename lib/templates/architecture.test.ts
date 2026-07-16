import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getTemplateArchitectureSnapshots,
  isTemplateArchitectureAccepted,
  PUBLIC_TEMPLATE_ACCEPTANCE_CAPABILITIES,
  PUBLIC_TEMPLATE_CALLBACKS,
  PUBLIC_TEMPLATE_CONTRACT_VERSION,
} from "./architecture";
import {
  TEMPLATE_REGISTRY,
} from "./registry";

describe(
  "public template architecture contract",
  () => {
    it(
      "locks the common callback boundary",
      () => {
        expect(
          PUBLIC_TEMPLATE_CALLBACKS
        ).toEqual([
          "onLocaleChange",
          "onBook",
          "onBookService",
          "onBookEmployee",
          "onSwitchToDesktop",
        ]);
      }
    );

    it(
      "requires the complete shared acceptance surface",
      () => {
        expect(
          PUBLIC_TEMPLATE_ACCEPTANCE_CAPABILITIES
        ).toEqual(
          expect.arrayContaining([
            "desktop-renderer",
            "mobile-renderer",
            "modular-desktop",
            "dedicated-mobile-experience",
            "seven-language-ui",
            "general-booking",
            "service-preselection",
            "employee-preselection",
            "reviews",
            "loading-state",
            "empty-state",
            "error-state",
            "manual-booking-smoke",
          ])
        );
      }
    );

    it(
      "records the honest current architecture state",
      () => {
        expect(
          getTemplateArchitectureSnapshots()
        ).toEqual([
          {
            key:
              "hair-luxury",
            architecture: {
              contractVersion:
                PUBLIC_TEMPLATE_CONTRACT_VERSION,
              desktop:
                "modular",
              mobile:
                "app-shell",
              acceptance:
                "reference",
            },
            supportsReviews:
              true,
            availability:
              "live",
          },
          {
            key:
              "hair-editorial",
            architecture: {
              contractVersion:
                PUBLIC_TEMPLATE_CONTRACT_VERSION,
              desktop:
                "monolith",
              mobile:
                "monolith",
              acceptance:
                "pending",
            },
            supportsReviews:
              true,
            availability:
              "live",
          },
          {
            key:
              "barber-heritage",
            architecture: {
              contractVersion:
                PUBLIC_TEMPLATE_CONTRACT_VERSION,
              desktop:
                "monolith",
              mobile:
                "monolith",
              acceptance:
                "pending",
            },
            supportsReviews:
              false,
            availability:
              "beta",
          },
        ]);
      }
    );

    it(
      "accepts only the current reference architecture",
      () => {
        expect(
          isTemplateArchitectureAccepted(
            TEMPLATE_REGISTRY[
              "hair-luxury"
            ]
          )
        ).toBe(true);

        expect(
          isTemplateArchitectureAccepted(
            TEMPLATE_REGISTRY[
              "hair-editorial"
            ]
          )
        ).toBe(false);

        expect(
          isTemplateArchitectureAccepted(
            TEMPLATE_REGISTRY[
              "barber-heritage"
            ]
          )
        ).toBe(false);
      }
    );
  }
);
