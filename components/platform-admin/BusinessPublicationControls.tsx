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
  BUSINESS_PUBLICATION_DESCRIPTIONS,
  BUSINESS_PUBLICATION_LABELS,
  BUSINESS_PUBLICATION_STATUSES,
  type BusinessPublicationStatus,
} from "@/lib/publishing/status";

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
}: {
  businessSlug: string;
  initialStatus:
    BusinessPublicationStatus;
}) {
  const router =
    useRouter();

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
          href={`/salon/${businessSlug}?preview=1`}
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

              return (
                <button
                  key={
                    nextStatus
                  }
                  type="button"
                  disabled={
                    isCurrent ||
                    pendingStatus !==
                      null
                  }
                  onClick={() =>
                    void updateStatus(
                      nextStatus
                    )
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
