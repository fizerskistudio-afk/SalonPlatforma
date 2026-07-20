"use client";

import {
  ExternalLink,
  MessageSquarePlus,
  Quote,
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

type NailsAtelierReviewsSectionProps = {
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
};

const CARD_ROTATIONS = [
  "lg:-rotate-[1.2deg]",
  "lg:translate-y-8 lg:rotate-[0.8deg]",
  "lg:-rotate-[0.4deg]",
] as const;

export default function NailsAtelierReviewsSection({
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
}: NailsAtelierReviewsSectionProps) {
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

  return (
    <section
      id={id}
      className={`relative isolate overflow-hidden px-4 py-16 text-[var(--brand-text)] sm:px-6 lg:px-8 lg:py-24 ${className}`}
      data-shared-reviews="true"
      data-nails-atelier-reviews="true"
    >
      <div className="pointer-events-none absolute -left-40 top-12 h-[34rem] w-[34rem] rounded-full bg-[var(--brand-secondary)]/45 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-16 grid rotate-12 grid-cols-3 gap-3 opacity-30" aria-hidden="true">
        {["#c83673", "#ef9db5", "#712947", "#f0c9d5", "#a92559", "#e6a27f"].map(
          (
            color
          ) => (
            <span
              key={color}
              className="h-28 w-11 rounded-[999px_999px_45%_45%] shadow-lg"
              style={{
                backgroundColor:
                  color,
              }}
            />
          )
        )}
      </div>

      <div className={`relative mx-auto w-full max-w-[1320px] ${contentClassName}`}>
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary)]/20 bg-[var(--brand-surface)]/75 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)] backdrop-blur">
              <Quote
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              {sectionSubtitle}
            </p>

            <h2 className="mt-6 max-w-[13ch] font-display text-[clamp(3.2rem,4.9vw,5.5rem)] font-medium italic leading-[0.88] tracking-[-0.05em]">
              {sectionTitle}
            </h2>
          </div>

          {config
            .showRatingSummary &&
            summary.ratedCount >
              0 && (
              <ReviewSummary
                summary={summary}
                locale={locale}
                className="rounded-[2.5rem] border-[var(--brand-primary)]/20 bg-[var(--brand-surface)]/80 shadow-[0_24px_70px_color-mix(in_srgb,var(--brand-primary)_10%,transparent)] backdrop-blur"
              />
            )}
        </header>

        {reviews.length >
        0 ? (
          <div
            className="mt-12 grid min-w-0 gap-5 pb-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
            role="list"
            aria-label={t(
              translations.reviews
                .reviewList,
              locale
            )}
          >
            {reviews.map(
              (
                review,
                index
              ) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  locale={locale}
                  className={`min-h-[290px] rounded-[2.4rem_2.4rem_2.4rem_1rem] border-[var(--brand-primary)]/15 bg-[var(--brand-surface)]/90 shadow-[0_18px_48px_color-mix(in_srgb,var(--brand-primary)_8%,transparent)] transition-transform hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none ${CARD_ROTATIONS[index % CARD_ROTATIONS.length]}`}
                />
              )
            )}
          </div>
        ) : (
          <div className="mt-12 overflow-hidden rounded-[2.5rem] border border-dashed border-[var(--brand-primary)]/25 bg-[var(--brand-surface)]/75 p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex w-fit gap-2" aria-hidden="true">
              {["#c83673", "#ef9db5", "#712947", "#e6a27f"].map(
                (
                  color
                ) => (
                  <span
                    key={color}
                    className="h-12 w-6 rounded-[999px_999px_45%_45%]"
                    style={{
                      backgroundColor:
                        color,
                    }}
                  />
                )
              )}
            </div>

            <h3 className="mt-5 font-display text-2xl font-medium italic">
              {t(
                translations.reviews
                  .emptyTitle,
                locale
              )}
            </h3>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--brand-muted)]">
              {t(
                translations.reviews
                  .emptyDescription,
                locale
              )}
            </p>
          </div>
        )}

        {(directReviewHref ||
          googleReviewHref) && (
          <div className="mt-10 flex flex-wrap gap-3 lg:mt-14">
            {directReviewHref && (
              <a
                href={directReviewHref}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 text-sm font-semibold text-[var(--brand-background)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
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
                href={googleReviewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 text-sm font-semibold transition hover:border-[var(--brand-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] motion-reduce:transition-none"
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
