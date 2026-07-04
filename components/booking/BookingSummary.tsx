"use client";

import {
  Clock,
  Edit2,
  Mail,
  Phone as PhoneIcon,
  StickyNote,
  User,
} from "lucide-react";

import { useCatalogData } from "@/lib/catalogContext";
import {
  t,
  translations,
} from "@/lib/translations";
import type {
  BookingDraft,
  Locale,
  ServicePriceType,
} from "@/lib/types";

type BookingSummaryProps = {
  locale: Locale;
  draft: BookingDraft;
  resolvedEmployeeId: string | null;

  onChangeStep?: (
    step:
      | "service"
      | "employee"
      | "date"
      | "time"
      | "customer"
  ) => void;
};

type LocalizedText =
  Partial<
    Record<Locale, string>
  > & {
    "sr-Latn": string;
    mk: string;
    sq: string;
    en: string;
  };

const intlLocaleMap: Record<
  Locale,
  string
> = {
  "sr-Latn": "sr-Latn-RS",
  mk: "mk-MK",
  sq: "sq-MK",
  en: "en-GB",
};

const automaticallyAssignedLabels: LocalizedText =
  {
    "sr-Latn": "Automatski izabran",
    mk: "Автоматски избран",
    sq: "Zgjedhur automatikisht",
    en: "Automatically assigned",
  };

const contactLabels: LocalizedText =
  {
    "sr-Latn": "Kontakt podaci",
    mk: "Контакт податоци",
    sq: "Të dhënat e kontaktit",
    en: "Contact details",
  };

function resolveIntlLocale(
  locale: Locale
): string {
  return (
    intlLocaleMap[String(locale)] ??
    locale ??
    "en-GB"
  );
}

function getLocalizedLabel(
  text: LocalizedText,
  locale: Locale
): string {
  return (
    text[locale] ??
    text.en ??
    text["sr-Latn"] ??
    text.mk ??
    text.sq
  );
}

function formatDisplayDate(
  dateString: string | null,
  locale: Locale,
  notSelectedLabel: string
): string {
  if (!dateString) {
    return notSelectedLabel;
  }

  const parts =
    dateString.split("-");

  if (parts.length !== 3) {
    return notSelectedLabel;
  }

  const [
    yearString,
    monthString,
    dayString,
  ] = parts;

  const year = Number.parseInt(
    yearString,
    10
  );

  const month = Number.parseInt(
    monthString,
    10
  );

  const day = Number.parseInt(
    dayString,
    10
  );

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return notSelectedLabel;
  }

  const date = new Date(
    year,
    month - 1,
    day
  );

  return date.toLocaleDateString(
    resolveIntlLocale(locale),
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}

function formatPrice(
  priceType: ServicePriceType,
  priceFrom: number,
  priceTo: number | undefined,
  currency: string,
  locale: Locale
): string {
  const formatter =
    new Intl.NumberFormat(
      resolveIntlLocale(locale),
      {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    );

  if (
    priceType === "fixed"
  ) {
    return formatter.format(
      priceFrom
    );
  }

  if (
    priceType === "from"
  ) {
    return `${t(
      translations.priceTypes.from,
      locale
    )} ${formatter.format(
      priceFrom
    )}`;
  }

  if (
    priceType === "range" &&
    priceTo !== undefined
  ) {
    return `${formatter.format(
      priceFrom
    )} ${t(
      translations.priceTypes.range,
      locale
    )} ${formatter.format(
      priceTo
    )}`;
  }

  return formatter.format(
    priceFrom
  );
}

export default function BookingSummary({
  locale,
  draft,
  resolvedEmployeeId,
  onChangeStep,
}: BookingSummaryProps) {
  const {
    business,
    services,
    employees,
  } = useCatalogData();

  const notSelectedLabel = t(
    translations.common.notSelected,
    locale
  );

  const service =
    draft.serviceId
      ? services.find(
          (item) =>
            item.id ===
              draft.serviceId &&
            item.isActive
        ) ?? null
      : null;

  const selectedEmployee =
    draft.employeePreference &&
    draft.employeePreference !==
      "any"
      ? employees.find(
          (item) =>
            item.id ===
              draft.employeePreference &&
            item.isActive
        ) ?? null
      : null;

  const resolvedEmployee =
    resolvedEmployeeId
      ? employees.find(
          (item) =>
            item.id ===
              resolvedEmployeeId &&
            item.isActive
        ) ?? null
      : null;

  const wasAutomaticallyAssigned =
    draft.employeePreference ===
      "any" &&
    resolvedEmployee !== null;

  const employeeDisplay =
    wasAutomaticallyAssigned
      ? resolvedEmployee.name
      : selectedEmployee
        ? selectedEmployee.name
        : draft.employeePreference ===
            "any"
          ? t(
              translations.booking
                .anyAvailable,
              locale
            )
          : notSelectedLabel;

  const hasPhone =
    draft.customer.phone.trim()
      .length > 0;

  const hasEmail =
    draft.customer.email.trim()
      .length > 0;

  const hasNote =
    draft.customer.note.trim()
      .length > 0;

  return (
    <div className="space-y-4">
      <h3 className="font-display mb-4 text-lg font-semibold text-[var(--brand-text)]">
        {t(
          translations.booking
            .summary,
          locale
        )}
      </h3>

      <div className="space-y-3">
        <div className="flex items-start justify-between rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3">
          <div className="flex-1">
            <div className="mb-1 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
              {t(
                translations.common
                  .service,
                locale
              )}
            </div>

            <div className="font-medium text-[var(--brand-text)]">
              {service
                ? t(
                    service.name,
                    locale
                  )
                : notSelectedLabel}
            </div>

            {service && (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--brand-muted)]">
                <Clock
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />

                <span>
                  {
                    service.durationMinutes
                  }{" "}
                  {t(
                    translations.booking
                      .minutes,
                    locale
                  )}
                </span>

                <span aria-hidden="true">
                  ·
                </span>

                <span className="font-semibold text-[var(--brand-primary)]">
                  {formatPrice(
                    service.priceType,
                    service.priceFrom,
                    service.priceTo,
                    business.currency,
                    locale
                  )}
                </span>
              </div>
            )}
          </div>

          {onChangeStep && (
            <button
              type="button"
              onClick={() =>
                onChangeStep(
                  "service"
                )
              }
              className="ml-3 rounded-lg p-2 text-[var(--brand-muted)] transition-colors hover:bg-[var(--brand-secondary)] hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
              aria-label={`${t(
                translations.booking
                  .change,
                locale
              )} ${t(
                translations.common
                  .service,
                locale
              )}`}
            >
              <Edit2
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        <div className="flex items-start justify-between rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3">
          <div className="flex-1">
            <div className="mb-1 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
              {t(
                translations.common
                  .stylist,
                locale
              )}
            </div>

            <div className="font-medium text-[var(--brand-text)]">
              {employeeDisplay}
            </div>

            {wasAutomaticallyAssigned && (
              <div className="mt-1 inline-flex rounded-full border border-[var(--brand-border)] bg-[var(--brand-secondary)] px-2.5 py-1 text-xs text-[var(--brand-muted)]">
                {
                  getLocalizedLabel(automaticallyAssignedLabels, locale)
                }
              </div>
            )}
          </div>

          {onChangeStep && (
            <button
              type="button"
              onClick={() =>
                onChangeStep(
                  "employee"
                )
              }
              className="ml-3 rounded-lg p-2 text-[var(--brand-muted)] transition-colors hover:bg-[var(--brand-secondary)] hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
              aria-label={`${t(
                translations.booking
                  .change,
                locale
              )} ${t(
                translations.common
                  .stylist,
                locale
              )}`}
            >
              <Edit2
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        <div className="flex items-start justify-between rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3">
          <div className="flex-1">
            <div className="mb-1 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
              {t(
                translations.common
                  .date,
                locale
              )}
            </div>

            <div className="font-medium text-[var(--brand-text)]">
              {formatDisplayDate(
                draft.date,
                locale,
                notSelectedLabel
              )}
            </div>
          </div>

          {onChangeStep && (
            <button
              type="button"
              onClick={() =>
                onChangeStep("date")
              }
              className="ml-3 rounded-lg p-2 text-[var(--brand-muted)] transition-colors hover:bg-[var(--brand-secondary)] hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
              aria-label={`${t(
                translations.booking
                  .change,
                locale
              )} ${t(
                translations.common
                  .date,
                locale
              )}`}
            >
              <Edit2
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        <div className="flex items-start justify-between rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3">
          <div className="flex-1">
            <div className="mb-1 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
              {t(
                translations.common
                  .time,
                locale
              )}
            </div>

            <div className="font-medium text-[var(--brand-text)]">
              {draft.time ||
                notSelectedLabel}
            </div>
          </div>

          {onChangeStep && (
            <button
              type="button"
              onClick={() =>
                onChangeStep("time")
              }
              className="ml-3 rounded-lg p-2 text-[var(--brand-muted)] transition-colors hover:bg-[var(--brand-secondary)] hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
              aria-label={`${t(
                translations.booking
                  .change,
                locale
              )} ${t(
                translations.common
                  .time,
                locale
              )}`}
            >
              <Edit2
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                {t(
                  translations.booking
                    .yourInfo,
                  locale
                )}
              </div>

              {(hasPhone ||
                hasEmail) && (
                <div className="mt-1 text-xs text-[var(--brand-muted)]">
                  {
                    getLocalizedLabel(contactLabels, locale)
                  }
                </div>
              )}
            </div>

            {onChangeStep && (
              <button
                type="button"
                onClick={() =>
                  onChangeStep(
                    "customer"
                  )
                }
                className="rounded-lg p-2 text-[var(--brand-muted)] transition-colors hover:bg-[var(--brand-secondary)] hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
                aria-label={`${t(
                  translations.booking
                    .change,
                  locale
                )} ${t(
                  translations.booking
                    .yourInfo,
                  locale
                )}`}
              >
                <Edit2
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User
                className="h-4 w-4 flex-shrink-0 text-[var(--brand-muted)]"
                aria-hidden="true"
              />

              <span className="text-[var(--brand-text)]">
                {draft.customer.name ||
                  notSelectedLabel}
              </span>
            </div>

            {hasPhone && (
              <div className="flex items-center gap-2 text-sm">
                <PhoneIcon
                  className="h-4 w-4 flex-shrink-0 text-[var(--brand-muted)]"
                  aria-hidden="true"
                />

                <span className="break-all text-[var(--brand-text)]">
                  {
                    draft.customer
                      .phone
                  }
                </span>
              </div>
            )}

            {hasEmail && (
              <div className="flex items-center gap-2 text-sm">
                <Mail
                  className="h-4 w-4 flex-shrink-0 text-[var(--brand-muted)]"
                  aria-hidden="true"
                />

                <span className="break-all text-[var(--brand-text)]">
                  {
                    draft.customer
                      .email
                  }
                </span>
              </div>
            )}

            {hasNote && (
              <div className="flex items-start gap-2 border-t border-[var(--brand-border)] pt-3 text-sm">
                <StickyNote
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--brand-muted)]"
                  aria-hidden="true"
                />

                <span className="whitespace-pre-wrap break-words italic text-[var(--brand-muted)]">
                  {
                    draft.customer
                      .note
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}