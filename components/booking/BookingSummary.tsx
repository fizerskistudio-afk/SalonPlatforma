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

  onChangeStep?: (
    step:
      | "service"
      | "employee"
      | "date"
      | "time"
      | "customer"
  ) => void;
};

const intlLocaleMap: Record<
  Locale,
  string
> = {
  mk: "mk-MK",
  sq: "sq-MK",
  en: "en-GB",
};

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
    intlLocaleMap[locale],
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
      intlLocaleMap[locale],
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

  const employee =
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

  const employeeDisplay =
    draft.employeePreference ===
    "any"
      ? t(
          translations.booking
            .anyAvailable,
          locale
        )
      : employee
        ? employee.name
        : notSelectedLabel;

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
              <div className="mt-1 flex items-center gap-2 text-sm text-[var(--brand-muted)]">
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
            <div className="text-xs uppercase tracking-wider text-[var(--brand-muted)]">
              {t(
                translations.booking
                  .yourInfo,
                locale
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

            <div className="flex items-center gap-2 text-sm">
              <PhoneIcon
                className="h-4 w-4 flex-shrink-0 text-[var(--brand-muted)]"
                aria-hidden="true"
              />

              <span className="text-[var(--brand-text)]">
                {draft.customer.phone ||
                  notSelectedLabel}
              </span>
            </div>

            {draft.customer.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail
                  className="h-4 w-4 flex-shrink-0 text-[var(--brand-muted)]"
                  aria-hidden="true"
                />

                <span className="text-[var(--brand-text)]">
                  {
                    draft.customer
                      .email
                  }
                </span>
              </div>
            )}

            {draft.customer.note && (
              <div className="flex items-start gap-2 border-t border-[var(--brand-border)] pt-2 text-sm">
                <StickyNote
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--brand-muted)]"
                  aria-hidden="true"
                />

                <span className="italic text-[var(--brand-muted)]">
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