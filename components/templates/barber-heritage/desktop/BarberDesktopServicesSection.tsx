
"use client";

import {
  ArrowUpRight,
  Clock3,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  t,
} from "@/lib/translations";

import type {
  Locale,
  LocalizedText,
  Service,
  ServiceCategory,
} from "@/lib/types";

import {
  barberLabels,
  formatServicePrice,
} from "../barber-utils";
import BarberDesktopServicesBackdrop from "./BarberDesktopServicesBackdrop";

const desktopServicesSlogan = {
  "sr-Latn":
    "Preciznost nije detalj. Ona je standard.",
  mk:
    "Прецизноста не е детаљ. Таа е стандард.",
  hr:
    "Preciznost nije detalj. Ona je standard.",
  sq:
    "Saktësia nuk është detaj. Ajo është standard.",
  en:
    "Precision is not a detail. It is the standard.",
  de:
    "Präzision ist kein Detail. Sie ist der Standard.",
  fr:
    "La précision n’est pas un détail. C’est la norme.",
} satisfies LocalizedText;

const activeCategoryLabel = {
  "sr-Latn": "Aktivno",
  mk: "Активно",
  hr: "Aktivno",
  sq: "Aktive",
  en: "Viewing",
  de: "Aktiv",
  fr: "Actif",
} satisfies LocalizedText;

type BarberDesktopServicesSectionProps = {
  categories:
    ServiceCategory[];
  currency: string;
  locale: Locale;
  services: Service[];
  onBookService: (
    serviceId: string
  ) => void;
};

export default function BarberDesktopServicesSection({
  categories,
  currency,
  locale,
  services,
  onBookService,
}: BarberDesktopServicesSectionProps) {
  const categoryOptions =
    useMemo(
      () =>
        categories.filter(
          (
            category
          ) =>
            category.isActive &&
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
  ] =
    useState(
      () =>
        categoryOptions[0]
          ?.id ?? ""
    );

  useEffect(
    () => {
      if (
        categoryOptions.length ===
        0
      ) {
        if (
          activeCategoryId
        ) {
          setActiveCategoryId(
            ""
          );
        }

        return;
      }

      const stillExists =
        categoryOptions.some(
          (
            category
          ) =>
            category.id ===
            activeCategoryId
        );

      if (
        !stillExists
      ) {
        setActiveCategoryId(
          categoryOptions[0]
            .id
        );
      }
    },
    [
      activeCategoryId,
      categoryOptions,
    ]
  );

  const activeCategory =
    useMemo(
      () =>
        categoryOptions.find(
          (
            category
          ) =>
            category.id ===
            activeCategoryId
        ) ??
        null,
      [
        activeCategoryId,
        categoryOptions,
      ]
    );

  const activeCategoryIndex =
    Math.max(
      0,
      categoryOptions.findIndex(
        (
          category
        ) =>
          category.id ===
          activeCategoryId
      )
    );

  const visibleServices =
    useMemo(
      () =>
        activeCategoryId
          ? services.filter(
              (
                service
              ) =>
                service.categoryId ===
                activeCategoryId
            )
          : services,
      [
        activeCategoryId,
        services,
      ]
    );

  return (
    <section
      id="services"
      className="relative isolate overflow-hidden border-y border-[var(--brand-border)] bg-black"
    >
      <BarberDesktopServicesBackdrop
        activeCategoryId={activeCategoryId}
        categories={categoryOptions}
      />

      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] max-w-[1500px] grid-cols-[minmax(330px,0.36fr)_minmax(0,0.64fr)]">
        <aside className="relative overflow-hidden bg-black/66 px-8 py-12 backdrop-blur-[2px] xl:px-12 xl:py-14">
          <div className="pointer-events-none absolute -left-8 bottom-2 font-display text-[15rem] font-semibold leading-none tracking-[-0.08em] text-[var(--brand-primary)]/[0.025]">
            01
          </div>

          <div className="relative z-10 sticky top-24">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
              01 /{" "}
              {t(
                barberLabels.navServices,
                locale
              )}
            </p>

            <h2 className="mt-6 max-w-[12ch] font-display text-[clamp(3rem,3.7vw,4.7rem)] font-medium leading-[0.9] tracking-[-0.055em]">
              {t(
                desktopServicesSlogan,
                locale
              )}
            </h2>

            <div className="mt-8 h-px w-20 bg-[var(--brand-primary)]" />

            {categoryOptions.length >
              0 && (
              <nav
                className="mt-8"
                aria-label={t(
                  barberLabels.navServices,
                  locale
                )}
              >
                <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-muted)]">
                  {t(
                    barberLabels.navServices,
                    locale
                  )}
                </p>

                <div className="relative border-t border-[var(--brand-border)]">
                  {categoryOptions.map(
                    (
                      category,
                      index
                    ) => {
                      const active =
                        category.id ===
                        activeCategoryId;

                      const count =
                        services.filter(
                          (
                            service
                          ) =>
                            service.categoryId ===
                            category.id
                        ).length;

                      return (
                        <button
                          key={
                            category.id
                          }
                          type="button"
                          aria-pressed={
                            active
                          }
                          onClick={() =>
                            setActiveCategoryId(
                              category.id
                            )
                          }
                          className={`group relative grid min-h-[68px] w-full grid-cols-[2.2rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--brand-border)] px-4 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand-primary)] ${
                            active
                              ? "bg-[color-mix(in_srgb,var(--brand-primary)_8%,transparent)] text-[var(--brand-primary)]"
                              : "text-[var(--brand-text)] hover:bg-[color-mix(in_srgb,var(--brand-primary)_4%,transparent)] hover:text-[var(--brand-primary)]"
                          }`}
                        >
                          <span
                            className={`absolute inset-y-3 left-0 w-[2px] origin-center bg-[var(--brand-primary)] transition-transform duration-300 motion-reduce:transition-none ${
                              active
                                ? "scale-y-100"
                                : "scale-y-0 group-hover:scale-y-60"
                            }`}
                          />

                          <span className="font-display text-base text-[var(--brand-muted)]/55">
                            {String(
                              index +
                                1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <span className="font-display text-[1.35rem] font-medium tracking-[-0.025em]">
                            {t(
                              category.name,
                              locale
                            )}
                          </span>

                          <span className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-semibold tabular-nums text-[var(--brand-muted)]">
                              {String(
                                count
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            {active && (
                              <span className="text-[8px] font-semibold uppercase tracking-[0.17em] text-[var(--brand-primary)]">
                                {t(
                                  activeCategoryLabel,
                                  locale
                                )}
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    }
                  )}

                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 h-[68px] w-[2px] bg-[var(--brand-primary)] transition-transform duration-300 motion-reduce:transition-none"
                    style={{
                      transform:
                        `translateY(${activeCategoryIndex * 68}px)`,
                    }}
                  />
                </div>
              </nav>
            )}
          </div>
        </aside>

        <div className="relative overflow-hidden bg-black/38 px-8 py-12 backdrop-blur-[1px] xl:px-12 xl:py-14">
          <div className="pointer-events-none absolute right-8 top-3 font-display text-[16rem] font-semibold leading-none tracking-[-0.08em] text-[var(--brand-primary)]/[0.035]">
            {String(
              activeCategoryIndex +
                1
            ).padStart(
              2,
              "0"
            )}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_92%_12%,color-mix(in_srgb,var(--brand-primary)_8%,transparent),transparent_30%),linear-gradient(180deg,transparent_0%,color-mix(in_srgb,var(--brand-background)_18%,transparent)_100%)]" />

          {services.length ===
          0 ? (
            <div className="relative flex min-h-[560px] items-center justify-center border border-dashed border-[var(--brand-border)] px-8 text-center text-[var(--brand-muted)]">
              {t(
                barberLabels.servicesEmpty,
                locale
              )}
            </div>
          ) : (
            <div
              key={
                activeCategoryId ||
                "all-services"
              }
              className="barber-services-panel relative z-10"
            >
              <div className="flex items-end justify-between gap-8 border-b border-[var(--brand-border)] pb-7">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
                    {String(
                      activeCategoryIndex +
                        1
                    ).padStart(
                      2,
                      "0"
                    )}{" "}
                    /{" "}
                    {t(
                      barberLabels.navServices,
                      locale
                    )}
                  </p>

                  <h3 className="mt-3 font-display text-[clamp(3.5rem,4.6vw,5.5rem)] font-medium leading-[0.88] tracking-[-0.055em]">
                    {activeCategory
                      ? t(
                          activeCategory.name,
                          locale
                        )
                      : t(
                          barberLabels.navServices,
                          locale
                        )}
                  </h3>

                  {activeCategory?.description && (
                    <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--brand-muted)]">
                      {t(
                        activeCategory.description,
                        locale
                      )}
                    </p>
                  )}
                </div>

                <p className="shrink-0 pb-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-muted)]">
                  Heritage price list
                </p>
              </div>

              <div>
                {visibleServices.map(
                  (
                    service,
                    index
                  ) => (
                    <button
                      key={
                        service.id
                      }
                      type="button"
                      onClick={() =>
                        onBookService(
                          service.id
                        )
                      }
                      className="group relative block min-h-[142px] w-full border-b border-[var(--brand-border)] py-7 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand-primary)]"
                      aria-label={`${t(
                        barberLabels.bookService,
                        locale
                      )}: ${t(
                        service.name,
                        locale
                      )}`}
                    >
                      <span className="absolute inset-y-0 -left-8 -right-8 origin-left scale-x-0 bg-[color-mix(in_srgb,var(--brand-primary)_7%,transparent)] transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none" />

                      <div className="relative grid grid-cols-[2.7rem_minmax(0,1fr)_auto] items-start gap-5">
                        <span className="pt-1 font-display text-lg text-[var(--brand-muted)]/45">
                          {String(
                            index +
                              1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-baseline gap-4">
                            <h4 className="shrink-0 font-display text-[clamp(1.85rem,2.2vw,2.55rem)] font-medium tracking-[-0.035em] transition-colors duration-200 group-hover:text-[var(--brand-primary)]">
                              {t(
                                service.name,
                                locale
                              )}
                            </h4>

                            <span className="min-w-10 flex-1 border-t border-dotted border-[var(--brand-border)]" />

                            <span className="shrink-0 text-base font-semibold tabular-nums">
                              {formatServicePrice(
                                service,
                                currency,
                                locale
                              )}
                            </span>
                          </div>

                          <div className="mt-4 flex items-center gap-5 text-sm text-[var(--brand-muted)]">
                            <span className="inline-flex shrink-0 items-center gap-2">
                              <Clock3
                                className="h-4 w-4"
                                aria-hidden="true"
                              />

                              {
                                service.durationMinutes
                              }{" "}
                              {t(
                                barberLabels.minutes,
                                locale
                              )}
                            </span>

                            {service.description && (
                              <span className="line-clamp-2 max-w-2xl">
                                {t(
                                  service.description,
                                  locale
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="flex h-11 w-11 translate-x-2 items-center justify-center rounded-full border border-[var(--brand-border)] opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:border-[var(--brand-primary)] group-hover:bg-[var(--brand-primary)] group-hover:text-[var(--brand-background)] group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transform-none motion-reduce:transition-none">
                          <ArrowUpRight
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes barberServicesPanelIn {
          from {
            opacity: 0;
            transform: translateX(-8px) translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        .barber-services-panel {
          animation: barberServicesPanelIn 320ms
            cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .barber-services-panel {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
