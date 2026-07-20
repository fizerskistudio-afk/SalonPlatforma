"use client";

import {
  ExternalLink,
  MessageSquarePlus,
  Quote,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ReviewStars from "@/components/reviews/ReviewStars";
import ReviewTrustBadge from "@/components/reviews/ReviewTrustBadge";
import {
  formatReviewDate,
  formatReviewRating,
  getReviewAuthorInitials,
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

type BarberEditorialReviewsSectionProps = {
  reviews:
    readonly CatalogReview[];
  reviewSummary:
    CatalogReviewSummary;
  reviewConfig:
    CatalogReviewConfig;
  locale:
    Locale;
  businessSlug:
    string;
  previewMode?:
    boolean;
  id?:
    string;
  className?:
    string;
  contentClassName?:
    string;
};

function useBarberEditorialReviewReveal() {
  const sectionRef =
    useRef<HTMLElement | null>(
      null
    );

  const [
    isRevealed,
    setIsRevealed,
  ] =
    useState(
      false
    );

  useEffect(
    () => {
      const element =
        sectionRef.current;

      if (
        !element
      ) {
        return;
      }

      const reducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

      if (
        reducedMotion ||
        typeof IntersectionObserver ===
          "undefined"
      ) {
        setIsRevealed(
          true
        );

        return;
      }

      const observer =
        new IntersectionObserver(
          (
            entries
          ) => {
            if (
              entries.some(
                (
                  entry
                ) =>
                  entry.isIntersecting
              )
            ) {
              setIsRevealed(
                true
              );

              observer.disconnect();
            }
          },
          {
            rootMargin:
              "0px 0px -8% 0px",
            threshold:
              0.12,
          }
        );

      observer.observe(
        element
      );

      return () => {
        observer.disconnect();
      };
    },
    []
  );

  return {
    isRevealed,
    sectionRef,
  };
}

function reviewAuthorName(
  review:
    CatalogReview,
  locale:
    Locale
): string {
  return (
    review.authorName.trim() ||
    t(
      translations.reviews
        .anonymousAuthor,
      locale
    )
  );
}

export default function BarberEditorialReviewsSection({
  reviews,
  reviewSummary,
  reviewConfig,
  locale,
  businessSlug,
  previewMode = false,
  id = "reviews",
  className = "",
  contentClassName = "",
}: BarberEditorialReviewsSectionProps) {

  const reviewItems =
    useMemo(
      () =>
        reviews.filter(
          (
            review
          ) =>
            Boolean(
              review.body.trim()
            )
        ),
      [
        reviews,
      ]
    );

  const [
    activeReviewId,
    setActiveReviewId,
  ] =
    useState(
      () =>
        reviewItems[0]
          ?.id ?? ""
    );

  useEffect(
    () => {
      if (
        reviewItems.length ===
        0
      ) {
        if (
          activeReviewId
        ) {
          setActiveReviewId(
            ""
          );
        }

        return;
      }

      if (
        !reviewItems.some(
          (
            review
          ) =>
            review.id ===
            activeReviewId
        )
      ) {
        setActiveReviewId(
          reviewItems[0]
            .id
        );
      }
    },
    [
      activeReviewId,
      reviewItems,
    ]
  );

  const activeReview =
    reviewItems.find(
      (
        review
      ) =>
        review.id ===
        activeReviewId
    ) ??
    reviewItems[0] ??
    null;

  const activeIndex =
    Math.max(
      0,
      reviewItems.findIndex(
        (
          review
        ) =>
          review.id ===
          activeReview?.id
      )
    );

  const directReviewHref =
    !previewMode &&
    reviewConfig
      .directSubmissionEnabled
      ? `/reviews/${encodeURIComponent(
          businessSlug
        )}`
      : null;

  const googleReviewHref =
    !previewMode &&
    reviewConfig
      .googleReviewsEnabled &&
    isSafeReviewExternalUrl(
      reviewConfig.googleReviewUrl
    )
      ? reviewConfig.googleReviewUrl
      : null;

  const hasActions =
    Boolean(
      directReviewHref ||
      googleReviewHref
    );

  const averageRating =
    reviewSummary.averageRating !==
    null
      ? formatReviewRating(
          reviewSummary.averageRating,
          locale
        )
      : "—";

  const maxDistribution =
    Math.max(
      1,
      ...Object.values(
        reviewSummary.distribution
      )
    );

  const {
    isRevealed,
    sectionRef,
  } =
    useBarberEditorialReviewReveal();

  if (
    !reviewConfig.enabled
  ) {
    return null;
  }

  const activeAuthor =
    activeReview
      ? reviewAuthorName(
          activeReview,
          locale
        )
      : "";

  const activeAvatarUrl =
    activeReview &&
    isSafeReviewExternalUrl(
      activeReview.authorAvatarUrl
    )
      ? activeReview.authorAvatarUrl
      : null;

  const activeDate =
    activeReview
      ? formatReviewDate(
          activeReview.publishedAt,
          locale
        )
      : null;

  const activeExternalUrl =
    activeReview &&
    isSafeReviewExternalUrl(
      activeReview.externalUrl
    )
      ? activeReview.externalUrl
      : null;

  return (
    <section
      ref={sectionRef}
      id={id}
      data-barber-revealed={
        isRevealed
          ? "true"
          : "false"
      }
      className={`relative isolate scroll-mt-20 overflow-hidden border-b border-[var(--brand-border)] bg-[var(--brand-background)] text-[var(--brand-text)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_14%,color-mix(in_srgb,var(--brand-primary)_8%,transparent),transparent_30%),linear-gradient(180deg,transparent,color-mix(in_srgb,var(--brand-surface)_46%,transparent))]" />

      <div className="pointer-events-none absolute -left-8 top-10 font-display text-[18rem] font-semibold leading-none tracking-[-0.09em] text-[var(--brand-primary)]/[0.025]">
        04
      </div>

      <div className={`relative mx-auto max-w-[1500px] px-8 py-16 xl:px-12 xl:py-20 ${contentClassName}`}>
        <header className="grid grid-cols-[minmax(0,0.78fr)_minmax(360px,1.22fr)] items-end gap-10">
          <div className="barber-reviews-enter-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
              04 /{" "}
              {t(
                translations.sections
                  .reviewsTitle,
                locale
              )}
            </p>

            <h2 className="mt-5 max-w-[11ch] font-display text-[clamp(3.4rem,4.7vw,5.8rem)] font-medium leading-[0.88] tracking-[-0.055em]">
              {t(
                translations.sections
                  .reviewsTitle,
                locale
              )}
            </h2>
          </div>

          <div className="barber-reviews-enter-right justify-self-end border-l border-[var(--brand-primary)]/55 pl-6">
            <p className="max-w-xl text-sm leading-7 text-[var(--brand-muted)]">
              {t(
                translations.sections
                  .reviewsSub,
                locale
              )}
            </p>

            <div className="mt-4 flex items-center justify-between gap-8 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-muted)]">
              <span>
                {t(
                  translations.reviews
                    .reviewList,
                  locale
                )}
              </span>

              <span className="tabular-nums text-[var(--brand-primary)]">
                {String(
                  activeReview
                    ? activeIndex +
                        1
                    : 0
                ).padStart(
                  2,
                  "0"
                )}{" "}
                /{" "}
                {String(
                  reviewItems.length
                ).padStart(
                  2,
                  "0"
                )}
              </span>
            </div>
          </div>
        </header>

        {activeReview ? (
          <div className="mt-10 grid items-start gap-4 xl:grid-cols-[240px_minmax(0,1fr)_360px]">
            <aside className="barber-reviews-summary sticky top-24 border border-[var(--brand-border)] bg-[var(--brand-surface)]/65 p-5 backdrop-blur-sm">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-muted)]">
                {t(
                  translations.sections
                    .reviewsSub,
                  locale
                )}
              </p>

              <div className="mt-5 border-b border-[var(--brand-border)] pb-5">
                <p className="font-display text-[4.6rem] font-medium leading-none tracking-[-0.06em] text-[var(--brand-primary)]">
                  {averageRating}
                </p>

                <ReviewStars
                  rating={
                    reviewSummary.averageRating
                  }
                  locale={
                    locale
                  }
                  size="sm"
                  className="mt-3"
                />

                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-muted)]">
                  {reviewSummary.ratedCount} /{" "}
                  {reviewSummary.total}
                </p>
              </div>

              <div className="mt-5 space-y-2.5">
                {(
                  [
                    5,
                    4,
                    3,
                    2,
                    1,
                  ] as const
                ).map(
                  (
                    rating
                  ) => {
                    const count =
                      reviewSummary
                        .distribution[
                          rating
                        ];

                    return (
                      <div
                        key={
                          rating
                        }
                        className="grid grid-cols-[14px_minmax(0,1fr)_24px] items-center gap-2 text-[9px] tabular-nums text-[var(--brand-muted)]"
                      >
                        <span>
                          {rating}
                        </span>

                        <span className="h-px bg-[var(--brand-border)]">
                          <span
                            className="block h-px bg-[var(--brand-primary)] transition-[width] duration-500 motion-reduce:transition-none"
                            style={{
                              width:
                                `${Math.max(
                                  count >
                                    0
                                    ? 8
                                    : 0,
                                  (count /
                                    maxDistribution) *
                                    100
                                )}%`,
                            }}
                          />
                        </span>

                        <span className="text-right">
                          {count}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>

              {hasActions && (
                <div className="mt-6 space-y-2">
                  {directReviewHref && (
                    <a
                      href={
                        directReviewHref
                      }
                      className="inline-flex min-h-10 w-full items-center justify-center gap-2 border border-[var(--brand-primary)] bg-[var(--brand-primary)] px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-background)] transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-background)] motion-reduce:transition-none"
                    >
                      <MessageSquarePlus
                        className="h-3.5 w-3.5"
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
                      className="inline-flex min-h-10 w-full items-center justify-center gap-2 border border-[var(--brand-border)] px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-text)] transition-colors hover:border-[var(--brand-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-background)] motion-reduce:transition-none"
                    >
                      {t(
                        translations.reviews
                          .reviewOnGoogle,
                        locale
                      )}

                      <ExternalLink
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </a>
                  )}
                </div>
              )}
            </aside>

            <article
              key={
                activeReview.id
              }
              data-review-source={
                activeReview.source
              }
              data-review-verified={
                activeReview.isVerifiedVisit
                  ? "true"
                  : "false"
              }
              className="barber-reviews-stage relative isolate flex min-h-[560px] flex-col overflow-hidden border border-[var(--brand-border)] bg-[var(--brand-surface)] p-8 xl:p-10"
            >
              <Quote
                className="absolute right-7 top-6 h-24 w-24 text-[var(--brand-primary)] opacity-[0.07]"
                strokeWidth={
                  1
                }
                aria-hidden="true"
              />

              <div className="relative flex items-start justify-between gap-6">
                <ReviewStars
                  rating={
                    activeReview.rating
                  }
                  locale={
                    locale
                  }
                  size="lg"
                  showValue={
                    activeReview.rating !==
                    null
                  }
                />

                <ReviewTrustBadge
                  badge={
                    activeReview.badge
                  }
                  locale={
                    locale
                  }
                  className="border-[var(--brand-primary)]/25 bg-transparent"
                />
              </div>

              <blockquote
                className="relative my-auto py-12 font-display text-[clamp(2.3rem,3.15vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.04em] text-[var(--brand-text)]"
                dir="auto"
              >
                “{activeReview.body}”
              </blockquote>

              {activeReview.ownerReply && (
                <div className="relative mb-7 border-l border-[var(--brand-primary)] pl-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                    {t(
                      translations.reviews
                        .ownerReply,
                      locale
                    )}
                  </p>

                  <p
                    className="mt-2 text-sm leading-6 text-[var(--brand-muted)]"
                    dir="auto"
                  >
                    {
                      activeReview.ownerReply
                    }
                  </p>
                </div>
              )}

              <footer className="relative flex min-w-0 items-center gap-4 border-t border-[var(--brand-border)] pt-6">
                {activeAvatarUrl ? (
                  <>
                    {/* Provider avatars use unknown external hosts, so a native image is intentional here. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        activeAvatarUrl
                      }
                      alt=""
                      width={
                        52
                      }
                      height={
                        52
                      }
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-[52px] w-[52px] flex-none rounded-full border border-[var(--brand-border)] object-cover"
                    />
                  </>
                ) : (
                  <span
                    className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full bg-[var(--brand-primary)] font-display text-lg font-semibold text-[var(--brand-background)]"
                    aria-hidden="true"
                  >
                    {getReviewAuthorInitials(
                      activeAuthor
                    )}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-xl font-medium tracking-[-0.02em]">
                    {activeAuthor}
                  </p>

                  {activeDate && (
                    <time
                      dateTime={
                        activeReview.publishedAt
                      }
                      className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-[var(--brand-muted)]"
                    >
                      {activeDate}
                    </time>
                  )}
                </div>

                {activeReview.source ===
                  "google" &&
                  activeExternalUrl && (
                    <a
                      href={
                        activeExternalUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t(
                        translations.reviews
                          .viewOnGoogle,
                        locale
                      )}
                      className="inline-flex min-h-10 flex-none items-center gap-2 border border-[var(--brand-border)] px-3 text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-[var(--brand-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
                    >
                      {t(
                        translations.reviews
                          .viewOnGoogle,
                        locale
                      )}

                      <ExternalLink
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </a>
                  )}
              </footer>
            </article>

            <aside
              className="barber-reviews-index border border-[var(--brand-border)] bg-black/[0.12] p-3"
              aria-label={t(
                translations.reviews
                  .reviewList,
                locale
              )}
            >
              <div className="flex items-center justify-between border-b border-[var(--brand-border)] px-2 pb-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-muted)]">
                  {t(
                    translations.reviews
                      .reviewList,
                    locale
                  )}
                </p>

                <span className="font-display text-lg tabular-nums text-[var(--brand-primary)]">
                  {String(
                    reviewItems.length
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>
              </div>

              <div
                className="mt-3 space-y-2"
                role="list"
              >
                {reviewItems.map(
                  (
                    review,
                    index
                  ) => {
                    const active =
                      review.id ===
                      activeReview.id;

                    const author =
                      reviewAuthorName(
                        review,
                        locale
                      );

                    return (
                      <button
                        key={
                          review.id
                        }
                        type="button"
                        role="listitem"
                        aria-pressed={
                          active
                        }
                        onClick={() =>
                          setActiveReviewId(
                            review.id
                          )
                        }
                        onMouseEnter={() =>
                          setActiveReviewId(
                            review.id
                          )
                        }
                        onFocus={() =>
                          setActiveReviewId(
                            review.id
                          )
                        }
                        className={`barber-review-index-item group w-full border px-4 py-4 text-left transition-[border-color,background-color] duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] ${
                          active
                            ? "border-[var(--brand-primary)] bg-[var(--brand-surface)]"
                            : "border-[var(--brand-border)] bg-transparent hover:border-[var(--brand-primary)]/55 hover:bg-[var(--brand-surface)]/50"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-display text-sm tabular-nums text-[var(--brand-primary)]">
                            {String(
                              index +
                                1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <ReviewStars
                            rating={
                              review.rating
                            }
                            locale={
                              locale
                            }
                            size="sm"
                          />
                        </span>

                        <span className="mt-3 block truncate font-display text-lg font-medium tracking-[-0.02em]">
                          {author}
                        </span>

                        <span
                          className="mt-2 line-clamp-2 block text-xs leading-5 text-[var(--brand-muted)]"
                          dir="auto"
                        >
                          {review.body}
                        </span>

                        <span className="mt-3 flex items-center justify-between gap-3">
                          <ReviewTrustBadge
                            badge={
                              review.badge
                            }
                            locale={
                              locale
                            }
                            className="min-h-6 bg-transparent px-2 py-0.5 text-[9px]"
                          />

                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] transition-opacity duration-300 ${
                              active
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                          />
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </aside>
          </div>
        ) : (
          <div className="barber-reviews-empty mt-10 flex min-h-[420px] items-center justify-center border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)]/40 px-8 text-center">
            <div className="max-w-xl">
              <Quote
                className="mx-auto h-10 w-10 text-[var(--brand-primary)] opacity-50"
                aria-hidden="true"
              />

              <h3 className="mt-5 font-display text-3xl font-medium tracking-[-0.03em]">
                {t(
                  translations.reviews
                    .emptyTitle,
                  locale
                )}
              </h3>

              <p className="mt-3 text-sm leading-7 text-[var(--brand-muted)]">
                {t(
                  translations.reviews
                    .emptyDescription,
                  locale
                )}
              </p>

              {directReviewHref && (
                <a
                  href={
                    directReviewHref
                  }
                  className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--brand-primary)] bg-[var(--brand-primary)] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-background)]"
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
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          .barber-reviews-enter-left,
          .barber-reviews-enter-right,
          .barber-reviews-summary,
          .barber-reviews-stage,
          .barber-reviews-index,
          .barber-reviews-empty {
            transition:
              opacity 760ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 760ms cubic-bezier(0.16, 1, 0.3, 1);
            will-change: opacity, transform;
          }

          [data-barber-revealed="false"]
            .barber-reviews-enter-left,
          [data-barber-revealed="false"]
            .barber-reviews-summary {
            opacity: 0;
            transform: translateX(-30px);
          }

          [data-barber-revealed="false"]
            .barber-reviews-enter-right,
          [data-barber-revealed="false"]
            .barber-reviews-index,
          [data-barber-revealed="false"]
            .barber-reviews-empty {
            opacity: 0;
            transform: translateX(30px);
          }

          [data-barber-revealed="false"]
            .barber-reviews-stage {
            opacity: 0;
            transform: translateY(24px) scale(0.99);
          }

          [data-barber-revealed="true"]
            .barber-reviews-enter-left,
          [data-barber-revealed="true"]
            .barber-reviews-enter-right,
          [data-barber-revealed="true"]
            .barber-reviews-summary,
          [data-barber-revealed="true"]
            .barber-reviews-stage,
          [data-barber-revealed="true"]
            .barber-reviews-index,
          [data-barber-revealed="true"]
            .barber-reviews-empty {
            opacity: 1;
            transform: translateX(0) translateY(0) scale(1);
          }

          .barber-reviews-stage {
            animation:
              barberReviewActiveIn 520ms cubic-bezier(0.16, 1, 0.3, 1);
          }

          .barber-review-index-item {
            transition:
              opacity 540ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 540ms cubic-bezier(0.16, 1, 0.3, 1),
              border-color 300ms ease,
              background-color 300ms ease;
            will-change: opacity, transform;
          }

          [data-barber-revealed="false"]
            .barber-review-index-item {
            opacity: 0;
            transform: translateX(20px);
          }

          [data-barber-revealed="true"]
            .barber-review-index-item {
            opacity: 1;
            transform: translateX(0);
          }

          [data-barber-revealed="true"]
            .barber-review-index-item:nth-child(1) {
            transition-delay: 140ms;
          }

          [data-barber-revealed="true"]
            .barber-review-index-item:nth-child(2) {
            transition-delay: 195ms;
          }

          [data-barber-revealed="true"]
            .barber-review-index-item:nth-child(3) {
            transition-delay: 250ms;
          }

          [data-barber-revealed="true"]
            .barber-review-index-item:nth-child(4) {
            transition-delay: 305ms;
          }

          [data-barber-revealed="true"]
            .barber-review-index-item:nth-child(5) {
            transition-delay: 360ms;
          }

          [data-barber-revealed="true"]
            .barber-review-index-item:nth-child(6) {
            transition-delay: 415ms;
          }
        }

        @keyframes barberReviewActiveIn {
          from {
            opacity: 0.55;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .barber-reviews-enter-left,
          .barber-reviews-enter-right,
          .barber-reviews-summary,
          .barber-reviews-stage,
          .barber-reviews-index,
          .barber-reviews-empty,
          .barber-review-index-item {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
