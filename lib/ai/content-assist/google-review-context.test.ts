import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveGoogleReviewReplyContext,
} from "./google-review-context";

const BUSINESS_ID =
  "11111111-1111-4111-8111-111111111111";

describe(
  "Google review reply context",
  () => {
    it(
      "builds the provider request only from server-loaded review data",
      () => {
        expect(
          resolveGoogleReviewReplyContext({
            businessId:
              BUSINESS_ID,
            requestId:
              "request-123",
            targetLocale:
              "sr-Latn",
            tone:
              "warm",
            review: {
              id:
                "review-1",
              businessId:
                BUSINESS_ID,
              source:
                "google",
              body:
                " Odlična usluga. ",
              languageCode:
                "sr-Latn",
              rating:
                5,
            },
            connection: {
              businessId:
                BUSINESS_ID,
              provider:
                "google",
              status:
                "connected",
            },
          })
        ).toEqual({
          ok:
            true,
          request: {
            task:
              "review_reply_draft",
            requestId:
              "request-123",
            sourceLocale:
              "sr-Latn",
            targetLocale:
              "sr-Latn",
            sourceText:
              "Odlična usluga.",
            tone:
              "warm",
            context:
              "Ocena recenzije: 5/5.",
          },
          surfaceContext: {
            googleReviewIntegrationConnected:
              true,
            reviewSource:
              "google",
          },
        });
      }
    );

    it(
      "keeps non-Google source and disconnected integration visible to the guard layer",
      () => {
        expect(
          resolveGoogleReviewReplyContext({
            businessId:
              BUSINESS_ID,
            requestId:
              "request-123",
            targetLocale:
              "en",
            tone:
              "professional",
            review: {
              id:
                "review-1",
              businessId:
                BUSINESS_ID,
              source:
                "platform",
              body:
                "Good service.",
              languageCode:
                "en",
              rating:
                4,
            },
            connection:
              null,
          })
        ).toMatchObject({
          ok:
            true,
          surfaceContext: {
            googleReviewIntegrationConnected:
              false,
            reviewSource:
              "platform",
          },
        });
      }
    );

    it(
      "fails closed for cross-tenant or missing review rows",
      () => {
        expect(
          resolveGoogleReviewReplyContext({
            businessId:
              BUSINESS_ID,
            requestId:
              "request-123",
            targetLocale:
              "en",
            tone:
              "warm",
            review: {
              id:
                "review-1",
              businessId:
                "22222222-2222-4222-8222-222222222222",
              source:
                "google",
              body:
                "Good service.",
              languageCode:
                "en",
              rating:
                5,
            },
            connection:
              null,
          })
        ).toMatchObject({
          ok:
            false,
          status:
            404,
          code:
            "AI_REVIEW_NOT_FOUND",
        });

        expect(
          resolveGoogleReviewReplyContext({
            businessId:
              BUSINESS_ID,
            requestId:
              "request-123",
            targetLocale:
              "en",
            tone:
              "warm",
            review:
              null,
            connection:
              null,
          })
        ).toMatchObject({
          ok:
            false,
          code:
            "AI_REVIEW_NOT_FOUND",
        });
      }
    );

    it(
      "uses the requested reply locale when provider language is missing",
      () => {
        const result =
          resolveGoogleReviewReplyContext({
            businessId:
              BUSINESS_ID,
            requestId:
              "request-123",
            targetLocale:
              "de",
            tone:
              "concise",
            review: {
              id:
                "review-1",
              businessId:
                BUSINESS_ID,
              source:
                "google",
              body:
                "Sehr gut.",
              languageCode:
                null,
              rating:
                null,
            },
            connection: {
              businessId:
                BUSINESS_ID,
              provider:
                "google",
              status:
                "connected",
            },
          });

        expect(
          result.ok &&
          result.request.sourceLocale
        ).toBe(
          "de"
        );
      }
    );
  }
);
