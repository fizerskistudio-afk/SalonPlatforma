import {
  Quote,
  Star,
} from "lucide-react";

import { reviews } from "@/lib/contentData";
import {
  t,
  translations,
} from "@/lib/translations";
import type { Locale } from "@/lib/types";

import SectionHeader from "../shared/SectionHeader";

type ReviewsSectionProps = {
  locale: Locale;
};

const intlLocaleMap: Record<
  Locale,
  string
> = {
  mk: "mk-MK",
  sq: "sq-MK",
  en: "en-GB",
};

function parseLocalDate(
  dateString: string
): Date | null {
  const parts =
    dateString.split("-");

  if (parts.length !== 3) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const date = new Date(
    year,
    month - 1,
    day
  );

  const isValid =
    date.getFullYear() === year &&
    date.getMonth() ===
      month - 1 &&
    date.getDate() === day;

  return isValid
    ? date
    : null;
}

function formatReviewDate(
  dateString: string,
  locale: Locale
): string | null {
  const date =
    parseLocalDate(dateString);

  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat(
    intlLocaleMap[locale],
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date);
}

function formatRating(
  rating: number,
  locale: Locale
): string {
  return new Intl.NumberFormat(
    intlLocaleMap[locale],
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }
  ).format(rating);
}

export default function ReviewsSection({
  locale,
}: ReviewsSectionProps) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <section
      id="reviews"
      className="bg-[var(--brand-background)] px-8 py-24"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title={
            translations.sections
              .reviewsTitle
          }
          subtitle={
            translations.sections
              .reviewsSub
          }
          locale={locale}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reviews.map(
            (review) => {
              const safeRating =
                Math.max(
                  0,
                  Math.min(
                    5,
                    review.rating
                  )
                );

              const filledStars =
                Math.round(
                  safeRating
                );

              const formattedDate =
                formatReviewDate(
                  review.date,
                  locale
                );

              return (
                <article
                  key={review.id}
                  className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-7 shadow-lg transition-transform duration-300 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <Quote
                    className="mb-4 h-8 w-8 text-[var(--brand-primary)] opacity-40"
                    aria-hidden="true"
                  />

                  <div className="mb-4 flex items-center gap-2">
                    <div
                      className="flex gap-0.5"
                      aria-hidden="true"
                    >
                      {Array.from({
                        length: 5,
                      }).map(
                        (
                          _,
                          index
                        ) => (
                          <Star
                            key={
                              index
                            }
                            className={`h-4 w-4 ${
                              index <
                              filledStars
                                ? "fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                                : "fill-[var(--brand-secondary)] text-[var(--brand-secondary)]"
                            }`}
                          />
                        )
                      )}
                    </div>

                    <span className="text-sm font-semibold text-[var(--brand-text)]">
                      {formatRating(
                        safeRating,
                        locale
                      )}
                      /5
                    </span>
                  </div>

                  <p className="mb-5 text-sm leading-relaxed text-[var(--brand-muted)]">
                    &ldquo;
                    {t(
                      review.text,
                      locale
                    )}
                    &rdquo;
                  </p>

                  <div className="flex items-center gap-3 border-t border-[var(--brand-border)] pt-4">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] font-semibold text-[var(--brand-surface)]"
                      aria-hidden="true"
                    >
                      {review.author
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-[var(--brand-text)]">
                        {
                          review.author
                        }
                      </div>

                      {formattedDate && (
                        <time
                          dateTime={
                            review.date
                          }
                          className="text-xs text-[var(--brand-muted)]"
                        >
                          {
                            formattedDate
                          }
                        </time>
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}