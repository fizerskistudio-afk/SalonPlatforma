"use client";

import {
  useState,
} from "react";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  Archive,
  Eye,
  FileClock,
  Globe2,
  LoaderCircle,
  PauseCircle,
} from "lucide-react";

import BusinessPublicationBadge from "./BusinessPublicationBadge";
import {
  usePlatformAdminAccess,
} from "./PlatformAdminAccessProvider";
import {
  getPublicationPermission,
} from "@/lib/platform-admin/publication-permissions";
import {
  getAllowedLifecycleTargets,
  type TenantReadinessItem,
  type TenantReadinessSnapshot,
} from "@/lib/platform-admin/tenant-lifecycle";
import {
  BUSINESS_PUBLICATION_DESCRIPTIONS,
  BUSINESS_PUBLICATION_LABELS,
  type BusinessPublicationStatus,
} from "@/lib/publishing/status";

type PublicationApiResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
  blockers?: TenantReadinessItem[];
  business?: {
    slug?: string;
    publicationStatus?:
      BusinessPublicationStatus;
    isActive?: boolean;
    updatedAt?: string;
  };
};

const STATUS_ICONS = {
  draft: FileClock,
  published: Globe2,
  suspended: PauseCircle,
  archived: Archive,
} as const;

function getLifecycleActionLabel(
  currentStatus: BusinessPublicationStatus,
  nextStatus: BusinessPublicationStatus
): string {
  switch (nextStatus) {
    case "published":
      return "Objavi javno";
    case "draft":
      return currentStatus === "suspended" ||
        currentStatus === "archived"
        ? "Reaktiviraj kao draft"
        : "Povuci u draft";
    case "suspended":
      return "Suspenduj";
    case "archived":
      return "Arhiviraj";
  }
}

function getConfirmationMessage(
  nextStatus: BusinessPublicationStatus
): string {
  switch (nextStatus) {
    case "published":
      return "Objaviti tenant? Javni sajt i booking postaće dostupni.";
    case "draft":
      return "Prebaciti tenant u draft? Javni sajt i booking neće biti dostupni.";
    case "suspended":
      return "Suspendovati tenant? Javni sajt i booking biće privremeno isključeni.";
    case "archived":
      return "Arhivirati tenant? Javni sajt i booking biće isključeni, a povratak ide prvo kroz draft.";
  }
}

export default function BusinessPublicationControls({
  businessSlug,
  initialStatus,
  expectedUpdatedAt,
  readiness,
  previewUrl,
}: {
  businessSlug: string;
  initialStatus:
    BusinessPublicationStatus;
  expectedUpdatedAt: string;
  readiness:
    TenantReadinessSnapshot;
  previewUrl: string;
}) {
  const router =
    useRouter();
  const platformAccess =
    usePlatformAdminAccess();
  const [
    status,
    setStatus,
  ] = useState<BusinessPublicationStatus>(
    initialStatus
  );
  const [
    version,
    setVersion,
  ] = useState(
    expectedUpdatedAt
  );
  const [
    pendingStatus,
    setPendingStatus,
  ] = useState<BusinessPublicationStatus | null>(
    null
  );
  const [
    message,
    setMessage,
  ] = useState<string | null>(
    null
  );
  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );
  const [
    serverBlockers,
    setServerBlockers,
  ] = useState<TenantReadinessItem[]>([]);

  const allowedTargets =
    getAllowedLifecycleTargets(
      status
    );
  const canUseAnyAction =
    allowedTargets.some(
      (target) =>
        platformAccess.permissions.includes(
          getPublicationPermission(
            status,
            target
          )
        )
    );
  const visibleBlockers =
    serverBlockers.length > 0
      ? serverBlockers
      : readiness.blockers;

  async function updateStatus(
    nextStatus: BusinessPublicationStatus
  ) {
    if (pendingStatus) {
      return;
    }

    if (
      nextStatus === "published" &&
      !readiness.productionReady
    ) {
      setError(
        "Objava je blokirana dok sve production readiness stavke ne budu završene."
      );
      setServerBlockers(
        readiness.blockers
      );
      return;
    }

    if (
      !window.confirm(
        getConfirmationMessage(
          nextStatus
        )
      )
    ) {
      return;
    }

    setPendingStatus(
      nextStatus
    );
    setMessage(null);
    setError(null);
    setServerBlockers([]);

    try {
      const response =
        await fetch(
          "/api/platform-admin/businesses/publication",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            cache: "no-store",
            body: JSON.stringify({
              businessSlug,
              status: nextStatus,
              expectedUpdatedAt:
                version,
            }),
          }
        );
      const payload =
        await response.json() as
          PublicationApiResponse;

      if (
        !response.ok ||
        !payload.ok
      ) {
        setServerBlockers(
          payload.blockers ??
          []
        );
        throw new Error(
          payload.message ??
          "Status tenant-a nije moguće promeniti."
        );
      }

      const resolvedStatus =
        payload.business
          ?.publicationStatus ??
        nextStatus;

      setStatus(
        resolvedStatus
      );

      if (
        payload.business
          ?.updatedAt
      ) {
        setVersion(
          payload.business
            .updatedAt
        );
      }

      setMessage(
        `Lifecycle akcija je završena. Trenutni status: „${BUSINESS_PUBLICATION_LABELS[resolvedStatus]}“.`
      );
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Došlo je do neočekivane greške."
      );
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Trenutni lifecycle status
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold">
              Javni tenant
            </h3>
            <BusinessPublicationBadge
              status={status}
            />
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            {BUSINESS_PUBLICATION_DESCRIPTIONS[status]}
          </p>
        </div>

        <Link
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/10 px-4 py-2.5 text-sm font-semibold text-sky-200 transition hover:border-sky-300/35 hover:bg-sky-300/15"
        >
          <Eye size={17} />
          Admin preview
        </Link>
      </div>

      {
        !readiness.productionReady ? (
          <div className="mt-5 rounded-xl border border-red-300/15 bg-red-300/[0.06] p-4">
            <p className="text-sm font-semibold text-red-100">
              Publish je server-side blokiran
            </p>
            <p className="mt-1 text-sm leading-6 text-zinc-400">
              Završi blokatore ispod. Preview može ostati dostupan kada su technical i content kriterijumi spremni.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {
                visibleBlockers.map(
                  (blocker) => (
                    <Link
                      key={blocker.key}
                      href={blocker.href}
                      className="inline-flex min-h-10 items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-white/25"
                    >
                      {blocker.label}
                    </Link>
                  )
                )
              }
            </div>
          </div>
        ) : null
      }

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Dozvoljene akcije
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {
            allowedTargets.map(
              (nextStatus) => {
                const Icon =
                  STATUS_ICONS[nextStatus];
                const isPending =
                  nextStatus ===
                  pendingStatus;
                const requiredPermission =
                  getPublicationPermission(
                    status,
                    nextStatus
                  );
                const isAllowed =
                  platformAccess.permissions.includes(
                    requiredPermission
                  );
                const blockedByReadiness =
                  nextStatus === "published" &&
                  !readiness.productionReady;

                return (
                  <button
                    key={nextStatus}
                    type="button"
                    disabled={
                      !isAllowed ||
                      blockedByReadiness ||
                      pendingStatus !== null
                    }
                    onClick={() =>
                      void updateStatus(
                        nextStatus
                      )
                    }
                    title={
                      !isAllowed
                        ? "Tvoja platformska rola nema dozvolu za ovu lifecycle akciju."
                        : blockedByReadiness
                          ? "Production readiness nije kompletan."
                          : undefined
                    }
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition enabled:hover:border-white/25 enabled:hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {
                      isPending ? (
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Icon size={17} />
                      )
                    }
                    {getLifecycleActionLabel(status, nextStatus)}
                  </button>
                );
              }
            )
          }
        </div>
      </div>

      {
        !canUseAnyAction ? (
          <p className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] px-4 py-3 text-sm text-amber-100">
            Tvoja rola može da pregleda stanje i preview, ali nema lifecycle release dozvolu.
          </p>
        ) : null
      }

      <div aria-live="polite">
        {
          message ? (
            <p className="mt-4 text-sm text-emerald-300">
              {message}
            </p>
          ) : null
        }
        {
          error ? (
            <p
              role="alert"
              className="mt-4 text-sm text-red-300"
            >
              {error}
            </p>
          ) : null
        }
      </div>
    </section>
  );
}
