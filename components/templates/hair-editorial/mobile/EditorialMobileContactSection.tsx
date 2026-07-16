"use client";

import {
  CalendarPlus,
  Mail,
  MapPin,
  Monitor,
  Phone,
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
  editorialLabels,
} from "../editorial-utils";

type EditorialMobileContactSectionProps = {
  business: CatalogBusiness;
  locale: Locale;
  locationLine: string;
  onBook: () => void;
  onSwitchToDesktop:
    () => void;
};

export default function EditorialMobileContactSection({
  business,
  locale,
  locationLine,
  onBook,
  onSwitchToDesktop,
}: EditorialMobileContactSectionProps) {
  return (
    <section
      id="editorial-mobile-contact"
      className="px-3 py-12"
    >
      <div className="rounded-[2rem] bg-[var(--brand-primary)] p-6 text-[var(--brand-background)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-60">
          04 /{" "}
          {t(
            translations.nav.contact,
            locale
          )}
        </p>

        <h2 className="font-display mt-5 text-5xl font-medium leading-[0.9] tracking-[-0.045em]">
          {t(
            editorialLabels
              .visitStudio,
            locale
          )}
        </h2>

        <div className="mt-8 space-y-5">
          {locationLine && (
            <div className="flex items-start gap-3">
              <MapPin
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />

              <span className="text-sm font-medium leading-6">
                {locationLine}
              </span>
            </div>
          )}

          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex items-center gap-3 text-sm font-medium"
            >
              <Phone
                className="h-5 w-5 shrink-0"
                aria-hidden="true"
              />

              {business.phone}
            </a>
          )}

          {business.email && (
            <a
              href={`mailto:${business.email}`}
              className="flex items-center gap-3 break-all text-sm font-medium"
            >
              <Mail
                className="h-5 w-5 shrink-0"
                aria-hidden="true"
              />

              {business.email}
            </a>
          )}

          {business.instagramUrl && (
            <a
              href={
                business.instagramUrl
              }
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-sm font-medium"
            >
              <InstagramIcon
                className="h-5 w-5 shrink-0"
                aria-hidden="true"
              />

              {business.instagramHandle ||
                t(
                  editorialLabels
                    .followStudio,
                  locale
                )}
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={onBook}
          className="mt-8 inline-flex min-h-13 w-full items-center justify-between rounded-full bg-[var(--brand-background)] px-5 text-sm font-semibold text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-background)] focus:ring-offset-2 focus:ring-offset-[var(--brand-primary)]"
        >
          {t(
            translations.hero.bookNow,
            locale
          )}

          <CalendarPlus
            className="h-5 w-5"
            aria-hidden="true"
          />
        </button>
      </div>

      <button
        type="button"
        onClick={
          onSwitchToDesktop
        }
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] text-xs font-semibold text-[var(--brand-muted)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
      >
        <Monitor
          className="h-4 w-4"
          aria-hidden="true"
        />

        {t(
          editorialLabels
            .openDesktop,
          locale
        )}
      </button>
    </section>
  );
}
