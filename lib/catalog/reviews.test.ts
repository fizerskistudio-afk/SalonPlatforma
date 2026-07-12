import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildCatalogReviewData,
  type CatalogReviewRow,
  type CatalogReviewSettingsRow,
} from "./reviews";

const SETTINGS:
  CatalogReviewSettingsRow = {
  reviews_enabled: true,
  direct_reviews_enabled:
    true,
  verified_reviews_enabled:
    true,
  testimonials_enabled:
    true,
  google_reviews_enabled:
    true,
  show_rating_summary:
    true,
  allow_demo_content:
    true,
  google_review_url:
    "https://g.page/r/example/review",
};

function createRow(
  overrides:
    Partial<CatalogReviewRow> =
      {}
): CatalogReviewRow {
  return {
    id:
      "11111111-1111-4111-8111-111111111111",
    source:
      "platform",
    status:
      "published",
    service_id:
      null,
    employee_id:
      null,
    author_name:
      "Ana",
    author_avatar_url:
      null,
    rating: 5,
    body:
      "Odlična usluga.",
    language_code:
      "sr-Latn",
    is_verified_visit:
      false,
    external_url:
      null,
    owner_reply:
      null,
    owner_reply_at:
      null,
    provider_published_at:
      null,
    published_at:
      "2026-07-12T08:00:00.000Z",
    created_at:
      "2026-07-12T08:00:00.000Z",
    ...overrides,
  };
}

describe(
  "catalog review contract",
  () => {
    it(
      "returns no reviews when tenant reviews are disabled",
      () => {
        const result =
          buildCatalogReviewData({
            mode:
              "public",
            settings: {
              ...SETTINGS,
              reviews_enabled:
                false,
            },
            rows: [
              createRow(),
            ],
          });

        expect(
          result.reviews
        ).toEqual([]);

        expect(
          result.config
            .enabled
        ).toBe(false);

        expect(
          result.summary
            .averageRating
        ).toBeNull();
      }
    );

    it(
      "keeps public output published-only and excludes demo content",
      () => {
        const result =
          buildCatalogReviewData({
            mode:
              "public",
            settings:
              SETTINGS,
            rows: [
              createRow(),
              createRow({
                id:
                  "22222222-2222-4222-8222-222222222222",
                status:
                  "pending",
              }),
              createRow({
                id:
                  "33333333-3333-4333-8333-333333333333",
                source:
                  "demo",
              }),
            ],
          });

        expect(
          result.reviews.map(
            (
              review
            ) =>
              review.id
          )
        ).toEqual([
          "11111111-1111-4111-8111-111111111111",
        ]);
      }
    );

    it(
      "allows demo reviews only in platform preview when enabled",
      () => {
        const result =
          buildCatalogReviewData({
            mode:
              "platform-preview",
            settings:
              SETTINGS,
            rows: [
              createRow({
                source:
                  "demo",
              }),
            ],
          });

        expect(
          result.reviews
        ).toHaveLength(1);

        expect(
          result.reviews[0]
            ?.badge
        ).toBe("demo");
      }
    );

    it(
      "respects testimonial and Google source switches",
      () => {
        const result =
          buildCatalogReviewData({
            mode:
              "public",
            settings: {
              ...SETTINGS,
              testimonials_enabled:
                false,
              google_reviews_enabled:
                false,
            },
            rows: [
              createRow({
                source:
                  "manual-testimonial",
                rating:
                  null,
              }),
              createRow({
                id:
                  "44444444-4444-4444-8444-444444444444",
                source:
                  "google",
                external_url:
                  "https://example.com/review",
              }),
            ],
          });

        expect(
          result.reviews
        ).toEqual([]);

        expect(
          result.config
            .googleReviewUrl
        ).toBeNull();
      }
    );

    it(
      "calculates rated summary and ignores null ratings",
      () => {
        const result =
          buildCatalogReviewData({
            mode:
              "public",
            settings:
              SETTINGS,
            rows: [
              createRow({
                rating: 5,
              }),
              createRow({
                id:
                  "55555555-5555-4555-8555-555555555555",
                rating: 4,
              }),
              createRow({
                id:
                  "66666666-6666-4666-8666-666666666666",
                source:
                  "manual-testimonial",
                rating:
                  null,
              }),
            ],
          });

        expect(
          result.summary
        ).toEqual({
          total: 3,
          ratedCount: 2,
          averageRating:
            4.5,
          distribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 1,
            5: 1,
          },
        });
      }
    );

    it(
      "keeps local owner replies only on platform reviews",
      () => {
        const result =
          buildCatalogReviewData({
            mode:
              "public",
            settings:
              SETTINGS,
            rows: [
              createRow({
                owner_reply:
                  "Hvala!",
                owner_reply_at:
                  "2026-07-12T09:00:00.000Z",
              }),
              createRow({
                id:
                  "77777777-7777-4777-8777-777777777777",
                source:
                  "google",
                external_url:
                  "https://example.com/review",
                owner_reply:
                  "Ne sme biti lokalno prikazano.",
              }),
            ],
          });

        expect(
          result.reviews[0]
            ?.ownerReply
        ).toBe("Hvala!");

        expect(
          result.reviews[1]
            ?.ownerReply
        ).toBeNull();
      }
    );
  }
);
