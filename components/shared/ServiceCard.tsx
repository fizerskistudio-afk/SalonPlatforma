"use client";

import type { MouseEvent } from "react";
import { Clock } from "lucide-react";

import type {
  Locale,
  Service,
  ServicePriceType,
} from "@/lib/types";
import { businessConfig } from "@/lib/config";
import {
  t,
  translations,
} from "@/lib/translations";

type ServiceCardBaseProps = {
  service: Service;
  locale: Locale;
};

type ServiceCardSelectableProps =
  ServiceCardBaseProps & {
    mode: "selectable";
    isSelected: boolean;
    onSelect: (serviceId: string) => void;
  };

type ServiceCardDisplayProps =
  ServiceCardBaseProps & {
    mode: "display";
    onBook: (serviceId: string) => void;
  };

type ServiceCardProps =
  | ServiceCardSelectableProps
  | ServiceCardDisplayProps;

function formatAmount(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value
    .toFixed(2)
    .replace(/\.?0+$/, "");
}

function formatCurrencyAmount(
  value: number,
  currency: string,
  locale: Locale
): string {
  const amount = formatAmount(value);

  switch (currency) {
    case "EUR":
      return locale === "en"
        ? `€${amount}`
        : `${amount} €`;

    case "USD":
      return `$${amount}`;

    case "GBP":
      return `£${amount}`;

    case "MKD":
      return `${amount} ден`;

    default:
      return `${amount} ${currency}`;
  }
}

function formatPrice(
  priceType: ServicePriceType,
  priceFrom: number,
  priceTo: number | undefined,
  currency: string,
  locale: Locale
): string {
  const formattedFrom = formatCurrencyAmount(
    priceFrom,
    currency,
    locale
  );

  if (priceType === "fixed") {
    return formattedFrom;
  }

  if (priceType === "from") {
    const prefix = t(
      translations.priceTypes.from,
      locale
    );

    return `${prefix} ${formattedFrom}`;
  }

  if (
    priceType === "range" &&
    priceTo !== undefined
  ) {
    const separator = t(
      translations.priceTypes.range,
      locale
    );

    const formattedTo = formatCurrencyAmount(
      priceTo,
      currency,
      locale
    );

    return `${formattedFrom} ${separator} ${formattedTo}`;
  }

  return formattedFrom;
}

export default function ServiceCard(
  props: ServiceCardProps
) {
  const { service, locale } = props;

  const price = formatPrice(
    service.priceType,
    service.priceFrom,
    service.priceTo,
    businessConfig.currency,
    locale
  );

  if (props.mode === "selectable") {
    const { isSelected, onSelect } = props;

    return (
      <button
        type="button"
        onClick={() => onSelect(service.id)}
        aria-pressed={isSelected}
        aria-label={`${t(
          service.name,
          locale
        )} - ${price}`}
        className={`group relative w-full rounded-2xl border-2 bg-[var(--brand-surface)] p-5 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none ${
          isSelected
            ? "border-[var(--brand-primary)] shadow-lg"
            : "border-[var(--brand-border)] hover:border-[var(--brand-primary)] hover:shadow-md"
        }`}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-[var(--brand-text)] transition-colors group-hover:text-[var(--brand-primary)] motion-reduce:transition-none">
              {t(service.name, locale)}
            </h3>

            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[var(--brand-muted)]">
              <Clock
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              <span>
                {service.durationMinutes}{" "}
                {t(
                  translations.booking.minutes,
                  locale
                )}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <div className="font-display text-lg font-semibold text-[var(--brand-primary)]">
              {price}
            </div>

            {isSelected && (
              <div
                className="mt-1 text-xs font-medium text-[var(--brand-primary)]"
                aria-hidden="true"
              >
                ✓
              </div>
            )}
          </div>
        </div>
      </button>
    );
  }

  const { onBook } = props;

  const handleBook = (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    onBook(service.id);
  };

  return (
    <article className="group relative rounded-2xl border-2 border-[var(--brand-border)] bg-[var(--brand-surface)] p-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-[var(--brand-text)]">
            {t(service.name, locale)}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[var(--brand-muted)]">
            <Clock
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />

            <span>
              {service.durationMinutes}{" "}
              {t(
                translations.booking.minutes,
                locale
              )}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className="font-display text-lg font-semibold text-[var(--brand-primary)]">
            {price}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleBook}
        aria-label={`${t(
          translations.nav.book,
          locale
        )} ${t(service.name, locale)}`}
        className="mt-3 w-full rounded-xl bg-[var(--brand-text)] py-2.5 text-sm font-medium text-[var(--brand-surface)] transition-colors hover:bg-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
      >
        {t(translations.nav.book, locale)}
      </button>
    </article>
  );
}