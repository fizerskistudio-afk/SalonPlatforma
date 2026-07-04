"use client";

import {
  useState,
  useTransition,
} from "react";
import {
  useRouter,
} from "next/navigation";
import {
  CheckCircle2,
  LoaderCircle,
  UserX,
} from "lucide-react";

import {
  updateBookingStatusAction,
} from "@/app/admin/(protected)/bookings/actions";
import type {
  BookingStatus,
} from "@/lib/admin/bookings";

type DashboardBookingQuickActionsProps = {
  bookingId: string;
  status: BookingStatus;
  compact?: boolean;
};

type ActionDefinition = {
  nextStatus: BookingStatus;
  label: string;
  icon: typeof CheckCircle2;
  className: string;
};

function getActions(
  status: BookingStatus
): ActionDefinition[] {
  if (status === "pending") {
    return [
      {
        nextStatus: "confirmed",
        label: "Potvrdi termin",
        icon: CheckCircle2,
        className:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15",
      },
    ];
  }

  if (status === "confirmed") {
    return [
      {
        nextStatus: "completed",
        label: "Označi završenim",
        icon: CheckCircle2,
        className:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15",
      },
      {
        nextStatus: "no_show",
        label: "Nije došao",
        icon: UserX,
        className:
          "border-orange-400/20 bg-orange-400/10 text-orange-200 hover:bg-orange-400/15",
      },
    ];
  }

  return [];
}

export default function DashboardBookingQuickActions({
  bookingId,
  status,
  compact = false,
}: DashboardBookingQuickActionsProps) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    message,
    setMessage,
  ] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const actions =
    getActions(status);

  if (
    actions.length === 0
  ) {
    return null;
  }

  function runAction(
    nextStatus: BookingStatus
  ) {
    setMessage(null);

    startTransition(
      () => {
        void (async () => {
          const result =
            await updateBookingStatusAction({
              bookingId,
              nextStatus,
            });

          setMessage({
            ok: result.ok,
            text: result.message,
          });

          if (result.ok) {
            router.refresh();
          }
        })();
      }
    );
  }

  return (
    <div
      className={
        compact
          ? "mt-4"
          : ""
      }
    >
      <div
        className={`grid gap-2 ${
          actions.length > 1
            ? "sm:grid-cols-2"
            : ""
        }`}
      >
        {actions.map(
          (action) => {
            const Icon =
              action.icon;

            return (
              <button
                key={
                  action.nextStatus
                }
                type="button"
                disabled={
                  isPending
                }
                onClick={() =>
                  runAction(
                    action.nextStatus
                  )
                }
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 ${action.className}`}
              >
                {isPending ? (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Icon
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                )}

                {action.label}
              </button>
            );
          }
        )}
      </div>

      {message && (
        <p
          aria-live="polite"
          className={`mt-2 text-xs leading-5 ${
            message.ok
              ? "text-emerald-300"
              : "text-red-300"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
