const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const PUBLIC_REVIEW_LOCALES = [
  "sr-Latn",
  "mk",
  "hr",
  "sq",
  "en",
  "de",
  "fr",
] as const;

export type PublicReviewLocale =
  (typeof PUBLIC_REVIEW_LOCALES)[number];

type JsonRecord = Record<
  string,
  unknown
>;

export type NormalizedReviewContent = {
  authorName: string;
  rating: number;
  body: string;
  languageCode:
    PublicReviewLocale | null;
};

export type NormalizedDirectReviewRequest =
  NormalizedReviewContent & {
    businessSlug: string;
  };

export type NormalizedVerifiedReviewRequest =
  NormalizedReviewContent;

export type PublicReviewValidationCode =
  | "INVALID_REQUEST"
  | "MISSING_BUSINESS_SLUG"
  | "INVALID_BUSINESS_SLUG"
  | "INVALID_AUTHOR_NAME"
  | "INVALID_RATING"
  | "INVALID_REVIEW_BODY"
  | "INVALID_LANGUAGE_CODE"
  | "BOT_FIELD_FILLED";

export type PublicReviewValidationError = {
  status: 400;
  message: string;
  code:
    PublicReviewValidationCode;
};

export type PublicReviewValidationResult<
  TValue,
> =
  | {
      ok: true;
      value: TValue;
    }
  | {
      ok: false;
      error:
        PublicReviewValidationError;
    };

function isJsonRecord(
  value: unknown
): value is JsonRecord {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function normalizeText(
  value: unknown
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const normalized =
    value
      .normalize("NFC")
      .replace(
        /\r\n?/g,
        "\n"
      )
      .trim();

  return normalized.length > 0
    ? normalized
    : null;
}

function invalid<TValue>(
  message: string,
  code:
    PublicReviewValidationCode
): PublicReviewValidationResult<TValue> {
  return {
    ok: false,
    error: {
      status: 400,
      message,
      code,
    },
  };
}

function isPublicReviewLocale(
  value: string
): value is PublicReviewLocale {
  return (
    PUBLIC_REVIEW_LOCALES as readonly string[]
  ).includes(value);
}

function validateSharedReviewContent(
  input: JsonRecord
): PublicReviewValidationResult<
  NormalizedReviewContent
> {
  const website =
    normalizeText(
      input.website
    );

  if (website) {
    return invalid(
      "Invalid review request.",
      "BOT_FIELD_FILLED"
    );
  }

  const authorName =
    normalizeText(
      input.authorName
    );

  if (
    !authorName ||
    authorName.length < 2 ||
    authorName.length > 160
  ) {
    return invalid(
      "Author name is invalid.",
      "INVALID_AUTHOR_NAME"
    );
  }

  const rating =
    input.rating;

  if (
    typeof rating !==
      "number" ||
    !Number.isInteger(
      rating
    ) ||
    rating < 1 ||
    rating > 5
  ) {
    return invalid(
      "Rating must be an integer from 1 to 5.",
      "INVALID_RATING"
    );
  }

  const body =
    normalizeText(
      input.body
    );

  if (
    !body ||
    body.length < 2 ||
    body.length > 2000
  ) {
    return invalid(
      "Review body is invalid.",
      "INVALID_REVIEW_BODY"
    );
  }

  const rawLanguageCode =
    normalizeText(
      input.languageCode
    );

  let languageCode:
    PublicReviewLocale | null =
      null;

  if (rawLanguageCode) {
    if (
      !isPublicReviewLocale(
        rawLanguageCode
      )
    ) {
      return invalid(
        "Language code is invalid.",
        "INVALID_LANGUAGE_CODE"
      );
    }

    languageCode =
      rawLanguageCode;
  }

  return {
    ok: true,
    value: {
      authorName,
      rating,
      body,
      languageCode,
    },
  };
}

export function validateDirectReviewRequest(
  input: unknown
): PublicReviewValidationResult<
  NormalizedDirectReviewRequest
> {
  if (
    !isJsonRecord(
      input
    )
  ) {
    return invalid(
      "Invalid review request.",
      "INVALID_REQUEST"
    );
  }

  const businessSlug =
    normalizeText(
      input.businessSlug
    );

  if (!businessSlug) {
    return invalid(
      "Business slug is required.",
      "MISSING_BUSINESS_SLUG"
    );
  }

  if (
    !SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    return invalid(
      "Business slug is invalid.",
      "INVALID_BUSINESS_SLUG"
    );
  }

  const shared =
    validateSharedReviewContent(
      input
    );

  if (!shared.ok) {
    return shared;
  }

  return {
    ok: true,
    value: {
      businessSlug,
      ...shared.value,
    },
  };
}

export function validateVerifiedReviewRequest(
  input: unknown
): PublicReviewValidationResult<
  NormalizedVerifiedReviewRequest
> {
  if (
    !isJsonRecord(
      input
    )
  ) {
    return invalid(
      "Invalid review request.",
      "INVALID_REQUEST"
    );
  }

  return validateSharedReviewContent(
    input
  );
}
