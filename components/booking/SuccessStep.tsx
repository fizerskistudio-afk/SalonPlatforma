"use client";

import type {
  BookingDraft,
  Locale,
} from "@/lib/types";
import { services } from "@/lib/mockData";
import {
  t,
  translations,
} from "@/lib/translations";
import {
  Calendar,
  Clock,
  PartyPopper,
  Scissors,
} from "lucide-react";

type SuccessStepProps = {
  locale: Locale;
  draft: BookingDraft;
  onDone: () => void;
};

const intlLocaleMap: Record<Locale, string> = {
  mk: "mk-MK",
  sq: "sq-MK",
  en: "en-GB",
};

function formatDisplayDate(
  dateString: string | null,
  locale: Locale
): string | null {
  if (!dateString) {
    return null;
  }

  const parts = dateString.split("-");

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

  const date = new Date(year, month - 1, day);

  const isValidDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  if (!isValidDate) {
    return null;
  }

  return new Intl.DateTimeFormat(
    intlLocaleMap[locale],
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date);
}

export default function SuccessStep({
  locale,
  draft,
  onDone,
}: SuccessStepProps) {
  const service = draft.serviceId
    ? services.find(
        (item) =>
          item.id === draft.serviceId &&
          item.isActive
      ) ?? null
    : null;

  const formattedDate = formatDisplayDate(
    draft.date,
    locale
  );

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div
        className="flex w-full flex-col items-center"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="relative mb-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] animate-pulse motion-reduce:animate-none">
            <PartyPopper
              className="h-12 w-12 text-[var(--brand-surface)]"
              aria-hidden="true"
            />
          </div>
        </div>

        <h2 className="font-display mb-3 text-3xl font-semibold text-[var(--brand-text)]">
          {t(translations.booking.success, locale)}
        </h2>

        <p className="mb-8 max-w-sm leading-relaxed text-[var(--brand-muted)]">
          {t(
            translations.booking.successMsg,
            locale
          )}
        </p>

        <div className="mb-8 w-full max-w-sm rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5">
          <div className="space-y-3">
            {service && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--brand-secondary)]">
                  <Scissors
                    className="h-5 w-5 text-[var(--brand-primary)]"
                    aria-hidden="true"
                  />
                </div>

                <div className="flex-1 text-left">
                  <div className="mb-0.5 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                    {t(
                      translations.common.service,
                      locale
                    )}
                  </div>

                  <div className="text-sm font-medium text-[var(--brand-text)]">
                    {t(service.name, locale)}
                  </div>
                </div>
              </div>
            )}

            {formattedDate && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--brand-secondary)]">
                  <Calendar
                    className="h-5 w-5 text-[var(--brand-primary)]"
                    aria-hidden="true"
                  />
                </div>

                <div className="flex-1 text-left">
                  <div className="mb-0.5 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                    {t(
                      translations.common.date,
                      locale
                    )}
                  </div>

                  <div className="text-sm font-medium text-[var(--brand-text)]">
                    {formattedDate}
                  </div>
                </div>
              </div>
            )}

            {draft.time && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--brand-secondary)]">
                  <Clock
                    className="h-5 w-5 text-[var(--brand-primary)]"
                    aria-hidden="true"
                  />
                </div>

                <div className="flex-1 text-left">
                  <div className="mb-0.5 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                    {t(
                      translations.common.time,
                      locale
                    )}
                  </div>

                  <div className="text-sm font-medium text-[var(--brand-text)]">
                    {draft.time}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="w-full max-w-sm rounded-2xl bg-[var(--brand-primary)] py-4 font-semibold text-[var(--brand-surface)] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
      >
        {t(translations.booking.done, locale)}
      </button>
    </div>
  );
}