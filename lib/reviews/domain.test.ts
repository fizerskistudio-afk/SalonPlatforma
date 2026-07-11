import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getReviewSourceCapabilities,
  isReviewPublic,
  isValidReviewInvariant,
  resolveReviewBadgeKind,
  REVIEW_SOURCES,
  REVIEW_STATUSES,
  validateReviewInvariant,
} from "./domain";

describe(
  "review domain contract",
  () => {
    it(
      "locks supported sources and moderation statuses",
      () => {
        expect(
          REVIEW_SOURCES
        ).toEqual([
          "platform",
          "google",
          "manual-testimonial",
          "demo",
        ]);

        expect(
          REVIEW_STATUSES
        ).toEqual([
          "pending",
          "published",
          "rejected",
          "flagged",
          "archived",
        ]);
      }
    );

    it(
      "allows a direct unverified platform review",
      () => {
        expect(
          isValidReviewInvariant({
            source:
              "platform",
            rating:
              5,
            bookingId:
              null,
            isVerifiedVisit:
              false,
            externalId:
              null,
            environment:
              "production",
          })
        ).toBe(true);
      }
    );

    it(
      "allows a verified platform review only with a booking link",
      () => {
        expect(
          isValidReviewInvariant({
            source:
              "platform",
            rating:
              5,
            bookingId:
              "booking-123",
            isVerifiedVisit:
              true,
            externalId:
              null,
            environment:
              "production",
          })
        ).toBe(true);

        expect(
          validateReviewInvariant({
            source:
              "platform",
            rating:
              5,
            bookingId:
              null,
            isVerifiedVisit:
              true,
            externalId:
              null,
            environment:
              "production",
          })
        ).toContain(
          "VERIFIED_VISIT_REQUIRES_BOOKING"
        );
      }
    );

    it(
      "never treats Google or manual content as a verified visit",
      () => {
        expect(
          validateReviewInvariant({
            source:
              "google",
            rating:
              5,
            bookingId:
              null,
            isVerifiedVisit:
              true,
            externalId:
              "google-review-1",
            environment:
              "production",
          })
        ).toContain(
          "VERIFIED_VISIT_REQUIRES_PLATFORM"
        );

        expect(
          validateReviewInvariant({
            source:
              "manual-testimonial",
            rating:
              null,
            bookingId:
              null,
            isVerifiedVisit:
              true,
            externalId:
              null,
            environment:
              "production",
          })
        ).toContain(
          "VERIFIED_VISIT_REQUIRES_PLATFORM"
        );
      }
    );

    it(
      "requires a stable external id for Google content",
      () => {
        expect(
          validateReviewInvariant({
            source:
              "google",
            rating:
              4,
            bookingId:
              null,
            isVerifiedVisit:
              false,
            externalId:
              null,
            environment:
              "production",
          })
        ).toContain(
          "GOOGLE_REQUIRES_EXTERNAL_ID"
        );

        expect(
          isValidReviewInvariant({
            source:
              "google",
            rating:
              4,
            bookingId:
              null,
            isVerifiedVisit:
              false,
            externalId:
              "google-review-1",
            environment:
              "production",
          })
        ).toBe(true);
      }
    );

    it(
      "allows a testimonial without a rating",
      () => {
        expect(
          isValidReviewInvariant({
            source:
              "manual-testimonial",
            rating:
              null,
            bookingId:
              null,
            isVerifiedVisit:
              false,
            externalId:
              null,
            environment:
              "production",
          })
        ).toBe(true);
      }
    );

    it(
      "allows generated demo reviews only in preview",
      () => {
        expect(
          isValidReviewInvariant({
            source:
              "demo",
            rating:
              5,
            bookingId:
              null,
            isVerifiedVisit:
              false,
            externalId:
              null,
            environment:
              "preview",
          })
        ).toBe(true);

        expect(
          validateReviewInvariant({
            source:
              "demo",
            rating:
              5,
            bookingId:
              null,
            isVerifiedVisit:
              false,
            externalId:
              null,
            environment:
              "production",
          })
        ).toContain(
          "DEMO_NOT_ALLOWED_IN_PRODUCTION"
        );
      }
    );

    it.each([
      0,
      1.5,
      6,
      Number.NaN,
    ])(
      "rejects invalid rating %s",
      (
        rating
      ) => {
        expect(
          validateReviewInvariant({
            source:
              "platform",
            rating,
            bookingId:
              null,
            isVerifiedVisit:
              false,
            externalId:
              null,
            environment:
              "production",
          })
        ).toContain(
          "INVALID_RATING"
        );
      }
    );

    it(
      "publishes only explicit published status",
      () => {
        expect(
          isReviewPublic(
            "published"
          )
        ).toBe(true);

        expect(
          isReviewPublic(
            "pending"
          )
        ).toBe(false);

        expect(
          isReviewPublic(
            "flagged"
          )
        ).toBe(false);
      }
    );

    it(
      "exposes honest source capabilities",
      () => {
        expect(
          getReviewSourceCapabilities(
            "platform"
          )
        ).toMatchObject({
          submissionMode:
            "platform-form",
          canBeVerifiedVisit:
            true,
          salonCanEditBody:
            false,
          ownerReplyMode:
            "platform",
        });

        expect(
          getReviewSourceCapabilities(
            "google"
          )
        ).toMatchObject({
          submissionMode:
            "provider-link",
          externallyManaged:
            true,
          salonCanEditBody:
            false,
          ownerReplyMode:
            "provider",
        });

        expect(
          getReviewSourceCapabilities(
            "manual-testimonial"
          )
        ).toMatchObject({
          submissionMode:
            "admin-entry",
          salonCanEditBody:
            true,
        });

        expect(
          getReviewSourceCapabilities(
            "demo"
          )
        ).toMatchObject({
          submissionMode:
            "preview-generator",
          synthetic:
            true,
        });
      }
    );

    it(
      "resolves public source badges without mixing trust levels",
      () => {
        expect(
          resolveReviewBadgeKind(
            "platform",
            true
          )
        ).toBe(
          "verified-visit"
        );

        expect(
          resolveReviewBadgeKind(
            "platform",
            false
          )
        ).toBe(
          "platform"
        );

        expect(
          resolveReviewBadgeKind(
            "google",
            false
          )
        ).toBe(
          "google"
        );

        expect(
          resolveReviewBadgeKind(
            "manual-testimonial",
            false
          )
        ).toBe(
          "testimonial"
        );

        expect(
          resolveReviewBadgeKind(
            "demo",
            false
          )
        ).toBe(
          "demo"
        );
      }
    );
  }
);
