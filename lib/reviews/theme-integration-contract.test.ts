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

function readSource(
  path: string
): string {
  return readFileSync(
    resolve(
      process.cwd(),
      path
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );
}

const DIRECT_THEME_PATHS = [
  "components/templates/hair-editorial/HairEditorialDesktopTemplate.tsx",
  "components/templates/hair-editorial/HairEditorialMobileTemplate.tsx",
  "components/templates/barber-heritage/BarberHeritageDesktopTemplate.tsx",
  "components/templates/barber-heritage/BarberHeritageMobileTemplate.tsx",
] as const;

const ALL_TEMPLATE_PATHS = [
  "components/templates/hair-luxury/HairLuxuryDesktopTemplate.tsx",
  "components/templates/hair-luxury/HairLuxuryMobileTemplate.tsx",
  ...DIRECT_THEME_PATHS,
] as const;

const REVIEW_ACTION_TEMPLATE_PATHS = [
  "components/templates/hair-luxury/HairLuxuryDesktopTemplate.tsx",
  ...DIRECT_THEME_PATHS,
] as const;

describe(
  "review theme integration contract",
  () => {
    it(
      "removes legacy static review sources",
      () => {
        expect(
          existsSync(
            resolve(
              process.cwd(),
              "lib/contentData.ts"
            )
          )
        ).toBe(false);

        expect(
          existsSync(
            resolve(
              process.cwd(),
              "components/desktop/ReviewsSection.tsx"
            )
          )
        ).toBe(false);
      }
    );

    it(
      "makes catalog review fields mandatory and removes the legacy Review type",
      () => {
        const types =
          readSource(
            "lib/types.ts"
          );

        expect(
          types
        ).not.toContain(
          "export type Review ="
        );

        expect(
          types
        ).toContain(
          "reviews: CatalogReview[];"
        );

        expect(
          types
        ).toContain(
          "reviewSummary: CatalogReviewSummary;"
        );

        expect(
          types
        ).toContain(
          "reviewConfig: CatalogReviewConfig;"
        );

        expect(
          types
        ).not.toContain(
          "reviews?: CatalogReview[];"
        );
      }
    );

    it(
      "passes preview mode through the public template contract",
      () => {
        expect(
          readSource(
            "components/templates/template-props.ts"
          )
        ).toContain(
          "previewMode: boolean;"
        );

        expect(
          readSource(
            "components/SalonPlatform.tsx"
          )
        ).toContain(
          "previewMode,"
        );
      }
    );

    it.each(
      DIRECT_THEME_PATHS
    )(
      "integrates the shared catalog adapter directly in %s",
      (
        path
      ) => {
        const source =
          readSource(
            path
          );

        expect(
          source
        ).toContain(
          "CatalogReviewsSection"
        );

        expect(
          source
        ).toContain(
          "previewMode"
        );
      }
    );

    it.each(
      REVIEW_ACTION_TEMPLATE_PATHS
    )(
      "passes preview mode where review actions render and contains no static review import in %s",
      (
        path
      ) => {
        const source =
          readSource(
            path
          );

        expect(
          source
        ).toContain(
          "previewMode"
        );

        expect(
          source
        ).not.toContain(
          "@/lib/contentData"
        );
      }
    );

    it(
      "keeps Lumiere desktop and mobile integration inside their composition layers",
      () => {
        const desktop =
          readSource(
            "components/desktop/DesktopLanding.tsx"
          );

        expect(
          desktop
        ).toContain(
          "CatalogReviewsSection"
        );

        expect(
          desktop
        ).not.toContain(
          "./ReviewsSection"
        );

        const mobile =
          readSource(
            "components/mobile/MobileAppShell.tsx"
          );

        expect(
          mobile
        ).not.toContain(
          "CatalogReviewsSection"
        );

        expect(
          mobile
        ).not.toContain(
          'id="mobile-reviews"'
        );
      }
    );

    it(
      "keeps Lumiere mobile review-free while preview booking enforcement stays centralized",
      () => {
        const mobileTemplate =
          readSource(
            "components/templates/hair-luxury/HairLuxuryMobileTemplate.tsx"
          );

        expect(
          mobileTemplate
        ).toContain(
          "<MobileAppShell"
        );

        expect(
          mobileTemplate
        ).not.toContain(
          "CatalogReviewsSection"
        );

        expect(
          mobileTemplate
        ).not.toContain(
          "@/lib/contentData"
        );

        const platform =
          readSource(
            "components/SalonPlatform.tsx"
          );

        expect(
          platform
        ).toContain(
          "previewMode"
        );

        expect(
          platform
        ).toContain(
          "<TemplateRenderer"
        );

        expect(
          platform
        ).toContain(
          "<MobileBookingModal"
        );
      }
    );

    it(
      "adds review anchors to desktop themes with header navigation",
      () => {
        const editorial =
          readSource(
            "components/templates/hair-editorial/HairEditorialDesktopTemplate.tsx"
          );

        expect(
          editorial
        ).toContain(
          'href="#editorial-reviews"'
        );

        const barber =
          readSource(
            "components/templates/barber-heritage/BarberHeritageDesktopTemplate.tsx"
          );

        expect(
          barber
        ).toContain(
          'href="#reviews"'
        );
      }
    );

    it(
      "keeps every integration on the shared adapter rather than duplicating review data logic",
      () => {
        const adapter =
          readSource(
            "components/reviews/CatalogReviewsSection.tsx"
          );

        expect(
          adapter
        ).toContain(
          "useCatalogData"
        );

        expect(
          adapter
        ).toContain(
          "SharedReviewsSection"
        );

        for (
          const path of
            ALL_TEMPLATE_PATHS
        ) {
          const source =
            readSource(
              path
            );

          expect(
            source
          ).not.toContain(
            "reviewSummary.distribution"
          );

          expect(
            source
          ).not.toContain(
            "reviews.map("
          );
        }
      }
    );
  }
);
