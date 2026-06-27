"use client";

import { useMemo } from "react";
import type { Locale } from "@/lib/types";
import {
  bookingConfig,
  businessConfig,
} from "@/lib/config";
import {
  t,
  translations,
} from "@/lib/translations";
import { CalendarDays } from "lucide-react";
import SectionHeader from "../shared/SectionHeader";

type DateStepProps = {
  locale: Locale;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

type DateOption = {
  date: string;
  isClosed: boolean;
  dayName: string;
  dayNumber: number;
  monthName: string;
  fullDateLabel: string;
};

const intlLocaleMap: Record<Locale, string> = {
  mk: "mk-MK",
  sq: "sq-MK",
  en: "en-GB",
};

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(date.getDate()).padStart(
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
  const dates = useMemo<DateOption[]>(() => {
    const localeCode = intlLocaleMap[locale];

    const weekdayFormatter = new Intl.DateTimeFormat(
      localeCode,
      {
        weekday: "short",
      }
    );

    const monthFormatter = new Intl.DateTimeFormat(
      localeCode,
      {
        month: "short",
      }
    );

    const fullDateFormatter =
      new Intl.DateTimeFormat(localeCode, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    const today = new Date();
    const result: DateOption[] = [];

    for (
      let dayOffset = 0;
      dayOffset < bookingConfig.bookingWindowDays;
      dayOffset += 1
    ) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + dayOffset
      );

      const workingHours =
        businessConfig.workingHours.find(
          (hours) =>
            hours.dayOfWeek === date.getDay()
        );

      const isClosed =
        !workingHours ||
        workingHours.isClosed ||
        !workingHours.openTime ||
        !workingHours.closeTime;

      result.push({
        date: formatLocalDate(date),
        isClosed,
        dayName: weekdayFormatter.format(date),
        dayNumber: date.getDate(),
        monthName: monthFormatter.format(date),
        fullDateLabel:
          fullDateFormatter.format(date),
      });
    }

    return result;
  }, [locale]);

  const allDatesClosed = dates.every(
    (date) => date.isClosed
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title={translations.booking.selectDate}
        subtitle={
          translations.booking.selectDateDescription
        }
        locale={locale}
        align="left"
      />

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
        {dates.map((option) => {
          const isSelected =
            selectedDate === option.date;

          const closedLabel = t(
            translations.contact.closed,
            locale
          );

          const ariaLabel = option.isClosed
            ? `${option.fullDateLabel}, ${closedLabel}`
            : option.fullDateLabel;

          return (
            <button
              key={option.date}
              type="button"
              disabled={option.isClosed}
              onClick={() =>
                onSelectDate(option.date)
              }
              aria-pressed={
                option.isClosed
                  ? undefined
                  : isSelected
              }
              aria-label={ariaLabel}
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
                {option.dayName}
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
                {option.dayNumber}
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
                {option.monthName}
              </span>

              {option.isClosed && (
                <span className="mt-0.5 text-[9px] uppercase tracking-wider text-[var(--brand-muted)]">
                  {closedLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {allDatesClosed && (
        <div className="flex items-center gap-3 rounded-2xl bg-[var(--brand-secondary)] p-4 text-sm text-[var(--brand-muted)]">
          <CalendarDays
            className="h-5 w-5 flex-shrink-0"
            aria-hidden="true"
          />

          <span>
            {t(
              translations.booking.noAvailableDates,
              locale
            )}
          </span>
        </div>
      )}
    </div>
  );
}