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

function absolute(
  path: string
): string {
  return resolve(
    process.cwd(),
    path
  );
}

function readSource(
  path: string
): string {
  return readFileSync(
    absolute(
      path
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );
}

const PUBLIC_ROUTE_PATHS = [
  "app/reviews/[businessSlug]/page.tsx",
  "app/reviews/invitation/[token]/page.tsx",
  "app/api/reviews/route.ts",
  "app/api/reviews/invitations/[token]/route.ts",
] as const;

const ADMIN_AND_WORKER_PATHS = [
  "app/admin/(protected)/reviews/page.tsx",
  "app/admin/(protected)/reviews/actions.ts",
  "app/api/cron/review-invitations/route.ts",
] as const;

const THEME_PATHS = [
  "components/desktop/DesktopLanding.tsx",
  "components/mobile/MobileAppShell.tsx",
  "components/templates/hair-editorial/HairEditorialDesktopTemplate.tsx",
  "components/templates/hair-editorial/HairEditorialMobileTemplate.tsx",
  "components/templates/barber-heritage/BarberHeritageDesktopTemplate.tsx",
  "components/templates/barber-heritage/BarberHeritageMobileTemplate.tsx",
] as const;

describe(
  "reviews launch readiness contract",
  () => {
    it.each(
      PUBLIC_ROUTE_PATHS
    )(
      "keeps public review surface %s",
      (
        path
      ) => {
        expect(
          existsSync(
            absolute(
              path
            )
          )
        ).toBe(true);
      }
    );

    it.each(
      ADMIN_AND_WORKER_PATHS
    )(
      "keeps admin or worker surface %s",
      (
        path
      ) => {
        expect(
          existsSync(
            absolute(
              path
            )
          )
        ).toBe(true);
      }
    );

    it.each(
      THEME_PATHS
    )(
      "keeps shared catalog review integration in %s",
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
        ).not.toContain(
          "@/lib/contentData"
        );
      }
    );

    it(
      "keeps review submission actions disabled in preview mode",
      () => {
        const section =
          readSource(
            "components/reviews/SharedReviewsSection.tsx"
          ).replace(
            /\s+/g,
            ""
          );

        expect(
          section
        ).toContain(
          "!previewMode&&config.directSubmissionEnabled"
        );

        expect(
          section
        ).toContain(
          "!previewMode&&config.googleReviewsEnabled"
        );
      }
    );

    it(
      "keeps trust and owner-reply presentation centralized",
      () => {
        const card =
          readSource(
            "components/reviews/ReviewCard.tsx"
          );

        expect(
          card
        ).toContain(
          "ReviewTrustBadge"
        );

        expect(
          card
        ).toContain(
          "review.ownerReply"
        );

        expect(
          card
        ).toContain(
          'data-review-verified='
        );
      }
    );

    it(
      "keeps tenant-safe published-only catalog boundaries",
      () => {
        const server =
          readSource(
            "lib/catalog/server.ts"
          ).replace(
            /\s+/g,
            ""
          );

        expect(
          server
        ).toContain(
          '.eq("business_id",business.id)'
        );

        expect(
          server
        ).toContain(
          '.eq("status","published")'
        );

        const mapper =
          readSource(
            "lib/catalog/reviews.ts"
          ).replace(
            /\s+/g,
            ""
          );

        expect(
          mapper
        ).toContain(
          'row.status==="published"'
        );

        expect(
          mapper
        ).toContain(
          '"platform-preview"'
        );
      }
    );

    it(
      "keeps the legacy static review layer removed",
      () => {
        expect(
          existsSync(
            absolute(
              "lib/contentData.ts"
            )
          )
        ).toBe(false);

        expect(
          existsSync(
            absolute(
              "components/desktop/ReviewsSection.tsx"
            )
          )
        ).toBe(false);
      }
    );

    it(
      "documents all seven UI locales and launch blockers",
      () => {
        const qa =
          readSource(
            "docs/qa/REVIEWS-LAUNCH-QA.md"
          );

        for (
          const locale of [
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
            qa
          ).toContain(
            `\`${locale}\``
          );
        }

        for (
          const marker of [
            "Direct review",
            "Verified invitation review",
            "Moderation smoke",
            "Catalog and tenant isolation smoke",
            "Resend and cron activation",
            "Do not activate",
          ]
        ) {
          expect(
            qa
          ).toContain(
            marker
          );
        }
      }
    );

    it(
      "keeps a review launch evidence template without secret fields",
      () => {
        const results =
          readSource(
            "docs/qa/REVIEWS-LAUNCH-RESULTS.md"
          );

        expect(
          results
        ).toContain(
          "Commit SHA"
        );

        expect(
          results
        ).toContain(
          "Deployment URL"
        );

        expect(
          results
        ).toContain(
          "production cron remains disabled"
        );

        expect(
          results
        ).toContain(
          "Do not record"
        );
      }
    );
  }
);
