import {
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

describe(
  "shared review presentation source contract",
  () => {
    const translations =
      readSource(
        "lib/translations.ts"
      );

    it.each([
      "verifiedVisit",
      "googleReview",
      "salonTestimonial",
      "demoReview",
      "platformReview",
      "ownerReply",
      "viewOnGoogle",
      "reviewOnGoogle",
      "leaveReview",
      "emptyTitle",
      "emptyDescription",
      "ratingOutOfFive",
      "basedOnRatings",
      "ratingDistribution",
      "unratedTestimonial",
    ])(
      "adds central review translation leaf %s",
      (
        marker
      ) => {
        expect(
          translations
        ).toContain(
          marker
        );
      }
    );

    const card =
      readSource(
        "components/reviews/ReviewCard.tsx"
      );

    it.each([
      "ReviewTrustBadge",
      "ReviewStars",
      "review.ownerReply",
      'data-review-source=',
      'data-review-verified=',
      'rel="noopener noreferrer"',
      "isSafeReviewExternalUrl",
      'dir="auto"',
    ])(
      "keeps review card trust marker %s",
      (
        marker
      ) => {
        expect(
          card
        ).toContain(
          marker
        );
      }
    );

    const section =
      readSource(
        "components/reviews/SharedReviewsSection.tsx"
      );

    const compactSection =
      section.replace(
        /\s+/g,
        ""
      );

    it.each([
      "!config.enabled",
      "config.showRatingSummary",
      "config.directSubmissionEnabled",
      "config.googleReviewsEnabled",
      "reviews.length > 0",
      'role="list"',
      'data-shared-reviews="true"',
      "previewMode",
    ])(
      "keeps section behavior marker %s",
      (
        marker
      ) => {
        expect(
          compactSection
        ).toContain(
          marker.replace(
            /\s+/g,
            ""
          )
        );
      }
    );

    it(
      "does not import legacy static review content",
      () => {
        for (
          const path of [
            "components/reviews/ReviewCard.tsx",
            "components/reviews/ReviewSummary.tsx",
            "components/reviews/SharedReviewsSection.tsx",
          ]
        ) {
          expect(
            readSource(
              path
            )
          ).not.toContain(
            "@/lib/contentData"
          );
        }
      }
    );

    const stars =
      readSource(
        "components/reviews/ReviewStars.tsx"
      );

    it(
      "supports fractional stars with an accessible rating label",
      () => {
        expect(
          stars
        ).toContain(
          "safeRating -"
        );

        expect(
          stars
        ).toContain(
          "aria-label"
        );

        expect(
          stars
        ).toContain(
          "ratingOutOfFive"
        );
      }
    );

    const summary =
      readSource(
        "components/reviews/ReviewSummary.tsx"
      );

    it(
      "exposes rating distribution as progress bars",
      () => {
        expect(
          summary
        ).toContain(
          'role="progressbar"'
        );

        expect(
          summary
        ).toContain(
          "aria-valuenow"
        );
      }
    );
  }
);
