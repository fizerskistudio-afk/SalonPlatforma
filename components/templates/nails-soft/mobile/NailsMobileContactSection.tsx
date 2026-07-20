"use client";

import {
  ArrowUpRight,
  CalendarPlus,
  Clock3,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Sparkle,
} from "lucide-react";

import InstagramIcon from "@/components/shared/icons/InstagramIcon";
import {
  t,
  translations,
} from "@/lib/translations";

import type {
  CatalogBusiness,
  Locale,
} from "@/lib/types";

import {
  nailsLabels,
} from "../nails-utils";

type NailsMobileContactSectionProps = {
  business: CatalogBusiness;
  locale: Locale;
  locationLine: string;
  onBook: () => void;
  onSwitchToDesktop:
    () => void;
};

export default function NailsMobileContactSection({
  business,
  locale,
  locationLine,
  onBook,
  onSwitchToDesktop,
}: NailsMobileContactSectionProps) {
  const mapsHref =
    locationLine
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          locationLine
        )}`
      : null;

  return (
    <section
      id="nails-mobile-contact"
      className="relative min-h-full overflow-hidden px-3 py-9"
      data-nails-atelier="mobile-appointment-card"
    >
      <div className="overflow-hidden rounded-[3.5rem_1rem_3.5rem_1rem] border border-white/60 bg-[var(--brand-surface)] shadow-[0_24px_65px_rgba(55,28,42,0.13)]">
        <div className="relative isolate overflow-hidden bg-[var(--brand-primary)] p-6 pb-8 text-[var(--brand-background)]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border-[2.75rem] border-white/10" />

          <div className="relative">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
              <Sparkle
                className="h-3 w-3"
                aria-hidden="true"
              />

              {t(
                nailsLabels.appointmentLabel,
                locale
              )}
            </p>

            <h2 className="mt-5 max-w-[10ch] font-display text-[2.75rem] font-medium italic leading-[0.84] tracking-[-0.055em]">
              {t(
                nailsLabels.visitTitle,
                locale
              )}
            </h2>

            <p className="mt-5 text-sm leading-6 text-white/72">
              {t(
                nailsLabels.contactIntro,
                locale
              )}
            </p>

            <button
              type="button"
              onClick={onBook}
              className="mt-7 inline-flex min-h-13 w-full items-center justify-between rounded-full bg-[var(--brand-background)] px-5 text-sm font-semibold text-[var(--brand-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-primary)]"
            >
              {t(
                translations.hero.bookNow,
                locale
              )}

              <CalendarPlus
                className="h-5 w-5 text-[var(--brand-primary)]"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div className="space-y-3 p-5">
          {mapsHref && (
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-[2rem_2rem_2rem_0.75rem] bg-[var(--brand-background)] p-4 text-sm font-medium leading-6"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[var(--brand-background)]">
                <MapPin
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </span>

              <span className="pt-1.5">
                {locationLine}
              </span>

              <ArrowUpRight
                className="ml-auto mt-2 h-4 w-4 shrink-0 text-[var(--brand-primary)]"
                aria-hidden="true"
              />
            </a>
          )}

          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex min-h-12 items-center gap-3 rounded-full border border-[var(--brand-border)] px-4 text-sm font-medium"
            >
              <Phone
                className="h-4 w-4 text-[var(--brand-primary)]"
                aria-hidden="true"
              />

              {business.phone}
            </a>
          )}

          {business.email && (
            <a
              href={`mailto:${business.email}`}
              className="flex min-h-12 items-center gap-3 rounded-full border border-[var(--brand-border)] px-4 text-sm font-medium"
            >
              <Mail
                className="h-4 w-4 shrink-0 text-[var(--brand-primary)]"
                aria-hidden="true"
              />

              <span className="break-all">
                {business.email}
              </span>
            </a>
          )}

          <div className="flex min-h-12 items-center gap-3 rounded-full border border-[var(--brand-border)] px-4 text-sm text-[var(--brand-muted)]">
            <Clock3
              className="h-4 w-4 text-[var(--brand-primary)]"
              aria-hidden="true"
            />

            {business.timezone}
          </div>

          {business.instagramUrl && (
            <a
              href={business.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center gap-3 rounded-full border border-[var(--brand-border)] px-4 text-sm font-medium"
            >
              <InstagramIcon
                className="h-4 w-4 text-[var(--brand-primary)]"
                aria-hidden="true"
              />

              {business.instagramHandle ||
                t(
                  nailsLabels.followStudio,
                  locale
                )}
            </a>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={
          onSwitchToDesktop
        }
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] text-xs font-semibold text-[var(--brand-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
      >
        <Monitor
          className="h-4 w-4"
          aria-hidden="true"
        />

        {t(
          nailsLabels.openDesktop,
          locale
        )}
      </button>
    </section>
  );
}
