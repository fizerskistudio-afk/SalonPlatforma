"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  LoaderCircle,
  Settings2,
} from "lucide-react";

import {
  usePlatformAdminAccess,
} from "@/components/platform-admin/PlatformAdminAccessProvider";
import {
  getLifecycleActionLabel,
  getLifecycleConfirmationMessage,
} from "@/lib/platform-admin/lifecycle-action-copy";
import {
  getPublicationPermission,
} from "@/lib/platform-admin/publication-permissions";
import {
  getAllowedLifecycleTargets,
} from "@/lib/platform-admin/tenant-lifecycle";
import {
  BUSINESS_PUBLICATION_LABELS,
  type BusinessPublicationStatus,
} from "@/lib/publishing/status";

type PublicationApiResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
  business?: {
    publicationStatus?:
      BusinessPublicationStatus;
    updatedAt?: string;
  };
};

export default function OperationsLifecycleQuickActions({
  businessSlug,
  initialStatus,
  expectedUpdatedAt,
}: {
  businessSlug: string;
  initialStatus:
    BusinessPublicationStatus;
  expectedUpdatedAt: string;
}) {
  const router =
    useRouter();

  const platformAccess =
    usePlatformAdminAccess();

  const [
    status,
    setStatus,
  ] =
    useState<BusinessPublicationStatus>(
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
  ] =
    useState<BusinessPublicationStatus | null>(
      null
    );

  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const visibleTargets =
    getAllowedLifecycleTargets(
      status
    ).filter(
      (
        target
      ) =>
        platformAccess
          .permissions
          .includes(
            getPublicationPermission(
              status,
              target
            )
          )
    );

  if (
    visibleTargets.length ===
    0
  ) {
    return null;
  }

  async function updateStatus(
    nextStatus:
      BusinessPublicationStatus
  ) {
    if (
      pendingStatus
    ) {
      return;
    }

    if (
      !window.confirm(
        getLifecycleConfirmationMessage(
          nextStatus
        )
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
            cache:
              "no-store",
            body:
              JSON.stringify({
                businessSlug,
                status:
                  nextStatus,
                expectedUpdatedAt:
                  version,
              }),
          }
        );

      const payload =
        (
          await response
            .json()
            .catch(
              () => ({})
            )
        ) as
          PublicationApiResponse;

      if (
        !response.ok ||
        !payload.ok
      ) {
        throw new Error(
          payload.message ??
          "Lifecycle akcija nije uspela."
        );
      }

      const resolvedStatus =
        payload.business
          ?.publicationStatus ??
        nextStatus;

      const resolvedVersion =
        payload.business
          ?.updatedAt;

      setStatus(
        resolvedStatus
      );

      if (
        resolvedVersion
      ) {
        setVersion(
          resolvedVersion
        );
      }

      setMessage(
        `Status je promenjen u „${BUSINESS_PUBLICATION_LABELS[resolvedStatus]}“.`
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
    <div className="w-full rounded-xl border border-white/10 bg-zinc-950/40 p-3 xl:w-56">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        <Settings2
          size={14}
          aria-hidden="true"
        />
        Quick actions
      </div>

      <div className="mt-3 grid gap-2">
        {
          visibleTargets.map(
            (
              target
            ) => {
              const isPending =
                pendingStatus ===
                target;

              return (
                <button
                  key={
                    target
                  }
                  type="button"
                  disabled={
                    pendingStatus !==
                    null
                  }
                  onClick={
                    () =>
                      void updateStatus(
                        target
                      )
                  }
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-300 transition enabled:hover:border-white/25 enabled:hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {
                    isPending ? (
                      <LoaderCircle
                        size={14}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                    ) : null
                  }

                  {
                    getLifecycleActionLabel(
                      status,
                      target
                    )
                  }
                </button>
              );
            }
          )
        }
      </div>

      <div
        aria-live="polite"
        className="mt-2"
      >
        {
          message ? (
            <p className="text-xs leading-5 text-emerald-300">
              {message}
            </p>
          ) : null
        }

        {
          error ? (
            <p className="text-xs leading-5 text-red-300">
              {error}
            </p>
          ) : null
        }
      </div>
    </div>
  );
}
