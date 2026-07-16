import {
  describe,
  expect,
  it,
} from "vitest";

import {
  AiContentAssistRequestContractError,
  parsePlatformAdminTranslationCommand,
  parseTenantGoogleReviewReplyCommand,
} from "./request-contract";

const BUSINESS_ID =
  "11111111-1111-4111-8111-111111111111";

const REVIEW_ID =
  "22222222-2222-4222-8222-222222222222";

describe(
  "AI content assist request contract",
  () => {
    it(
      "forces Platform Admin task and request ID",
      () => {
        expect(
          parsePlatformAdminTranslationCommand({
            requestId:
              "request-123",
            value: {
              businessId:
                BUSINESS_ID,
              sourceLocale:
                "sr-Latn",
              targetLocale:
                "de",
              sourceText:
                " Premium salon. ",
              tone:
                "professional",
            },
          })
        ).toEqual({
          businessId:
            BUSINESS_ID,
          request: {
            task:
              "content_translation",
            requestId:
              "request-123",
            sourceLocale:
              "sr-Latn",
            targetLocale:
              "de",
            sourceText:
              "Premium salon.",
            tone:
              "professional",
          },
        });
      }
    );

    it.each([
      {
        task:
          "review_reply_draft",
      },
      {
        requestId:
          "client-controlled",
      },
      {
        actorId:
          "client-controlled",
      },
    ])(
      "rejects client-controlled translation boundary field %#",
      (
        extra
      ) => {
        expect(
          () =>
            parsePlatformAdminTranslationCommand({
              requestId:
                "request-123",
              value: {
                businessId:
                  BUSINESS_ID,
                sourceLocale:
                  "sr-Latn",
                targetLocale:
                  "de",
                sourceText:
                  "Premium salon.",
                ...extra,
              },
            })
        ).toThrow(
          AiContentAssistRequestContractError
        );
      }
    );

    it(
      "accepts only review ID, target locale and tone from tenant UI",
      () => {
        expect(
          parseTenantGoogleReviewReplyCommand({
            requestId:
              "review-request",
            value: {
              reviewId:
                REVIEW_ID,
              targetLocale:
                "sr-Latn",
            },
          })
        ).toEqual({
          requestId:
            "review-request",
          reviewId:
            REVIEW_ID,
          targetLocale:
            "sr-Latn",
          tone:
            "warm",
        });
      }
    );

    it.each([
      {
        businessId:
          BUSINESS_ID,
      },
      {
        sourceText:
          "Client-controlled review text",
      },
      {
        sourceLocale:
          "en",
      },
      {
        task:
          "content_translation",
      },
      {
        requestId:
          "client-controlled",
      },
    ])(
      "rejects client-controlled tenant review field %#",
      (
        extra
      ) => {
        expect(
          () =>
            parseTenantGoogleReviewReplyCommand({
              requestId:
                "review-request",
              value: {
                reviewId:
                  REVIEW_ID,
                targetLocale:
                  "sr-Latn",
                ...extra,
              },
            })
        ).toThrow(
          AiContentAssistRequestContractError
        );
      }
    );

    it(
      "rejects invalid identifiers",
      () => {
        expect(
          () =>
            parsePlatformAdminTranslationCommand({
              requestId:
                "request-123",
              value: {
                businessId:
                  "not-a-uuid",
                sourceLocale:
                  "sr-Latn",
                targetLocale:
                  "de",
                sourceText:
                  "Premium salon.",
              },
            })
        ).toThrowError(
          expect.objectContaining({
            code:
              "INVALID_BUSINESS_ID",
          })
        );

        expect(
          () =>
            parseTenantGoogleReviewReplyCommand({
              requestId:
                "review-request",
              value: {
                reviewId:
                  "not-a-uuid",
                targetLocale:
                  "sr-Latn",
              },
            })
        ).toThrowError(
          expect.objectContaining({
            code:
              "INVALID_REVIEW_ID",
          })
        );
      }
    );
  }
);
