import Link from "next/link";

import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Rocket,
} from "lucide-react";

import BusinessPublicationBadge from "@/components/platform-admin/BusinessPublicationBadge";

import {
  buildTenantReadiness,
} from "@/lib/platform-admin/operational-readiness";

import {
  type BusinessPublicationStatus,
} from "@/lib/publishing/status";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

type TenantReadinessCardProps = {
  businessId: string;
  businessSlug: string;
  publicationStatus:
    BusinessPublicationStatus;
  contactReady: boolean;
  bookingSettingsReady: boolean;
  categoriesReady: boolean;
  servicesReady: boolean;
  employeesReady: boolean;
  workingHoursReady: boolean;
};

export default async function TenantReadinessCard({
  businessId,
  businessSlug,
  publicationStatus,
  contactReady,
  bookingSettingsReady,
  categoriesReady,
  servicesReady,
  employeesReady,
  workingHoursReady,
}: TenantReadinessCardProps) {
  const supabase =
    createAdminClient();

  const {
    count:
      activeOwnerCount,
    error:
      ownerError,
  } =
    await supabase
      .from(
        "business_members"
      )
      .select(
        "id",
        {
          count:
            "exact",
          head:
            true,
        }
      )
      .eq(
        "business_id",
        businessId
      )
      .eq(
        "role",
        "owner"
      )
      .eq(
        "is_active",
        true
      );

  const ownerReady =
    !ownerError &&
    (
      activeOwnerCount ??
      0
    ) >
      0;

  const readiness =
    buildTenantReadiness({
      businessSlug,
      contactReady,
      bookingSettingsReady,
      categoriesReady,
      servicesReady,
      employeesReady,
      workingHoursReady,
      ownerReady,
    });

  const firstMissingItem =
    readiness.items.find(
      (
        item
      ) =>
        !item.ready
    ) ??
    null;

  return (
    <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <Rocket
                size={
                  18
                }
              />

              Onboarding readiness
            </div>

            <BusinessPublicationBadge
              status={
                publicationStatus
              }
            />
          </div>

          <h3 className="mt-3 text-xl font-semibold">
            {
              readiness.readyToPublish
                ? "Tenant je operativno spreman"
                : "Tenant zahteva još podešavanja"
            }
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            {
              readiness.completed
            }
            /
            {
              readiness.total
            }
            {" "}
            osnovnih launch stavki je završeno.
            {
              ownerError
                ? " Owner status trenutno nije mogao da se učita."
                : ""
            }
          </p>
        </div>

        <div className="min-w-44 rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
            Spremnost
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {
              readiness.percent
            }
            %
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-300 transition-[width]"
              style={{
                width:
                  `${readiness.percent}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {
          readiness.items.map(
            (
              item
            ) => (
              <Link
                key={
                  item.key
                }
                href={
                  item.href
                }
                className={[
                  "flex",
                  "items-center",
                  "gap-3",
                  "rounded-xl",
                  "border",
                  "px-4",
                  "py-3",
                  "text-sm",
                  "font-medium",
                  "transition",
                  item.ready
                    ? "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-200 hover:border-emerald-300/30"
                    : "border-amber-300/15 bg-amber-300/[0.06] text-amber-100 hover:border-amber-300/30",
                ].join(
                  " "
                )}
              >
                {
                  item.ready ? (
                    <CheckCircle2
                      size={
                        17
                      }
                      className="shrink-0"
                    />
                  ) : (
                    <Circle
                      size={
                        17
                      }
                      className="shrink-0"
                    />
                  )
                }

                {
                  item.label
                }
              </Link>
            )
          )
        }
      </div>

      {
        publicationStatus ===
          "published" &&
        !readiness.readyToPublish ? (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            <AlertTriangle
              size={
                18
              }
              className="mt-0.5 shrink-0"
            />

            Objavljen tenant ima nezavršene launch stavke. Sistem radi, ali pre prvog klijenta treba završiti checklistu.
          </div>
        ) : null
      }

      {
        firstMissingItem ? (
          <Link
            href={
              firstMissingItem.href
            }
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Nastavi: {
              firstMissingItem.label
            }
          </Link>
        ) : null
      }
    </section>
  );
}
