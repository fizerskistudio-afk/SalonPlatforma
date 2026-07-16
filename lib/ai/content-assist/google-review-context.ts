import {
  LOCALE_CODES,
  type LocaleCode,
} from "@/lib/i18n/locales";
import type {
  AiContentAssistRequest,
  AiContentAssistTone,
} from "@/lib/ai/content-assist/domain";
import type {
  AiContentAssistSurfaceContext,
} from "@/lib/ai/content-assist/surface-policy";
import type {
  ReviewSource,
} from "@/lib/reviews/domain";

const LOCALE_SET =
  new Set<string>(
    LOCALE_CODES
  );

export type GoogleReviewContextReview = {
  id: string;
  businessId: string;
  source:
    ReviewSource;
  body: string;
  languageCode:
    string | null;
  rating:
    number | null;
};

export type GoogleReviewContextConnection = {
  businessId: string;
  provider:
    "google";
  status:
    | "disconnected"
    | "pending"
    | "connected"
    | "error";
};

export type GoogleReviewReplyContextFailure = {
  ok: false;
  status:
    | 404
    | 409;
  code:
    | "AI_REVIEW_NOT_FOUND"
    | "AI_REVIEW_TEXT_UNAVAILABLE";
  message: string;
};

export type GoogleReviewReplyContextSuccess = {
  ok: true;
  request:
    AiContentAssistRequest;
  surfaceContext:
    AiContentAssistSurfaceContext;
};

export type GoogleReviewReplyContextResult =
  | GoogleReviewReplyContextFailure
  | GoogleReviewReplyContextSuccess;

function resolveSourceLocale(
  languageCode:
    string | null,
  fallback:
    LocaleCode
): LocaleCode {
  const candidate =
    languageCode
      ?.trim() ??
    "";

  return LOCALE_SET.has(
    candidate
  )
    ? candidate as
        LocaleCode
    : fallback;
}

function buildSafeContext(
  rating:
    number | null
): string | undefined {
  return (
    typeof rating ===
      "number" &&
    Number.isInteger(
      rating
    ) &&
    rating >=
      1 &&
    rating <=
      5
  )
    ? `Ocena recenzije: ${rating}/5.`
    : undefined;
}

export function resolveGoogleReviewReplyContext({
  businessId,
  requestId,
  targetLocale,
  tone,
  review,
  connection,
}: {
  businessId: string;
  requestId: string;
  targetLocale:
    LocaleCode;
  tone:
    AiContentAssistTone;
  review:
    GoogleReviewContextReview | null;
  connection:
    GoogleReviewContextConnection | null;
}): GoogleReviewReplyContextResult {
  if (
    !review ||
    review.businessId !==
      businessId
  ) {
    return {
      ok:
        false,
      status:
        404,
      code:
        "AI_REVIEW_NOT_FOUND",
      message:
        "Recenzija nije pronađena za aktivni salon.",
    };
  }

  const sourceText =
    review.body.trim();

  if (
    sourceText.length ===
    0
  ) {
    return {
      ok:
        false,
      status:
        409,
      code:
        "AI_REVIEW_TEXT_UNAVAILABLE",
      message:
        "Recenzija nema tekst za AI odgovor.",
    };
  }

  const safeContext =
    buildSafeContext(
      review.rating
    );

  return {
    ok:
      true,
    request: {
      task:
        "review_reply_draft",
      requestId,
      sourceLocale:
        resolveSourceLocale(
          review.languageCode,
          targetLocale
        ),
      targetLocale,
      sourceText,
      tone,
      ...(safeContext
        ? {
            context:
              safeContext,
          }
        : {}),
    },
    surfaceContext: {
      googleReviewIntegrationConnected:
        connection
          ?.businessId ===
          businessId &&
        connection.provider ===
          "google" &&
        connection.status ===
          "connected",
      reviewSource:
        review.source,
    },
  };
}
