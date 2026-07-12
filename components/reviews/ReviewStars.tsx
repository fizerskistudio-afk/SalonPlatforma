import {
  Star,
} from "lucide-react";

import {
  clampReviewRating,
  formatReviewRating,
  interpolateReviewLabel,
} from "@/lib/reviews/presentation";
import {
  t,
  translations,
} from "@/lib/translations";
import type {
  Locale,
} from "@/lib/types";

type ReviewStarsProps = {
  rating: number | null;
  locale: Locale;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
};

const STAR_SIZE_CLASSES = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const;

export default function ReviewStars({
  rating,
  locale,
  size = "md",
  showValue = false,
  className = "",
}: ReviewStarsProps) {
  const safeRating =
    clampReviewRating(
      rating
    );

  if (
    safeRating === null
  ) {
    return (
      <span
        className={`text-xs font-medium text-[var(--brand-muted)] ${className}`}
      >
        {t(
          translations.reviews
            .unratedTestimonial,
          locale
        )}
      </span>
    );
  }

  const formattedRating =
    formatReviewRating(
      safeRating,
      locale
    );

  const ariaLabel =
    interpolateReviewLabel(
      t(
        translations.reviews
          .ratingOutOfFive,
        locale
      ),
      {
        rating:
          formattedRating,
      }
    );

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label={ariaLabel}
    >
      <span
        className="inline-flex items-center gap-0.5"
        aria-hidden="true"
      >
        {Array.from({
          length: 5,
        }).map(
          (
            _,
            index
          ) => {
            const fill =
              Math.max(
                0,
                Math.min(
                  1,
                  safeRating -
                    index
                )
              ) * 100;

            return (
              <span
                key={index}
                className={`relative inline-flex ${STAR_SIZE_CLASSES[size]}`}
              >
                <Star
                  className="absolute inset-0 h-full w-full text-[var(--brand-border)]"
                  strokeWidth={1.75}
                />

                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    width:
                      `${fill}%`,
                  }}
                >
                  <Star
                    className={`${STAR_SIZE_CLASSES[size]} max-w-none fill-[var(--brand-primary)] text-[var(--brand-primary)]`}
                    strokeWidth={1.75}
                  />
                </span>
              </span>
            );
          }
        )}
      </span>

      {showValue && (
        <span className="text-sm font-semibold tabular-nums text-[var(--brand-text)]">
          {formattedRating}
        </span>
      )}
    </div>
  );
}
