import "server-only";

import type {
  LocaleCode,
} from "@/lib/i18n/locales";
import type {
  AiContentAssistTone,
} from "@/lib/ai/content-assist/domain";
import {
  resolveGoogleReviewReplyContext,
  type GoogleReviewContextConnection,
  type GoogleReviewContextReview,
  type GoogleReviewReplyContextResult,
} from "@/lib/ai/content-assist/google-review-context";
import type {
  ReviewSource,
} from "@/lib/reviews/domain";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

type ReviewRow = {
  id: string;
  business_id: string;
  source:
    ReviewSource;
  body: string;
  language_code:
    string | null;
  rating:
    number | null;
};

type ConnectionRow = {
  business_id: string;
  provider:
    "google";
  status:
    | "disconnected"
    | "pending"
    | "connected"
    | "error";
};

export class GoogleReviewContextLoadError
  extends Error {
  constructor(
    message: string
  ) {
    super(
      message
    );

    this.name =
      "GoogleReviewContextLoadError";
  }
}

export async function loadGoogleReviewReplyContext({
  businessId,
  reviewId,
  requestId,
  targetLocale,
  tone,
}: {
  businessId: string;
  reviewId: string;
  requestId: string;
  targetLocale:
    LocaleCode;
  tone:
    AiContentAssistTone;
}): Promise<GoogleReviewReplyContextResult> {
  const supabase =
    createAdminClient();

  const [
    reviewResult,
    connectionResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "reviews"
        )
        .select(
          "id, business_id, source, body, language_code, rating"
        )
        .eq(
          "id",
          reviewId
        )
        .eq(
          "business_id",
          businessId
        )
        .maybeSingle(),

      supabase
        .from(
          "review_provider_connections"
        )
        .select(
          "business_id, provider, status"
        )
        .eq(
          "business_id",
          businessId
        )
        .eq(
          "provider",
          "google"
        )
        .maybeSingle(),
    ]);

  if (
    reviewResult.error ||
    connectionResult.error
  ) {
    throw new GoogleReviewContextLoadError(
      "Google review context trenutno nije moguće učitati."
    );
  }

  const review =
    reviewResult.data
      ? reviewResult.data as unknown as
          ReviewRow
      : null;

  const connection =
    connectionResult.data
      ? connectionResult.data as unknown as
          ConnectionRow
      : null;

  return resolveGoogleReviewReplyContext({
    businessId,
    requestId,
    targetLocale,
    tone,
    review:
      review
        ? {
            id:
              review.id,
            businessId:
              review.business_id,
            source:
              review.source,
            body:
              review.body,
            languageCode:
              review.language_code,
            rating:
              review.rating,
          } satisfies
            GoogleReviewContextReview
        : null,
    connection:
      connection
        ? {
            businessId:
              connection.business_id,
            provider:
              connection.provider,
            status:
              connection.status,
          } satisfies
            GoogleReviewContextConnection
        : null,
  });
}
