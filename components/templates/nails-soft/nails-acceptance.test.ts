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
  "NailsDesktopHeader",
  "NailsDesktopHeroSection",
  "NailsDesktopGallerySection",
  "NailsDesktopServicesSection",
  "NailsDesktopTeamSection",
  "NailsDesktopReviewsSection",
  "NailsDesktopContactSection",
  "NailsDesktopFooter",
] as const;

const MOBILE_MODULES = [
  "NailsMobileHeader",
  "NailsMobileHeroSection",
  "NailsMobileGallerySection",
  "NailsMobileServicesSection",
  "NailsMobileTeamSection",
  "NailsMobileReviewsSection",
  "NailsMobileContactSection",
  "NailsMobileBottomNav",
] as const;

function source(
  relativePath: string
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
    | "desktop"
    | "mobile",
  moduleName: string
): string {
  return source(
    `components/templates/nails-soft/${viewport}/${moduleName}.tsx`
  );
}

describe(
  "DEMO-THEME-NAILS visual identity acceptance",
  () => {
    it(
      "registers an accepted modular beta manifest",
      () => {
        const manifest =
          getTemplateManifest(
            "nails-soft"
          );

        expect(
          manifest
        ).toMatchObject({
          key:
            "nails-soft",
          businessType:
            "nails",
          availability:
            "beta",
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
          "gallery",
          "services",
          "team",
          "reviews",
          "contact",
        ]);

        expect(
          isTemplateArchitectureAccepted(
            manifest
          )
        ).toBe(true);
      }
    );

    it(
      "keeps both viewport roots thin and composition-only",
      () => {
        const desktop =
          source(
            "components/templates/nails-soft/NailsSoftDesktopTemplate.tsx"
          );

        const mobile =
          source(
            "components/templates/nails-soft/NailsSoftMobileTemplate.tsx"
          );

        expect(
          desktop.split(
            "\n"
          ).length
        ).toBeLessThan(
          180
        );

        expect(
          mobile.split(
            "\n"
          ).length
        ).toBeLessThan(
          180
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

        expect(
          desktop.indexOf(
            "NailsDesktopGallerySection"
          )
        ).toBeLessThan(
          desktop.indexOf(
            "NailsDesktopServicesSection"
          )
        );

        expect(
          mobile.indexOf(
            "NailsMobileGallerySection"
          )
        ).toBeLessThan(
          mobile.indexOf(
            "NailsMobileServicesSection"
          )
        );
      }
    );

    it(
      "keeps the complete desktop behavior in dedicated modules",
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
            "nails-top",
            "nails-portfolio",
            "nails-services",
            "nails-team",
            "nails-reviews",
            "nails-contact",
            "CatalogReviewsSection",
            "onBookService",
            "onBookEmployee",
            "nailsLabels.noTeam",
            "nailsLabels.noGallery",
            "LanguageSwitcher",
            "aria-pressed",
            "rounded-[999px",
            "data-nails-atelier",
            'variant="nails-atelier"',
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
      "keeps a dedicated mobile experience with safe-area navigation",
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
            "nails-mobile-home",
            "nails-mobile-portfolio",
            "nails-mobile-services",
            "nails-mobile-team",
            "nails-mobile-reviews",
            "nails-mobile-contact",
            "CatalogReviewsSection",
            "onBookService",
            "onBookEmployee",
            "onSwitchToDesktop",
            "nailsLabels.noTeam",
            "nailsLabels.noGallery",
            "env(safe-area-inset-bottom)",
            "snap-mandatory",
            "LanguageSwitcher",
            "data-nails-atelier",
            'variant="nails-atelier"',
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
      "locks theme-owned mobile tabs and a non-scrolling home viewport",
      () => {
        const mobile =
          source(
            "components/templates/nails-soft/NailsSoftMobileTemplate.tsx"
          );
        const navigation =
          moduleSource(
            "mobile",
            "NailsMobileBottomNav"
          );
        const hero =
          moduleSource(
            "mobile",
            "NailsMobileHeroSection"
          );
        const services =
          moduleSource(
            "mobile",
            "NailsMobileServicesSection"
          );

        for (
          const marker of [
            "NailsMobileView",
            'useState<NailsMobileView>',
            'activeView ===',
            'h-[100dvh]',
            'overflow-hidden',
            'overflow-y-auto',
            'overscroll-y-contain',
            'onNavigate={setActiveView}',
          ]
        ) {
          expect(
            mobile
          ).toContain(
            marker
          );
        }

        for (
          const view of [
            "home",
            "portfolio",
            "services",
            "contact",
          ]
        ) {
          expect(
            navigation
          ).toContain(
            `"${view}"`
          );
        }

        expect(
          navigation
        ).toContain(
          "aria-current"
        );
        expect(
          navigation
        ).not.toContain(
          'href="#nails-mobile-'
        );
        expect(
          hero
        ).toContain(
          "h-full min-h-0 overflow-hidden"
        );
        expect(
          hero
        ).toContain(
          "onViewPortfolio"
        );
        expect(
          services
        ).not.toContain(
          '"all"'
        );
        expect(
          services
        ).toMatch(
          /services\.slice\(\s*0,\s*4\s*\)/
        );
      }
    );

    it(
      "locks the compact category-first desktop density contract",
      () => {
        const desktop =
          source(
            "components/templates/nails-soft/NailsSoftDesktopTemplate.tsx"
          );
        const hero =
          moduleSource(
            "desktop",
            "NailsDesktopHeroSection"
          );
        const gallery =
          moduleSource(
            "desktop",
            "NailsDesktopGallerySection"
          );
        const services =
          moduleSource(
            "desktop",
            "NailsDesktopServicesSection"
          );
        const team =
          moduleSource(
            "desktop",
            "NailsDesktopTeamSection"
          );
        const contact =
          moduleSource(
            "desktop",
            "NailsDesktopContactSection"
          );
        const reviews =
          source(
            "components/reviews/NailsAtelierReviewsSection.tsx"
          );

        for (
          const [
            module,
            marker,
          ] of [
            [
              hero,
              "min-h-[800px]",
            ],
            [
              gallery,
              "min-h-[360px]",
            ],
            [
              services,
              "min-h-[136px]",
            ],
            [
              team,
              "min-h-[280px]",
            ],
            [
              contact,
              "min-h-[560px]",
            ],
            [
              reviews,
              "max-w-[1320px]",
            ],
          ] as const
        ) {
          expect(
            module
          ).toContain(
            marker
          );
        }

        expect(
          services
        ).toContain(
          "selectedCategoryId"
        );
        expect(
          services
        ).toMatch(
          /services\.slice\(\s*0,\s*4\s*\)/
        );
        expect(
          services
        ).not.toContain(
          '"all"'
        );
        expect(
          desktop
        ).toContain(
          "onBook={onBook}"
        );
      }
    );

    it(
      "stays tenant-neutral and independent from existing theme renderers",
      () => {
        const nailsSource =
          [
            source(
              "components/templates/nails-soft/NailsSoftDesktopTemplate.tsx"
            ),
            source(
              "components/templates/nails-soft/NailsSoftMobileTemplate.tsx"
            ),
            source(
              "components/templates/nails-soft/nails-utils.ts"
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

        for (
          const forbidden of [
            "HairLuxury",
            "EditorialDesktop",
            "EditorialMobile",
            "BarberDesktop",
            "BarberMobile",
            "heritage-barber-demo",
            "@/components/desktop/",
            "@/components/mobile/",
          ]
        ) {
          expect(
            nailsSource
          ).not.toContain(
            forbidden
          );
        }

        for (
          const inheritedVisualMarker of [
            "01 /",
            "02 /",
            "03 /",
            "04 /",
            "05 /",
          ]
        ) {
          expect(
            nailsSource
          ).not.toContain(
            inheritedVisualMarker
          );
        }
      }
    );

    it(
      "documents the portfolio-first identity and accepted architecture",
      () => {
        const milestone =
          source(
            "docs/milestones/DEMO-THEME-NAILS-01.md"
          );

        for (
          const marker of [
            "portfolio-first",
            "modular",
            "desktop",
            "mobile",
            "beta",
            "passed",
            "visual acceptance",
            "Nail Studio starter pack",
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
