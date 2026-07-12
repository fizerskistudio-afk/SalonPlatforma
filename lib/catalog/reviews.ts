import {
  resolveReviewBadgeKind,
  type ReviewSource,
  type ReviewStatus,
} from "@/lib/reviews/domain";
import type {
  CatalogReview,
  CatalogReviewConfig,
  CatalogReviewSummary,
} from "@/lib/types";

export type CatalogReviewLoadMode =
  | "public"
  | "platform-preview";

export type CatalogReviewSettingsRow = {
  reviews_enabled: boolean;
  direct_reviews_enabled: boolean;
  verified_reviews_enabled: boolean;
  testimonials_enabled: boolean;
  google_reviews_enabled: boolean;
  show_rating_summary: boolean;
  allow_demo_content: boolean;
  google_review_url: string | null;
};

export type CatalogReviewRow = {
  id: string;
  source: ReviewSource;
  status: ReviewStatus;
  service_id: string | null;
  employee_id: string | null;
  author_name: string;
  author_avatar_url: string | null;
  rating: number | null;
  body: string;
  language_code: string | null;
  is_verified_visit: boolean;
  external_url: string | null;
  owner_reply: string | null;
  owner_reply_at: string | null;
  provider_published_at: string | null;
  published_at: string | null;
  created_at: string;
};

export type CatalogReviewData = {
  reviews: CatalogReview[];
  summary: CatalogReviewSummary;
  config: CatalogReviewConfig;
};

type ValidRating =
  | 1
  | 2
  | 3
  | 4
  | 5;

const EMPTY_DISTRIBUTION:
  CatalogReviewSummary["distribution"] = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
};

function toValidRating(
  value: number | null
): ValidRating | null {
  if (
    value === 1 ||
    value === 2 ||
    value === 3 ||
    value === 4 ||
    value === 5
  ) {
    return value;
  }

  return null;
}

function toHttpsUrl(
  value: string | null
): string | null {
  const normalized =
    value?.trim() ?? "";

  return normalized.startsWith(
    "https://"
  )
    ? normalized
    : null;
}

function isSourceEnabled(
  source: ReviewSource,
  settings:
    CatalogReviewSettingsRow,
  mode:
    CatalogReviewLoadMode
): boolean {
  switch (source) {
    case "platform":
      return true;

    case "google":
      return settings
        .google_reviews_enabled;

    case "manual-testimonial":
      return settings
        .testimonials_enabled;

    case "demo":
      return (
        mode ===
          "platform-preview" &&
        settings
          .allow_demo_content
      );
  }
}

function createConfig(
  settings:
    CatalogReviewSettingsRow | null
): CatalogReviewConfig {
  if (!settings) {
    return {
      enabled: false,
      directSubmissionEnabled:
        false,
      verifiedSubmissionEnabled:
        false,
      testimonialsEnabled:
        false,
      googleReviewsEnabled:
        false,
      showRatingSummary:
        false,
      googleReviewUrl:
        null,
    };
  }

  const enabled =
    settings.reviews_enabled;

  const googleReviewsEnabled =
    enabled &&
    settings
      .google_reviews_enabled;

  return {
    enabled,
    directSubmissionEnabled:
      enabled &&
      settings
        .direct_reviews_enabled,
    verifiedSubmissionEnabled:
      enabled &&
      settings
        .verified_reviews_enabled,
    testimonialsEnabled:
      enabled &&
      settings
        .testimonials_enabled,
    googleReviewsEnabled,
    showRatingSummary:
      enabled &&
      settings
        .show_rating_summary,
    googleReviewUrl:
      googleReviewsEnabled
        ? toHttpsUrl(
            settings
              .google_review_url
          )
        : null,
  };
}

export function createEmptyCatalogReviewData(
  settings:
    CatalogReviewSettingsRow | null =
      null
): CatalogReviewData {
  return {
    reviews: [],
    summary: {
      total: 0,
      ratedCount: 0,
      averageRating: null,
      distribution: {
        ...EMPTY_DISTRIBUTION,
      },
    },
    config:
      createConfig(
        settings
      ),
  };
}

export function buildCatalogReviewData({
  mode,
  settings,
  rows,
}: {
  mode:
    CatalogReviewLoadMode;
  settings:
    CatalogReviewSettingsRow | null;
  rows:
    readonly CatalogReviewRow[];
}): CatalogReviewData {
  const empty =
    createEmptyCatalogReviewData(
      settings
    );

  if (
    !settings ||
    !settings.reviews_enabled
  ) {
    return empty;
  }

  const reviews =
    rows
      .filter(
        (
          row
        ) =>
          row.status ===
            "published" &&
          isSourceEnabled(
            row.source,
            settings,
            mode
          )
      )
      .map(
        (
          row
        ): CatalogReview => {
          const rating =
            toValidRating(
              row.rating
            );

          const isPlatform =
            row.source ===
            "platform";

          return {
            id: row.id,
            source:
              row.source,
            badge:
              resolveReviewBadgeKind(
                row.source,
                row
                  .is_verified_visit
              ),
            authorName:
              row.author_name
                .trim(),
            authorAvatarUrl:
              toHttpsUrl(
                row
                  .author_avatar_url
              ),
            rating,
            body:
              row.body.trim(),
            languageCode:
              row.language_code,
            isVerifiedVisit:
              row
                .is_verified_visit,
            serviceId:
              row.service_id,
            employeeId:
              row.employee_id,
            externalUrl:
              row.source ===
                "google"
                ? toHttpsUrl(
                    row.external_url
                  )
                : null,
            ownerReply:
              isPlatform
                ? row.owner_reply
                    ?.trim() ||
                  null
                : null,
            ownerReplyAt:
              isPlatform &&
              row.owner_reply
                ? row
                    .owner_reply_at
                : null,
            publishedAt:
              row
                .provider_published_at ??
              row.published_at ??
              row.created_at,
          };
        }
      );

  const distribution = {
    ...EMPTY_DISTRIBUTION,
  };

  let ratingTotal = 0;
  let ratedCount = 0;

  for (
    const review of reviews
  ) {
    const rating =
      toValidRating(
        review.rating
      );

    if (
      rating === null
    ) {
      continue;
    }

    distribution[rating] += 1;
    ratingTotal += rating;
    ratedCount += 1;
  }

  return {
    reviews,
    summary: {
      total:
        reviews.length,
      ratedCount,
      averageRating:
        ratedCount > 0
          ? Math.round(
              (
                ratingTotal /
                ratedCount
              ) *
                100
            ) /
            100
          : null,
      distribution,
    },
    config:
      empty.config,
  };
}
