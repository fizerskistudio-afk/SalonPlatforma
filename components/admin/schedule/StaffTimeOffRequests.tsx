"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  Clock3,
  LoaderCircle,
  UserRound,
  X,
} from "lucide-react";

import { reviewStaffTimeOffRequestAction } from "@/app/admin/(protected)/schedule/staff-time-off-actions";
import type { AdminStaffTimeOffRequest } from "@/lib/admin/staff-time-off-requests";

type StaffTimeOffRequestsProps = {
  timezone: string;
  requests: AdminStaffTimeOffRequest[];
};

function formatDateTime(
  value: string,
  timezone: string
): string {
  const date =
    new Date(value);

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
      timeZone:
        timezone,
      weekday:
        "short",
      day:
        "2-digit",
      month:
        "short",
      year:
        "numeric",
      hour:
        "2-digit",
      minute:
        "2-digit",
    }
  ).format(date);
}

export default function StaffTimeOffRequests({
  timezone,
  requests,
}: StaffTimeOffRequestsProps) {
  const router =
    useRouter();

  const pendingRequests =
    requests.filter(
      (request) =>
        request.status ===
        "pending"
    );

  const [
    actionId,
    setActionId,
  ] =
    useState<string | null>(
      null
    );

  const [
    message,
    setMessage,
  ] =
    useState<{
      type: "success" | "error";
      text: string;
    } | null>(null);

  async function review(
    requestId: string,
    decision:
      | "approved"
      | "rejected"
  ) {
    setActionId(
      requestId
    );
    setMessage(
      null
    );

    try {
      const result =
        await reviewStaffTimeOffRequestAction({
          requestId,
          decision,
        });

      setMessage({
        type:
          result.ok
            ? "success"
            : "error",
        text:
          result.message,
      });

      if (result.ok) {
        router.refresh();
      }
    } finally {
      setActionId(
        null
      );
    }
  }

  return (
    <section className="px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <div className="rounded-[2rem] border border-violet-300/15 bg-violet-300/[0.035] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-300/10 text-violet-200">
              <Clock3 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                Staff zahtevi za odsustvo
              </h2>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Odobren zahtev automatski kreira blokadu zaposlenog. Zahtev sa aktivnom rezervacijom u istom periodu ne može biti odobren.
              </p>
            </div>
          </div>

          <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-semibold text-violet-200">
            {pendingRequests.length} na čekanju
          </span>
        </div>

        {message && (
          <div
            role="status"
            className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : "border-red-400/20 bg-red-400/10 text-red-200"
            }`}
          >
            {message.type === "error" && (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}

            <span>{message.text}</span>
          </div>
        )}

        {pendingRequests.length ===
        0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-zinc-600">
            Nema zahteva koji čekaju odluku.
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {pendingRequests.map(
              (request) => {
                const pending =
                  actionId ===
                  request.id;

                return (
                  <article
                    key={
                      request.id
                    }
                    className="grid gap-5 rounded-2xl border border-white/[0.08] bg-black/15 p-4 lg:grid-cols-[1fr_auto] lg:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 font-semibold text-zinc-100">
                          <UserRound className="h-4 w-4 text-violet-200" />
                          {
                            request.employeeName
                          }
                        </span>

                        {request.requesterEmail && (
                          <span className="text-xs text-zinc-600">
                            {
                              request.requesterEmail
                            }
                          </span>
                        )}
                      </div>

                      <div className="mt-3 text-sm text-zinc-300">
                        {formatDateTime(
                          request.startsAt,
                          timezone
                        )}{" "}
                        —{" "}
                        {formatDateTime(
                          request.endsAt,
                          timezone
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-zinc-500">
                        {
                          request.reason
                        }
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={
                          pending
                        }
                        onClick={() =>
                          void review(
                            request.id,
                            "approved"
                          )
                        }
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pending ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Odobri
                      </button>

                      <button
                        type="button"
                        disabled={
                          pending
                        }
                        onClick={() =>
                          void review(
                            request.id,
                            "rejected"
                          )
                        }
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X className="h-4 w-4" />
                        Odbij
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>
    </section>
  );
}
