import {
  ExternalLink,
  MessageSquarePlus,
} from "lucide-react";

import {
  isSafeReviewExternalUrl,
} from "@/lib/reviews/presentation";
import {
  t,
  translations,
} from "@/lib/translations";
import type {
  CatalogReview,
  CatalogReviewConfig,
  CatalogReviewSummary,
  Locale,
} from "@/lib/types";

import ReviewCard from "./ReviewCard";
import ReviewSummary from "./ReviewSummary";

type SharedReviewsSectionProps = {
  reviews:
    readonly CatalogReview[];
  summary:
    CatalogReviewSummary;
  config:
    CatalogReviewConfig;
  locale: Locale;
  businessSlug: string;
  previewMode?: boolean;
  id?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  contentClassName?: string;
  cardClassName?: string;
};

export default function SharedReviewsSection({
  reviews,
  summary,
  config,
  locale,
  businessSlug,
  previewMode = false,
  id = "reviews",
  title,
  subtitle,
  className = "",
  contentClassName = "",
  cardClassName = "",
}: SharedReviewsSectionProps) {
  if (
    !config.enabled
  ) {
    return null;
  }

  const sectionTitle =
    title ??
    t(
      translations.sections
        .reviewsTitle,
      locale
    );

  const sectionSubtitle =
    subtitle ??
    t(
      translations.sections
        .reviewsSub,
      locale
    );

  const directReviewHref =
    !previewMode &&
    config
      .directSubmissionEnabled
      ? `/reviews/${encodeURIComponent(
          businessSlug
        )}`
      : null;

  const googleReviewHref =
    !previewMode &&
    config
      .googleReviewsEnabled &&
    isSafeReviewExternalUrl(
      config.googleReviewUrl
    )
      ? config.googleReviewUrl
      : null;

  const hasActions =
    Boolean(
      directReviewHref ||
      googleReviewHref
    );

  return (
    <section
      id={id}
      className={`bg-[var(--brand-background)] px-4 py-16 text-[var(--brand-text)] sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${className}`}
      data-shared-reviews="true"
    >
      <div
        className={`mx-auto w-full max-w-7xl ${contentClassName}`}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
            {sectionSubtitle}
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-text)] sm:text-4xl lg:text-5xl">
            {sectionTitle}
          </h2>
        </div>

        {config
          .showRatingSummary &&
          summary.ratedCount >
            0 && (
            <div className="mx-auto mt-8 max-w-xl sm:mt-10">
              <ReviewSummary
                summary={summary}
                locale={locale}
              />
            </div>
          )}

        {reviews.length > 0 ? (
          <div
            className="mt-8 grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3 sm:mt-10"
            role="list"
            aria-label={t(
              translations.reviews
                .reviewList,
              locale
            )}
          >
            {reviews.map(
              (
                review
              ) => (
                <ReviewCard
                  key={
                    review.id
                  }
                  review={
                    review
                  }
                  locale={
                    locale
                  }
                  className={
                    cardClassName
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="mx-auto mt-8 max-w-2xl rounded-[1.75rem] border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] p-8 text-center sm:mt-10 sm:p-10">
            <h3 className="text-lg font-semibold text-[var(--brand-text)]">
              {t(
                translations.reviews
                  .emptyTitle,
                locale
              )}
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--brand-muted)]">
              {t(
                translations.reviews
                  .emptyDescription,
                locale
              )}
            </p>
          </div>
        )}

        {hasActions && (
          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:mt-10">
            {directReviewHref && (
              <a
                href={
                  directReviewHref
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-background)] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transition-none"
              >
                <MessageSquarePlus
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                {t(
                  translations.reviews
                    .leaveReview,
                  locale
                )}
              </a>
            )}

            {googleReviewHref && (
              <a
                href={
                  googleReviewHref
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-text)] transition-colors hover:bg-[var(--brand-background)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transition-none"
              >
                {t(
                  translations.reviews
                    .reviewOnGoogle,
                  locale
                )}

                <ExternalLink
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
