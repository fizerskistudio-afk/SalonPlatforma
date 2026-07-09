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

type ParsedReviewDate = {
  year: number;
  month: number;
  day: number;
};

type ReviewDateLocale =
  | "mk"
  | "sq"
  | "en"
  | "sr-Latn";

const monthNames: Record<
  ReviewDateLocale,
  readonly string[]
> = {
  mk: [
    "јануари",
    "февруари",
    "март",
    "април",
    "мај",
    "јуни",
    "јули",
    "август",
    "септември",
    "октомври",
    "ноември",
    "декември",
  ],
  sq: [
    "janar",
    "shkurt",
    "mars",
    "prill",
    "maj",
    "qershor",
    "korrik",
    "gusht",
    "shtator",
    "tetor",
    "nëntor",
    "dhjetor",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  "sr-Latn": [
    "januar",
    "februar",
    "mart",
    "april",
    "maj",
    "jun",
    "jul",
    "avgust",
    "septembar",
    "oktobar",
    "novembar",
    "decembar",
  ],
};

function resolveReviewDateLocale(
  locale: Locale
): ReviewDateLocale {
  const normalized =
    locale.trim().toLowerCase();

  if (normalized.startsWith("mk")) {
    return "mk";
  }

  if (normalized.startsWith("sq")) {
    return "sq";
  }

  if (
    normalized.startsWith("sr")
  ) {
    return "sr-Latn";
  }

  return "en";
}

function parseReviewDate(
  dateString: string
): ParsedReviewDate | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      dateString
    );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  const isValid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() ===
      month - 1 &&
    date.getUTCDate() === day;

  return isValid
    ? {
        year,
        month,
        day,
      }
    : null;
}

function formatReviewDate(
  dateString: string,
  locale: Locale
): string | null {
  const parsed =
    parseReviewDate(dateString);

  if (!parsed) {
    return null;
  }

  const resolvedLocale =
    resolveReviewDateLocale(locale);

  const month =
    monthNames[resolvedLocale][
      parsed.month - 1
    ];

  if (!month) {
    return null;
  }

  switch (resolvedLocale) {
    case "mk":
      return `${parsed.day} ${month} ${parsed.year} г.`;

    case "sr-Latn":
      return `${parsed.day}. ${month} ${parsed.year}.`;

    case "sq":
    case "en":
      return `${parsed.day} ${month} ${parsed.year}`;
  }
}

function formatRating(
  rating: number,
  locale: Locale
): string {
  const normalized =
    Number.isInteger(rating)
      ? String(rating)
      : rating.toFixed(1);

  const resolvedLocale =
    resolveReviewDateLocale(locale);

  return resolvedLocale === "en"
    ? normalized
    : normalized.replace(".", ",");
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
