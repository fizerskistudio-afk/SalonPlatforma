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
  "public catalog review source contract",
  () => {
    const types =
      readSource(
        "lib/types.ts"
      );

    it.each([
      "export type CatalogReview =",
      "export type CatalogReviewSummary =",
      "export type CatalogReviewConfig =",
      "reviews: CatalogReview[]",
      "reviewSummary: CatalogReviewSummary",
      "reviewConfig: CatalogReviewConfig",
    ])(
      "adds catalog type marker %s",
      (
        marker
      ) => {
        expect(
          types
        ).toContain(
          marker
        );
      }
    );

    it(
      "rejects the staged optional review fields",
      () => {
        expect(
          types
        ).not.toContain(
          "reviews?: CatalogReview[]"
        );

        expect(
          types
        ).not.toContain(
          "reviewSummary?: CatalogReviewSummary"
        );

        expect(
          types
        ).not.toContain(
          "reviewConfig?: CatalogReviewConfig"
        );
      }
    );

    const server =
      readSource(
        "lib/catalog/server.ts"
      );

    it.each([
      'from("review_settings")',
      'from("reviews")',
      '"status"',
      '"published"',
      "buildCatalogReviewData",
      "reviews:",
      "reviewSummary:",
      "reviewConfig:",
    ])(
      "connects loader marker %s",
      (
        marker
      ) => {
        expect(
          server
        ).toContain(
          marker
        );
      }
    );

    const mapper =
      readSource(
        "lib/catalog/reviews.ts"
      );

    it.each([
      'row.status ===',
      '"published"',
      'mode ===',
      '"platform-preview"',
      "allow_demo_content",
      "resolveReviewBadgeKind",
      "averageRating",
      "googleReviewUrl",
    ])(
      "contains trust marker %s",
      (
        marker
      ) => {
        expect(
          mapper
        ).toContain(
          marker
        );
      }
    );

    it(
      "keeps preview demo content out of public mode",
      () => {
        expect(
          mapper
        ).toContain(
          'mode ===\n          "platform-preview"'
        );
      }
    );

  }
);
