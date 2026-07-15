import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Filter,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import BusinessPublicationBadge from "@/components/platform-admin/BusinessPublicationBadge";
import OperationsLifecycleQuickActions from "@/components/platform-admin/OperationsLifecycleQuickActions";
import {
  requirePlatformAdminPermission,
} from "@/lib/auth/platform-admin";
import type {
  TenantAttentionSeverity,
} from "@/lib/platform-admin/operational-readiness";
import {
  buildPlatformOperationsHref,
  countPlatformOperationsViews,
  filterPlatformOperationsTenants,
  parsePlatformOperationsFilters,
  type PlatformOperationsFilters,
  type PlatformOperationsSearchParams,
  type PlatformOperationsView,
} from "@/lib/platform-admin/operations-query";
import {
  loadPlatformOperationsOverview,
} from "@/lib/platform-admin/operations-server";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

type PlatformOperationsPageProps = {
  searchParams:
    Promise<
      PlatformOperationsSearchParams
    >;
};

const VIEW_LABELS:
  Record<
    PlatformOperationsView,
    string
  > = {
  attention:
    "Zahteva pažnju",
  launch:
    "Launch queue",
  published:
    "Objavljeni",
  all:
    "Svi tenant-i",
};

const LIFECYCLE_OPTIONS = [
  [
    "all",
    "Svi lifecycle statusi",
  ],
  [
    "draft",
    "Draft",
  ],
  [
    "published",
    "Published",
  ],
  [
    "suspended",
    "Suspended",
  ],
  [
    "archived",
    "Archived",
  ],
] as const;

const SEVERITY_OPTIONS = [
  [
    "all",
    "Sve severity vrednosti",
  ],
  [
    "critical",
    "Kritično",
  ],
  [
    "warning",
    "Upozorenje",
  ],
  [
    "info",
    "Info",
  ],
] as const;

const PACKAGE_OPTIONS = [
  [
    "all",
    "Sva package stanja",
  ],
  [
    "assigned",
    "Dodeljen paket",
  ],
  [
    "legacy",
    "Legacy full access",
  ],
  [
    "invalid",
    "Zahteva proveru",
  ],
] as const;

function SeverityBadge({
  severity,
}: {
  severity:
    TenantAttentionSeverity;
}) {
  const label =
    severity ===
    "critical"
      ? "Kritično"
      : severity ===
        "warning"
        ? "Upozorenje"
        : "Info";

  const classes =
    severity ===
    "critical"
      ? "border-red-300/20 bg-red-300/10 text-red-200"
      : severity ===
        "warning"
        ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
        : "border-sky-300/20 bg-sky-300/10 text-sky-200";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${classes}`}
    >
      {label}
    </span>
  );
}

function PackageStateBadge({
  filters,
}: {
  filters:
    PlatformOperationsFilters;
}) {
  const hasFilters =
    Boolean(
      filters.query
    ) ||
    filters.lifecycle !==
      "all" ||
    filters.severity !==
      "all" ||
    filters.packageState !==
      "all";

  if (
    !hasFilters
  ) {
    return null;
  }

  return (
    <Link
      href={
        buildPlatformOperationsHref(
          {
            view:
              filters.view,
            query:
              "",
            lifecycle:
              "all",
            severity:
              "all",
            packageState:
              "all",
          }
        )
      }
      className="text-sm font-semibold text-amber-200 transition hover:text-amber-100"
    >
      Očisti filtere
    </Link>
  );
}

export default async function PlatformOperationsPage({
  searchParams,
}: PlatformOperationsPageProps) {
  await requirePlatformAdminPermission(
    "platform.dashboard.read"
  );

  const [
    overview,
    rawSearchParams,
  ] = await Promise.all([
    loadPlatformOperationsOverview(),
    searchParams,
  ]);

  const filters =
    parsePlatformOperationsFilters(
      rawSearchParams
    );

  const viewCounts =
    countPlatformOperationsViews(
      overview.tenants
    );

  const tenantViews =
    filterPlatformOperationsTenants(
      overview.tenants,
      filters
    );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <SlidersHorizontal
              size={17}
              aria-hidden="true"
            />
            Operativni tenant pregled
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Operacije
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base">
            Filtriran read-only pregled tenant rizika, launch reda, package stanja i upcoming booking uticaja.
          </p>
        </div>

        <Link
          href="/platform-admin"
          className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
        >
          <Building2
            size={17}
            aria-hidden="true"
          />
          Pregled platforme
        </Link>
      </div>

      {
        overview.errors.length >
        0 ? (
          <section className="mt-7 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={19}
                className="mt-0.5 shrink-0 text-amber-200"
                aria-hidden="true"
              />

              <div>
                <p className="font-semibold text-amber-100">
                  Operativni pregled je delimičan
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-100/70">
                  {
                    overview.errors.join(
                      " "
                    )
                  }
                </p>
              </div>
            </div>
          </section>
        ) : null
      }

      <nav
        aria-label="Operativni pogledi"
        className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {
          (
            Object.keys(
              VIEW_LABELS
            ) as
              PlatformOperationsView[]
          ).map(
            (
              view
            ) => {
              const active =
                filters.view ===
                view;

              return (
                <Link
                  key={
                    view
                  }
                  href={
                    buildPlatformOperationsHref(
                      filters,
                      {
                        view,
                      }
                    )
                  }
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={[
                    "rounded-2xl",
                    "border",
                    "px-4",
                    "py-4",
                    "transition",
                    active
                      ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                      : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20",
                  ].join(
                    " "
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">
                      {
                        VIEW_LABELS[
                          view
                        ]
                      }
                    </span>

                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold">
                      {
                        viewCounts[
                          view
                        ]
                      }
                    </span>
                  </div>
                </Link>
              );
            }
          )
        }
      </nav>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <div className="flex items-center gap-2">
          <Filter
            size={17}
            className="text-amber-300"
            aria-hidden="true"
          />
          <h2 className="font-semibold">
            Filteri
          </h2>
        </div>

        <form
          method="get"
          className="mt-5 grid gap-4 xl:grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(170px,0.7fr))_auto]"
        >
          <input
            type="hidden"
            name="view"
            value={
              filters.view
            }
          />

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Pretraga
            </span>

            <span className="mt-2 flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/60 px-3">
              <Search
                size={16}
                className="shrink-0 text-zinc-500"
                aria-hidden="true"
              />

              <input
                type="search"
                name="q"
                defaultValue={
                  filters.query
                }
                placeholder="Naziv ili slug"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-zinc-600"
              />
            </span>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Lifecycle
            </span>

            <select
              name="lifecycle"
              defaultValue={
                filters.lifecycle
              }
              className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-zinc-950/60 px-3 text-sm text-zinc-200 outline-none focus:border-amber-300/40"
            >
              {
                LIFECYCLE_OPTIONS.map(
                  (
                    [
                      value,
                      label,
                    ]
                  ) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {
                        label
                      }
                    </option>
                  )
                )
              }
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Severity
            </span>

            <select
              name="severity"
              defaultValue={
                filters.severity
              }
              className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-zinc-950/60 px-3 text-sm text-zinc-200 outline-none focus:border-amber-300/40"
            >
              {
                SEVERITY_OPTIONS.map(
                  (
                    [
                      value,
                      label,
                    ]
                  ) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {
                        label
                      }
                    </option>
                  )
                )
              }
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Package stanje
            </span>

            <select
              name="package"
              defaultValue={
                filters.packageState
              }
              className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-zinc-950/60 px-3 text-sm text-zinc-200 outline-none focus:border-amber-300/40"
            >
              {
                PACKAGE_OPTIONS.map(
                  (
                    [
                      value,
                      label,
                    ]
                  ) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {
                        label
                      }
                    </option>
                  )
                )
              }
            </select>
          </label>

          <button
            type="submit"
            className="min-h-11 self-end rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Primeni
          </button>
        </form>
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <h2 className="text-lg font-semibold">
              {
                VIEW_LABELS[
                  filters.view
                ]
              }
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {
                tenantViews.length
              }
              {" "}
              rezultata posle filtera
            </p>
          </div>

          <PackageStateBadge
            filters={
              filters
            }
          />
        </div>

        {
          tenantViews.length >
          0 ? (
            <div className="divide-y divide-white/10">
              {
                tenantViews.map(
                  (
                    item
                  ) => {
                    const {
                      tenant,
                      reasons,
                      severity,
                    } = item;

                    return (
                      <article
                        key={
                          tenant.id
                        }
                        className="grid gap-4 px-5 py-5 md:px-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.8fr)_auto]"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="truncate font-semibold">
                              {
                                tenant.name
                              }
                            </h3>

                            <BusinessPublicationBadge
                              status={
                                tenant.publicationStatus
                              }
                            />

                            {
                              severity ? (
                                <SeverityBadge
                                  severity={
                                    severity
                                  }
                                />
                              ) : (
                                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                                  Stabilno
                                </span>
                              )
                            }
                          </div>

                          <p className="mt-2 truncate text-sm text-zinc-500">
                            /{
                              tenant.slug
                            }
                          </p>

                          <p className="mt-3 text-sm leading-6 text-zinc-400">
                            {
                              reasons.length >
                              0
                                ? reasons.join(
                                    " · "
                                  )
                                : "Nema otvorenih operativnih signala."
                            }
                          </p>
                        </div>

                        <div className="grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-1">
                          <div className="rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2.5">
                            <p className="text-xs uppercase tracking-wider text-zinc-600">
                              Paket
                            </p>

                            <p className="mt-1 font-semibold text-zinc-300">
                              {
                                tenant.packageLabel
                              }
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2.5">
                            <p className="text-xs uppercase tracking-wider text-zinc-600">
                              Rezervacije 7 dana
                            </p>

                            <p className="mt-1 font-semibold text-zinc-300">
                              {
                                tenant.upcomingBookings
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-stretch gap-3 self-center">
                          <Link
                            href={`/platform-admin/businesses/${tenant.slug}`}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
                          >
                            Command center
                            <ArrowRight
                              size={16}
                              aria-hidden="true"
                            />
                          </Link>

                          <OperationsLifecycleQuickActions
                            businessSlug={
                              tenant.slug
                            }
                            initialStatus={
                              tenant.publicationStatus
                            }
                            expectedUpdatedAt={
                              tenant.updatedAt
                            }
                          />
                        </div>
                      </article>
                    );
                  }
                )
              }
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <CheckCircle2
                size={32}
                className="mx-auto text-emerald-300"
                aria-hidden="true"
              />

              <p className="mt-3 font-semibold">
                Nema tenant-a za izabrani pogled
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Promeni view ili očisti filtere.
              </p>
            </div>
          )
        }
      </section>
    </div>
  );
}
