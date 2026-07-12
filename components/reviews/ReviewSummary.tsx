import {
  formatReviewRating,
  interpolateReviewLabel,
} from "@/lib/reviews/presentation";
import {
  t,
  translations,
} from "@/lib/translations";
import type {
  CatalogReviewSummary,
  Locale,
} from "@/lib/types";

import ReviewStars from "./ReviewStars";

type ReviewSummaryProps = {
  summary: CatalogReviewSummary;
  locale: Locale;
  className?: string;
  showDistribution?: boolean;
};

const RATING_VALUES = [
  5,
  4,
  3,
  2,
  1,
] as const;

export default function ReviewSummary({
  summary,
  locale,
  className = "",
  showDistribution = true,
}: ReviewSummaryProps) {
  if (
    summary.ratedCount ===
      0 ||
    summary.averageRating ===
      null
  ) {
    return null;
  }

  const formattedAverage =
    formatReviewRating(
      summary.averageRating,
      locale
    );

  const basedOnLabel =
    interpolateReviewLabel(
      t(
        translations.reviews
          .basedOnRatings,
        locale
      ),
      {
        count:
          summary.ratedCount,
      }
    );

  return (
    <aside
      className={`rounded-[1.75rem] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-sm sm:p-6 ${className}`}
      aria-label={t(
        translations.reviews
          .ratingSummary,
        locale
      )}
    >
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <strong className="text-4xl font-semibold leading-none tabular-nums text-[var(--brand-text)] sm:text-5xl">
          {formattedAverage}
        </strong>

        <div className="pb-0.5">
          <ReviewStars
            rating={
              summary.averageRating
            }
            locale={locale}
            size="lg"
          />

          <p className="mt-1 text-xs text-[var(--brand-muted)]">
            {basedOnLabel}
          </p>
        </div>
      </div>

      {showDistribution && (
        <div
          className="mt-6 space-y-2.5"
          aria-label={t(
            translations.reviews
              .ratingDistribution,
            locale
          )}
        >
          {RATING_VALUES.map(
            (
              rating
            ) => {
              const count =
                summary
                  .distribution[
                  rating
                ];

              const percentage =
                summary.ratedCount >
                0
                  ? Math.round(
                      (
                        count /
                        summary.ratedCount
                      ) *
                        100
                    )
                  : 0;

              const label =
                interpolateReviewLabel(
                  t(
                    translations
                      .reviews
                      .starCount,
                    locale
                  ),
                  {
                    stars:
                      rating,
                    count,
                  }
                );

              return (
                <div
                  key={rating}
                  className="grid grid-cols-[1.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 text-xs text-[var(--brand-muted)]"
                >
                  <span
                    className="text-right font-semibold tabular-nums"
                    aria-hidden="true"
                  >
                    {rating}
                  </span>

                  <div
                    className="h-2 overflow-hidden rounded-full bg-[var(--brand-background)]"
                    role="progressbar"
                    aria-label={
                      label
                    }
                    aria-valuemin={0}
                    aria-valuemax={
                      summary.ratedCount
                    }
                    aria-valuenow={
                      count
                    }
                  >
                    <div
                      className="h-full rounded-full bg-[var(--brand-primary)]"
                      style={{
                        width:
                          `${percentage}%`,
                      }}
                    />
                  </div>

                  <span className="text-right tabular-nums">
                    {count}
                  </span>
                </div>
              );
            }
          )}
        </div>
      )}
    </aside>
  );
}
