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

type NailsDesktopServicesSectionProps = {
  categories:
    ServiceCategory[];
  currency: string;
  locale: Locale;
  services: Service[];
  onBook: () => void;
  onBookService: (
    serviceId: string
  ) => void;
};

const SERVICE_SHADES = [
  "#c2326d",
  "#ed9db6",
  "#762b4a",
  "#e88767",
  "#9e1f51",
  "#e7bbc7",
] as const;

export default function NailsDesktopServicesSection({
  categories,
  currency,
  locale,
  services,
  onBook,
  onBookService,
}: NailsDesktopServicesSectionProps) {
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
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState<
    string | null
  >(
    null
  );
  const activeCategoryId =
    selectedCategoryId &&
    availableCategories.some(
      (
        category
      ) =>
        category.id ===
        selectedCategoryId
    )
      ? selectedCategoryId
      : availableCategories[0]
          ?.id ?? null;
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
      id="nails-services"
      className="relative isolate overflow-hidden border-b border-[var(--brand-border)] bg-[var(--brand-background)]"
      data-nails-atelier="treatment-menu"
    >
      <div className="pointer-events-none absolute -left-52 bottom-12 h-[38rem] w-[38rem] rounded-full bg-[var(--brand-secondary)]/55 blur-3xl" />

      <div className="relative mx-auto max-w-[1320px] px-8 py-20 xl:px-10 xl:py-24">
        <header className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <p className="inline-flex rounded-full bg-[var(--brand-primary)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-background)]">
              {t(
                nailsLabels.treatmentMenu,
                locale
              )}
            </p>

            <h2 className="mt-6 max-w-[12ch] font-display text-[clamp(3.6rem,5vw,5.7rem)] font-medium italic leading-[0.86] tracking-[-0.05em]">
              {t(
                nailsLabels.servicesTitle,
                locale
              )}
            </h2>
          </div>

          <p className="rounded-[2rem_2rem_0.75rem_2rem] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 text-sm leading-7 text-[var(--brand-muted)] shadow-sm">
            {t(
              nailsLabels.servicesIntro,
              locale
            )}
          </p>
        </header>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:gap-10">
          <aside className="overflow-hidden rounded-[2.5rem_2.5rem_2.5rem_1rem] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-[0_20px_60px_rgba(55,28,42,0.07)] lg:sticky lg:top-24">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-muted)]">
              {t(
                nailsLabels.treatmentMenu,
                locale
              )}
            </p>

            <div className="mt-5 space-y-1.5">
              {availableCategories.map(
                (
                  category,
                  index
                ) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategoryId(
                        category.id
                      )
                    }
                    aria-pressed={
                      activeCategoryId ===
                      category.id
                    }
                    className={`flex min-h-11 w-full items-center gap-3 rounded-full px-3 text-left text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] motion-reduce:transition-none ${activeCategoryId === category.id ? "bg-[var(--brand-primary)] text-[var(--brand-background)]" : "text-[var(--brand-muted)] hover:bg-[var(--brand-background)]"}`}
                  >
                    <span
                      className="h-7 w-7 rounded-full border-[3px] border-white shadow-sm"
                      style={{
                        backgroundColor:
                          SERVICE_SHADES[
                            index %
                              SERVICE_SHADES.length
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

            <div className="mt-6 flex items-end justify-center gap-2 rounded-[2rem] bg-[var(--brand-background)] px-5 py-5" aria-hidden="true">
              {SERVICE_SHADES.slice(
                0,
                5
              ).map(
                (
                  shade,
                  index
                ) => (
                  <span
                    key={shade}
                    className="rounded-[999px_999px_45%_45%] shadow-md"
                    style={{
                      width:
                        `${24 + index * 2}px`,
                      height:
                        `${60 + (index % 2) * 15}px`,
                      backgroundColor:
                        shade,
                    }}
                  />
                )
              )}
            </div>
          </aside>

          <div className="space-y-3">
            {visibleServices.map(
              (
                service,
                index
              ) => (
                <article
                  key={service.id}
                  className="group grid min-h-[136px] grid-cols-[72px_minmax(0,1fr)_160px] items-center gap-5 overflow-hidden rounded-[2.1rem_2.1rem_2.1rem_0.75rem] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 pr-5 shadow-sm transition-[transform,border-color,box-shadow] hover:-translate-y-1 hover:border-[var(--brand-primary)]/40 hover:shadow-[0_18px_45px_color-mix(in_srgb,var(--brand-primary)_9%,transparent)] motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <div className="flex h-[104px] items-end justify-center rounded-[1.65rem] bg-[var(--brand-background)] pb-3">
                    <span
                      className="h-[76px] w-8 rounded-[999px_999px_45%_45%] shadow-[0_10px_22px_rgba(55,28,42,0.18)]"
                      style={{
                        backgroundColor:
                          SERVICE_SHADES[
                            index %
                              SERVICE_SHADES.length
                          ],
                      }}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                      {getNailsCategoryLabel(
                        service,
                        categories,
                        locale
                      )}
                    </p>

                    <h3 className="mt-1.5 line-clamp-2 font-display text-[1.65rem] font-medium italic leading-tight tracking-[-0.025em]">
                      {t(
                        service.name,
                        locale
                      )}
                    </h3>

                    {service.description && (
                      <p className="mt-1.5 line-clamp-2 max-w-2xl text-xs leading-5 text-[var(--brand-muted)]">
                        {t(
                          service.description,
                          locale
                        )}
                      </p>
                    )}
                  </div>

                  <div className="border-l border-[var(--brand-border)] pl-5">
                    <strong className="block font-display text-xl font-medium text-[var(--brand-primary)]">
                      {formatNailsServicePrice(
                        service,
                        currency,
                        locale
                      )}
                    </strong>

                    <span className="mt-2 inline-flex items-center gap-2 text-xs text-[var(--brand-muted)]">
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
                      className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--brand-text)] px-4 text-xs font-semibold text-[var(--brand-background)] transition group-hover:bg-[var(--brand-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] motion-reduce:transition-none"
                    >
                      {t(
                        nailsLabels.bookService,
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

            {visibleServices.length ===
              0 && (
              <div className="rounded-[3rem] border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-8 py-20 text-center text-[var(--brand-muted)]">
                {t(
                  translations.common
                    .noServicesDescription,
                  locale
                )}
              </div>
            )}
          </div>
        </div>

        {services.length > 0 && (
          <div className="mt-10 flex items-center justify-between gap-8 rounded-[2rem_2rem_2rem_0.75rem] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-7 py-5 shadow-sm">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
                {t(
                  nailsLabels.allTreatments,
                  locale
                )}
              </p>

              <p className="mt-1 text-sm text-[var(--brand-muted)]">
                {t(
                  nailsLabels.servicesIntro,
                  locale
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={onBook}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-xs font-semibold text-[var(--brand-background)] transition hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
            >
              {t(
                translations.hero.bookNow,
                locale
              )}

              <ArrowUpRight
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
