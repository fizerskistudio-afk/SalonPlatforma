import {
  describe,
  expect,
  it,
} from "vitest";

import {
  validateDirectReviewRequest,
  validateVerifiedReviewRequest,
} from "./public-validation";

function validPayload() {
  return {
    businessSlug:
      "mika-berberin",
    authorName:
      "  Petar Petrović  ",
    rating: 5,
    body:
      "  Odlična usluga.\r\nDolazim ponovo.  ",
    languageCode:
      "sr-Latn",
    website: "",
  };
}

function expectCode(
  result:
    ReturnType<
      typeof validateDirectReviewRequest
    >,
  code: string
) {
  expect(
    result.ok
  ).toBe(false);

  if (result.ok) {
    throw new Error(
      "Expected validation error."
    );
  }

  expect(
    result.error.code
  ).toBe(code);
}

describe(
  "public review validation",
  () => {
    it(
      "normalizes a direct review",
      () => {
        const result =
          validateDirectReviewRequest(
            validPayload()
          );

        expect(
          result.ok
        ).toBe(true);

        if (!result.ok) {
          throw new Error(
            result.error.code
          );
        }

        expect(
          result.value
        ).toEqual({
          businessSlug:
            "mika-berberin",
          authorName:
            "Petar Petrović",
          rating: 5,
          body:
            "Odlična usluga.\nDolazim ponovo.",
          languageCode:
            "sr-Latn",
        });
      }
    );

    it(
      "normalizes a verified review without tenant input",
      () => {
        const payload:
          Record<string, unknown> = {
            ...validPayload(),
          };

        delete payload.businessSlug;

        const result =
          validateVerifiedReviewRequest(
            payload
          );

        expect(
          result.ok
        ).toBe(true);

        if (result.ok) {
          expect(
            result.value
          ).toEqual({
            authorName:
              "Petar Petrović",
            rating: 5,
            body:
              "Odlična usluga.\nDolazim ponovo.",
            languageCode:
              "sr-Latn",
          });
        }
      }
    );

    it(
      "rejects non-object input",
      () => {
        expectCode(
          validateDirectReviewRequest(
            []
          ),
          "INVALID_REQUEST"
        );
      }
    );

    it(
      "requires a direct tenant slug",
      () => {
        const payload =
          validPayload();

        payload.businessSlug =
          " ";

        expectCode(
          validateDirectReviewRequest(
            payload
          ),
          "MISSING_BUSINESS_SLUG"
        );
      }
    );

    it(
      "rejects an invalid direct tenant slug",
      () => {
        const payload =
          validPayload();

        payload.businessSlug =
          "Mika Berberin";

        expectCode(
          validateDirectReviewRequest(
            payload
          ),
          "INVALID_BUSINESS_SLUG"
        );
      }
    );

    it.each([
      "",
      "P",
      "x".repeat(161),
    ])(
      "rejects invalid author name",
      (
        authorName
      ) => {
        const payload =
          validPayload();

        payload.authorName =
          authorName;

        expectCode(
          validateDirectReviewRequest(
            payload
          ),
          "INVALID_AUTHOR_NAME"
        );
      }
    );

    it.each([
      0,
      6,
      4.5,
      "5",
    ])(
      "rejects invalid rating",
      (
        rating
      ) => {
        const payload:
          Record<string, unknown> =
            validPayload();

        payload.rating =
          rating;

        expectCode(
          validateDirectReviewRequest(
            payload
          ),
          "INVALID_RATING"
        );
      }
    );

    it.each([
      "",
      "x",
      "x".repeat(2001),
    ])(
      "rejects invalid review body",
      (
        body
      ) => {
        const payload =
          validPayload();

        payload.body =
          body;

        expectCode(
          validateDirectReviewRequest(
            payload
          ),
          "INVALID_REVIEW_BODY"
        );
      }
    );

    it(
      "accepts all seven public locales",
      () => {
        for (
          const languageCode of [
            "sr-Latn",
            "mk",
            "hr",
            "sq",
            "en",
            "de",
            "fr",
          ]
        ) {
          const payload =
            validPayload();

          payload.languageCode =
            languageCode;

          expect(
            validateDirectReviewRequest(
              payload
            ).ok
          ).toBe(true);
        }
      }
    );

    it(
      "rejects unsupported locale",
      () => {
        const payload =
          validPayload();

        payload.languageCode =
          "sr-Cyrl";

        expectCode(
          validateDirectReviewRequest(
            payload
          ),
          "INVALID_LANGUAGE_CODE"
        );
      }
    );

    it(
      "rejects a filled honeypot",
      () => {
        const payload =
          validPayload();

        payload.website =
          "https://spam.example";

        expectCode(
          validateDirectReviewRequest(
            payload
          ),
          "BOT_FIELD_FILLED"
        );
      }
    );
  }
);
