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
  BUSINESS_PUBLICATION_DESCRIPTIONS,
  BUSINESS_PUBLICATION_LABELS,
  BUSINESS_PUBLICATION_STATUSES,
  type BusinessPublicationStatus,
} from "@/lib/publishing/status";
import {
  getPublicationPermission,
} from "@/lib/platform-admin/publication-permissions";

type PublicationApiResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
  business?: {
    slug?: string;
    publicationStatus?:
      BusinessPublicationStatus;
    isActive?: boolean;
  };
};

const STATUS_ICONS = {
  draft:
    FileClock,
  published:
    Globe2,
  suspended:
    PauseCircle,
  archived:
    Archive,
} as const;

export default function BusinessPublicationControls({
  businessSlug,
  initialStatus,
  previewUrl,
}: {
  businessSlug: string;
  initialStatus:
    BusinessPublicationStatus;
  previewUrl: string;
}) {
  const router =
    useRouter();

  const platformAccess =
    usePlatformAdminAccess();

  const [
    status,
    setStatus,
  ] =
    useState<
      BusinessPublicationStatus
    >(
      initialStatus
    );

  const [
    pendingStatus,
    setPendingStatus,
  ] =
    useState<
      BusinessPublicationStatus |
      null
    >(
      null
    );

  const [
    message,
    setMessage,
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null
    );

  async function updateStatus(
    nextStatus:
      BusinessPublicationStatus
  ) {
    if (
      nextStatus ===
        status ||
      pendingStatus
    ) {
      return;
    }

    if (
      (
        nextStatus ===
          "suspended" ||
        nextStatus ===
          "archived"
      ) &&
      !window.confirm(
        nextStatus ===
          "archived"
          ? "Arhivirati tenant? Javni sajt i booking biće isključeni."
          : "Suspendovati tenant? Javni sajt i booking biće privremeno isključeni."
      )
    ) {
      return;
    }

    setPendingStatus(
      nextStatus
    );

    setMessage(
      null
    );

    setError(
      null
    );

    try {
      const response =
        await fetch(
          "/api/platform-admin/businesses/publication",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                businessSlug,
                status:
                  nextStatus,
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

      setMessage(
        `Status je promenjen na „${BUSINESS_PUBLICATION_LABELS[
          resolvedStatus
        ]}“.`
      );

      router.refresh();
    } catch (
      updateError
    ) {
      setError(
        updateError instanceof
          Error
          ? updateError.message
          : "Došlo je do neočekivane greške."
      );
    } finally {
      setPendingStatus(
        null
      );
    }
  }

  return (
    <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Publishing lifecycle
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold">
              Status javnog tenant-a
            </h3>

            <BusinessPublicationBadge
              status={
                status
              }
            />
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            {
              BUSINESS_PUBLICATION_DESCRIPTIONS[
                status
              ]
            }
          </p>
        </div>

        <Link
          href={
            previewUrl
          }
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/10 px-4 py-2.5 text-sm font-semibold text-sky-200 transition hover:border-sky-300/35 hover:bg-sky-300/15"
        >
          <Eye
            size={
              17
            }
          />

          Admin preview
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {
          BUSINESS_PUBLICATION_STATUSES.map(
            (
              nextStatus
            ) => {
              const Icon =
                STATUS_ICONS[
                  nextStatus
                ];

              const isCurrent =
                nextStatus ===
                status;

              const isPending =
                nextStatus ===
                pendingStatus;

              const requiredPermission =
                getPublicationPermission(
                  nextStatus
                );

              const isAllowed =
                platformAccess
                  .permissions
                  .includes(
                    requiredPermission
                  );

              return (
                <button
                  key={
                    nextStatus
                  }
                  type="button"
                  disabled={
                    !isAllowed ||
                    isCurrent ||
                    pendingStatus !==
                      null
                  }
                  onClick={() =>
                    void updateStatus(
                      nextStatus
                    )
                  }
                  title={
                    isAllowed
                      ? undefined
                      : "Tvoja platformska rola nema dozvolu za ovu lifecycle akciju."
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition enabled:hover:border-white/25 enabled:hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {
                    isPending ? (
                      <LoaderCircle
                        size={
                          17
                        }
                        className="animate-spin"
                      />
                    ) : (
                      <Icon
                        size={
                          17
                        }
                      />
                    )
                  }

                  {
                    BUSINESS_PUBLICATION_LABELS[
                      nextStatus
                    ]
                  }
                </button>
              );
            }
          )
        }
      </div>

      {
        !platformAccess.permissions.includes(
          "tenant.publish"
        ) ? (
          <p className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] px-4 py-3 text-sm text-amber-100">
            Tvoja rola može da pregleda preview, ali nema dozvolu da objavi ili promeni lifecycle status tenant-a.
          </p>
        ) : null
      }

      {
        message ? (
          <p className="mt-4 text-sm text-emerald-300">
            {
              message
            }
          </p>
        ) : null
      }

      {
        error ? (
          <p className="mt-4 text-sm text-red-300">
            {
              error
            }
          </p>
        ) : null
      }
    </section>
  );
}
