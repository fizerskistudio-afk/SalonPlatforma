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

const DESKTOP_MODULES = [
  "EditorialDesktopHeader",
  "EditorialDesktopHeroSection",
  "EditorialDesktopServicesSection",
  "EditorialDesktopTeamSection",
  "EditorialDesktopGallerySection",
  "EditorialDesktopReviewsSection",
  "EditorialDesktopContactSection",
  "EditorialDesktopFooter",
] as const;

const MOBILE_MODULES = [
  "EditorialMobileHeader",
  "EditorialMobileHeroSection",
  "EditorialMobileServicesSection",
  "EditorialMobileTeamSection",
  "EditorialMobileGallerySection",
  "EditorialMobileReviewsSection",
  "EditorialMobileContactSection",
  "EditorialMobileBottomNav",
] as const;

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

function moduleSource(
  viewport:
    "desktop" |
    "mobile",
  moduleName:
    string
): string {
  return source(
    `components/templates/hair-editorial/${viewport}/${moduleName}.tsx`
  );
}

describe(
  "DEMO-THEME-EDITORIAL-02 modular acceptance",
  () => {
    it(
      "meets the public modular architecture contract",
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
              "modular",
            mobile:
              "modular",
            acceptance:
              "passed",
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
          true
        );
      }
    );

    it(
      "keeps both viewport roots thin and composition-only",
      () => {
        const desktop =
          source(
            "components/templates/hair-editorial/HairEditorialDesktopTemplate.tsx"
          );

        const mobile =
          source(
            "components/templates/hair-editorial/HairEditorialMobileTemplate.tsx"
          );

        expect(
          desktop
            .split(
              "\n"
            )
            .length
        ).toBeLessThan(
          180
        );

        expect(
          mobile
            .split(
              "\n"
            )
            .length
        ).toBeLessThan(
          190
        );

        for (
          const forbidden of [
            "next/image",
            "lucide-react",
            "<section",
            "<header",
            "<footer",
            "<nav",
          ]
        ) {
          expect(
            desktop
          ).not.toContain(
            forbidden
          );

          expect(
            mobile
          ).not.toContain(
            forbidden
          );
        }

        for (
          const moduleName of
          DESKTOP_MODULES
        ) {
          expect(
            desktop
          ).toContain(
            moduleName
          );
        }

        for (
          const moduleName of
          MOBILE_MODULES
        ) {
          expect(
            mobile
          ).toContain(
            moduleName
          );
        }
      }
    );

    it(
      "preserves the complete desktop behavior in dedicated modules",
      () => {
        const combined =
          DESKTOP_MODULES.map(
            (
              moduleName
            ) =>
              moduleSource(
                "desktop",
                moduleName
              )
          ).join(
            "\n"
          );

        for (
          const marker of [
            "editorial-top",
            "editorial-services",
            "editorial-team",
            "editorial-gallery",
            "editorial-reviews",
            "editorial-contact",
            "CatalogReviewsSection",
            "onBookService",
            "onBookEmployee",
            "editorialLabels.noTeam",
            "editorialLabels.noGallery",
            "LanguageSwitcher",
          ]
        ) {
          expect(
            combined
          ).toContain(
            marker
          );
        }
      }
    );

    it(
      "preserves the complete mobile behavior in dedicated modules",
      () => {
        const combined =
          MOBILE_MODULES.map(
            (
              moduleName
            ) =>
              moduleSource(
                "mobile",
                moduleName
              )
          ).join(
            "\n"
          );

        for (
          const marker of [
            "editorial-mobile-home",
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
            "editorialLabels.noGallery",
            "env(safe-area-inset-bottom)",
            "LanguageSwitcher",
          ]
        ) {
          expect(
            combined
          ).toContain(
            marker
          );
        }
      }
    );

    it(
      "remains tenant-neutral and independent from the Lumiere implementation",
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
            ...DESKTOP_MODULES.map(
              (
                moduleName
              ) =>
                moduleSource(
                  "desktop",
                  moduleName
                )
            ),
            ...MOBILE_MODULES.map(
              (
                moduleName
              ) =>
                moduleSource(
                  "mobile",
                  moduleName
                )
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

        expect(
          editorialSource
        ).not.toContain(
          "@/components/desktop/"
        );

        expect(
          editorialSource
        ).not.toContain(
          "@/components/mobile/"
        );
      }
    );

    it(
      "documents the modular closeout and reference standard",
      () => {
        const milestone =
          source(
            "docs/milestones/DEMO-THEME-EDITORIAL-02-MODULAR-ARCHITECTURE.md"
          );

        for (
          const marker of [
            "Lumière",
            "modular",
            "desktop",
            "mobile",
            "passed",
            "TemplateRenderer",
            "Starter Pack Business Builder",
          ]
        ) {
          expect(
            milestone
          ).toContain(
            marker
          );
        }
      }
    );
  }
);
