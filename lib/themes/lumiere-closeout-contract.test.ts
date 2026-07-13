import {
  existsSync,
  readFileSync,
} from "node:fs";
import {
  resolve,
} from "node:path";
import {
  describe,
  expect,
  it,
} from "vitest";

function source(
  path: string
): string {
  const file =
    resolve(
      process.cwd(),
      path
    );

  expect(
    existsSync(file),
    `Missing: ${path}`
  ).toBe(true);

  return readFileSync(
    file,
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );
}

function ordered(
  text: string,
  markers:
    readonly string[]
) {
  let cursor = -1;

  for (
    const marker of
    markers
  ) {
    const index =
      text.indexOf(
        marker
      );

    expect(
      index,
      `Missing: ${marker}`
    ).toBeGreaterThan(
      -1
    );

    expect(
      index,
      `Out of order: ${marker}`
    ).toBeGreaterThan(
      cursor
    );

    cursor =
      index;
  }
}

describe(
  "Lumiere final closeout contract",
  () => {
    const desktop =
      source(
        "components/desktop/DesktopLanding.tsx"
      );

    const gallery =
      source(
        "components/desktop/GallerySection.tsx"
      );

    const mobile =
      source(
        "components/mobile/MobileAppShell.tsx"
      );

    const platform =
      source(
        "components/SalonPlatform.tsx"
      );

    const renderer =
      source(
        "components/templates/TemplateRenderer.tsx"
      );

    const luxuryDesktop =
      source(
        "components/templates/hair-luxury/HairLuxuryDesktopTemplate.tsx"
      );

    const luxuryMobile =
      source(
        "components/templates/hair-luxury/HairLuxuryMobileTemplate.tsx"
      );

    it(
      "locks desktop composition including full reviews",
      () => {
        ordered(
          desktop,
          [
            "<Header",
            "<Hero",
            "<ServicesSection",
            "<TeamSection",
            "<GallerySection",
            "<CatalogReviewsSection",
            "<ContactSection",
            "<Footer",
          ]
        );
      }
    );

    it(
      "uses one featured desktop gallery tile for the seven-image layout",
      () => {
        expect(
          gallery
        ).toContain(
          "index === 0;"
        );

        expect(
          gallery
        ).not.toContain(
          "index === 5"
        );

        expect(
          gallery
        ).toContain(
          '"md:row-span-2"'
        );
      }
    );

    it(
      "keeps the booking-first mobile app shell review-free",
      () => {
        for (
          const marker of
          [
            'case "home":',
            'case "services":',
            'case "team":',
            'case "contact":',
            "<MobileHeader",
            "<BottomNav",
            "<MobileHome",
          ]
        ) {
          expect(
            mobile
          ).toContain(
            marker
          );
        }

        expect(
          mobile
        ).not.toContain(
          "CatalogReviewsSection"
        );

        expect(
          mobile
        ).not.toContain(
          "mobile-reviews"
        );
      }
    );

    it(
      "keeps desktop and mobile booking entry points wired",
      () => {
        expect(
          desktop
        ).toContain(
          "onBook={onBook}"
        );

        expect(
          desktop
        ).toContain(
          "onBookService={onBookService}"
        );

        expect(
          mobile
        ).toContain(
          "onBook={onBook}"
        );

        expect(
          mobile
        ).toContain(
          "onBookService={onBookService}"
        );
      }
    );

    it(
      "routes hair-luxury through its desktop and mobile adapters",
      () => {
        expect(
          renderer
        ).toContain(
          'case "hair-luxury":'
        );

        expect(
          renderer
        ).toContain(
          "<HairLuxuryDesktopTemplate"
        );

        expect(
          renderer
        ).toContain(
          "<HairLuxuryMobileTemplate"
        );

        expect(
          luxuryDesktop
        ).toContain(
          "<DesktopLanding"
        );

        expect(
          luxuryMobile
        ).toContain(
          "<MobileAppShell"
        );
      }
    );

    it(
      "keeps preview enforcement and booking modals centralized",
      () => {
        expect(
          platform
        ).toContain(
          "<TemplateRenderer"
        );

        expect(
          platform
        ).toContain(
          "previewMode"
        );

        expect(
          platform
        ).toContain(
          "<DesktopBookingModal"
        );

        expect(
          platform
        ).toContain(
          "<MobileBookingModal"
        );

        expect(
          platform
        ).toContain(
          "if ("
        );

        expect(
          platform
        ).toContain(
          "previewMode"
        );
      }
    );

    it(
      "retains seven supported locales",
      () => {
        const paths = [
          "lib/translations.ts",
          "lib/types.ts",
          "lib/locales.ts",
          "lib/locale-registry.ts",
          "lib/i18n/locales.ts",
        ];

        const all =
          paths
            .filter(
              (
                path
              ) =>
                existsSync(
                  resolve(
                    process.cwd(),
                    path
                  )
                )
            )
            .map(
              source
            )
            .join(
              "\n"
            );

        for (
          const locale of
          [
            "sr-Latn",
            "mk",
            "hr",
            "sq",
            "en",
            "de",
            "fr",
          ]
        ) {
          expect(
            all
          ).toContain(
            locale
          );
        }
      }
    );

    it(
      "does not restore legacy static reviews",
      () => {
        expect(
          existsSync(
            resolve(
              process.cwd(),
              "components/desktop/ReviewsSection.tsx"
            )
          )
        ).toBe(false);

        expect(
          existsSync(
            resolve(
              process.cwd(),
              "lib/contentData.ts"
            )
          )
        ).toBe(false);
      }
    );
  }
);
