"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  Archive,
  Check,
  Flag,
  MessageSquareReply,
  RotateCcw,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";

import {
  moderateReviewAction,
  updateReviewOwnerReplyAction,
} from "@/app/admin/(protected)/reviews/actions";
import type {
  AdminReviewItem,
  AdminReviewManagementData,
} from "@/lib/admin/reviews";
import type {
  ReviewSource,
  ReviewStatus,
} from "@/lib/reviews/domain";
import {
  isModerationReasonRequired,
} from "@/lib/reviews/moderation";

type ReviewFilter =
  | "all"
  | "attention"
  | ReviewStatus;

type ModerationDialogState = {
  review: AdminReviewItem;
  nextStatus: ReviewStatus;
} | null;

const STATUS_LABELS:
  Record<
    ReviewStatus,
    string
  > = {
  pending:
    "Na čekanju",
  published:
    "Objavljena",
  rejected:
    "Odbijena",
  flagged:
    "Označena",
  archived:
    "Arhivirana",
};

const STATUS_CLASSES:
  Record<
    ReviewStatus,
    string
  > = {
  pending:
    "border-amber-300/20 bg-amber-300/10 text-amber-200",
  published:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  rejected:
    "border-red-400/20 bg-red-400/10 text-red-300",
  flagged:
    "border-orange-400/20 bg-orange-400/10 text-orange-300",
  archived:
    "border-zinc-400/20 bg-zinc-400/10 text-zinc-300",
};

const SOURCE_LABELS:
  Record<
    ReviewSource,
    string
  > = {
  platform:
    "Platform review",
  google:
    "Google",
  "manual-testimonial":
    "Testimonial salona",
  demo:
    "Demo sadržaj",
};

const FILTERS:
  Array<{
    key: ReviewFilter;
    label: string;
  }> = [
  {
    key: "all",
    label: "Sve",
  },
  {
    key: "attention",
    label: "Traže pažnju",
  },
  {
    key: "pending",
    label: "Na čekanju",
  },
  {
    key: "published",
    label: "Objavljene",
  },
  {
    key: "flagged",
    label: "Označene",
  },
  {
    key: "rejected",
    label: "Odbijene",
  },
  {
    key: "archived",
    label: "Arhivirane",
  },
];

function formatDateTime(
  value: string,
  timezone: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "sr-Latn-RS",
    {
      dateStyle:
        "medium",
      timeStyle:
        "short",
      timeZone:
        timezone,
    }
  ).format(date);
}

function getTransitionLabel(
  status: ReviewStatus
): string {
  switch (status) {
    case "published":
      return "Objavi";

    case "rejected":
      return "Odbij";

    case "flagged":
      return "Označi";

    case "archived":
      return "Arhiviraj";

    case "pending":
      return "Vrati na čekanje";
  }
}

function getTransitionIcon(
  status: ReviewStatus
) {
  switch (status) {
    case "published":
      return Check;

    case "rejected":
      return X;

    case "flagged":
      return Flag;

    case "archived":
      return Archive;

    case "pending":
      return RotateCcw;
  }
}

function getFilterCount(
  data:
    AdminReviewManagementData,
  filter:
    ReviewFilter
): number {
  if (
    filter ===
    "all"
  ) {
    return data.summary.total;
  }

  if (
    filter ===
    "attention"
  ) {
    return data.summary.attention;
  }

  return data.summary[
    filter
  ];
}

function ReviewStars({
  rating,
}: {
  rating: number | null;
}) {
  if (
    rating === null
  ) {
    return (
      <span className="text-xs text-zinc-600">
        Bez ocene
      </span>
    );
  }

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${rating} od 5 zvezdica`}
    >
      {[
        1,
        2,
        3,
        4,
        5,
      ].map(
        (
          value
        ) => (
          <Star
            key={value}
            className={`h-4 w-4 ${
              value <=
              rating
                ? "text-amber-300"
                : "text-zinc-700"
            }`}
            fill={
              value <=
              rating
                ? "currentColor"
                : "none"
            }
            aria-hidden="true"
          />
        )
      )}
    </div>
  );
}

function ReviewReplyEditor({
  review,
}: {
  review: AdminReviewItem;
}) {
  const router =
    useRouter();

  const [
    reply,
    setReply,
  ] =
    useState(
      review.ownerReply ??
        ""
    );

  const [
    notice,
    setNotice,
  ] =
    useState<{
      ok: boolean;
      message: string;
    } | null>(
      null
    );

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  const unchanged =
    reply.trim() ===
    (
      review.ownerReply ??
      ""
    ).trim();

  function saveReply() {
    startTransition(
      async () => {
        const result =
          await updateReviewOwnerReplyAction({
            reviewId:
              review.id,
            reply,
          });

        setNotice({
          ok:
            result.ok,
          message:
            result.message,
        });

        if (
          result.ok
        ) {
          router.refresh();
        }
      }
    );
  }

  return (
    <section className="mt-5 rounded-2xl border border-white/[0.07] bg-black/15 p-4">
      <div className="flex items-center gap-2">
        <MessageSquareReply
          className="h-4 w-4 text-amber-300"
          aria-hidden="true"
        />

        <h4 className="text-sm font-semibold text-zinc-200">
          Odgovor salona
        </h4>
      </div>

      <textarea
        value={reply}
        onChange={(
          event
        ) => {
          setReply(
            event.target
              .value
          );
          setNotice(
            null
          );
        }}
        rows={4}
        maxLength={2000}
        placeholder="Napiši profesionalan odgovor koji će biti prikazan uz recenziju..."
        className="mt-3 w-full resize-y rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-700 focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/20"
      />

      <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <span className="text-xs text-zinc-600">
          {reply.length}/2000
        </span>

        <button
          type="button"
          disabled={
            isPending ||
            unchanged
          }
          onClick={
            saveReply
          }
          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "Čuvanje..."
            : reply.trim()
              ? "Sačuvaj odgovor"
              : "Ukloni odgovor"}
        </button>
      </div>

      {notice && (
        <p
          className={`mt-3 text-sm ${
            notice.ok
              ? "text-emerald-300"
              : "text-red-300"
          }`}
          role="status"
          aria-live="polite"
        >
          {
            notice.message
          }
        </p>
      )}
    </section>
  );
}

export default function AdminReviewsManager({
  data,
}: {
  data:
    AdminReviewManagementData;
}) {
  const router =
    useRouter();

  const [
    filter,
    setFilter,
  ] =
    useState<ReviewFilter>(
      data.summary
        .attention >
      0
        ? "attention"
        : "all"
    );

  const [
    dialog,
    setDialog,
  ] =
    useState<
      ModerationDialogState
    >(null);

  const [
    reason,
    setReason,
  ] =
    useState("");

  const [
    notice,
    setNotice,
  ] =
    useState<{
      ok: boolean;
      message: string;
    } | null>(
      null
    );

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  const visibleReviews =
    useMemo(
      () =>
        data.reviews.filter(
          (
            review
          ) => {
            if (
              filter ===
              "all"
            ) {
              return true;
            }

            if (
              filter ===
              "attention"
            ) {
              return (
                review.status ===
                  "pending" ||
                review.status ===
                  "flagged"
              );
            }

            return (
              review.status ===
              filter
            );
          }
        ),
      [
        data.reviews,
        filter,
      ]
    );

  function openDialog(
    review:
      AdminReviewItem,
    nextStatus:
      ReviewStatus
  ) {
    setReason("");
    setNotice(null);
    setDialog({
      review,
      nextStatus,
    });
  }

  function submitModeration() {
    if (!dialog) {
      return;
    }

    startTransition(
      async () => {
        const result =
          await moderateReviewAction({
            reviewId:
              dialog.review.id,
            nextStatus:
              dialog.nextStatus,
            reason,
          });

        setNotice({
          ok:
            result.ok,
          message:
            result.message,
        });

        if (
          result.ok
        ) {
          setDialog(
            null
          );
          setReason("");
          router.refresh();
        }
      }
    );
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.07] via-white/[0.035] to-amber-300/[0.04] p-6 shadow-2xl sm:p-8">
        <div
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
            <ShieldCheck
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />

            Review moderation
          </div>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Recenzije za{" "}
            <span className="text-amber-300">
              {
                data.business
                  .name
              }
            </span>
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Objavi autentične utiske, sakrij zloupotrebu i odgovori profesionalno. Negativna ocena sama po sebi nije razlog za odbijanje.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label:
              "Traže pažnju",
            value:
              data.summary
                .attention,
            detail:
              `${data.summary.pending} na čekanju · ${data.summary.flagged} označenih`,
            className:
              "border-amber-300/15 bg-amber-300/[0.055]",
          },
          {
            label:
              "Objavljene",
            value:
              data.summary
                .published,
            detail:
              "vidljive na javnom sajtu",
            className:
              "border-emerald-400/15 bg-emerald-400/[0.055]",
          },
          {
            label:
              "Odbijene",
            value:
              data.summary
                .rejected,
            detail:
              "sa moderation razlogom",
            className:
              "border-red-400/15 bg-red-400/[0.055]",
          },
          {
            label:
              "Ukupno",
            value:
              data.summary
                .total,
            detail:
              `${data.summary.archived} arhiviranih`,
            className:
              "border-white/[0.08] bg-white/[0.035]",
          },
        ].map(
          (
            card
          ) => (
            <article
              key={
                card.label
              }
              className={`rounded-2xl border p-5 ${card.className}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                {
                  card.label
                }
              </p>

              <p className="mt-3 text-3xl font-semibold text-white">
                {
                  card.value
                }
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                {
                  card.detail
                }
              </p>
            </article>
          )
        )}
      </section>

      <section className="rounded-[2rem] border border-white/[0.08] bg-white/[0.035] p-4 sm:p-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {FILTERS.map(
            (
              item
            ) => {
              const active =
                filter ===
                item.key;

              const count =
                getFilterCount(
                  data,
                  item.key
                );

              return (
                <button
                  key={
                    item.key
                  }
                  type="button"
                  onClick={() =>
                    setFilter(
                      item.key
                    )
                  }
                  className={`inline-flex min-h-10 flex-none items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
                    active
                      ? "border-amber-300 bg-amber-300 text-zinc-950"
                      : "border-white/10 bg-zinc-950/50 text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {
                    item.label
                  }

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      active
                        ? "bg-zinc-950/10"
                        : "bg-white/[0.06]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {notice && (
          <div
            className={`mt-4 rounded-2xl border p-4 text-sm ${
              notice.ok
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : "border-red-400/20 bg-red-400/10 text-red-200"
            }`}
            role="status"
            aria-live="polite"
          >
            {
              notice.message
            }
          </div>
        )}

        <div className="mt-5 space-y-4">
          {visibleReviews.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
              <p className="text-lg font-semibold text-zinc-300">
                Nema recenzija u ovom prikazu
              </p>

              <p className="mt-2 text-sm text-zinc-600">
                Promeni filter ili sačekaj novi utisak klijenta.
              </p>
            </div>
          ) : (
            visibleReviews.map(
              (
                review
              ) => (
                <article
                  key={
                    review.id
                  }
                  className="rounded-2xl border border-white/[0.08] bg-zinc-950/55 p-5 sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_CLASSES[review.status]}`}
                        >
                          {
                            STATUS_LABELS[
                              review
                                .status
                            ]
                          }
                        </span>

                        <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-zinc-400">
                          {
                            SOURCE_LABELS[
                              review
                                .source
                            ]
                          }
                        </span>

                        {review.isVerifiedVisit && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                            <ShieldCheck
                              className="h-3 w-3"
                              aria-hidden="true"
                            />

                            Potvrđena poseta
                          </span>
                        )}
                      </div>

                      <h3 className="mt-4 text-lg font-semibold text-white">
                        {
                          review.authorName
                        }
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <ReviewStars
                          rating={
                            review.rating
                          }
                        />

                        <span className="text-xs text-zinc-600">
                          {formatDateTime(
                            review.createdAt,
                            data.business
                              .timezone
                          )}
                        </span>

                        {review.languageCode && (
                          <span className="text-xs uppercase text-zinc-600">
                            {
                              review.languageCode
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <blockquote className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300 sm:text-base">
                    {
                      review.body
                    }
                  </blockquote>

                  {(review.bookingReference ||
                    review.serviceName ||
                    review.employeeName) && (
                    <dl className="mt-5 grid gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-xs sm:grid-cols-3">
                      {review.bookingReference && (
                        <div>
                          <dt className="text-zinc-600">
                            Rezervacija
                          </dt>
                          <dd className="mt-1 font-medium text-zinc-300">
                            {
                              review.bookingReference
                            }
                          </dd>
                        </div>
                      )}

                      {review.serviceName && (
                        <div>
                          <dt className="text-zinc-600">
                            Usluga
                          </dt>
                          <dd className="mt-1 font-medium text-zinc-300">
                            {
                              review.serviceName
                            }
                          </dd>
                        </div>
                      )}

                      {review.employeeName && (
                        <div>
                          <dt className="text-zinc-600">
                            Član tima
                          </dt>
                          <dd className="mt-1 font-medium text-zinc-300">
                            {
                              review.employeeName
                            }
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}

                  {review.latestModeration
                    ?.reason && (
                    <div className="mt-4 rounded-xl border border-orange-400/15 bg-orange-400/[0.06] px-4 py-3 text-xs leading-5 text-orange-200">
                      <strong>
                        Poslednji moderation razlog:
                      </strong>{" "}
                      {
                        review
                          .latestModeration
                          .reason
                      }
                    </div>
                  )}

                  {review.allowedTransitions.length >
                    0 && (
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.07] pt-5">
                      {review.allowedTransitions.map(
                        (
                          nextStatus
                        ) => {
                          const Icon =
                            getTransitionIcon(
                              nextStatus
                            );

                          return (
                            <button
                              key={
                                nextStatus
                              }
                              type="button"
                              onClick={() =>
                                openDialog(
                                  review,
                                  nextStatus
                                )
                              }
                              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-2 text-sm font-semibold text-zinc-300 transition hover:border-amber-300/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                            >
                              <Icon
                                className="h-4 w-4"
                                aria-hidden="true"
                              />

                              {
                                getTransitionLabel(
                                  nextStatus
                                )
                              }
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}

                  {review.canReply && (
                    <ReviewReplyEditor
                      key={`${review.id}:${review.ownerReply ?? ""}`}
                      review={
                        review
                      }
                    />
                  )}

                  {!review.canReply &&
                    review.ownerReply && (
                    <section className="mt-5 rounded-2xl border border-white/[0.07] bg-black/15 p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                        Sačuvan odgovor salona
                      </h4>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                        {
                          review.ownerReply
                        }
                      </p>
                    </section>
                  )}
                </article>
              )
            )
          )}
        </div>
      </section>

      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-moderation-title"
        >
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-zinc-950 p-6 shadow-2xl sm:p-7">
            <h2
              id="review-moderation-title"
              className="text-xl font-semibold text-white"
            >
              {
                getTransitionLabel(
                  dialog.nextStatus
                )
              }{" "}
              recenziju?
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Autor:{" "}
              <strong className="text-zinc-300">
                {
                  dialog.review
                    .authorName
                }
              </strong>
            </p>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-zinc-300">
                Razlog
                {isModerationReasonRequired(
                  dialog.nextStatus
                )
                  ? " — obavezno"
                  : " — opciono"}
              </span>

              <textarea
                value={reason}
                onChange={(
                  event
                ) =>
                  setReason(
                    event.target
                      .value
                  )
                }
                rows={4}
                maxLength={500}
                placeholder="Zabeleži operativni razlog. Negativna ocena sama po sebi nije razlog za odbijanje."
                className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-700 focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/20"
              />

              <span className="mt-1 block text-right text-xs text-zinc-700">
                {reason.length}/500
              </span>
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={
                  isPending
                }
                onClick={() => {
                  setDialog(
                    null
                  );
                  setReason("");
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:bg-white/[0.05] hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                Odustani
              </button>

              <button
                type="button"
                disabled={
                  isPending ||
                  (
                    isModerationReasonRequired(
                      dialog.nextStatus
                    ) &&
                    reason.trim()
                      .length <
                      3
                  )
                }
                onClick={
                  submitModeration
                }
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-300 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending
                  ? "Čuvanje..."
                  : getTransitionLabel(
                      dialog.nextStatus
                    )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
