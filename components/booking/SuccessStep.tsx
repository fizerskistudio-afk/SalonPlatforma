"use client";

import {
  Calendar,
  Clock,
  Clock3,
  Coins,
  Hash,
  PartyPopper,
  Scissors,
  Timer,
  UserRound,
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
    serviceId: string;
    employeeId: string;
    startsAt: string;
    endsAt: string;
    durationMinutes: number;
    priceAmount: number;
    currency: string;
  } | null;

  onDone: () => void;
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

const confirmedTitles: LocalizedText = {
  "sr-Latn": "Rezervacija je potvrđena!",
  mk: "Резервацијата е потврдена!",
  sq: "Rezervimi u konfirmua!",
  en: "Booking confirmed!",
};

const confirmedMessages: LocalizedText = {
  "sr-Latn": "Tvoj termin je uspešno potvrđen. Radujemo se tvom dolasku.",
  mk: "Вашиот термин е успешно потврден. Со нетрпение ве очекуваме.",
  sq: "Orari juaj u konfirmua me sukses. Me kënaqësi ju presim.",
  en: "Your appointment is confirmed. We look forward to seeing you.",
};

const pendingTitles: LocalizedText = {
  "sr-Latn": "Rezervacija je primljena",
  mk: "Резервацијата е примена",
  sq: "Rezervimi u pranua",
  en: "Booking received",
};

const pendingMessages: LocalizedText = {
  "sr-Latn": "Tvoj termin je sačuvan i čeka potvrdu salona. Salon će te uskoro kontaktirati.",
  mk: "Вашиот термин е зачуван и чека потврда од салонот. Салонот ќе ве контактира наскоро.",
  sq: "Orari juaj u ruajt dhe pret konfirmimin e sallonit. Salloni do t’ju kontaktojë së shpejti.",
  en: "Your appointment is reserved and awaiting confirmation from the salon. The salon will contact you shortly.",
};

const referenceLabels: LocalizedText = {
  "sr-Latn": "Broj rezervacije",
  mk: "Број на резервација",
  sq: "Numri i rezervimit",
  en: "Booking reference",
};

const confirmedStatusLabels: LocalizedText =
  {
    "sr-Latn": "Potvrđena",
    mk: "Потврдена",
    sq: "Konfirmuar",
    en: "Confirmed",
  };

const pendingStatusLabels: LocalizedText =
  {
    "sr-Latn": "Čeka potvrdu",
    mk: "Чека потврда",
    sq: "Në pritje",
    en: "Awaiting confirmation",
  };

const durationLabels: LocalizedText = {
  "sr-Latn": "Trajanje",
  mk: "Времетраење",
  sq: "Kohëzgjatja",
  en: "Duration",
};

const priceLabels: LocalizedText = {
  "sr-Latn": "Cena",
  mk: "Цена",
  sq: "Çmimi",
  en: "Price",
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

function formatDraftDate(
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
    Number.isNaN(day)
  ) {
    return null;
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

function formatSavedDateTime(
  startsAt: string,
  locale: Locale,
  timezone: string
): {
  date: string;
  time: string;
} | null {
  const date =
    new Date(startsAt);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  try {
    return {
      date: new Intl.DateTimeFormat(
        resolveIntlLocale(locale),
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: timezone,
        }
      ).format(date),

      time: new Intl.DateTimeFormat(
        resolveIntlLocale(locale),
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: timezone,
        }
      ).format(date),
    };
  } catch {
    return null;
  }
}

function formatPrice(
  amount: number,
  currency: string,
  locale: Locale
): string {
  try {
    return new Intl.NumberFormat(
      resolveIntlLocale(locale),
      {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export default function SuccessStep({
  locale,
  draft,
  booking,
  onDone,
}: SuccessStepProps) {
  const {
    business,
    services,
    employees,
  } = useCatalogData();

  const serviceId =
    booking?.serviceId ??
    draft.serviceId;

  const employeeId =
    booking?.employeeId ??
    null;

  const service = serviceId
    ? services.find(
        (item) =>
          item.id === serviceId
      ) ?? null
    : null;

  const employee = employeeId
    ? employees.find(
        (item) =>
          item.id === employeeId
      ) ?? null
    : null;

  const savedDateTime =
    booking
      ? formatSavedDateTime(
          booking.startsAt,
          locale,
          business.timezone
        )
      : null;

  const formattedDate =
    savedDateTime?.date ??
    formatDraftDate(
      draft.date,
      locale
    );

  const formattedTime =
    savedDateTime?.time ??
    draft.time;

  const isPending =
    booking?.status ===
    "pending";

  const title = isPending
    ? getLocalizedLabel(pendingTitles, locale)
    : getLocalizedLabel(confirmedTitles, locale);

  const message = isPending
    ? getLocalizedLabel(pendingMessages, locale)
    : getLocalizedLabel(confirmedMessages, locale);

  const statusLabel = isPending
    ? getLocalizedLabel(pendingStatusLabels, locale)
    : getLocalizedLabel(confirmedStatusLabels, locale);

  const formattedPrice =
    booking
      ? formatPrice(
          booking.priceAmount,
          booking.currency,
          locale
        )
      : null;

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

      <div className="mb-8 w-full max-w-md rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5">
        <div className="space-y-3">
          {booking?.referenceCode && (
            <div className="flex items-center gap-3 rounded-xl bg-[var(--brand-secondary)] p-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--brand-surface)]">
                <Hash
                  className="h-5 w-5 text-[var(--brand-primary)]"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1 text-left">
                <div className="mb-0.5 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                  {
                    getLocalizedLabel(referenceLabels, locale)
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

              <div className="min-w-0 flex-1 text-left">
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

          {employee && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--brand-secondary)]">
                <UserRound
                  className="h-5 w-5 text-[var(--brand-primary)]"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1 text-left">
                <div className="mb-0.5 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                  {t(
                    translations.common
                      .stylist,
                    locale
                  )}
                </div>

                <div className="text-sm font-medium text-[var(--brand-text)]">
                  {employee.name}
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

              <div className="min-w-0 flex-1 text-left">
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

          {formattedTime && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--brand-secondary)]">
                <Clock
                  className="h-5 w-5 text-[var(--brand-primary)]"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1 text-left">
                <div className="mb-0.5 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                  {t(
                    translations.common
                      .time,
                    locale
                  )}
                </div>

                <div className="text-sm font-medium text-[var(--brand-text)]">
                  {formattedTime}
                </div>
              </div>
            </div>
          )}

          {booking && (
            <div className="grid gap-3 border-t border-[var(--brand-border)] pt-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-[var(--brand-secondary)] p-3">
                <Timer
                  className="h-5 w-5 flex-shrink-0 text-[var(--brand-primary)]"
                  aria-hidden="true"
                />

                <div className="min-w-0 text-left">
                  <div className="text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                    {
                      getLocalizedLabel(durationLabels, locale)
                    }
                  </div>

                  <div className="mt-0.5 text-sm font-semibold text-[var(--brand-text)]">
                    {
                      booking.durationMinutes
                    }{" "}
                    {t(
                      translations.booking
                        .minutes,
                      locale
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-[var(--brand-secondary)] p-3">
                <Coins
                  className="h-5 w-5 flex-shrink-0 text-[var(--brand-primary)]"
                  aria-hidden="true"
                />

                <div className="min-w-0 text-left">
                  <div className="text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                    {
                      getLocalizedLabel(priceLabels, locale)
                    }
                  </div>

                  <div className="mt-0.5 text-sm font-semibold text-[var(--brand-text)]">
                    {formattedPrice}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="w-full max-w-md rounded-2xl bg-[var(--brand-primary)] py-4 font-semibold text-[var(--brand-surface)] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
      >
        {t(
          translations.booking.done,
          locale
        )}
      </button>
    </div>
  );
}