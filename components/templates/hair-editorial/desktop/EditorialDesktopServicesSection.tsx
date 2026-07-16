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

type EditorialDesktopServicesSectionProps = {
  categories:
    ServiceCategory[];
  currency: string;
  locale: Locale;
  services: Service[];
  onBookService: (
    serviceId: string
  ) => void;
};

export default function EditorialDesktopServicesSection({
  categories,
  currency,
  locale,
  services,
  onBookService,
}: EditorialDesktopServicesSectionProps) {
  return (
    <section
      id="editorial-services"
      className="border-y border-[var(--brand-border)]"
    >
      <div className="mx-auto grid max-w-[1500px] grid-cols-[0.68fr_1.32fr]">
        <div className="border-r border-[var(--brand-border)] px-8 py-20 xl:px-12 xl:py-28">
          <div className="sticky top-32">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
              01 /{" "}
              {t(
                translations.nav.services,
                locale
              )}
            </p>

            <h2 className="font-display mt-6 max-w-lg text-6xl font-medium leading-[0.92] tracking-[-0.04em]">
              {t(
                editorialLabels
                  .signatureServices,
                locale
              )}
            </h2>

            <p className="mt-8 max-w-md text-base leading-7 text-[var(--brand-muted)]">
              {t(
                editorialLabels
                  .servicesIntro,
                locale
              )}
            </p>
          </div>
        </div>

        <div>
          {services.map(
            (
              service,
              index
            ) => (
              <article
                key={service.id}
                className="group grid grid-cols-[60px_minmax(0,1fr)_auto] items-center gap-6 border-b border-[var(--brand-border)] px-8 py-8 last:border-b-0 xl:px-12"
              >
                <span className="font-display text-2xl text-[var(--brand-muted)]/60">
                  {String(
                    index + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                    {getCategoryLabel(
                      service,
                      categories,
                      locale
                    )}
                  </p>

                  <h3 className="font-display mt-2 text-3xl font-medium tracking-[-0.02em] transition-colors group-hover:text-[var(--brand-primary)] motion-reduce:transition-none">
                    {t(
                      service.name,
                      locale
                    )}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--brand-muted)]">
                    <span className="inline-flex items-center gap-2">
                      <Clock3
                        className="h-4 w-4"
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

                    {service.description && (
                      <span className="line-clamp-1 max-w-xl">
                        {t(
                          service.description,
                          locale
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className="whitespace-nowrap text-base font-semibold">
                    {formatServicePrice(
                      service,
                      currency,
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
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--brand-border)] transition group-hover:border-[var(--brand-primary)] group-hover:bg-[var(--brand-primary)] group-hover:text-[var(--brand-background)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
                    aria-label={`${t(
                      editorialLabels
                        .bookService,
                      locale
                    )}: ${t(
                      service.name,
                      locale
                    )}`}
                  >
                    <ArrowUpRight
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </article>
            )
          )}

          {services.length ===
            0 && (
            <div className="px-8 py-24 text-center text-[var(--brand-muted)] xl:px-12">
              {t(
                translations.common
                  .noServicesDescription,
                locale
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
