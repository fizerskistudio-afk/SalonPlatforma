
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
  "BarberDesktopHeader",
  "BarberDesktopHeroSection",
  "BarberDesktopServicesSection",
  "BarberDesktopTeamSection",
  "BarberDesktopGallerySection",
  "BarberDesktopReviewsSection",
  "BarberDesktopContactSection",
  "BarberDesktopFooter",
] as const;

const MOBILE_SCREEN_MODULES = [
  "BarberMobileHeader",
  "BarberMobileHeroSection",
  "BarberMobileServicesSection",
  "BarberMobileTeamSection",
  "BarberMobileGallerySection",
  "BarberMobileReviewsSection",
  "BarberMobileContactSection",
  "BarberMobileBottomNav",
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
    `components/templates/barber-heritage/${viewport}/${moduleName}.tsx`
  );
}

describe(
  "DEMO-THEME-BARBER-01 V2 acceptance",
  () => {
    it(
      "keeps Barber in beta while the modular app-shell architecture is accepted",
      () => {
        const manifest =
          getTemplateManifest(
            "barber-heritage"
          );

        expect(
          manifest
        ).toMatchObject({
          key:
            "barber-heritage",
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
              "app-shell",
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
            "components/templates/barber-heritage/BarberHeritageDesktopTemplate.tsx"
          );

        const mobile =
          source(
            "components/templates/barber-heritage/BarberHeritageMobileTemplate.tsx"
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
          115
        );

        for (
          const forbidden of [
            "next/image",
            "lucide-react",
            "useState",
            "useRef",
            "<section",
            "<header",
            "<footer",
            "<nav",
            "CatalogReviewsSection",
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

        expect(
          mobile
        ).toContain(
          "BarberMobileAppShell"
        );

        for (
          const moduleName of
          MOBILE_SCREEN_MODULES
        ) {
          expect(
            mobile
          ).not.toContain(
            moduleName
          );
        }
      }
    );

    it(
      "uses one full-bleed image plane with a translucent desktop content overlay",
      () => {
        const hero =
          moduleSource(
            "desktop",
            "BarberDesktopHeroSection"
          );

        for (
          const marker of [
            "fill",
            "sizes=\"100vw\"",
            "barber-hero-image",
            "barber-hero-overlay",
            "linear-gradient(90deg",
            "rgba(7,6,4,0.97)",
            "barberHeroImageIn",
            "barberHeroOverlayIn",
            "barberHeroAccentReveal",
            "prefers-reduced-motion",
            "[object-position:68%_center]",
          ]
        ) {
          expect(
            hero
          ).toContain(
            marker
          );
        }

        expect(
          hero
        ).not.toContain(
          "grid-cols-[minmax"
        );

        expect(
          hero
        ).not.toContain(
          "border-r"
        );
      }
    );


    it(
      "uses a full-viewport Services stage and a side-mounted preview indicator",
      () => {
        const services =
          moduleSource(
            "desktop",
            "BarberDesktopServicesSection"
          );

        const platform =
          source(
            "components/SalonPlatform.tsx"
          );

        expect(
          services
        ).toContain(
          "min-h-[calc(100dvh-5rem)]"
        );

        expect(
          services
        ).not.toContain(
          "min-h-[680px]"
        );

        for (
          const marker of [
            "fixed right-0 top-1/2",
            "-translate-y-1/2",
            "pointer-events-none",
            "[writing-mode:vertical-rl]",
            "rotate-180",
            "PREVIEW",
            'aria-label="Platform admin preview · booking je isključen"',
          ]
        ) {
          expect(
            platform
          ).toContain(
            marker
          );
        }

        expect(
          platform
        ).not.toContain(
          "fixed left-1/2 top-3"
        );

        expect(
          platform
        ).toContain(
          "!previewMode &&"
        );

        expect(
          platform
        ).toContain(
          "isBookingOpen"
        );
      }
    );

    it(
      "renders the refined desktop category navigator without changing mobile services",
      () => {
        const desktopServices =
          moduleSource(
            "desktop",
            "BarberDesktopServicesSection"
          );

        const mobileServices =
          moduleSource(
            "mobile",
            "BarberMobileServicesSection"
          );

        for (
          const marker of [
            "useState",
            "useEffect",
            "useMemo",
            "activeCategoryId",
            "activeCategoryIndex",
            "setActiveCategoryId",
            "categoryOptions",
            "visibleServices",
            "aria-pressed",
            "desktopServicesSlogan",
            "Preciznost nije detalj",
            "activeCategoryLabel",
            "translateY(${activeCategoryIndex * 68}px)",
            "grid-cols-[minmax(330px,0.36fr)_minmax(0,0.64fr)]",
            "min-h-[142px]",
            "barber-services-panel",
            "barberServicesPanelIn",
            "prefers-reduced-motion",
          ]
        ) {
          expect(
            desktopServices
          ).toContain(
            marker
          );
        }

        expect(
          desktopServices
        ).toContain(
          "service.categoryId ==="
        );

        expect(
          desktopServices
        ).not.toContain(
          "grid-cols-[0.72fr_1.28fr]"
        );

        expect(
          desktopServices
        ).not.toContain(
          "Preciznost se ne podrazumeva"
        );

        expect(
          desktopServices
        ).not.toContain(
          "getCategoryLabel"
        );

        for (
          const preservedMobileMarker of [
            'id="barber-mobile-services"',
            "services.map",
            "getCategoryLabel",
            "rounded-[1.35rem]",
          ]
        ) {
          expect(
            mobileServices
          ).toContain(
            preservedMobileMarker
          );
        }

        expect(
          mobileServices
        ).not.toContain(
          "activeCategoryId"
        );
      }
    );

    it(
      "renders a premium interactive desktop barber roster without changing mobile team",
      () => {
        const desktopTeam =
          moduleSource(
            "desktop",
            "BarberDesktopTeamSection"
          );

        const mobileTeam =
          moduleSource(
            "mobile",
            "BarberMobileTeamSection"
          );

        for (
          const marker of [
            "useState",
            "useEffect",
            "useMemo",
            "activeEmployeeId",
            "activeEmployee",
            "aria-pressed",
            "onMouseEnter",
            "onFocus",
            "data-barber-portrait",
            "transition-[opacity,transform,filter]",
            "min-h-[calc(100dvh-5rem)]",
            "grid-cols-[minmax(0,1.12fr)_minmax(420px,0.88fr)]",
            "barber-team-copy",
            "barberTeamCopyIn",
            "prefers-reduced-motion",
          ]
        ) {
          expect(
            desktopTeam
          ).toContain(
            marker
          );
        }

        expect(
          desktopTeam
        ).not.toContain(
          "grid-cols-4"
        );

        for (
          const preservedMobileMarker of [
            'id="barber-mobile-team"',
            "carouselIndex",
            "scrollToIndex",
            "snap-mandatory",
            "onBookEmployee",
          ]
        ) {
          expect(
            mobileTeam
          ).toContain(
            preservedMobileMarker
          );
        }

        expect(
          mobileTeam
        ).not.toContain(
          "activeEmployeeId"
        );
      }
    );


it(
  "coordinates desktop Services and Team entrance motion without changing mobile screens",
  () => {
    const revealHook =
      source(
        "components/templates/barber-heritage/desktop/useBarberSectionReveal.ts"
      );

    const desktopServices =
      moduleSource(
        "desktop",
        "BarberDesktopServicesSection"
      );

    const desktopTeam =
      moduleSource(
        "desktop",
        "BarberDesktopTeamSection"
      );

    const mobileCombined =
      MOBILE_SCREEN_MODULES.map(
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
        "IntersectionObserver",
        "window.matchMedia",
        "prefers-reduced-motion",
        "observer.disconnect",
        "rootMargin",
        "threshold",
      ]
    ) {
      expect(
        revealHook
      ).toContain(
        marker
      );
    }

    for (
      const marker of [
        "useBarberSectionReveal",
        "sectionRef",
        "data-barber-revealed",
        "barber-services-backdrop-reveal",
        "barber-services-enter-left",
        "barber-services-enter-right",
        "barber-services-category-entry",
        "barber-services-item-entry",
      ]
    ) {
      expect(
        desktopServices
      ).toContain(
        marker
      );
    }

    for (
      const marker of [
        "useBarberSectionReveal",
        "sectionRef",
        "data-barber-revealed",
        "barber-team-enter-left",
        "barber-team-enter-right",
        "barber-team-roster-entry",
        "items-stretch",
        "min-h-[720px]",
      ]
    ) {
      expect(
        desktopTeam
      ).toContain(
        marker
      );
    }

    expect(
      desktopTeam
    ).not.toContain(
      "employees.length -"
    );

    expect(
      desktopServices
    ).not.toContain(
      "window.scrollTo"
    );

    expect(
      desktopTeam
    ).not.toContain(
      "window.scrollTo"
    );

    expect(
      mobileCombined
    ).not.toContain(
      "useBarberSectionReveal"
    );

    expect(
      mobileCombined
    ).not.toContain(
      "data-barber-revealed"
    );
  }
);


it(
  "renders a premium interactive desktop gallery without changing the mobile gallery",
  () => {
    const desktopGallery =
      moduleSource(
        "desktop",
        "BarberDesktopGallerySection"
      );

    const mobileGallery =
      moduleSource(
        "mobile",
        "BarberMobileGallerySection"
      );

    for (
      const marker of [
        "useState",
        "useEffect",
        "useMemo",
        "useBarberSectionReveal",
        "activeGalleryId",
        "setActiveGalleryId",
        "data-barber-revealed",
        "barber-gallery-stage",
        "barber-gallery-archive",
        "barber-gallery-thumbnail",
        "aria-pressed",
        "onMouseEnter",
        "onFocus",
        "sticky top-24",
        "galleryItems.map",
        "prefers-reduced-motion",
      ]
    ) {
      expect(
        desktopGallery
      ).toContain(
        marker
      );
    }

    expect(
      desktopGallery
    ).toContain(
      "gallery.filter"
    );

    expect(
      desktopGallery
    ).toContain(
      "barberLabels.galleryEmpty"
    );

    expect(
      desktopGallery
    ).not.toContain(
      "auto-rows-[125px]"
    );

for (
  const compactViewportMarker of [
    "h-[calc(90dvh-7.2rem)]",
    "min-h-[550px]",
    "max-h-[700px]",
    "text-[clamp(3rem,4.15vw,5.2rem)]",
    "min-h-[148px]",
    "mt-8 grid items-start",
  ]
) {
  expect(
    desktopGallery
  ).toContain(
    compactViewportMarker
  );
}

expect(
  desktopGallery
).not.toContain(
  "h-[calc(100dvh-8rem)]"
);

expect(
  desktopGallery
).not.toContain(
  "text-[clamp(3.8rem,5vw,6.3rem)]"
);

    for (
      const preservedMobileMarker of [
        'id="barber-mobile-gallery"',
        "gallery.map",
        "barberLabels.galleryEmpty",
      ]
    ) {
      expect(
        mobileGallery
      ).toContain(
        preservedMobileMarker
      );
    }

    expect(
      mobileGallery
    ).not.toContain(
      "activeGalleryId"
    );

    expect(
      mobileGallery
    ).not.toContain(
      "useBarberSectionReveal"
    );
  }
);


it(
  "renders Barber desktop reviews through the shared catalog adapter and editorial variant",
  () => {
    const desktopReviews =
      moduleSource(
        "desktop",
        "BarberDesktopReviewsSection"
      );

    const mobileReviews =
      moduleSource(
        "mobile",
        "BarberMobileReviewsSection"
      );

    const adapter =
      source(
        "components/reviews/CatalogReviewsSection.tsx"
      );

    const editorialReviews =
      source(
        "components/reviews/BarberEditorialReviewsSection.tsx"
      );

    for (
      const marker of [
        "CatalogReviewsSection",
        'variant="barber-editorial"',
        'id="reviews"',
        "previewMode",
      ]
    ) {
      expect(
        desktopReviews
      ).toContain(
        marker
      );
    }

    for (
      const forbidden of [
        "useCatalogData",
        "reviewSummary.distribution",
        "reviews.map(",
        "activeReviewId",
      ]
    ) {
      expect(
        desktopReviews
      ).not.toContain(
        forbidden
      );
    }

    for (
      const adapterMarker of [
        "useCatalogData",
        "SharedReviewsSection",
        "BarberEditorialReviewsSection",
        '"barber-editorial"',
        "reviewSummary",
        "reviewConfig",
      ]
    ) {
      expect(
        adapter
      ).toContain(
        adapterMarker
      );
    }

    for (
      const editorialMarker of [
        "useState",
        "useEffect",
        "useMemo",
        "useRef",
        "IntersectionObserver",
        "activeReviewId",
        "setActiveReviewId",
        "barber-reviews-stage",
        "barber-reviews-summary",
        "barber-reviews-index",
        "barber-review-index-item",
        "ReviewStars",
        "ReviewTrustBadge",
        "aria-pressed",
        "onMouseEnter",
        "onFocus",
        "directReviewHref",
        "googleReviewHref",
        "reviewSummary.distribution",
        "ownerReply",
        "prefers-reduced-motion",
      ]
    ) {
      expect(
        editorialReviews
      ).toContain(
        editorialMarker
      );
    }

    for (
      const preservedMobileMarker of [
        "CatalogReviewsSection",
        'id="barber-mobile-reviews"',
        "previewMode",
        "pb-32",
      ]
    ) {
      expect(
        mobileReviews
      ).toContain(
        preservedMobileMarker
      );
    }

    expect(
      mobileReviews
    ).not.toContain(
      'variant="barber-editorial"'
    );
  }
);


it(
  "renders a premium desktop contact and location closeout without changing mobile contact",
  () => {
    const desktopContact =
      moduleSource(
        "desktop",
        "BarberDesktopContactSection"
      );

    const mobileContact =
      moduleSource(
        "mobile",
        "BarberMobileContactSection"
      );

    for (
      const marker of [
        "useMemo",
        "useBarberSectionReveal",
        "groupWorkingHours",
        "formatDayRange",
        "business.workingHours",
        "workingHoursGroups.map",
        "https://www.google.com/maps/search/?api=1&query=",
        "encodeURIComponent",
        "barber-contact-location",
        "barber-contact-booking",
        "barber-contact-details",
        "barber-contact-hours",
        "data-barber-revealed",
        "05 /",
        "onClick",
        "tel:",
        "mailto:",
        "InstagramIcon",
        "prefers-reduced-motion",
      ]
    ) {
      expect(
        desktopContact
      ).toContain(
        marker
      );
    }

    expect(
      desktopContact
    ).not.toContain(
      "04 /"
    );

    for (
      const preservedMobileMarker of [
        'id="barber-mobile-contact"',
        "onSwitchToDesktop",
        "CalendarPlus",
        "business.phone",
        "business.email",
        "business.instagramUrl",
        "onClick={onBook}",
      ]
    ) {
      expect(
        mobileContact
      ).toContain(
        preservedMobileMarker
      );
    }

    for (
      const desktopOnlyMarker of [
        "useBarberSectionReveal",
        "groupWorkingHours",
        "google.com/maps/search",
        "barber-contact-hours",
      ]
    ) {
      expect(
        mobileContact
      ).not.toContain(
        desktopOnlyMarker
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
            "barber-top",
            'href="#services"',
            'href="#barbers"',
            'href="#gallery"',
            'href="#reviews"',
            'href="#contact"',
            'id="services"',
            'id="barbers"',
            'id="gallery"',
            'id="reviews"',
            'id="contact"',
            "CatalogReviewsSection",
            "onBookService",
            "onBookEmployee",
            "barberLabels.servicesEmpty",
            "barberLabels.barbersEmpty",
            "barberLabels.galleryEmpty",
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
      "implements a fixed viewport mobile app shell with a scroll-free Home screen",
      () => {
        const appShell =
          moduleSource(
            "mobile",
            "BarberMobileAppShell"
          );

        const hero =
          moduleSource(
            "mobile",
            "BarberMobileHeroSection"
          );

        const bottomNav =
          moduleSource(
            "mobile",
            "BarberMobileBottomNav"
          );

        for (
          const marker of [
            "useState",
            "BarberMobileTab",
            '\"home\"',
            '\"services\"',
            '\"team\"',
            "h-[100dvh]",
            "isHome",
            "overflow-hidden pb-24",
            "overflow-y-auto overscroll-contain pb-28",
            "activeTab",
            "barber-app-screen",
            "BarberMobileHeroSection",
            "BarberMobileServicesSection",
            "BarberMobileTeamSection",
            "BarberMobileGallerySection",
            "BarberMobileReviewsSection",
            "BarberMobileContactSection",
            "BarberMobileBottomNav",
            "prefers-reduced-motion",
          ]
        ) {
          expect(
            appShell
          ).toContain(
            marker
          );
        }

        for (
          const redundantHomeMarker of [
            "ArrowRight",
            "services.length",
            "employees.length",
            "barberLabels.viewServices",
            "grid-cols-2",
          ]
        ) {
          expect(
            appShell
          ).not.toContain(
            redundantHomeMarker
          );
        }

        for (
          const marker of [
            "h-full min-h-0",
            "relative h-full min-h-0",
            "business.tagline",
          ]
        ) {
          expect(
            hero
          ).toContain(
            marker
          );
        }

        expect(
          hero
        ).not.toContain(
          "business.description"
        );

        expect(
          hero
        ).not.toContain(
          "min-h-[74dvh]"
        );

        for (
          const marker of [
            "activeTab",
            "onTabChange",
            "aria-current",
            "env(safe-area-inset-bottom)",
            "barberLabels.navProfile",
            '\"profile\"',
          ]
        ) {
          expect(
            bottomNav
          ).toContain(
            marker
          );
        }

        expect(
          bottomNav
        ).not.toContain(
          'href="#barber-mobile'
        );
      }
    );

    it(
      "keeps screen-level booking, review and empty-state boundaries",
      () => {
        const combined =
          MOBILE_SCREEN_MODULES.map(
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
            "CatalogReviewsSection",
            "onBookService",
            "onBookEmployee",
            "onSwitchToDesktop",
            "barberLabels.servicesEmpty",
            "barberLabels.barbersEmpty",
            "barberLabels.galleryEmpty",
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
      "remains tenant-neutral and independent from Lumiere and Editorial implementations",
      () => {
        const barberSource =
          [
            source(
              "components/templates/barber-heritage/BarberHeritageDesktopTemplate.tsx"
            ),
            source(
              "components/templates/barber-heritage/BarberHeritageMobileTemplate.tsx"
            ),
            source(
              "components/templates/barber-heritage/barber-utils.ts"
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
            moduleSource(
              "mobile",
              "BarberMobileAppShell"
            ),
            ...MOBILE_SCREEN_MODULES.map(
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
          barberSource
        ).not.toContain(
          "HairLuxury"
        );

        expect(
          barberSource
        ).not.toContain(
          "EditorialDesktop"
        );

        expect(
          barberSource
        ).not.toContain(
          "EditorialMobile"
        );

        expect(
          barberSource
        ).not.toContain(
          "@/components/desktop/"
        );

        expect(
          barberSource
        ).not.toContain(
          "@/components/mobile/"
        );
      }
    );

    it(
      "documents V2 visual intent without claiming browser acceptance",
      () => {
        const milestone =
          source(
            "docs/milestones/DEMO-THEME-BARBER-01.md"
          );

        for (
          const marker of [
            "Barber V2",
            "full-bleed",
            "semitransparent",
            "app-shell",
            "microanimacije",
            "beta",
            "browser visual acceptance",
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
