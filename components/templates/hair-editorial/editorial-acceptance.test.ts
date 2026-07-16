import {
  readFileSync,
} from "node:fs";

import {
  join,
} from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  isTemplateArchitectureAccepted,
} from "@/lib/templates/architecture";

import {
  getTemplateManifest,
} from "@/lib/templates/registry";

const ROOT =
  process.cwd();

function source(
  relativePath:
    string
): string {
  return readFileSync(
    join(
      ROOT,
      relativePath
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );
}

describe(
  "DEMO-THEME-EDITORIAL-01 acceptance",
  () => {
    it(
      "records visual readiness without misreporting monolith architecture",
      () => {
        const manifest =
          getTemplateManifest(
            "hair-editorial"
          );

        expect(
          manifest
        ).toMatchObject({
          key:
            "hair-editorial",
          availability:
            "live",
          supportsBooking:
            true,
          supportsGallery:
            true,
          supportsReviews:
            true,
          architecture: {
            desktop:
              "monolith",
            mobile:
              "monolith",
            acceptance:
              "pending",
          },
        });

        expect(
          manifest.sections
        ).toEqual([
          "hero",
          "services",
          "team",
          "gallery",
          "reviews",
          "contact",
        ]);

        expect(
          isTemplateArchitectureAccepted(
            manifest
          )
        ).toBe(
          false
        );
      }
    );

    it(
      "keeps desktop and mobile sections, booking actions and review presentation",
      () => {
        const desktop =
          source(
            "components/templates/hair-editorial/HairEditorialDesktopTemplate.tsx"
          );

        const mobile =
          source(
            "components/templates/hair-editorial/HairEditorialMobileTemplate.tsx"
          );

        for (
          const marker of [
            "editorial-services",
            "editorial-team",
            "editorial-gallery",
            "editorial-reviews",
            "editorial-contact",
            "CatalogReviewsSection",
            "onBookService",
            "onBookEmployee",
            "editorialLabels.noTeam",
          ]
        ) {
          expect(
            desktop
          ).toContain(
            marker
          );
        }

        for (
          const marker of [
            "editorial-mobile-services",
            "editorial-mobile-team",
            "editorial-mobile-gallery",
            "editorial-mobile-reviews",
            "editorial-mobile-contact",
            "CatalogReviewsSection",
            "onBookService",
            "onBookEmployee",
            "onSwitchToDesktop",
            "editorialLabels.noTeam",
          ]
        ) {
          expect(
            mobile
          ).toContain(
            marker
          );
        }
      }
    );

    it(
      "does not hardcode the Lumiere tenant or mutate the reference theme",
      () => {
        const editorialSource =
          [
            source(
              "components/templates/hair-editorial/HairEditorialDesktopTemplate.tsx"
            ),
            source(
              "components/templates/hair-editorial/HairEditorialMobileTemplate.tsx"
            ),
            source(
              "components/templates/hair-editorial/editorial-utils.ts"
            ),
          ].join(
            "\n"
          );

        expect(
          editorialSource
            .toLowerCase()
        ).not.toContain(
          "lumiere-studio"
        );

        expect(
          editorialSource
        ).not.toContain(
          "HairLuxury"
        );
      }
    );

    it(
      "ships the acceptance runbook and milestone record",
      () => {
        const milestone =
          source(
            "docs/milestones/DEMO-THEME-EDITORIAL-01.md"
          );

        const runbook =
          source(
            "docs/qa/DEMO-THEME-EDITORIAL-01-ACCEPTANCE.md"
          );

        for (
          const marker of [
            "Hair Editorial",
            "desktop",
            "mobile",
            "Starter Pack Business Builder",
            "Lumière",
            "01B",
          ]
        ) {
          expect(
            milestone
          ).toContain(
            marker
          );

          expect(
            runbook
          ).toContain(
            marker
          );
        }
      }
    );
  }
);
