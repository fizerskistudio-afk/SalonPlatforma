import {
  describe,
  expect,
  it,
} from "vitest";

import {
  clampReviewRating,
  formatReviewDate,
  formatReviewRating,
  getReviewAuthorInitials,
  interpolateReviewLabel,
  isSafeReviewExternalUrl,
} from "./presentation";

describe(
  "review presentation helpers",
  () => {
    it(
      "clamps rating values",
      () => {
        expect(
          clampReviewRating(
            -1
          )
        ).toBe(0);

        expect(
          clampReviewRating(
            6
          )
        ).toBe(5);

        expect(
          clampReviewRating(
            4.5
          )
        ).toBe(4.5);

        expect(
          clampReviewRating(
            null
          )
        ).toBeNull();
      }
    );

    it(
      "formats ratings with locale punctuation",
      () => {
        expect(
          formatReviewRating(
            4.5,
            "sr-Latn"
          )
        ).toBe("4,5");

        expect(
          formatReviewRating(
            4.5,
            "en"
          )
        ).toBe("4.5");
      }
    );

    it(
      "formats dates deterministically in UTC",
      () => {
        expect(
          formatReviewDate(
            "2026-07-12T23:30:00-10:00",
            "en"
          )
        ).toBe(
          "13 July 2026"
        );

        expect(
          formatReviewDate(
            "not-a-date",
            "en"
          )
        ).toBeNull();
      }
    );

    it(
      "creates compact author initials",
      () => {
        expect(
          getReviewAuthorInitials(
            "Ana Petrović"
          )
        ).toBe("AP");

        expect(
          getReviewAuthorInitials(
            "Ana"
          )
        ).toBe("A");

        expect(
          getReviewAuthorInitials(
            "   "
          )
        ).toBe("?");
      }
    );

    it(
      "interpolates known labels and preserves unknown placeholders",
      () => {
        expect(
          interpolateReviewLabel(
            "{rating} od 5, {count} ocena, {missing}",
            {
              rating:
                "4,8",
              count: 12,
            }
          )
        ).toBe(
          "4,8 od 5, 12 ocena, {missing}"
        );
      }
    );

    it(
      "allows HTTPS review links only",
      () => {
        expect(
          isSafeReviewExternalUrl(
            "https://example.com/review"
          )
        ).toBe(true);

        expect(
          isSafeReviewExternalUrl(
            "http://example.com/review"
          )
        ).toBe(false);

        expect(
          isSafeReviewExternalUrl(
            "javascript:alert(1)"
          )
        ).toBe(false);
      }
    );
  }
);
