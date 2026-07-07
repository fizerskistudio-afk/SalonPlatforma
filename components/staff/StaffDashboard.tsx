"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Phone,
  Send,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  cancelStaffTimeOffRequestAction,
  createStaffTimeOffRequestAction,
  updateStaffBookingStatusAction,
} from "@/app/staff/(protected)/actions";
import type {
  StaffBooking,
  StaffBookingStatus,
  StaffDashboardData,
  StaffTimeOffRequestStatus,
} from "@/lib/staff/types";

type StaffDashboardProps = {
  data: StaffDashboardData;
};

type Message = {
  type: "success" | "error";
  text: string;
};

const statusLabels:
  Record<StaffBookingStatus, string> = {
    pending: "Na čekanju",
    confirmed: "Potvrđena",
    completed: "Završena",
    cancelled: "Otkazana",
    no_show: "Nije došao",
  };

const statusClasses:
  Record<StaffBookingStatus, string> = {
    pending:
      "border-amber-300/20 bg-amber-300/10 text-amber-200",
    confirmed:
      "border-blue-400/20 bg-blue-400/10 text-blue-200",
    completed:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    cancelled:
      "border-red-400/20 bg-red-400/10 text-red-200",
    no_show:
      "border-orange-400/20 bg-orange-400/10 text-orange-200",
  };

const requestStatusLabels:
  Record<StaffTimeOffRequestStatus, string> = {
    pending: "Na čekanju",
    approved: "Odobren",
    rejected: "Odbijen",
    cancelled: "Otkazan",
  };

function getDateKey(
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
    return "";
  }

  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          timezone,
        year:
          "numeric",
        month:
          "2-digit",
        day:
          "2-digit",
      }
    ).formatToParts(
      date
    );

  const get =
    (type: string) =>
      parts.find(
        (part) =>
          part.type ===
          type
      )?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

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
      hour:
        "2-digit",
      minute:
        "2-digit",
    }
  ).format(date);
}

function BookingActions({
  booking,
  pending,
  onAction,
}: {
  booking: StaffBooking;
  pending: boolean;
  onAction: (
    bookingId: string,
    nextStatus:
      | "confirmed"
      | "completed"
      | "no_show"
  ) => void;
}) {
  if (
    booking.status ===
    "pending"
  ) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          onAction(
            booking.id,
            "confirmed"
          )
        }
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && (
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
        )}
        Potvrdi
      </button>
    );
  }

  if (
    booking.status ===
    "confirmed"
  ) {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            onAction(
              booking.id,
              "completed"
            )
          }
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          )}
          Završeno
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            onAction(
              booking.id,
              "no_show"
            )
          }
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-xs font-semibold text-orange-200 transition hover:bg-orange-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Nije došao
        </button>
      </div>
    );
  }

  return null;
}

export default function StaffDashboard({
  data,
}: StaffDashboardProps) {
  const router =
    useRouter();

  const [
    pendingId,
    setPendingId,
  ] =
    useState<string | null>(
      null
    );

  const [
    requestPending,
    setRequestPending,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] =
    useState<Message | null>(
      null
    );

  const [
    startsAt,
    setStartsAt,
  ] = useState("");

  const [
    endsAt,
    setEndsAt,
  ] = useState("");

  const [
    reason,
    setReason,
  ] = useState("");

  const now =
    new Date();

  const todayKey =
    getDateKey(
      now.toISOString(),
      data.business.timezone
    );

  const todayBookings =
    data.bookings.filter(
      (booking) =>
        getDateKey(
          booking.startsAt,
          data.business.timezone
        ) === todayKey &&
        booking.status !==
          "cancelled"
    );

  const upcomingBookings =
    data.bookings.filter(
      (booking) =>
        new Date(
          booking.startsAt
        ).getTime() >=
          now.getTime() &&
        (
          booking.status ===
            "pending" ||
          booking.status ===
            "confirmed"
        )
    );

  const pendingCount =
    upcomingBookings.filter(
      (booking) =>
        booking.status ===
        "pending"
    ).length;

  async function changeStatus(
    bookingId: string,
    nextStatus:
      | "confirmed"
      | "completed"
      | "no_show"
  ) {
    setPendingId(
      bookingId
    );
    setMessage(
      null
    );

    try {
      const result =
        await updateStaffBookingStatusAction({
          bookingId,
          nextStatus,
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
      setPendingId(
        null
      );
    }
  }

  async function submitRequest(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setRequestPending(
      true
    );
    setMessage(
      null
    );

    try {
      const startDate =
        new Date(startsAt);

      const endDate =
        new Date(endsAt);

      if (
        Number.isNaN(
          startDate.getTime()
        ) ||
        Number.isNaN(
          endDate.getTime()
        )
      ) {
        setMessage({
          type:
            "error",
          text:
            "Unesi početak i kraj odsustva.",
        });
        return;
      }

      const result =
        await createStaffTimeOffRequestAction({
          startsAt:
            startDate.toISOString(),
          endsAt:
            endDate.toISOString(),
          reason,
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
        setStartsAt("");
        setEndsAt("");
        setReason("");
        router.refresh();
      }
    } finally {
      setRequestPending(
        false
      );
    }
  }

  async function cancelRequest(
    requestId: string
  ) {
    setPendingId(
      requestId
    );
    setMessage(
      null
    );

    try {
      const result =
        await cancelStaffTimeOffRequestAction({
          requestId,
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
      setPendingId(
        null
      );
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.07] to-amber-300/[0.035] p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-200">
            <UserRound className="h-4 w-4" />
            Staff dashboard
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Zdravo,{" "}
            <span className="text-amber-300">
              {data.employee.name}
            </span>
          </h1>

          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Ovde vidiš samo svoj raspored, svoje rezervacije i svoje zahteve za odsustvo u salonu{" "}
            <strong className="text-zinc-200">
              {data.business.name}
            </strong>
            .
          </p>
        </div>
      </section>

      {message && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
              : "border-red-400/20 bg-red-400/10 text-red-200"
          }`}
        >
          {message.type ===
          "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}

          <span>
            {message.text}
          </span>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Danas"
          value={todayBookings.length}
          description="tvojih termina"
          icon={CalendarCheck2}
        />

        <MetricCard
          label="Predstojeće"
          value={upcomingBookings.length}
          description="aktivnih termina"
          icon={CalendarClock}
        />

        <MetricCard
          label="Na čekanju"
          value={pendingCount}
          description="za potvrdu"
          icon={Clock3}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
          <div className="border-b border-white/[0.07] px-5 py-5 sm:px-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Današnji raspored
            </div>

            <h2 className="mt-1 text-xl font-semibold">
              Moji termini
            </h2>
          </div>

          {todayBookings.length ===
          0 ? (
            <div className="px-6 py-14 text-center text-sm text-zinc-600">
              Danas nemaš zakazanih termina.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {todayBookings.map(
                (booking) => (
                  <BookingRow
                    key={
                      booking.id
                    }
                    booking={
                      booking
                    }
                    timezone={
                      data.business
                        .timezone
                    }
                    pending={
                      pendingId ===
                      booking.id
                    }
                    onAction={
                      changeStatus
                    }
                  />
                )
              )}
            </div>
          )}
        </article>

        <article className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-5 w-5 text-amber-300" />

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Nedeljni raspored
              </div>

              <h2 className="mt-1 text-xl font-semibold">
                Radno vreme
              </h2>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {data.schedule.map(
              (day) => (
                <div
                  key={
                    day.dayOfWeek
                  }
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-black/10 px-3 py-2.5 text-sm"
                >
                  <span className="text-zinc-400">
                    {day.label}
                  </span>

                  <span
                    className={
                      day.isClosed
                        ? "text-zinc-600"
                        : "font-medium text-zinc-200"
                    }
                  >
                    {day.isClosed
                      ? "Ne radiš"
                      : `${day.openTime}–${day.closeTime}`}
                  </span>
                </div>
              )
            )}
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <div className="border-b border-white/[0.07] px-5 py-5 sm:px-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
            Naredni period
          </div>

          <h2 className="mt-1 text-xl font-semibold">
            Predstojeće rezervacije
          </h2>
        </div>

        {upcomingBookings.length ===
        0 ? (
          <div className="px-6 py-14 text-center text-sm text-zinc-600">
            Nema predstojećih rezervacija.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {upcomingBookings
              .slice(0, 20)
              .map(
                (booking) => (
                  <BookingRow
                    key={
                      booking.id
                    }
                    booking={
                      booking
                    }
                    timezone={
                      data.business
                        .timezone
                    }
                    pending={
                      pendingId ===
                      booking.id
                    }
                    onAction={
                      changeStatus
                    }
                  />
                )
              )}
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-300/10 text-violet-200">
              <Send className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                Zahtev za odsustvo
              </h2>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Zahtev ne blokira termine dok ga vlasnik ili menadžer ne odobri.
              </p>
            </div>
          </div>

          <form
            onSubmit={
              submitRequest
            }
            className="mt-6 space-y-4"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">
                Početak
              </span>

              <input
                type="datetime-local"
                required
                value={
                  startsAt
                }
                onChange={
                  (event: ChangeEvent<HTMLInputElement>) =>
                    setStartsAt(
                      event.target
                        .value
                    )
                }
                disabled={
                  requestPending
                }
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">
                Kraj
              </span>

              <input
                type="datetime-local"
                required
                value={
                  endsAt
                }
                onChange={
                  (event: ChangeEvent<HTMLInputElement>) =>
                    setEndsAt(
                      event.target
                        .value
                    )
                }
                disabled={
                  requestPending
                }
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">
                Razlog
              </span>

              <textarea
                required
                minLength={3}
                maxLength={500}
                value={
                  reason
                }
                onChange={
                  (event: ChangeEvent<HTMLTextAreaElement>) =>
                    setReason(
                      event.target
                        .value
                    )
                }
                disabled={
                  requestPending
                }
                rows={4}
                className="w-full resize-y rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
                placeholder="Godišnji odmor, privatne obaveze..."
              />
            </label>

            <button
              type="submit"
              disabled={
                requestPending
              }
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {requestPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}

              Pošalji zahtev
            </button>
          </form>
        </article>

        <article className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6">
          <h2 className="text-xl font-semibold">
            Moji zahtevi
          </h2>

          <div className="mt-5 space-y-3">
            {data.timeOffRequests.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-600">
                Još nema zahteva za odsustvo.
              </div>
            ) : (
              data.timeOffRequests.map(
                (request) => (
                  <div
                    key={
                      request.id
                    }
                    className="rounded-2xl border border-white/[0.07] bg-black/10 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-zinc-200">
                          {formatDateTime(
                            request.startsAt,
                            data.business
                              .timezone
                          )}
                        </div>

                        <div className="mt-1 text-xs text-zinc-600">
                          do{" "}
                          {formatDateTime(
                            request.endsAt,
                            data.business
                              .timezone
                          )}
                        </div>
                      </div>

                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        {
                          requestStatusLabels[
                            request.status
                          ]
                        }
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-zinc-500">
                      {
                        request.reason
                      }
                    </p>

                    {request.reviewNote && (
                      <p className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs text-zinc-500">
                        Napomena:{" "}
                        {
                          request.reviewNote
                        }
                      </p>
                    )}

                    {request.status ===
                      "pending" && (
                      <button
                        type="button"
                        disabled={
                          pendingId ===
                          request.id
                        }
                        onClick={() =>
                          void cancelRequest(
                            request.id
                          )
                        }
                        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-red-300 transition hover:text-red-200 disabled:opacity-50"
                      >
                        {pendingId ===
                        request.id ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}

                        Otkaži zahtev
                      </button>
                    )}
                  </div>
                )
              )
            )}
          </div>
        </article>
      </section>

      {data.approvedTimeOff.length >
        0 && (
        <section className="rounded-[2rem] border border-emerald-400/15 bg-emerald-400/[0.04] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-emerald-100">
            Odobrena buduća odsustva
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.approvedTimeOff.map(
              (item) => (
                <div
                  key={
                    item.id
                  }
                  className="rounded-2xl border border-emerald-400/10 bg-black/10 p-4"
                >
                  <div className="text-sm font-medium text-emerald-100">
                    {formatDateTime(
                      item.startsAt,
                      data.business
                        .timezone
                    )}
                  </div>

                  <div className="mt-1 text-xs text-emerald-300/60">
                    do{" "}
                    {formatDateTime(
                      item.endsAt,
                      data.business
                        .timezone
                    )}
                  </div>

                  {item.reason && (
                    <p className="mt-2 text-sm text-zinc-500">
                      {
                        item.reason
                      }
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function BookingRow({
  booking,
  timezone,
  pending,
  onAction,
}: {
  booking: StaffBooking;
  timezone: string;
  pending: boolean;
  onAction: (
    bookingId: string,
    nextStatus:
      | "confirmed"
      | "completed"
      | "no_show"
  ) => void;
}) {
  return (
    <div className="grid gap-4 px-5 py-4 sm:px-6 lg:grid-cols-[180px_1fr_auto] lg:items-center">
      <div>
        <div className="font-semibold text-zinc-100">
          {formatDateTime(
            booking.startsAt,
            timezone
          )}
        </div>

        <div className="mt-1 text-xs text-zinc-600">
          {
            booking.durationMinutes
          }{" "}
          min · #
          {
            booking.referenceCode
          }
        </div>
      </div>

      <div className="min-w-0">
        <div className="truncate font-medium text-zinc-200">
          {
            booking.customerName
          }
        </div>

        <div className="mt-1 text-sm text-zinc-500">
          {
            booking.serviceName
          }
        </div>

        <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-600">
          {booking.customerPhone && (
            <a
              href={`tel:${booking.customerPhone.replace(
                /[^\d+]/g,
                ""
              )}`}
              className="inline-flex items-center gap-1.5 transition hover:text-amber-200"
            >
              <Phone className="h-3.5 w-3.5" />
              {
                booking.customerPhone
              }
            </a>
          )}

          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusClasses[booking.status]}`}
          >
            {
              statusLabels[
                booking.status
              ]
            }
          </span>
        </div>
      </div>

      <BookingActions
        booking={booking}
        pending={pending}
        onAction={onAction}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof CalendarCheck2;
}) {
  return (
    <article className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-500">
            {label}
          </div>

          <div className="mt-2 text-3xl font-semibold">
            {value}
          </div>

          <div className="mt-1 text-xs text-zinc-600">
            {description}
          </div>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}
