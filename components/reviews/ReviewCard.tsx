import {
  ExternalLink,
  Quote,
} from "lucide-react";

import {
  formatReviewDate,
  getReviewAuthorInitials,
  interpolateReviewLabel,
  isSafeReviewExternalUrl,
} from "@/lib/reviews/presentation";
import {
  t,
  translations,
} from "@/lib/translations";
import type {
  CatalogReview,
  Locale,
} from "@/lib/types";

import ReviewStars from "./ReviewStars";
import ReviewTrustBadge from "./ReviewTrustBadge";

type ReviewCardProps = {
  review: CatalogReview;
  locale: Locale;
  className?: string;
};

export default function ReviewCard({
  review,
  locale,
  className = "",
}: ReviewCardProps) {
  const authorName =
    review.authorName.trim() ||
    t(
      translations.reviews
        .anonymousAuthor,
      locale
    );

  const formattedDate =
    formatReviewDate(
      review.publishedAt,
      locale
    );

  const ariaLabel =
    interpolateReviewLabel(
      t(
        translations.reviews
          .reviewByAuthor,
        locale
      ),
      {
        author:
          authorName,
      }
    );

  const externalUrl =
    isSafeReviewExternalUrl(
      review.externalUrl
    )
      ? review.externalUrl
      : null;

  const authorAvatarUrl =
    isSafeReviewExternalUrl(
      review.authorAvatarUrl
    )
      ? review.authorAvatarUrl
      : null;

  return (
    <article
      role="listitem"
      aria-label={ariaLabel}
      className={`flex min-w-0 flex-col rounded-[1.75rem] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-sm sm:p-6 ${className}`}
      data-review-source={
        review.source
      }
      data-review-verified={
        review.isVerifiedVisit
          ? "true"
          : "false"
      }
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <Quote
          className="h-7 w-7 flex-none text-[var(--brand-primary)] opacity-45"
          aria-hidden="true"
        />

        <ReviewTrustBadge
          badge={review.badge}
          locale={locale}
        />
      </div>

      <ReviewStars
        rating={review.rating}
        locale={locale}
        showValue={
          review.rating !==
          null
        }
        className="mb-4"
      />

      <p
        className="min-w-0 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--brand-text)] sm:text-[15px]"
        dir="auto"
      >
        {review.body}
      </p>

      {review.ownerReply && (
        <div className="mt-5 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-primary)]">
            {t(
              translations.reviews
                .ownerReply,
              locale
            )}
          </p>

          <p
            className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--brand-muted)]"
            dir="auto"
          >
            {review.ownerReply}
          </p>
        </div>
      )}

      <div className="mt-auto flex min-w-0 items-center gap-3 border-t border-[var(--brand-border)] pt-5">
        {authorAvatarUrl ? (
          <>
            {/* Provider avatars use unknown external hosts, so a native image is intentional here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                authorAvatarUrl
              }
              alt=""
              width={44}
              height={44}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-11 w-11 flex-none rounded-full border border-[var(--brand-border)] object-cover"
            />
          </>
        ) : (
          <span
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[var(--brand-primary)] text-sm font-bold text-[var(--brand-background)]"
            aria-hidden="true"
          >
            {getReviewAuthorInitials(
              authorName
            )}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--brand-text)]">
            {authorName}
          </p>

          {formattedDate && (
            <time
              dateTime={
                review.publishedAt
              }
              className="text-xs text-[var(--brand-muted)]"
            >
              {formattedDate}
            </time>
          )}
        </div>

        {review.source ===
          "google" &&
          externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t(
                translations.reviews
                  .viewOnGoogle,
                locale
              )}
              className="inline-flex min-h-11 flex-none items-center gap-1.5 rounded-full border border-[var(--brand-border)] px-3 text-xs font-semibold text-[var(--brand-text)] transition-colors hover:bg-[var(--brand-background)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-surface)] motion-reduce:transition-none"
            >
              <span className="hidden sm:inline">
                {t(
                  translations.reviews
                    .viewOnGoogle,
                  locale
                )}
              </span>

              <ExternalLink
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
            </a>
          )}
      </div>
    </article>
  );
}
