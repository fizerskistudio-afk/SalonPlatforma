"use client";

import {
  ArrowUpRight,
  Clock3,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

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
  formatNailsServicePrice,
  getNailsCategoryLabel,
  nailsLabels,
} from "../nails-utils";

type NailsMobileServicesSectionProps = {
  categories:
    ServiceCategory[];
  currency: string;
  locale: Locale;
  services: Service[];
  onBookService: (
    serviceId: string
  ) => void;
};

const MOBILE_SERVICE_SHADES = [
  "#c2326d",
  "#ed9db6",
  "#762b4a",
  "#e88767",
  "#9e1f51",
] as const;

export default function NailsMobileServicesSection({
  categories,
  currency,
  locale,
  services,
  onBookService,
}: NailsMobileServicesSectionProps) {
  const availableCategories =
    useMemo(
      () =>
        categories.filter(
          (
            category
          ) =>
            services.some(
              (
                service
              ) =>
                service.categoryId ===
                category.id
            )
        ),
      [
        categories,
        services,
      ]
    );
  const [
    activeCategoryId,
    setActiveCategoryId,
  ] = useState(
    () =>
      availableCategories[0]
        ?.id || ""
  );
  const visibleServices =
    activeCategoryId
      ? services.filter(
          (
            service
          ) =>
            service.categoryId ===
            activeCategoryId
        )
      : services.slice(
          0,
          4
        );

  return (
    <section
      id="nails-mobile-services"
      className="relative min-h-full overflow-hidden py-9"
      data-nails-atelier="mobile-treatment-menu"
    >
      <div className="pointer-events-none absolute -left-32 top-32 h-80 w-80 rounded-full bg-[var(--brand-secondary)]/60 blur-3xl" />

      <header className="relative px-5">
        <p className="inline-flex rounded-full bg-[var(--brand-primary)] px-3.5 py-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-background)]">
          {t(
            nailsLabels.treatmentMenu,
            locale
          )}
        </p>

        <h2 className="mt-4 max-w-[11ch] font-display text-[2.45rem] font-medium italic leading-[0.88] tracking-[-0.05em]">
          {t(
            nailsLabels.servicesTitle,
            locale
          )}
        </h2>

        <p className="mt-4 text-[13px] leading-5 text-[var(--brand-muted)]">
          {t(
            nailsLabels.servicesIntro,
            locale
          )}
        </p>
      </header>

      <div className="no-scrollbar relative mt-5 flex gap-2 overflow-x-auto px-5 pb-2">
        {availableCategories.map(
          (
            category,
            index
          ) => (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                setActiveCategoryId(
                  category.id
                )
              }
              aria-pressed={
                activeCategoryId ===
                category.id
              }
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[9px] font-semibold uppercase tracking-[0.13em] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] ${activeCategoryId === category.id ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--brand-background)]" : "border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-muted)]"}`}
            >
              <span
                className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                style={{
                  backgroundColor:
                    MOBILE_SERVICE_SHADES[
                      index %
                        MOBILE_SERVICE_SHADES.length
                    ],
                }}
                aria-hidden="true"
              />

              {t(
                category.name,
                locale
              )}
            </button>
          )
        )}
      </div>

      <div className="relative mt-4 space-y-3 px-3">
        {visibleServices.map(
          (
            service,
            index
          ) => (
            <article
              key={service.id}
              className="grid grid-cols-[58px_minmax(0,1fr)] gap-4 overflow-hidden rounded-[2.5rem_2.5rem_2.5rem_0.75rem] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 shadow-sm"
            >
              <div className="flex items-end justify-center rounded-[1.6rem] bg-[var(--brand-background)] py-3">
                <span
                  className="h-[86px] w-8 rounded-[999px_999px_45%_45%] shadow-md"
                  style={{
                    backgroundColor:
                      MOBILE_SERVICE_SHADES[
                        index %
                          MOBILE_SERVICE_SHADES.length
                      ],
                  }}
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 py-1">
                <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-primary)]">
                  {getNailsCategoryLabel(
                    service,
                    categories,
                    locale
                  )}
                </p>

                <h3 className="mt-1.5 font-display text-2xl font-medium italic leading-tight tracking-[-0.025em]">
                  {t(
                    service.name,
                    locale
                  )}
                </h3>

                {service.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--brand-muted)]">
                    {t(
                      service.description,
                      locale
                    )}
                  </p>
                )}

                <div className="mt-4 flex items-end justify-between gap-3 border-t border-[var(--brand-border)] pt-3">
                  <div>
                    <strong className="block text-xs text-[var(--brand-primary)]">
                      {formatNailsServicePrice(
                        service,
                        currency,
                        locale
                      )}
                    </strong>

                    <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] text-[var(--brand-muted)]">
                      <Clock3
                        className="h-3 w-3"
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
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onBookService(
                        service.id
                      )
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-text)] text-[var(--brand-background)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
                    aria-label={t(
                      nailsLabels.bookService,
                      locale
                    )}
                  >
                    <ArrowUpRight
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </article>
          )
        )}

        {visibleServices.length ===
          0 && (
          <div className="rounded-[2.5rem] border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-14 text-center text-sm text-[var(--brand-muted)]">
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
