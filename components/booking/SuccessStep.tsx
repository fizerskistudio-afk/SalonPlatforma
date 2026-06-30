"use client";

import {
  Calendar,
  Clock,
  Clock3,
  Hash,
  PartyPopper,
  Scissors,
} from "lucide-react";

import { useCatalogData } from "@/lib/catalogContext";
import {
  t,
  translations,
} from "@/lib/translations";
import type {
  BookingDraft,
  Locale,
} from "@/lib/types";

type SuccessStepProps = {
  locale: Locale;
  draft: BookingDraft;

  booking: {
    referenceCode: string;
    status: string;
  } | null;

  onDone: () => void;
};

const intlLocaleMap: Record<
  Locale,
  string
> = {
  mk: "mk-MK",
  sq: "sq-MK",
  en: "en-GB",
};

const confirmedTitles: Record<
  Locale,
  string
> = {
  mk: "Резервацијата е потврдена!",
  sq: "Rezervimi u konfirmua!",
  en: "Booking confirmed!",
};

const confirmedMessages: Record<
  Locale,
  string
> = {
  mk: "Вашиот термин е успешно потврден. Со нетрпение ве очекуваме.",
  sq: "Orari juaj u konfirmua me sukses. Me kënaqësi ju presim.",
  en: "Your appointment is confirmed. We look forward to seeing you.",
};

const pendingTitles: Record<
  Locale,
  string
> = {
  mk: "Резервацијата е примена",
  sq: "Rezervimi u pranua",
  en: "Booking received",
};

const pendingMessages: Record<
  Locale,
  string
> = {
  mk: "Вашиот термин е зачуван и чека потврда од салонот. Салонот ќе ве контактира наскоро.",
  sq: "Orari juaj u ruajt dhe pret konfirmimin e sallonit. Salloni do t’ju kontaktojë së shpejti.",
  en: "Your appointment is reserved and awaiting confirmation from the salon. The salon will contact you shortly.",
};

const referenceLabels: Record<
  Locale,
  string
> = {
  mk: "Број на резервација",
  sq: "Numri i rezervimit",
  en: "Booking reference",
};

const confirmedStatusLabels: Record<
  Locale,
  string
> = {
  mk: "Потврдена",
  sq: "Konfirmuar",
  en: "Confirmed",
};

const pendingStatusLabels: Record<
  Locale,
  string
> = {
  mk: "Чека потврда",
  sq: "Në pritje",
  en: "Awaiting confirmation",
};

function formatDisplayDate(
  dateString: string | null,
  locale: Locale
): string | null {
  if (!dateString) {
    return null;
  }

  const parts =
    dateString.split("-");

  if (parts.length !== 3) {
    return null;
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
    return null;
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

export default function SuccessStep({
  locale,
  draft,
  booking,
  onDone,
}: SuccessStepProps) {
  const {
    services,
  } = useCatalogData();

  const service =
    draft.serviceId
      ? services.find(
          (item) =>
            item.id ===
              draft.serviceId &&
            item.isActive
        ) ?? null
      : null;

  const formattedDate =
    formatDisplayDate(
      draft.date,
      locale
    );

  const isPending =
    booking?.status ===
    "pending";

  const title = isPending
    ? pendingTitles[locale]
    : confirmedTitles[locale];

  const message = isPending
    ? pendingMessages[locale]
    : confirmedMessages[locale];

  const statusLabel = isPending
    ? pendingStatusLabels[locale]
    : confirmedStatusLabels[locale];

  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-10 text-center sm:py-12"
      role="status"
      aria-live="polite"
    >
      <div className="relative mb-6">
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full ${
            isPending
              ? "border border-[var(--brand-border)] bg-[var(--brand-secondary)]"
              : "animate-pulse bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] motion-reduce:animate-none"
          }`}
        >
          {isPending ? (
            <Clock3
              className="h-12 w-12 text-[var(--brand-primary)]"
              aria-hidden="true"
            />
          ) : (
            <PartyPopper
              className="h-12 w-12 text-[var(--brand-surface)]"
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      <span
        className={`mb-4 rounded-full border px-3 py-1.5 text-xs font-semibold ${
          isPending
            ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
        }`}
      >
        {statusLabel}
      </span>

      <h2 className="font-display mb-3 text-3xl font-semibold text-[var(--brand-text)]">
        {title}
      </h2>

      <p className="mb-8 max-w-md leading-relaxed text-[var(--brand-muted)]">
        {message}
      </p>

      <div className="mb-8 w-full max-w-sm rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5">
        <div className="space-y-3">
          {booking?.referenceCode && (
            <div className="flex items-center gap-3 rounded-xl bg-[var(--brand-secondary)] p-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--brand-surface)]">
                <Hash
                  className="h-5 w-5 text-[var(--brand-primary)]"
                  aria-hidden="true"
                />
              </div>

              <div className="flex-1 text-left">
                <div className="mb-0.5 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                  {
                    referenceLabels[
                      locale
                    ]
                  }
                </div>

                <div className="break-all text-sm font-bold tracking-wider text-[var(--brand-text)]">
                  {
                    booking.referenceCode
                  }
                </div>
              </div>
            </div>
          )}

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
                    translations.common
                      .service,
                    locale
                  )}
                </div>

                <div className="text-sm font-medium text-[var(--brand-text)]">
                  {t(
                    service.name,
                    locale
                  )}
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
                    translations.common
                      .date,
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
                    translations.common
                      .time,
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

      <button
        type="button"
        onClick={onDone}
        className="w-full max-w-sm rounded-2xl bg-[var(--brand-primary)] py-4 font-semibold text-[var(--brand-surface)] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
      >
        {t(
          translations.booking.done,
          locale
        )}
      </button>
    </div>
  );
}