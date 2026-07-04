"use client";

import {
  useMemo,
} from "react";

import {
  CalendarDays,
} from "lucide-react";

import {
  useCatalogData,
} from "@/lib/catalogContext";

import {
  t,
  translations,
} from "@/lib/translations";

import type {
  DayOfWeek,
  Locale,
} from "@/lib/types";

import SectionHeader from "../shared/SectionHeader";

type DateStepProps = {
  locale: Locale;
  selectedDate: string | null;
  onSelectDate: (
    date: string
  ) => void;
};

type DateOption = {
  date: string;
  isClosed: boolean;
  dayName: string;
  dayNumber: number;
  monthName: string;
  fullDateLabel: string;
};

type CalendarDateParts = {
  year: number;
  month: number;
  day: number;
};

const intlLocaleMap: Record<
  Locale,
  string
> = {
  "sr-Latn":
    "sr-Latn-RS",

  mk:
    "mk-MK",

  sq:
    "sq-AL",

  en:
    "en-GB",
};

function resolveIntlLocale(
  locale: Locale
): string {
  return (
    intlLocaleMap[locale] ??
    locale ??
    "en-GB"
  );
}

function getCurrentDateParts(
  timezone: string
): CalendarDateParts {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          timezone,

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",
      }
    );

  const parts =
    formatter.formatToParts(
      new Date()
    );

  const year =
    Number(
      parts.find(
        (part) =>
          part.type ===
          "year"
      )?.value
    );

  const month =
    Number(
      parts.find(
        (part) =>
          part.type ===
          "month"
      )?.value
    );

  const day =
    Number(
      parts.find(
        (part) =>
          part.type ===
          "day"
      )?.value
    );

  if (
    !Number.isInteger(
      year
    ) ||
    !Number.isInteger(
      month
    ) ||
    !Number.isInteger(
      day
    )
  ) {
    const fallbackDate =
      new Date();

    return {
      year:
        fallbackDate
          .getUTCFullYear(),

      month:
        fallbackDate
          .getUTCMonth() +
        1,

      day:
        fallbackDate
          .getUTCDate(),
    };
  }

  return {
    year,
    month,
    day,
  };
}

function createCalendarDate(
  startDate:
    CalendarDateParts,
  dayOffset: number
): Date {
  return new Date(
    Date.UTC(
      startDate.year,
      startDate.month - 1,
      startDate.day +
        dayOffset,
      12,
      0,
      0
    )
  );
}

function formatCalendarDate(
  date: Date
): string {
  const year =
    date.getUTCFullYear();

  const month =
    String(
      date.getUTCMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getUTCDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

export default function DateStep({
  locale,
  selectedDate,
  onSelectDate,
}: DateStepProps) {
  const {
    business,
    booking,
  } =
    useCatalogData();

  const dates =
    useMemo<
      DateOption[]
    >(() => {
      const localeCode =
        resolveIntlLocale(
          locale
        );

      const weekdayFormatter =
        new Intl.DateTimeFormat(
          localeCode,
          {
            weekday:
              "short",

            timeZone:
              "UTC",
          }
        );

      const monthFormatter =
        new Intl.DateTimeFormat(
          localeCode,
          {
            month:
              "short",

            timeZone:
              "UTC",
          }
        );

      const fullDateFormatter =
        new Intl.DateTimeFormat(
          localeCode,
          {
            weekday:
              "long",

            day:
              "numeric",

            month:
              "long",

            year:
              "numeric",

            timeZone:
              "UTC",
          }
        );

      const salonToday =
        getCurrentDateParts(
          business.timezone
        );

      const result:
        DateOption[] =
          [];

      for (
        let dayOffset = 0;
        dayOffset <
        booking.bookingWindowDays;
        dayOffset += 1
      ) {
        const date =
          createCalendarDate(
            salonToday,
            dayOffset
          );

        const dayOfWeek =
          date.getUTCDay() as
            DayOfWeek;

        const workingHours =
          business
            .workingHours
            .find(
              (hours) =>
                hours.dayOfWeek ===
                dayOfWeek
            );

        const isClosed =
          !workingHours ||
          workingHours
            .isClosed ||
          !workingHours
            .openTime ||
          !workingHours
            .closeTime;

        result.push({
          date:
            formatCalendarDate(
              date
            ),

          isClosed,

          dayName:
            weekdayFormatter
              .format(
                date
              ),

          dayNumber:
            date.getUTCDate(),

          monthName:
            monthFormatter
              .format(
                date
              ),

          fullDateLabel:
            fullDateFormatter
              .format(
                date
              ),
        });
      }

      return result;
    }, [
      booking
        .bookingWindowDays,

      business
        .timezone,

      business
        .workingHours,

      locale,
    ]);

  const allDatesClosed =
    dates.every(
      (date) =>
        date.isClosed
    );

  return (
    <div
      className="
        space-y-6
      "
    >
      <SectionHeader
        title={
          translations
            .booking
            .selectDate
        }
        subtitle={
          translations
            .booking
            .selectDateDescription
        }
        locale={
          locale
        }
        align="left"
      />

      <div
        className="
          -mx-1
          flex
          gap-2
          overflow-x-auto
          px-1
          pb-3
        "
      >
        {dates.map(
          (
            option
          ) => {
            const isSelected =
              selectedDate ===
              option.date;

            const closedLabel =
              t(
                translations
                  .contact
                  .closed,
                locale
              );

            const ariaLabel =
              option.isClosed
                ? `${option.fullDateLabel}, ${closedLabel}`
                : option.fullDateLabel;

            return (
              <button
                key={
                  option.date
                }
                type="button"
                disabled={
                  option.isClosed
                }
                onClick={() =>
                  onSelectDate(
                    option.date
                  )
                }
                aria-pressed={
                  option.isClosed
                    ? undefined
                    : isSelected
                }
                aria-label={
                  ariaLabel
                }
                className={`flex w-20 flex-shrink-0 flex-col items-center gap-0.5 rounded-2xl border-2 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none ${
                  option.isClosed
                    ? "cursor-not-allowed border-[var(--brand-border)] bg-[var(--brand-secondary)] opacity-50"
                    : isSelected
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--brand-surface)]"
                      : "border-[var(--brand-border)] bg-[var(--brand-surface)] hover:border-[var(--brand-primary)]"
                }`}
              >
                <span
                  className={`text-[10px] font-semibold uppercase ${
                    option.isClosed
                      ? "text-[var(--brand-muted)]"
                      : isSelected
                        ? "text-[var(--brand-surface)]"
                        : "text-[var(--brand-muted)]"
                  }`}
                >
                  {
                    option.dayName
                  }
                </span>

                <span
                  className={`font-display text-xl font-semibold ${
                    option.isClosed
                      ? "text-[var(--brand-muted)]"
                      : isSelected
                        ? "text-[var(--brand-surface)]"
                        : "text-[var(--brand-text)]"
                  }`}
                >
                  {
                    option.dayNumber
                  }
                </span>

                <span
                  className={`text-[10px] ${
                    option.isClosed
                      ? "text-[var(--brand-muted)]"
                      : isSelected
                        ? "text-[var(--brand-surface)]"
                        : "text-[var(--brand-muted)]"
                  }`}
                >
                  {
                    option.monthName
                  }
                </span>

                {option.isClosed ? (
                  <span
                    className="
                      mt-0.5
                      text-[9px]
                      uppercase
                      tracking-wider
                      text-[var(--brand-muted)]
                    "
                  >
                    {
                      closedLabel
                    }
                  </span>
                ) : null}
              </button>
            );
          }
        )}
      </div>

      {allDatesClosed ? (
        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            bg-[var(--brand-secondary)]
            p-4
            text-sm
            text-[var(--brand-muted)]
          "
        >
          <CalendarDays
            className="
              h-5
              w-5
              flex-shrink-0
            "
            aria-hidden="true"
          />

          <span>
            {t(
              translations
                .booking
                .noAvailableDates,
              locale
            )}
          </span>
        </div>
      ) : null}
    </div>
  );
}