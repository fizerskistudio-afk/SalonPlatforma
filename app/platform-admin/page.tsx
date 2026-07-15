import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleOff,
  Clock3,
  Database,
  KeyRound,
  Mail,
  PlusCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import BusinessPublicationBadge from "@/components/platform-admin/BusinessPublicationBadge";

import {
  buildTenantAttentionQueue,
} from "@/lib/platform-admin/operational-readiness";
import {
  loadPlatformOperationsOverview,
  type PlatformOperationsTenant,
} from "@/lib/platform-admin/operations-server";

import type {
  BusinessPublicationStatus,
} from "@/lib/publishing/status";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

type DashboardTenant =
  PlatformOperationsTenant;

function hasValue(
  value:
    | string
    | null
    | undefined
): boolean {
  return Boolean(
    value?.trim()
  );
}

type ConfigurationCheck = {
  label: string;
  detail: string;
  ready: boolean;
  icon:
    typeof Database;
};

function getConfigurationChecks():
  ConfigurationCheck[] {
  const emailEnabled =
    process.env
      .EMAIL_DELIVERY_ENABLED !==
    "false";

  const checks:
    ConfigurationCheck[] = [
      {
        label:
          "Supabase server",
        detail:
          hasValue(
            process.env
              .NEXT_PUBLIC_SUPABASE_URL
          ) &&
          hasValue(
            process.env
              .SUPABASE_SECRET_KEY
          )
            ? "Server pristup je konfigurisan"
            : "Nedostaje server konfiguracija",
        ready:
          hasValue(
            process.env
              .NEXT_PUBLIC_SUPABASE_URL
          ) &&
          hasValue(
            process.env
              .SUPABASE_SECRET_KEY
          ),
        icon:
          Database,
      },
      {
        label:
          "Google Calendar",
        detail:
          hasValue(
            process.env
              .GOOGLE_OAUTH_CLIENT_ID
          ) &&
          hasValue(
            process.env
              .GOOGLE_OAUTH_CLIENT_SECRET
          ) &&
          hasValue(
            process.env
              .GOOGLE_TOKEN_ENCRYPTION_KEY
          )
            ? "OAuth i token enkripcija su spremni"
            : "Google OAuth nije kompletan",
        ready:
          hasValue(
            process.env
              .GOOGLE_OAUTH_CLIENT_ID
          ) &&
          hasValue(
            process.env
              .GOOGLE_OAUTH_CLIENT_SECRET
          ) &&
          hasValue(
            process.env
              .GOOGLE_TOKEN_ENCRYPTION_KEY
          ),
        icon:
          CalendarDays,
      },
      {
        label:
          "Email delivery",
        detail:
          !emailEnabled
            ? "Slanje emailova je isključeno"
            : hasValue(
                  process.env
                    .RESEND_API_KEY
                )
              ? "Resend delivery je konfigurisan"
              : "Email je uključen bez API ključa",
        ready:
          emailEnabled &&
          hasValue(
            process.env
              .RESEND_API_KEY
          ),
        icon:
          Mail,
      },
      {
        label:
          "Reminder cron",
        detail:
          hasValue(
            process.env
              .CRON_SECRET
          )
            ? "Cron endpoint ima zaštitu"
            : "CRON_SECRET nije podešen",
        ready:
          hasValue(
            process.env
              .CRON_SECRET
          ),
        icon:
          Clock3,
      },
      {
        label:
          "Public zaštita",
        detail:
          hasValue(
            process.env
              .PUBLIC_RATE_LIMIT_SECRET
          )
            ? "Rate-limit identiteti su zaštićeni"
            : "Rate-limit secret nije podešen",
        ready:
          hasValue(
            process.env
              .PUBLIC_RATE_LIMIT_SECRET
          ),
        icon:
          ShieldCheck,
      },
    ];

  return checks;
}

function countStatus(
  tenants:
    readonly DashboardTenant[],
  status:
    BusinessPublicationStatus
): number {
  return tenants.filter(
    (
      tenant
    ) =>
      tenant.publicationStatus ===
      status
  ).length;
}

function formatDate(
  value: string
): string {
  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "sr-Latn-RS",
    {
      dateStyle:
        "medium",
    }
  ).format(
    date
  );
}

export default async function PlatformAdminPage() {
  const overview =
    await loadPlatformOperationsOverview();

  const attentionQueue =
    buildTenantAttentionQueue(
      overview.tenants
    );

  const configurationChecks =
    getConfigurationChecks();

  const readyConfigurationCount =
    configurationChecks.filter(
      (
        check
      ) =>
        check.ready
    ).length;

  const recentTenants =
    overview.tenants.slice(
      0,
      5
    );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <Sparkles
              size={
                17
              }
            />

            Operativni kontrolni centar
          </div>

          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
            Platforma na jednom mestu.
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base">
            Stvarni status tenant-a, owner pristupa, upcoming rezervacija i ključnih produkcionih integracija.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/platform-admin/businesses"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            <Building2
              size={
                17
              }
            />

            Svi saloni
          </Link>

          <Link
            href="/platform-admin/businesses/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            <PlusCircle
              size={
                17
              }
            />

            Novi salon
          </Link>
        </div>
      </div>

      {
        overview.errors.length >
        0 ? (
          <section className="mt-7 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={
                  19
                }
                className="mt-0.5 shrink-0 text-amber-200"
              />

              <div>
                <p className="font-semibold text-amber-100">
                  Pregled je učitan delimično
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

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Ukupno tenant-a"
          value={
            overview.tenants.length
          }
          detail="Svi lifecycle statusi"
          icon={
            Building2
          }
        />

        <StatCard
          label="Objavljeni"
          value={
            countStatus(
              overview.tenants,
              "published"
            )
          }
          detail="Javni sajt i booking"
          icon={
            CheckCircle2
          }
        />

        <StatCard
          label="Draft"
          value={
            countStatus(
              overview.tenants,
              "draft"
            )
          }
          detail="Čeka završni onboarding"
          icon={
            Clock3
          }
        />

        <StatCard
          label="Pažnja"
          value={
            attentionQueue.length
          }
          detail="Operativne stavke"
          icon={
            AlertTriangle
          }
        />

        <StatCard
          label="Rezervacije 7 dana"
          value={
            overview
              .upcomingBookingsTotal
          }
          detail="Pending i confirmed"
          icon={
            CalendarDays
          }
        />
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 md:px-6">
            <div>
              <h3 className="text-lg font-semibold">
                Zahteva pažnju
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Draft, suspendovani ili tenant-i bez ključnog pristupa.
              </p>
            </div>

            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-400">
              {
                attentionQueue.length
              }
            </span>
          </div>

          {
            attentionQueue.length >
            0 ? (
              <div className="divide-y divide-white/10">
                {
                  attentionQueue
                    .slice(
                      0,
                      7
                    )
                    .map(
                      (
                        tenant
                      ) => (
                        <Link
                          key={
                            tenant.id
                          }
                          href={`/platform-admin/businesses/${tenant.slug}`}
                          className="flex flex-col gap-3 px-5 py-4 transition hover:bg-white/[0.025] md:flex-row md:items-center md:justify-between md:px-6"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="truncate font-semibold">
                                {
                                  tenant.name
                                }
                              </p>

                              <BusinessPublicationBadge
                                status={
                                  tenant.publicationStatus
                                }
                              />

                              <span
                                className={[
                                  "rounded-full",
                                  "border",
                                  "px-2.5",
                                  "py-1",
                                  "text-[10px]",
                                  "font-semibold",
                                  "uppercase",
                                  "tracking-wider",
                                  tenant.severity ===
                                  "critical"
                                    ? "border-red-300/20 bg-red-300/10 text-red-200"
                                    : tenant.severity ===
                                      "warning"
                                      ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                                      : "border-sky-300/20 bg-sky-300/10 text-sky-200",
                                ].join(
                                  " "
                                )}
                              >
                                {
                                  tenant.severity ===
                                  "critical"
                                    ? "Kritično"
                                    : tenant.severity ===
                                      "warning"
                                      ? "Upozorenje"
                                      : "Info"
                                }
                              </span>

                              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-zinc-400">
                                {
                                  tenant.packageLabel
                                }
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-zinc-500">
                              {
                                tenant.reasons.join(
                                  " · "
                                )
                              }
                            </p>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-zinc-400">
                            <span>
                              {
                                tenant.upcomingBookings
                              }
                              {" "}
                              rezervacija
                            </span>

                            <ArrowRight
                              size={
                                16
                              }
                            />
                          </div>
                        </Link>
                      )
                    )
                }
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <CheckCircle2
                  size={
                    30
                  }
                  className="mx-auto text-emerald-300"
                />

                <p className="mt-3 font-semibold">
                  Nema otvorenih operativnih stavki
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Svi aktivni tenant-i imaju osnovni status i owner pristup.
                </p>
              </div>
            )
          }
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">
                System health
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Bez prikazivanja vrednosti tajni.
              </p>
            </div>

            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-400">
              {
                readyConfigurationCount
              }
              /
              {
                configurationChecks.length
              }
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {
              configurationChecks.map(
                (
                  check
                ) => {
                  const Icon =
                    check.icon;

                  return (
                    <article
                      key={
                        check.label
                      }
                      className="flex items-start gap-3 rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3"
                    >
                      <div
                        className={[
                          "flex",
                          "h-9",
                          "w-9",
                          "shrink-0",
                          "items-center",
                          "justify-center",
                          "rounded-lg",
                          check.ready
                            ? "bg-emerald-300/10 text-emerald-300"
                            : "bg-amber-300/10 text-amber-200",
                        ].join(
                          " "
                        )}
                      >
                        <Icon
                          size={
                            17
                          }
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          {
                            check.label
                          }
                        </p>

                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          {
                            check.detail
                          }
                        </p>
                      </div>
                    </article>
                  );
                }
              )
            }
          </div>
        </section>
      </div>

      <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 md:px-6">
          <div>
            <h3 className="text-lg font-semibold">
              Poslednji tenant-i
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Brz ulaz u command center i onboarding.
            </p>
          </div>

          <Link
            href="/platform-admin/businesses"
            className="text-sm font-semibold text-amber-200 transition hover:text-amber-100"
          >
            Prikaži sve
          </Link>
        </div>

        {
          recentTenants.length >
          0 ? (
            <div className="divide-y divide-white/10">
              {
                recentTenants.map(
                  (
                    tenant
                  ) => (
                    <Link
                      key={
                        tenant.id
                      }
                      href={`/platform-admin/businesses/${tenant.slug}`}
                      className="grid gap-3 px-5 py-4 transition hover:bg-white/[0.025] md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center md:px-6"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {
                            tenant.name
                          }
                        </p>

                        <p className="mt-1 truncate text-sm text-zinc-500">
                          /{
                            tenant.slug
                          }
                        </p>
                      </div>

                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-400">
                        {
                          tenant.packageLabel
                        }
                      </span>

                      <BusinessPublicationBadge
                        status={
                          tenant.publicationStatus
                        }
                      />

                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span>
                          {
                            tenant.upcomingBookings
                          }
                          {" "}
                          narednih 7 dana
                        </span>

                        <span>
                          {
                            formatDate(
                              tenant.createdAt
                            )
                          }
                        </span>
                      </div>
                    </Link>
                  )
                )
              }
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <CircleOff
                size={
                  30
                }
                className="mx-auto text-zinc-600"
              />

              <p className="mt-3 font-semibold">
                Još nema tenant-a
              </p>

              <Link
                href="/platform-admin/businesses/new"
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950"
              >
                Kreiraj prvi salon
              </Link>
            </div>
          )
        }
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon:
    Icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon:
    typeof Building2;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">
            {
              label
            }
          </p>

          <p className="mt-3 text-3xl font-semibold">
            {
              value
            }
          </p>

          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-zinc-600">
            {
              detail
            }
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-zinc-200">
          <Icon
            size={
              20
            }
          />
        </div>
      </div>
    </article>
  );
}
