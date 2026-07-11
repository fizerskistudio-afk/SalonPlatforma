import {
  describe,
  expect,
  it,
} from "vitest";

import {
  UI_LOCALE_CODES,
} from "@/lib/i18n/locales";

import {
  getReviewUiCopy,
  resolveReviewUiLocale,
} from "./public-copy";

describe(
  "review public UI copy",
  () => {
    it.each(
      UI_LOCALE_CODES
    )(
      "contains every non-empty label for %s",
      (
        locale
      ) => {
        const copy =
          getReviewUiCopy(
            locale
          );

        expect(
          Object.keys(
            copy
          ).length
        ).toBeGreaterThan(
          20
        );

        for (
          const value of
          Object.values(
            copy
          )
        ) {
          expect(
            value.trim()
              .length
          ).toBeGreaterThan(
            0
          );
        }
      }
    );

    it(
      "falls back to Serbian Latin for unsupported locale",
      () => {
        expect(
          resolveReviewUiLocale(
            "sr-Cyrl"
          )
        ).toBe(
          "sr-Latn"
        );
      }
    );
  }
);
