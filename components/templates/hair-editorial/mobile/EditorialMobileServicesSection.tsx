"use client";

import {
  ArrowUpRight,
  Clock3,
} from "lucide-react";

import {
  t,
  translations,
} from "@/lib/translations";

import type {
  Locale,
  Service,
  ServiceCategory,
} from "@/lib/types";

import {
  editorialLabels,
  formatServicePrice,
  getCategoryLabel,
} from "../editorial-utils";

type EditorialMobileServicesSectionProps = {
  categories:
    ServiceCategory[];
  currency: string;
  locale: Locale;
  services: Service[];
  onBookService: (
    serviceId: string
  ) => void;
};

export default function EditorialMobileServicesSection({
  categories,
  currency,
  locale,
  services,
  onBookService,
}: EditorialMobileServicesSectionProps) {
  return (
    <section
      id="editorial-mobile-services"
      className="border-y border-[var(--brand-border)] py-10"
    >
      <div className="px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
          01 /{" "}
          {t(
            translations.nav.services,
            locale
          )}
        </p>

        <h2 className="font-display mt-4 text-4xl font-medium leading-[0.95] tracking-[-0.035em]">
          {t(
            editorialLabels
              .signatureServices,
            locale
          )}
        </h2>

        <p className="mt-4 text-sm leading-6 text-[var(--brand-muted)]">
          {t(
            editorialLabels
              .servicesIntro,
            locale
          )}
        </p>
      </div>

      <div className="mt-8 space-y-2 px-3">
        {services.map(
          (
            service,
            index
          ) => (
            <article
              key={service.id}
              className="rounded-[1.5rem] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}{" "}
                    /{" "}
                    {getCategoryLabel(
                      service,
                      categories,
                      locale
                    )}
                  </p>

                  <h3 className="font-display mt-2 text-2xl font-medium leading-tight">
                    {t(
                      service.name,
                      locale
                    )}
                  </h3>
                </div>

                <p className="shrink-0 text-sm font-semibold">
                  {formatServicePrice(
                    service,
                    currency,
                    locale
                  )}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--brand-border)] pt-4">
                <span className="inline-flex items-center gap-2 text-xs text-[var(--brand-muted)]">
                  <Clock3
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />

                  {
                    service
                      .durationMinutes
                  }{" "}
                  {t(
                    translations.booking
                      .minutes,
                    locale
                  )}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    onBookService(
                      service.id
                    )
                  }
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--brand-text)] px-4 text-xs font-semibold text-[var(--brand-background)] transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transform-none motion-reduce:transition-none"
                >
                  {t(
                    translations.nav.book,
                    locale
                  )}

                  <ArrowUpRight
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </article>
          )
        )}

        {services.length ===
          0 && (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--brand-border)] px-5 py-12 text-center text-sm text-[var(--brand-muted)]">
            {t(
              translations.common
                .noServicesDescription,
              locale
            )}
          </div>
        )}
      </div>
    </section>
  );
}
