"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
  Star,
} from "lucide-react";

import {
  getLocaleDefinition,
  UI_LOCALE_CODES,
  type UiLocaleCode,
} from "@/lib/i18n/locales";
import {
  getReviewUiCopy,
  resolveReviewUiLocale,
} from "@/lib/reviews/public-copy";
import type {
  PublicReviewMode,
  PublicReviewPageContext,
} from "@/lib/reviews/public-page-types";

type PublicReviewExperienceProps = {
  mode: PublicReviewMode;
  context:
    | PublicReviewPageContext
    | null;
  token?: string;
};

type SubmitState =
  | {
      kind: "idle";
    }
  | {
      kind: "submitting";
    }
  | {
      kind: "error";
      message: string;
    }
  | {
      kind: "success";
      status: string;
    };

type ApiErrorBody = {
  code?: unknown;
  message?: unknown;
};

function formatDateTime(
  value: string,
  timezone: string,
  locale: UiLocaleCode
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  try {
    return new Intl.DateTimeFormat(
      getLocaleDefinition(
        locale
      ).intlLocale,
      {
        dateStyle:
          "medium",
        timeStyle:
          "short",
        timeZone:
          timezone,
      }
    ).format(date);
  } catch {
    return date.toISOString();
  }
}

function readErrorCode(
  value: unknown
): string | null {
  if (
    typeof value !==
      "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return null;
  }

  const body =
    value as ApiErrorBody;

  return typeof body.code ===
    "string"
    ? body.code
    : null;
}

function resolveSubmitError(
  code: string | null,
  copy:
    ReturnType<
      typeof getReviewUiCopy
    >
): string {
  switch (code) {
    case "RATE_LIMITED":
      return copy.rateLimited;

    case "REVIEW_LINK_INVALID":
    case "REVIEW_SUBMISSION_NOT_AVAILABLE":
      return copy.unavailableBody;

    case "REVIEW_ALREADY_SUBMITTED":
      return copy.alreadySubmitted;

    case "INVALID_REQUEST":
    case "MISSING_BUSINESS_SLUG":
    case "INVALID_BUSINESS_SLUG":
    case "INVALID_AUTHOR_NAME":
    case "INVALID_RATING":
    case "INVALID_REVIEW_BODY":
    case "INVALID_LANGUAGE_CODE":
    case "BOT_FIELD_FILLED":
    case "INVALID_REVIEW_PAYLOAD":
      return copy.invalidInput;

    default:
      return copy.genericError;
  }
}

function LanguageSelect({
  locale,
  onChange,
  label,
}: {
  locale: UiLocaleCode;
  onChange:
    (
      locale:
        UiLocaleCode
    ) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-zinc-600">
      <span className="sr-only">
        {label}
      </span>

      <select
        value={locale}
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value as UiLocaleCode
          )
        }
        aria-label={label}
        className="min-h-10 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 shadow-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
      >
        {UI_LOCALE_CODES.map(
          (
            code
          ) => (
            <option
              key={code}
              value={code}
            >
              {
                getLocaleDefinition(
                  code
                ).nativeName
              }
            </option>
          )
        )}
      </select>
    </label>
  );
}

function ReviewUnavailable({
  locale,
  onLocaleChange,
  salonUrl,
}: {
  locale: UiLocaleCode;
  onLocaleChange:
    (
      locale:
        UiLocaleCode
    ) => void;
  salonUrl?: string;
}) {
  const copy =
    getReviewUiCopy(
      locale
    );

  return (
    <main className="min-h-[100dvh] bg-zinc-100 px-4 py-8 text-zinc-950 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-xl">
        <div className="mb-4 flex justify-end">
          <LanguageSelect
            locale={locale}
            onChange={
              onLocaleChange
            }
            label={
              copy.languageLabel
            }
          />
        </div>

        <section
          className="rounded-[2rem] border border-zinc-200 bg-white p-7 text-center shadow-[0_24px_70px_rgba(24,24,27,0.08)] sm:p-10"
          role="alert"
          aria-live="polite"
        >
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <AlertCircle
              className="h-7 w-7"
              aria-hidden="true"
            />
          </span>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
            {
              copy.unavailableTitle
            }
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-zinc-600 sm:text-base">
            {
              copy.unavailableBody
            }
          </p>

          {salonUrl && (
            <a
              href={salonUrl}
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden="true"
              />

              {
                copy.backToSalon
              }
            </a>
          )}
        </section>
      </div>
    </main>
  );
}

export default function PublicReviewExperience({
  mode,
  context,
  token,
}: PublicReviewExperienceProps) {
  const [
    locale,
    setLocale,
  ] =
    useState<UiLocaleCode>(
      resolveReviewUiLocale(
        context
          ?.defaultLocale
      )
    );

  const [
    authorName,
    setAuthorName,
  ] =
    useState("");

  const [
    rating,
    setRating,
  ] =
    useState(0);

  const [
    body,
    setBody,
  ] =
    useState("");

  const [
    website,
    setWebsite,
  ] =
    useState("");

  const [
    submitState,
    setSubmitState,
  ] =
    useState<SubmitState>({
      kind: "idle",
    });

  const copy =
    useMemo(
      () =>
        getReviewUiCopy(
          locale
        ),
      [
        locale,
      ]
    );

  if (!context) {
    return (
      <ReviewUnavailable
        locale={locale}
        onLocaleChange={
          setLocale
        }
      />
    );
  }

  const reviewContext =
    context;

  const isVerified =
    mode ===
    "verified";

  const title =
    isVerified
      ? copy.verifiedTitle
      : copy.directTitle;

  const intro =
    isVerified
      ? copy.verifiedIntro
      : copy.directIntro;

  const success =
    submitState.kind ===
    "success";

  async function submitReview(
    event:
      React.FormEvent<
        HTMLFormElement
      >
  ) {
    event.preventDefault();

    if (
      submitState.kind ===
      "submitting"
    ) {
      return;
    }

    if (
      authorName.trim().length <
        2 ||
      rating < 1 ||
      rating > 5 ||
      body.trim().length <
        2
    ) {
      setSubmitState({
        kind: "error",
        message:
          copy.invalidInput,
      });

      return;
    }

    setSubmitState({
      kind: "submitting",
    });

    const endpoint =
      isVerified
        ? `/api/reviews/invitations/${
            encodeURIComponent(
              token ?? ""
            )
          }`
        : "/api/reviews";

    const payload =
      isVerified
        ? {
            authorName,
            rating,
            body,
            languageCode:
              locale,
            website,
          }
        : {
            businessSlug:
              reviewContext.businessSlug,
            authorName,
            rating,
            body,
            languageCode:
              locale,
            website,
          };

    try {
      const response =
        await fetch(
          endpoint,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                payload
              ),
            cache:
              "no-store",
          }
        );

      const responseBody:
        unknown =
          await response
            .json()
            .catch(
              () =>
                null
            );

      if (!response.ok) {
        setSubmitState({
          kind: "error",
          message:
            resolveSubmitError(
              readErrorCode(
                responseBody
              ),
              copy
            ),
        });

        return;
      }

      const status =
        typeof responseBody ===
          "object" &&
        responseBody !==
          null &&
        !Array.isArray(
          responseBody
        ) &&
        typeof (
          responseBody as {
            review?: {
              status?: unknown;
            };
          }
        ).review?.status ===
          "string"
          ? (
              responseBody as {
                review: {
                  status:
                    string;
                };
              }
            ).review.status
          : "pending";

      setSubmitState({
        kind: "success",
        status,
      });
    } catch {
      setSubmitState({
        kind: "error",
        message:
          copy.genericError,
      });
    }
  }

  return (
    <main className="min-h-[100dvh] bg-zinc-100 px-4 py-6 text-zinc-950 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <a
            href={
              reviewContext.salonUrl
            }
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />

            {
              copy.backToSalon
            }
          </a>

          <LanguageSelect
            locale={locale}
            onChange={
              setLocale
            }
            label={
              copy.languageLabel
            }
          />
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_24px_70px_rgba(24,24,27,0.09)]">
          <header className="border-b border-zinc-100 bg-zinc-950 px-6 py-7 text-white sm:px-9 sm:py-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-200">
                {isVerified && (
                  <ShieldCheck
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                )}

                {isVerified
                  ? copy.verifiedBadge
                  : copy.directBadge}
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-zinc-400">
              {
                reviewContext.businessName
              }
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">
              {intro}
            </p>
          </header>

          {success ? (
            <div
              className="p-7 text-center sm:p-10"
              role="status"
              aria-live="polite"
            >
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <CheckCircle2
                  className="h-8 w-8"
                  aria-hidden="true"
                />
              </span>

              <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                {
                  copy.successTitle
                }
              </h2>

              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-zinc-600 sm:text-base">
                {submitState.status ===
                "published"
                  ? copy.successPublished
                  : copy.successPending}
              </p>

              <a
                href={
                  reviewContext.salonUrl
                }
                className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
              >
                <ArrowLeft
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                {
                  copy.backToSalon
                }
              </a>
            </div>
          ) : (
            <form
              onSubmit={
                submitReview
              }
              className="space-y-7 p-6 sm:p-9"
              noValidate
            >
              {isVerified &&
              reviewContext.serviceName &&
              reviewContext.employeeName &&
              reviewContext.bookingStartsAt &&
              reviewContext.expiresAt && (
                <section
                  aria-labelledby="review-visit-details"
                  className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5"
                >
                  <h2
                    id="review-visit-details"
                    className="flex items-center gap-2 text-sm font-semibold text-emerald-950"
                  >
                    <ShieldCheck
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                    {
                      copy.visitDetails
                    }
                  </h2>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-emerald-800/70">
                        {
                          copy.serviceLabel
                        }
                      </dt>

                      <dd className="mt-1 font-semibold text-emerald-950">
                        {
                          reviewContext.serviceName
                        }
                      </dd>
                    </div>

                    <div>
                      <dt className="text-emerald-800/70">
                        {
                          copy.employeeLabel
                        }
                      </dt>

                      <dd className="mt-1 font-semibold text-emerald-950">
                        {
                          reviewContext.employeeName
                        }
                      </dd>
                    </div>

                    <div>
                      <dt className="text-emerald-800/70">
                        {
                          copy.appointmentLabel
                        }
                      </dt>

                      <dd className="mt-1 font-semibold text-emerald-950">
                        {formatDateTime(
                          reviewContext.bookingStartsAt,
                          reviewContext.timezone,
                          locale
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-emerald-800/70">
                        {
                          copy.expiresLabel
                        }
                      </dt>

                      <dd className="mt-1 font-semibold text-emerald-950">
                        {formatDateTime(
                          reviewContext.expiresAt,
                          reviewContext.timezone,
                          locale
                        )}
                      </dd>
                    </div>
                  </dl>
                </section>
              )}

              <p className="text-xs font-medium text-zinc-500">
                {
                  copy.requiredNote
                }
              </p>

              <div>
                <label
                  htmlFor="review-author-name"
                  className="text-sm font-semibold text-zinc-800"
                >
                  {
                    copy.authorLabel
                  }
                </label>

                <input
                  id="review-author-name"
                  name="authorName"
                  type="text"
                  required
                  minLength={2}
                  maxLength={160}
                  autoComplete="name"
                  value={
                    authorName
                  }
                  onChange={(
                    event
                  ) =>
                    setAuthorName(
                      event.target
                        .value
                    )
                  }
                  placeholder={
                    copy.authorPlaceholder
                  }
                  className="mt-2 min-h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                />
              </div>

              <fieldset>
                <legend className="text-sm font-semibold text-zinc-800">
                  {
                    copy.ratingLabel
                  }
                </legend>

                <div
                  className="mt-3 flex flex-wrap gap-2"
                  aria-label={
                    copy.ratingLabel
                  }
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
                      <label
                        key={
                          value
                        }
                        className="group relative cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="rating"
                          value={
                            value
                          }
                          checked={
                            rating ===
                            value
                          }
                          onChange={() =>
                            setRating(
                              value
                            )
                          }
                          className="peer sr-only"
                        />

                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-300 transition group-hover:border-amber-300 group-hover:text-amber-400 peer-checked:border-amber-400 peer-checked:bg-amber-50 peer-checked:text-amber-500 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400 peer-focus-visible:ring-offset-2">
                          <Star
                            className="h-6 w-6"
                            fill={
                              rating >=
                              value
                                ? "currentColor"
                                : "none"
                            }
                            aria-hidden="true"
                          />
                        </span>

                        <span className="sr-only">
                          {value}{" "}
                          {
                            copy.starsWord
                          }
                        </span>
                      </label>
                    )
                  )}
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor="review-body"
                  className="text-sm font-semibold text-zinc-800"
                >
                  {
                    copy.bodyLabel
                  }
                </label>

                <textarea
                  id="review-body"
                  name="body"
                  required
                  minLength={2}
                  maxLength={2000}
                  rows={7}
                  value={body}
                  onChange={(
                    event
                  ) =>
                    setBody(
                      event.target
                        .value
                    )
                  }
                  placeholder={
                    copy.bodyPlaceholder
                  }
                  className="mt-2 w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base leading-7 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                />

                <p className="mt-1 text-right text-xs text-zinc-500">
                  {
                    body.length
                  }
                  /2000{" "}
                  {
                    copy.characters
                  }
                </p>
              </div>

              <div
                aria-hidden="true"
                className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
              >
                <label htmlFor="review-website">
                  Website
                </label>

                <input
                  id="review-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(
                    event
                  ) =>
                    setWebsite(
                      event.target
                        .value
                    )
                  }
                />
              </div>

              {submitState.kind ===
                "error" && (
                <div
                  className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertCircle
                    className="mt-0.5 h-5 w-5 flex-none"
                    aria-hidden="true"
                  />

                  <p>
                    {
                      submitState.message
                    }
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  submitState.kind ===
                  "submitting"
                }
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitState.kind ===
                "submitting" && (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                )}

                {submitState.kind ===
                "submitting"
                  ? copy.submitting
                  : copy.submit}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
