import Link from "next/link";

import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Eye,
  Rocket,
} from "lucide-react";

import BusinessPublicationBadge from "@/components/platform-admin/BusinessPublicationBadge";
import {
  TENANT_READINESS_GROUPS,
  type TenantReadinessGroup,
  type TenantReadinessSnapshot,
} from "@/lib/platform-admin/tenant-lifecycle";
import type {
  BusinessPublicationStatus,
} from "@/lib/publishing/status";

const GROUP_LABELS: Record<
  TenantReadinessGroup,
  string
> = {
  technical: "Tehnički",
  content: "Sadržaj",
  booking: "Booking",
  "owner-access": "Owner pristup",
};

export default function TenantReadinessCard({
  publicationStatus,
  readiness,
}: {
  publicationStatus:
    BusinessPublicationStatus;
  readiness:
    TenantReadinessSnapshot;
}) {
  const firstBlocker =
    readiness.blockers[0] ??
    null;

  return (
    <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <Rocket size={18} />
              Lifecycle readiness
            </div>

            <BusinessPublicationBadge
              status={
                publicationStatus
              }
            />
          </div>

          <h3 className="mt-3 text-xl font-semibold">
            {
              readiness.productionReady
                ? "Tenant je spreman za objavu"
                : "Objavu blokiraju nezavršene stavke"
            }
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            {readiness.completed}/{readiness.total}{" "}
            obaveznih stavki je završeno. Preview i production spremnost su odvojeni kako prodajni preview ne bi uključio booking pre vremena.
          </p>
        </div>

        <div className="min-w-44 rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
            Production
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {readiness.percent}%
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

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {
          TENANT_READINESS_GROUPS.map(
            (group) => {
              const ready =
                readiness.groups[
                  group
                ];

              return (
                <div
                  key={group}
                  className={[
                    "rounded-xl border px-4 py-3",
                    ready
                      ? "border-emerald-300/15 bg-emerald-300/[0.06]"
                      : "border-amber-300/15 bg-amber-300/[0.06]",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    {
                      ready ? (
                        <CheckCircle2
                          size={17}
                          className="text-emerald-300"
                        />
                      ) : (
                        <Circle
                          size={17}
                          className="text-amber-300"
                        />
                      )
                    }
                    <p className="text-sm font-semibold">
                      {GROUP_LABELS[group]}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {ready ? "Spremno" : "Potrebna akcija"}
                  </p>
                </div>
              );
            }
          )
        }
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className={[
          "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm",
          readiness.previewReady
            ? "border-sky-300/15 bg-sky-300/[0.06] text-sky-100"
            : "border-amber-300/15 bg-amber-300/[0.06] text-amber-100",
        ].join(" ")}>
          <Eye size={17} />
          Preview: {readiness.previewReady ? "spreman" : "blokiran"}
        </div>

        <div className={[
          "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm",
          readiness.productionReady
            ? "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-100"
            : "border-red-300/15 bg-red-300/[0.06] text-red-100",
        ].join(" ")}>
          <Rocket size={17} />
          Production/publish: {readiness.productionReady ? "spreman" : "blokiran"}
        </div>
      </div>

      {
        readiness.blockers.length > 0 ? (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Blokatori i direktne akcije
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {
                readiness.blockers.map(
                  (item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="flex min-h-11 items-center gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] px-4 py-3 text-sm font-medium text-amber-100 transition hover:border-amber-300/30"
                    >
                      <Circle
                        size={17}
                        className="shrink-0"
                      />
                      <span>
                        {item.label}
                      </span>
                    </Link>
                  )
                )
              }
            </div>
          </div>
        ) : null
      }

      {
        publicationStatus === "published" &&
        !readiness.productionReady ? (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />
            Objavljen tenant više ne ispunjava production kriterijume. Novi publish pokušaj bio bi blokiran; proveri navedene stavke.
          </div>
        ) : null
      }

      {
        firstBlocker ? (
          <Link
            href={firstBlocker.href}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Sledeći korak: {firstBlocker.label}
          </Link>
        ) : null
      }
    </section>
  );
}
