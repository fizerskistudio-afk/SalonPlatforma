"use client";

import type {
  Locale,
  Service,
  ServicePriceType,
} from "@/lib/types";
import { businessConfig } from "@/lib/config";
import { t, translations } from "@/lib/translations";
import { Clock } from "lucide-react";

type ServiceCardBaseProps = {
  service: Service;
  locale: Locale;
};

type ServiceCardSelectableProps = ServiceCardBaseProps & {
  mode: "selectable";
  isSelected: boolean;
  onSelect: (serviceId: string) => void;
};

type ServiceCardDisplayProps = ServiceCardBaseProps & {
  mode: "display";
  onBook: (serviceId: string) => void;
};

type ServiceCardProps =
  | ServiceCardSelectableProps
  | ServiceCardDisplayProps;

const intlLocaleMap: Record<Locale, string> = {
  mk: "mk-MK",
  sq: "sq-MK",
  en: "en-GB",
};

function formatPrice(
  priceType: ServicePriceType,
  priceFrom: number,
  priceTo: number | undefined,
  currency: string,
  locale: Locale
): string {
  const formatter = new Intl.NumberFormat(
    intlLocaleMap[locale],
    {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  );

  if (priceType === "fixed") {
    return formatter.format(priceFrom);
  }

  if (priceType === "from") {
    const prefix = t(
      translations.priceTypes.from,
      locale
    );

    return `${prefix} ${formatter.format(priceFrom)}`;
  }

  if (
    priceType === "range" &&
    priceTo !== undefined
  ) {
    const separator = t(
      translations.priceTypes.range,
      locale
    );

    return `${formatter.format(
      priceFrom
    )} ${separator} ${formatter.format(priceTo)}`;
  }

  return formatter.format(priceFrom);
}

export default function ServiceCard(
  props: ServiceCardProps
) {
  const { service, locale } = props;
  const { currency } = businessConfig;

  const serviceName = t(service.name, locale);

  const minutesLabel = t(
    translations.booking.minutes,
    locale
  );

  const price = formatPrice(
    service.priceType,
    service.priceFrom,
    service.priceTo,
    currency,
    locale
  );

  if (props.mode === "selectable") {
    const { isSelected, onSelect } = props;

    return (
      <button
        type="button"
        onClick={() => onSelect(service.id)}
        className={`group relative w-full rounded-2xl border-2 p-5 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none ${
          isSelected
            ? "border-[var(--brand-primary)] bg-[var(--brand-surface)] shadow-lg"
            : "border-[var(--brand-border)] bg-[var(--brand-surface)] hover:border-[var(--brand-primary)] hover:shadow-md"
        }`}
        aria-pressed={isSelected}
        aria-label={`${serviceName} - ${price}`}
      >
        <span className="flex items-start justify-between gap-4">
          <span className="block flex-1">
            <span className="block font-medium text-[var(--brand-text)] transition-colors group-hover:text-[var(--brand-primary)] motion-reduce:transition-none">
              {serviceName}
            </span>

            <span className="mt-1.5 flex items-center gap-1.5 text-sm text-[var(--brand-muted)]">
              <Clock
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              <span>
                {service.durationMinutes} {minutesLabel}
              </span>
            </span>
          </span>

          <span className="block text-right">
            <span className="font-display block text-lg font-semibold text-[var(--brand-primary)]">
              {price}
            </span>

            {isSelected && (
              <span
                className="mt-1 block text-xs font-medium text-[var(--brand-primary)]"
                aria-hidden="true"
              >
                ✓
              </span>
            )}
          </span>
        </span>
      </button>
    );
  }

  const bookLabel = t(
    translations.nav.book,
    locale
  );

  return (
    <article className="group relative rounded-2xl border-2 border-[var(--brand-border)] bg-[var(--brand-surface)] p-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-[var(--brand-text)]">
            {serviceName}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[var(--brand-muted)]">
            <Clock
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />

            <span>
              {service.durationMinutes} {minutesLabel}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="font-display text-lg font-semibold text-[var(--brand-primary)]">
            {price}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => props.onBook(service.id)}
        className="mt-3 w-full rounded-xl bg-[var(--brand-text)] py-2.5 text-sm font-medium text-[var(--brand-surface)] transition-colors hover:bg-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
        aria-label={`${bookLabel} ${serviceName}`}
      >
        {bookLabel}
      </button>
    </article>
  );
}