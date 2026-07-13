"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  FilterX,
  Hash,
  Languages,
  Layers,
  LoaderCircle,
  Power,
  Search,
  Scissors,
  Tag,
  X,
} from "lucide-react";

import {
  setServiceActiveAction,
  setServiceCategoryActiveAction,
} from "@/app/admin/(protected)/services/actions";
import {
  getAdminLocaleOptions,
  getAdminLocalizedSearchValues,
  getAdminLocalizedText,
  getAdminLocalizedValue,
  type AdminLocalizedTextValue,
} from "@/lib/admin/localized-text";
import type {
  LocaleCode,
} from "@/lib/i18n/locales";
import type {
  AdminServiceCategory,
  AdminServiceItem,
  AdminServicesResult,
  ServicePriceType,
} from "@/lib/admin/services";

type AdminServicesViewProps = {
  businessName: string;
  categories: AdminServiceCategory[];
  uncategorizedServices: AdminServiceItem[];
  metrics: AdminServicesResult["metrics"];
  defaultLocale: LocaleCode;
  supportedLocales: LocaleCode[];
};

type StatusFilter =
  | "all"
  | "active"
  | "inactive";

type ServiceEntry = {
  service: AdminServiceItem;
  category: AdminServiceCategory | null;
};

type ActionMessage = {
  type: "success" | "error";
  text: string;
};

const priceTypeLabels: Record<
  ServicePriceType,
  string
> = {
  fixed: "Fiksna cena",
  from: "Cena od",
  range: "Raspon cena",
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("sr-Latn-RS", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatServicePrice(
  service: AdminServiceItem
): string {
  const from = formatNumber(service.priceFrom);

  if (
    service.priceType === "range" &&
    service.priceTo !== null
  ) {
    return `${from} – ${formatNumber(
      service.priceTo
    )}`;
  }

  if (service.priceType === "from") {
    return `Od ${from}`;
  }

  return from;
}

function normalizeSearchValue(
  value: string | null | undefined
): string {
  return value?.trim().toLocaleLowerCase() ?? "";
}

function ServiceStatusBadge({
  isActive,
  categoryIsActive,
}: {
  isActive: boolean;
  categoryIsActive: boolean;
}) {
  const isPubliclyVisible =
    isActive && categoryIsActive;

  if (isPubliclyVisible) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
        <Eye
          className="h-3 w-3"
          aria-hidden="true"
        />

        Aktivna
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-500">
      <EyeOff
        className="h-3 w-3"
        aria-hidden="true"
      />

      Neaktivna
    </span>
  );
}

export default function AdminServicesView({
  businessName,
  categories,
  uncategorizedServices,
  metrics,
  defaultLocale,
  supportedLocales,
}: AdminServicesViewProps) {
  const router = useRouter();

  const languages =
    useMemo(
      () =>
        getAdminLocaleOptions(
          defaultLocale,
          supportedLocales
        ),
      [
        defaultLocale,
        supportedLocales,
      ]
    );

  const getPrimaryText = (
    value:
      AdminLocalizedTextValue
  ) =>
    getAdminLocalizedText(
      value,
      defaultLocale,
      supportedLocales
    );

  const getLocalizedText = (
    value:
      AdminLocalizedTextValue,
    locale: LocaleCode
  ) =>
    getAdminLocalizedValue(
      value,
      locale
    );

  const [isPending, startTransition] =
    useTransition();

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [
    selectedServiceId,
    setSelectedServiceId,
  ] = useState<string | null>(null);

  const [
    pendingEntityKey,
    setPendingEntityKey,
  ] = useState<string | null>(null);

  const [actionMessage, setActionMessage] =
    useState<ActionMessage | null>(null);

  const allServiceEntries =
    useMemo<ServiceEntry[]>(
      () => [
        ...categories.flatMap((category) =>
          category.services.map((service) => ({
            service,
            category,
          }))
        ),

        ...uncategorizedServices.map(
          (service) => ({
            service,
            category: null,
          })
        ),
      ],
      [categories, uncategorizedServices]
    );

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLocaleLowerCase();

    return allServiceEntries.filter(
      ({ service, category }) => {
        if (
          categoryFilter !== "all" &&
          service.categoryId !== categoryFilter
        ) {
          return false;
        }

        const categoryIsActive =
          category?.isActive ?? false;

        const isPubliclyVisible =
          service.isActive && categoryIsActive;

        if (
          statusFilter === "active" &&
          !isPubliclyVisible
        ) {
          return false;
        }

        if (
          statusFilter === "inactive" &&
          isPubliclyVisible
        ) {
          return false;
        }

        if (normalizedQuery) {
          const searchableValues = [
            service.slug,
            ...getAdminLocalizedSearchValues(
              service.name
            ),
            ...getAdminLocalizedSearchValues(
              service.description
            ),
            category?.slug,
            ...getAdminLocalizedSearchValues(
              category?.name
            ),
          ]
            .map(normalizeSearchValue)
            .join(" ");

          if (
            !searchableValues.includes(
              normalizedQuery
            )
          ) {
            return false;
          }
        }

        return true;
      }
    );
  }, [
    allServiceEntries,
    categoryFilter,
    query,
    statusFilter,
  ]);

  const filteredCategoryGroups = useMemo(() => {
    return categories
      .map((category) => ({
        category,

        services: filteredEntries
          .filter(
            (entry) =>
              entry.category?.id === category.id
          )
          .map((entry) => entry.service),
      }))
      .filter(
        (group) => group.services.length > 0
      );
  }, [categories, filteredEntries]);

  const filteredUncategorized = useMemo(
    () =>
      filteredEntries
        .filter(
          (entry) => entry.category === null
        )
        .map((entry) => entry.service),
    [filteredEntries]
  );

  const selectedEntry = useMemo(
    () =>
      allServiceEntries.find(
        (entry) =>
          entry.service.id === selectedServiceId
      ) ?? null,
    [allServiceEntries, selectedServiceId]
  );

  useEffect(() => {
    if (!selectedEntry) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape" &&
        !isPending
      ) {
        setSelectedServiceId(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedEntry, isPending]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    statusFilter !== "all" ||
    categoryFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  const closeServiceDetails = () => {
    if (isPending) {
      return;
    }

    setSelectedServiceId(null);
  };

  const handleCategoryStatusChange = (
    category: AdminServiceCategory
  ) => {
    if (isPending) {
      return;
    }

    const entityKey = `category:${category.id}`;

    setPendingEntityKey(entityKey);
    setActionMessage(null);

    startTransition(async () => {
      try {
        const result =
          await setServiceCategoryActiveAction({
            categoryId: category.id,
            isActive: !category.isActive,
          });

        setActionMessage({
          type: result.ok ? "success" : "error",
          text: result.message,
        });

        if (result.ok) {
          router.refresh();
        }
      } catch {
        setActionMessage({
          type: "error",
          text: "Došlo je do greške prilikom promene statusa kategorije.",
        });
      } finally {
        setPendingEntityKey(null);
      }
    });
  };

  const handleServiceStatusChange = (
    service: AdminServiceItem
  ) => {
    if (isPending) {
      return;
    }

    const entityKey = `service:${service.id}`;

    setPendingEntityKey(entityKey);
    setActionMessage(null);

    startTransition(async () => {
      try {
        const result =
          await setServiceActiveAction({
            serviceId: service.id,
            isActive: !service.isActive,
          });

        setActionMessage({
          type: result.ok ? "success" : "error",
          text: result.message,
        });

        if (result.ok) {
          router.refresh();
        }
      } catch {
        setActionMessage({
          type: "error",
          text: "Došlo je do greške prilikom promene statusa usluge.",
        });
      } finally {
        setPendingEntityKey(null);
      }
    });
  };

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
          {businessName}
        </div>

        <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Usluge
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Upravljanje katalogom,
              kategorijama, cenama,
              trajanjem i vidljivošću usluga
              na javnom sajtu.
            </p>
          </div>

          <div className="inline-flex self-start items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-xs text-zinc-500">
            <Scissors
              className="h-4 w-4 text-amber-300"
              aria-hidden="true"
            />

            Ukupno usluga:

            <span className="font-semibold text-white">
              {metrics.totalServices}
            </span>
          </div>
        </div>
      </section>

      {actionMessage && (
        <section
          aria-live="polite"
          className={`mb-6 flex items-start justify-between gap-4 rounded-2xl border p-4 ${
            actionMessage.type === "success"
              ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
              : "border-red-400/20 bg-red-400/[0.07] text-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {actionMessage.type === "success" ? (
              <CheckCircle2
                className="mt-0.5 h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              />
            ) : (
              <AlertCircle
                className="mt-0.5 h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              />
            )}

            <span className="text-sm leading-relaxed">
              {actionMessage.text}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActionMessage(null)}
            aria-label="Zatvori poruku"
            className="flex-shrink-0 text-current opacity-60 transition hover:opacity-100"
          >
            <X
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-500">
              Kategorije
            </div>

            <Layers
              className="h-5 w-5 text-zinc-600"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-white">
            {metrics.totalCategories}
          </div>

          <div className="mt-2 text-xs text-zinc-600">
            {metrics.activeCategories} aktivnih ·{" "}
            {metrics.inactiveCategories} neaktivnih
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-emerald-200/70">
              Aktivne usluge
            </div>

            <Eye
              className="h-5 w-5 text-emerald-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-emerald-100">
            {metrics.activeServices}
          </div>

          <div className="mt-2 text-xs text-emerald-300/50">
            aktivne u bazi
          </div>
        </article>

        <article className="rounded-3xl border border-zinc-500/15 bg-zinc-500/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-400">
              Neaktivne usluge
            </div>

            <EyeOff
              className="h-5 w-5 text-zinc-500"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-zinc-300">
            {metrics.inactiveServices}
          </div>

          <div className="mt-2 text-xs text-zinc-600">
            skrivene sa javnog sajta
          </div>
        </article>

        <article className="rounded-3xl border border-amber-300/15 bg-amber-300/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-200/70">
              Prosečno po kategoriji
            </div>

            <Scissors
              className="h-5 w-5 text-amber-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-amber-100">
            {metrics.totalCategories > 0
              ? (
                  metrics.totalServices /
                  metrics.totalCategories
                ).toFixed(1)
              : "0"}
          </div>

          <div className="mt-2 text-xs text-amber-300/50">
            usluga po kategoriji
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <div className="border-b border-white/[0.07] p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(18rem,1fr)_minmax(12rem,0.35fr)_minmax(12rem,0.35fr)_auto]">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600"
                aria-hidden="true"
              />

              <input
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Naziv, opis ili slug..."
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/15 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-700 hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-white/[0.08] bg-zinc-950 px-3 text-sm text-zinc-300 outline-none transition hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
            >
              <option value="all">
                Sve kategorije
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {getPrimaryText(category.name) ||
                    category.slug}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as StatusFilter
                )
              }
              className="h-11 rounded-xl border border-white/[0.08] bg-zinc-950 px-3 text-sm text-zinc-300 outline-none transition hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
            >
              <option value="all">
                Svi statusi
              </option>

              <option value="active">
                Aktivne
              </option>

              <option value="inactive">
                Neaktivne
              </option>
            </select>

            <button
              type="button"
              disabled={!hasActiveFilters}
              onClick={clearFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 text-sm font-medium text-zinc-400 transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FilterX
                className="h-4 w-4"
                aria-hidden="true"
              />

              Očisti
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 text-xs text-zinc-600 sm:px-5">
          <span>
            Prikazano{" "}
            <strong className="text-zinc-300">
              {filteredEntries.length}
            </strong>{" "}
            od {allServiceEntries.length}
          </span>

          <span>
            Klikni uslugu za detalje
          </span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-zinc-600">
              <Scissors
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              Nema usluga
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-600">
              Nijedna usluga ne odgovara
              trenutno izabranoj pretrazi ili
              filterima.
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
              >
                Očisti filtere
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6 p-4 sm:p-5">
            {filteredCategoryGroups.map(
              ({ category, services }) => {
                const categoryPending =
                  pendingEntityKey ===
                  `category:${category.id}`;

                return (
                  <section
                    key={category.id}
                    className="overflow-hidden rounded-3xl border border-white/[0.08] bg-black/10"
                  >
                    <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 xl:flex-row xl:items-center">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                            category.isActive
                              ? "bg-amber-300/10 text-amber-300"
                              : "bg-white/[0.04] text-zinc-600"
                          }`}
                        >
                          <Layers
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">
                              {getPrimaryText(
                                category.name
                              ) || category.slug}
                            </h3>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                                category.isActive
                                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                  : "border-zinc-500/20 bg-zinc-500/10 text-zinc-500"
                              }`}
                            >
                              {category.isActive
                                ? "Aktivna kategorija"
                                : "Neaktivna kategorija"}
                            </span>
                          </div>

                          <div className="mt-1 text-xs text-zinc-600">
                            {services.length} prikazanih ·
                            redosled{" "}
                            {category.sortOrder}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-xs text-zinc-600">
                          {
                            category.metrics
                              .activeServices
                          }{" "}
                          aktivnih
                        </span>

                        <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-xs text-zinc-600">
                          {
                            category.metrics
                              .inactiveServices
                          }{" "}
                          neaktivnih
                        </span>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            handleCategoryStatusChange(
                              category
                            )
                          }
                          className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
                            category.isActive
                              ? "border-red-400/15 bg-red-400/[0.055] text-red-300 hover:bg-red-400/10"
                              : "border-emerald-400/15 bg-emerald-400/[0.055] text-emerald-300 hover:bg-emerald-400/10"
                          }`}
                        >
                          {categoryPending ? (
                            <LoaderCircle
                              className="h-3.5 w-3.5 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <Power
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          )}

                          {categoryPending
                            ? "Čuvanje..."
                            : category.isActive
                              ? "Deaktiviraj"
                              : "Aktiviraj"}
                        </button>
                      </div>
                    </div>

                    {!category.isActive && (
                      <div className="border-b border-amber-300/10 bg-amber-300/[0.035] px-5 py-3 text-xs leading-relaxed text-amber-200/60">
                        Kategorija je neaktivna, pa
                        njene usluge nisu javno
                        vidljive čak i kada su
                        pojedinačno aktivne.
                      </div>
                    )}

                    <div className="grid gap-3 p-4 md:grid-cols-2 2xl:grid-cols-3">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() =>
                            setSelectedServiceId(
                              service.id
                            )
                          }
                          className="group flex min-h-48 flex-col rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-left transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.045]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.045] text-zinc-500 transition group-hover:text-amber-300">
                              <Scissors
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </div>

                            <ServiceStatusBadge
                              isActive={
                                service.isActive
                              }
                              categoryIsActive={
                                category.isActive
                              }
                            />
                          </div>

                          <div className="mt-5 flex-1">
                            <h4 className="font-semibold text-white">
                              {getPrimaryText(
                                service.name
                              ) || service.slug}
                            </h4>

                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600">
                              {getPrimaryText(
                                service.description
                              ) ||
                                "Opis usluge nije unet."}
                            </p>
                          </div>

                          <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/[0.06] pt-4">
                            <div>
                              <div className="text-xs text-zinc-700">
                                Cena
                              </div>

                              <div className="mt-1 font-semibold text-amber-200">
                                {formatServicePrice(
                                  service
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                                <Clock3
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />

                                {
                                  service.durationMinutes
                                }{" "}
                                min
                              </div>

                              <ChevronRight
                                className="ml-auto mt-2 h-4 w-4 text-zinc-700 transition group-hover:text-amber-300"
                                aria-hidden="true"
                              />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                );
              }
            )}

            {filteredUncategorized.length > 0 && (
              <section className="overflow-hidden rounded-3xl border border-red-400/15 bg-red-400/[0.025]">
                <div className="border-b border-red-400/10 p-5">
                  <h3 className="font-semibold text-red-200">
                    Usluge bez postojeće
                    kategorije
                  </h3>

                  <p className="mt-1 text-sm text-red-300/50">
                    Ove stavke imaju category_id
                    koji više nije pronađen.
                  </p>
                </div>

                <div className="grid gap-3 p-4 md:grid-cols-2">
                  {filteredUncategorized.map(
                    (service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() =>
                          setSelectedServiceId(
                            service.id
                          )
                        }
                        className="rounded-2xl border border-red-400/10 bg-black/10 p-5 text-left transition hover:border-red-400/20"
                      >
                        <div className="font-semibold text-white">
                          {getPrimaryText(
                            service.name
                          ) || service.slug}
                        </div>

                        <div className="mt-2 text-sm text-zinc-500">
                          {
                            service.durationMinutes
                          }{" "}
                          min ·{" "}
                          {formatServicePrice(
                            service
                          )}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </section>

      {selectedEntry && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Zatvori detalje usluge"
            onClick={closeServiceDetails}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <aside className="absolute inset-y-0 right-0 w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-zinc-950 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-zinc-950/90 px-5 py-5 backdrop-blur-xl sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-300 text-zinc-950">
                  <Scissors
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-600">
                    Detalji usluge
                  </div>

                  <div className="mt-1 truncate text-lg font-semibold text-white">
                    {getPrimaryText(
                      selectedEntry.service.name
                    ) ||
                      selectedEntry.service.slug}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeServiceDetails}
                disabled={isPending}
                aria-label="Zatvori"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-500 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-wait disabled:opacity-40"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {actionMessage && (
                <div
                  aria-live="polite"
                  className={`flex items-start gap-3 rounded-2xl border p-4 ${
                    actionMessage.type === "success"
                      ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
                      : "border-red-400/20 bg-red-400/[0.07] text-red-200"
                  }`}
                >
                  {actionMessage.type ===
                  "success" ? (
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 flex-shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <AlertCircle
                      className="mt-0.5 h-5 w-5 flex-shrink-0"
                      aria-hidden="true"
                    />
                  )}

                  <span className="text-sm leading-relaxed">
                    {actionMessage.text}
                  </span>
                </div>
              )}

              <section className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                  <div className="text-xs text-zinc-600">
                    Cena
                  </div>

                  <div className="mt-2 text-xl font-semibold text-amber-200">
                    {formatServicePrice(
                      selectedEntry.service
                    )}
                  </div>
                </article>

                <article className="rounded-2xl border border-blue-400/15 bg-blue-400/[0.05] p-4">
                  <div className="text-xs text-blue-300/60">
                    Trajanje
                  </div>

                  <div className="mt-2 text-xl font-semibold text-blue-100">
                    {
                      selectedEntry.service
                        .durationMinutes
                    }{" "}
                    min
                  </div>
                </article>

                <article className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                  <div className="text-xs text-zinc-600">
                    Status
                  </div>

                  <div className="mt-2">
                    <ServiceStatusBadge
                      isActive={
                        selectedEntry.service
                          .isActive
                      }
                      categoryIsActive={
                        selectedEntry.category
                          ?.isActive ?? false
                      }
                    />
                  </div>
                </article>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                      Status usluge
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                      Aktivna usluga se prikazuje
                      javno samo kada je aktivna i
                      njena kategorija.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      handleServiceStatusChange(
                        selectedEntry.service
                      )
                    }
                    className={`inline-flex min-h-11 flex-shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
                      selectedEntry.service.isActive
                        ? "border-red-400/20 bg-red-400/[0.07] text-red-300 hover:bg-red-400/10"
                        : "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300 hover:bg-emerald-400/10"
                    }`}
                  >
                    {pendingEntityKey ===
                    `service:${selectedEntry.service.id}` ? (
                      <LoaderCircle
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Power
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    )}

                    {pendingEntityKey ===
                    `service:${selectedEntry.service.id}`
                      ? "Čuvanje..."
                      : selectedEntry.service
                            .isActive
                        ? "Deaktiviraj uslugu"
                        : "Aktiviraj uslugu"}
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  <Layers
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Kategorija
                </div>

                {selectedEntry.category ? (
                  <div>
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="font-semibold text-white">
                          {getPrimaryText(
                            selectedEntry.category.name
                          ) ||
                            selectedEntry.category
                              .slug}
                        </div>

                        <div className="mt-2 text-sm text-zinc-600">
                          Slug:{" "}
                          {
                            selectedEntry.category
                              .slug
                          }
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          handleCategoryStatusChange(
                            selectedEntry.category as AdminServiceCategory
                          )
                        }
                        className={`inline-flex min-h-10 flex-shrink-0 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
                          selectedEntry.category
                            .isActive
                            ? "border-red-400/15 bg-red-400/[0.055] text-red-300 hover:bg-red-400/10"
                            : "border-emerald-400/15 bg-emerald-400/[0.055] text-emerald-300 hover:bg-emerald-400/10"
                        }`}
                      >
                        {pendingEntityKey ===
                        `category:${selectedEntry.category.id}` ? (
                          <LoaderCircle
                            className="h-3.5 w-3.5 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Power
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        )}

                        {selectedEntry.category
                          .isActive
                          ? "Deaktiviraj kategoriju"
                          : "Aktiviraj kategoriju"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-red-300">
                    Kategorija nije pronađena.
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  <Languages
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Nazivi i opisi
                </div>

                <div className="space-y-4">
                  {languages.map((language) => (
                    <article
                      key={language.key}
                      className="rounded-xl border border-white/[0.06] bg-black/10 p-4"
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                        {language.label}
                      </div>

                      <div className="mt-2 font-semibold text-white">
                        {getLocalizedText(
                          selectedEntry.service.name,
                          language.key
                        ) || "Nije uneto"}
                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-500">
                        {getLocalizedText(
                          selectedEntry.service
                            .description,
                          language.key
                        ) || "Opis nije unet."}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  <Tag
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Cena
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs text-zinc-700">
                      Tip cene
                    </div>

                    <div className="mt-1 text-sm font-medium text-zinc-300">
                      {
                        priceTypeLabels[
                          selectedEntry.service
                            .priceType
                        ]
                      }
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-zinc-700">
                      Početna cena
                    </div>

                    <div className="mt-1 text-sm font-medium text-zinc-300">
                      {formatNumber(
                        selectedEntry.service
                          .priceFrom
                      )}
                    </div>
                  </div>

                  {selectedEntry.service
                    .priceType === "range" && (
                    <div>
                      <div className="text-xs text-zinc-700">
                        Krajnja cena
                      </div>

                      <div className="mt-1 text-sm font-medium text-zinc-300">
                        {selectedEntry.service
                          .priceTo !== null
                          ? formatNumber(
                              selectedEntry.service
                                .priceTo
                            )
                          : "Nije uneta"}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  <Hash
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Sistem
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs text-zinc-700">
                      Slug
                    </div>

                    <div className="mt-1 break-all text-sm font-medium text-zinc-300">
                      {selectedEntry.service.slug}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-zinc-700">
                      Redosled
                    </div>

                    <div className="mt-1 text-sm font-medium text-zinc-300">
                      {
                        selectedEntry.service
                          .sortOrder
                      }
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-zinc-700">
                      Usluga aktivna
                    </div>

                    <div className="mt-1 text-sm font-medium text-zinc-300">
                      {selectedEntry.service
                        .isActive
                        ? "Da"
                        : "Ne"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-zinc-700">
                      Kategorija aktivna
                    </div>

                    <div className="mt-1 text-sm font-medium text-zinc-300">
                      {selectedEntry.category
                        ?.isActive
                        ? "Da"
                        : "Ne"}
                    </div>
                  </div>
                </div>
              </section>

              <div className="rounded-2xl border border-white/[0.06] bg-black/10 px-4 py-3 text-xs leading-relaxed text-zinc-600">
                Deaktiviranje kategorije ne menja
                pojedinačne statuse usluga. Kada
                ponovo aktiviraš kategoriju,
                prethodno aktivne usluge ponovo
                postaju javno dostupne.
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}