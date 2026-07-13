"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  FilterX,
  Languages,
  Mail,
  Phone,
  Search,
  Settings2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import type {
  AdminEmployee,
  AdminEmployeeService,
  AdminTeamResult,
} from "@/lib/admin/team";
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

type AdminTeamViewProps = {
  businessName: string;
  employees: AdminEmployee[];
  metrics: AdminTeamResult["metrics"];
  catalogServiceCount: number;
  defaultLocale: LocaleCode;
  supportedLocales: LocaleCode[];
};

type EmployeeStatusFilter =
  | "all"
  | "active"
  | "inactive";

type AssignmentFilter =
  | "all"
  | "with_services"
  | "without_services"
  | "overrides";

const statusFilterLabels: Record<
  EmployeeStatusFilter,
  string
> = {
  all: "Svi statusi",
  active: "Aktivni zaposleni",
  inactive: "Neaktivni zaposleni",
};

const assignmentFilterLabels: Record<
  AssignmentFilter,
  string
> = {
  all: "Sve dodele",
  with_services: "Imaju usluge",
  without_services: "Bez usluga",
  overrides: "Posebna cena ili trajanje",
};

function getInitials(value: string): string {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "TM";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
}

function normalizeSearchValue(
  value: string | null | undefined
): string {
  return (
    value
      ?.trim()
      .toLocaleLowerCase() ?? ""
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat(
    "sr-Latn-RS",
    {
      maximumFractionDigits: 2,
    }
  ).format(value);
}

function formatCatalogPrice(
  assignment: AdminEmployeeService
): string {
  const service =
    assignment.service;

  const priceFrom = formatNumber(
    service.priceFrom
  );

  if (
    service.priceType === "range" &&
    service.priceTo !== null
  ) {
    return `${priceFrom} – ${formatNumber(
      service.priceTo
    )}`;
  }

  if (
    service.priceType === "from"
  ) {
    return `Od ${priceFrom}`;
  }

  return priceFrom;
}

function formatEffectivePrice(
  assignment: AdminEmployeeService
): string {
  if (
    assignment.customPriceFrom !== null
  ) {
    return formatNumber(
      assignment.effectivePriceFrom
    );
  }

  return formatCatalogPrice(
    assignment
  );
}

function hasOverrides(
  employee: AdminEmployee
): boolean {
  return employee.services.some(
    (assignment) =>
      assignment.customDurationMinutes !==
        null ||
      assignment.customPriceFrom !== null
  );
}

function EmployeeStatusBadge({
  isActive,
}: {
  isActive: boolean;
}) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
        <Eye
          className="h-3 w-3"
          aria-hidden="true"
        />

        Aktivan
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-500">
      <EyeOff
        className="h-3 w-3"
        aria-hidden="true"
      />

      Neaktivan
    </span>
  );
}

function AssignmentStatusBadge({
  employeeIsActive,
  assignment,
}: {
  employeeIsActive: boolean;
  assignment: AdminEmployeeService;
}) {
  const isPubliclyAvailable =
    employeeIsActive &&
    assignment.isPubliclyAvailable;

  if (isPubliclyAvailable) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
        <Eye
          className="h-3 w-3"
          aria-hidden="true"
        />

        Dostupna
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-1 text-[10px] font-semibold text-zinc-500">
      <EyeOff
        className="h-3 w-3"
        aria-hidden="true"
      />

      Nedostupna
    </span>
  );
}

function getAssignmentAvailabilityReason(
  employee: AdminEmployee,
  assignment: AdminEmployeeService
): string {
  if (!employee.isActive) {
    return "Zaposleni je neaktivan.";
  }

  if (!assignment.isActive) {
    return "Dodela usluge je neaktivna.";
  }

  if (!assignment.service.categoryIsActive) {
    return "Kategorija usluge je neaktivna.";
  }

  if (!assignment.service.isActive) {
    return "Usluga je neaktivna.";
  }

  return "Usluga je dostupna za javno zakazivanje.";
}

export default function AdminTeamView({
  businessName,
  employees,
  metrics,
  catalogServiceCount,
  defaultLocale,
  supportedLocales,
}: AdminTeamViewProps) {
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
  const [query, setQuery] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<EmployeeStatusFilter>(
      "all"
    );

  const [
    assignmentFilter,
    setAssignmentFilter,
  ] =
    useState<AssignmentFilter>(
      "all"
    );

  const [
    selectedEmployeeId,
    setSelectedEmployeeId,
  ] = useState<string | null>(
    null
  );

  const filteredEmployees =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLocaleLowerCase();

      return employees
        .filter((employee) => {
          if (
            statusFilter ===
              "active" &&
            !employee.isActive
          ) {
            return false;
          }

          if (
            statusFilter ===
              "inactive" &&
            employee.isActive
          ) {
            return false;
          }

          if (
            assignmentFilter ===
              "with_services" &&
            employee.services.length === 0
          ) {
            return false;
          }

          if (
            assignmentFilter ===
              "without_services" &&
            employee.services.length > 0
          ) {
            return false;
          }

          if (
            assignmentFilter ===
              "overrides" &&
            !hasOverrides(employee)
          ) {
            return false;
          }

          if (normalizedQuery) {
            const serviceSearchValues =
              employee.services.flatMap(
                (assignment) => [
                  assignment.service.slug,
                  ...getAdminLocalizedSearchValues(
                    assignment.service.name
                  ),
                  assignment.service
                    .categorySlug,
                  ...getAdminLocalizedSearchValues(
                    assignment.service
                      .categoryName
                  ),
                ]
              );

            const searchableValues = [
              employee.name,
              employee.slug,
              employee.email,
              employee.phone,
              ...getAdminLocalizedSearchValues(
                employee.title
              ),
              ...getAdminLocalizedSearchValues(
                employee.bio
              ),
              ...serviceSearchValues,
            ]
              .map(
                normalizeSearchValue
              )
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
        })
        .sort((first, second) => {
          if (
            first.sortOrder !==
            second.sortOrder
          ) {
            return (
              first.sortOrder -
              second.sortOrder
            );
          }

          return first.name.localeCompare(
            second.name,
            "sr-Latn"
          );
        });
    }, [
      assignmentFilter,
      employees,
      query,
      statusFilter,
    ]);

  const selectedEmployee =
    useMemo(
      () =>
        employees.find(
          (employee) =>
            employee.id ===
            selectedEmployeeId
        ) ?? null,
      [
        employees,
        selectedEmployeeId,
      ]
    );

  useEffect(() => {
    if (!selectedEmployee) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape"
      ) {
        setSelectedEmployeeId(
          null
        );
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
  }, [selectedEmployee]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    statusFilter !== "all" ||
    assignmentFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setAssignmentFilter("all");
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
              Tim
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Pregled zaposlenih,
              kontakata, profila,
              dodeljenih usluga i
              individualnih cena i
              trajanja.
            </p>
          </div>

          <div className="inline-flex self-start items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-xs text-zinc-500">
            <UsersRound
              className="h-4 w-4 text-amber-300"
              aria-hidden="true"
            />

            Ukupno članova:

            <span className="font-semibold text-white">
              {metrics.totalEmployees}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-500">
              Članovi tima
            </div>

            <UsersRound
              className="h-5 w-5 text-zinc-600"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-white">
            {metrics.totalEmployees}
          </div>

          <div className="mt-2 text-xs text-zinc-600">
            ukupno zaposlenih
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-emerald-200/70">
              Aktivni
            </div>

            <Eye
              className="h-5 w-5 text-emerald-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-emerald-100">
            {metrics.activeEmployees}
          </div>

          <div className="mt-2 text-xs text-emerald-300/50">
            javno vidljivi profili
          </div>
        </article>

        <article className="rounded-3xl border border-zinc-500/15 bg-zinc-500/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-400">
              Neaktivni
            </div>

            <EyeOff
              className="h-5 w-5 text-zinc-500"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-zinc-300">
            {metrics.inactiveEmployees}
          </div>

          <div className="mt-2 text-xs text-zinc-600">
            skriveni sa javnog sajta
          </div>
        </article>

        <article className="rounded-3xl border border-blue-400/15 bg-blue-400/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-200/70">
              Javne dodele
            </div>

            <BriefcaseBusiness
              className="h-5 w-5 text-blue-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-blue-100">
            {
              metrics.publiclyAvailableAssignments
            }
          </div>

          <div className="mt-2 text-xs text-blue-300/50">
            usluga dostupnih za booking
          </div>
        </article>

        <article className="rounded-3xl border border-amber-300/15 bg-amber-300/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-200/70">
              Posebna pravila
            </div>

            <Settings2
              className="h-5 w-5 text-amber-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-amber-100">
            {metrics.customDurationOverrides +
              metrics.customPriceOverrides}
          </div>

          <div className="mt-2 text-xs text-amber-300/50">
            cena i trajanje po zaposlenom
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <div className="border-b border-white/[0.07] p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(18rem,1fr)_minmax(13rem,0.35fr)_minmax(15rem,0.4fr)_auto]">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600"
                aria-hidden="true"
              />

              <input
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value
                  )
                }
                placeholder="Ime, kontakt, titula ili usluga..."
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/15 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-700 hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as EmployeeStatusFilter
                )
              }
              className="h-11 rounded-xl border border-white/[0.08] bg-zinc-950 px-3 text-sm text-zinc-300 outline-none transition hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
            >
              {(
                Object.keys(
                  statusFilterLabels
                ) as EmployeeStatusFilter[]
              ).map((filter) => (
                <option
                  key={filter}
                  value={filter}
                >
                  {
                    statusFilterLabels[
                      filter
                    ]
                  }
                </option>
              ))}
            </select>

            <select
              value={assignmentFilter}
              onChange={(event) =>
                setAssignmentFilter(
                  event.target
                    .value as AssignmentFilter
                )
              }
              className="h-11 rounded-xl border border-white/[0.08] bg-zinc-950 px-3 text-sm text-zinc-300 outline-none transition hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
            >
              {(
                Object.keys(
                  assignmentFilterLabels
                ) as AssignmentFilter[]
              ).map((filter) => (
                <option
                  key={filter}
                  value={filter}
                >
                  {
                    assignmentFilterLabels[
                      filter
                    ]
                  }
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={
                !hasActiveFilters
              }
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

        <div className="flex flex-col justify-between gap-2 border-b border-white/[0.07] px-4 py-3 text-xs text-zinc-600 sm:flex-row sm:items-center sm:px-5">
          <span>
            Prikazano{" "}
            <strong className="text-zinc-300">
              {filteredEmployees.length}
            </strong>{" "}
            od {employees.length}
          </span>

          <span>
            Katalog sadrži{" "}
            <strong className="text-zinc-400">
              {catalogServiceCount}
            </strong>{" "}
            usluga
          </span>
        </div>

        {filteredEmployees.length ===
        0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-zinc-600">
              <UsersRound
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              Nema zaposlenih
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-600">
              Nijedan član tima ne
              odgovara trenutno izabranoj
              pretrazi ili filterima.
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
          <div className="grid gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3 sm:p-5">
            {filteredEmployees.map(
              (employee) => {
                const title =
                  getPrimaryText(
                    employee.title
                  );

                const bio =
                  getPrimaryText(
                    employee.bio
                  );

                return (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() =>
                      setSelectedEmployeeId(
                        employee.id
                      )
                    }
                    className="group flex min-h-80 flex-col rounded-3xl border border-white/[0.08] bg-black/10 p-5 text-left transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.035]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${
                          employee.imageUrl
                            ? "bg-cover bg-center text-transparent"
                            : "bg-amber-300/10 text-amber-200"
                        }`}
                        style={
                          employee.imageUrl
                            ? {
                                backgroundImage: `url("${employee.imageUrl}")`,
                              }
                            : undefined
                        }
                        aria-label={
                          employee.imageUrl
                            ? `Fotografija: ${employee.name}`
                            : undefined
                        }
                      >
                        {!employee.imageUrl &&
                          getInitials(
                            employee.name
                          )}
                      </div>

                      <EmployeeStatusBadge
                        isActive={
                          employee.isActive
                        }
                      />
                    </div>

                    <div className="mt-5">
                      <h3 className="text-lg font-semibold text-white">
                        {employee.name}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-amber-200/70">
                        {title ||
                          "Titula nije uneta"}
                      </p>

                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-600">
                        {bio ||
                          "Biografija zaposlenog nije uneta."}
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-700">
                          Usluge
                        </div>

                        <div className="mt-1 text-lg font-semibold text-white">
                          {
                            employee.metrics
                              .totalServices
                          }
                        </div>
                      </div>

                      <div className="rounded-xl border border-blue-400/10 bg-blue-400/[0.035] p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-blue-300/40">
                          Javne
                        </div>

                        <div className="mt-1 text-lg font-semibold text-blue-100">
                          {
                            employee.metrics
                              .publiclyAvailableServices
                          }
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-4 border-t border-white/[0.06] pt-5">
                      <div className="min-w-0">
                        <div className="truncate text-xs text-zinc-600">
                          {employee.email ??
                            employee.phone ??
                            employee.slug}
                        </div>

                        <div className="mt-1 text-xs text-zinc-700">
                          Redosled{" "}
                          {employee.sortOrder}
                        </div>
                      </div>

                      <ChevronRight
                        className="h-5 w-5 flex-shrink-0 text-zinc-700 transition group-hover:text-amber-300"
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                );
              }
            )}
          </div>
        )}
      </section>

      {selectedEmployee && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Zatvori profil zaposlenog"
            onClick={() =>
              setSelectedEmployeeId(
                null
              )
            }
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <aside className="absolute inset-y-0 right-0 w-full max-w-3xl overflow-y-auto border-l border-white/10 bg-zinc-950 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/[0.08] bg-zinc-950/90 px-5 py-5 backdrop-blur-xl sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                    selectedEmployee.imageUrl
                      ? "bg-cover bg-center text-transparent"
                      : "bg-amber-300 text-zinc-950"
                  }`}
                  style={
                    selectedEmployee.imageUrl
                      ? {
                          backgroundImage: `url("${selectedEmployee.imageUrl}")`,
                        }
                      : undefined
                  }
                >
                  {!selectedEmployee.imageUrl &&
                    getInitials(
                      selectedEmployee.name
                    )}
                </div>

                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-600">
                    Profil zaposlenog
                  </div>

                  <div className="mt-1 truncate text-lg font-semibold text-white">
                    {selectedEmployee.name}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedEmployeeId(
                    null
                  )
                }
                aria-label="Zatvori"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-500 transition hover:bg-white/[0.08] hover:text-white"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <section className="grid gap-3 sm:grid-cols-4">
                <article className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                  <div className="text-xs text-zinc-600">
                    Status
                  </div>

                  <div className="mt-2">
                    <EmployeeStatusBadge
                      isActive={
                        selectedEmployee.isActive
                      }
                    />
                  </div>
                </article>

                <article className="rounded-2xl border border-blue-400/15 bg-blue-400/[0.05] p-4">
                  <div className="text-xs text-blue-300/60">
                    Usluge
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-blue-100">
                    {
                      selectedEmployee.metrics
                        .totalServices
                    }
                  </div>
                </article>

                <article className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4">
                  <div className="text-xs text-emerald-300/60">
                    Javne
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-emerald-100">
                    {
                      selectedEmployee.metrics
                        .publiclyAvailableServices
                    }
                  </div>
                </article>

                <article className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-4">
                  <div className="text-xs text-amber-300/60">
                    Posebna pravila
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-amber-100">
                    {selectedEmployee.metrics
                      .customDurationOverrides +
                      selectedEmployee.metrics
                        .customPriceOverrides}
                  </div>
                </article>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  <UserRound
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Profil
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs text-zinc-700">
                      Ime
                    </div>

                    <div className="mt-1 text-sm font-semibold text-white">
                      {selectedEmployee.name}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-zinc-700">
                      Slug
                    </div>

                    <div className="mt-1 break-all text-sm text-zinc-400">
                      {selectedEmployee.slug}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-zinc-700">
                      Redosled
                    </div>

                    <div className="mt-1 text-sm text-zinc-400">
                      {
                        selectedEmployee.sortOrder
                      }
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-zinc-700">
                      Fotografija
                    </div>

                    <div className="mt-1 break-all text-sm text-zinc-400">
                      {selectedEmployee.imageUrl ??
                        "Nije uneta"}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Kontakt
                </div>

                <div className="space-y-4">
                  {selectedEmployee.email ? (
                    <a
                      href={`mailto:${selectedEmployee.email}`}
                      className="flex items-center gap-3 text-sm text-zinc-400 transition hover:text-amber-200"
                    >
                      <Mail
                        className="h-4 w-4 text-zinc-600"
                        aria-hidden="true"
                      />

                      {
                        selectedEmployee.email
                      }
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-zinc-700">
                      <Mail
                        className="h-4 w-4"
                        aria-hidden="true"
                      />

                      Email nije unet
                    </div>
                  )}

                  {selectedEmployee.phone ? (
                    <a
                      href={`tel:${selectedEmployee.phone.replace(
                        /[^\d+]/g,
                        ""
                      )}`}
                      className="flex items-center gap-3 text-sm text-zinc-400 transition hover:text-amber-200"
                    >
                      <Phone
                        className="h-4 w-4 text-zinc-600"
                        aria-hidden="true"
                      />

                      {
                        selectedEmployee.phone
                      }
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-zinc-700">
                      <Phone
                        className="h-4 w-4"
                        aria-hidden="true"
                      />

                      Telefon nije unet
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  <Languages
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Titula i biografija
                </div>

                <div className="space-y-4">
                  {languages.map(
                    (language) => (
                      <article
                        key={
                          language.key
                        }
                        className="rounded-xl border border-white/[0.06] bg-black/10 p-4"
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                          {
                            language.label
                          }
                        </div>

                        <div className="mt-2 font-semibold text-white">
                          {getLocalizedText(
                            selectedEmployee.title,
                            language.key
                          ) ||
                            "Titula nije uneta"}
                        </div>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-500">
                          {getLocalizedText(
                            selectedEmployee.bio,
                            language.key
                          ) ||
                            "Biografija nije uneta."}
                        </p>
                      </article>
                    )
                  )}
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
                <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                      Dodeljene usluge
                    </div>

                    <div className="mt-1 font-semibold text-white">
                      Usluge zaposlenog
                    </div>
                  </div>

                  <div className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-xs text-zinc-500">
                    {
                      selectedEmployee.services
                        .length
                    }
                  </div>
                </div>

                {selectedEmployee.services
                  .length === 0 ? (
                  <div className="flex min-h-44 flex-col items-center justify-center p-6 text-center">
                    <BriefcaseBusiness
                      className="h-6 w-6 text-zinc-700"
                      aria-hidden="true"
                    />

                    <div className="mt-3 text-sm font-medium text-zinc-400">
                      Nema dodeljenih usluga
                    </div>

                    <p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-700">
                      Ovaj zaposleni trenutno
                      ne može biti izabran za
                      nijednu uslugu.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.06]">
                    {selectedEmployee.services.map(
                      (assignment) => {
                        const publiclyAvailable =
                          selectedEmployee.isActive &&
                          assignment.isPubliclyAvailable;

                        return (
                          <article
                            key={
                              assignment.serviceId
                            }
                            className="p-5"
                          >
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                              <div>
                                <div className="font-semibold text-white">
                                  {getPrimaryText(
                                    assignment
                                      .service.name
                                  ) ||
                                    assignment
                                      .service.slug}
                                </div>

                                <div className="mt-1 text-xs text-zinc-600">
                                  {getPrimaryText(
                                    assignment
                                      .service
                                      .categoryName
                                  ) ||
                                    assignment
                                      .service
                                      .categorySlug}
                                </div>
                              </div>

                              <AssignmentStatusBadge
                                employeeIsActive={
                                  selectedEmployee.isActive
                                }
                                assignment={
                                  assignment
                                }
                              />
                            </div>

                            <div className="mt-4 grid gap-3 rounded-xl border border-white/[0.06] bg-black/10 p-4 sm:grid-cols-2">
                              <div>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-700">
                                  <Clock3
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />

                                  Trajanje
                                </div>

                                <div className="mt-1 text-sm font-medium text-zinc-300">
                                  {
                                    assignment.effectiveDurationMinutes
                                  }{" "}
                                  min
                                </div>

                                {assignment.customDurationMinutes !==
                                  null && (
                                  <div className="mt-1 text-[10px] font-semibold text-amber-300/60">
                                    Posebno trajanje
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-700">
                                  <BadgeDollarSign
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />

                                  Cena
                                </div>

                                <div className="mt-1 text-sm font-medium text-amber-200">
                                  {formatEffectivePrice(
                                    assignment
                                  )}
                                </div>

                                {assignment.customPriceFrom !==
                                  null && (
                                  <div className="mt-1 text-[10px] font-semibold text-amber-300/60">
                                    Posebna cena
                                  </div>
                                )}
                              </div>
                            </div>

                            <div
                              className={`mt-3 rounded-xl border px-3 py-2.5 text-xs leading-relaxed ${
                                publiclyAvailable
                                  ? "border-emerald-400/10 bg-emerald-400/[0.035] text-emerald-200/60"
                                  : "border-zinc-500/10 bg-white/[0.02] text-zinc-600"
                              }`}
                            >
                              {getAssignmentAvailabilityReason(
                                selectedEmployee,
                                assignment
                              )}
                            </div>
                          </article>
                        );
                      }
                    )}
                  </div>
                )}
              </section>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}