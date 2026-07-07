"use client";

import {
  type ReactNode,
  useState,
  useTransition,
} from "react";
import {
  AlertCircle,
  CalendarDays,
  CalendarSync,
  CheckCircle2,
  Clock3,
  Link2,
  LoaderCircle,
  Mail,
  RefreshCw,
  Unplug,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  disconnectStaffGoogleCalendarAction,
  syncUpcomingStaffBookingsAction,
} from "@/app/staff/(protected)/calendar/actions";
import type {
  StaffGoogleCalendarConnection,
} from "@/lib/staff/google-calendar";

type StaffGoogleCalendarManagerProps = {
  connection:
    StaffGoogleCalendarConnection;
  oauthStatus: string | null;
};

type Message = {
  type:
    | "success"
    | "error";
  text: string;
};

function formatDateTime(
  value: string | null
): string {
  if (!value) {
    return "Još nema podataka";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "sr-Latn-RS",
    {
      dateStyle:
        "medium",
      timeStyle:
        "short",
    }
  ).format(date);
}

function getOAuthMessage(
  status: string | null
): Message | null {
  if (!status) {
    return null;
  }

  if (
    status === "connected"
  ) {
    return {
      type: "success",
      text:
        "Tvoj Google Calendar je uspešno povezan.",
    };
  }

  if (
    status === "cancelled" ||
    status === "access_denied"
  ) {
    return {
      type: "error",
      text:
        "Povezivanje je otkazano.",
    };
  }

  if (
    status ===
    "employee_link_required"
  ) {
    return {
      type: "error",
      text:
        "Staff nalog prvo mora biti povezan sa zaposlenim profilom.",
    };
  }

  if (
    status ===
    "insufficient_scope"
  ) {
    return {
      type: "error",
      text:
        "Google Calendar dozvola nije odobrena. Poveži nalog ponovo i obavezno dozvoli aplikaciji da vidi i menja događaje u Google Calendar-u.",
    };
  }

  return {
    type: "error",
    text:
      "Google Calendar trenutno nije moguće povezati. Pokušaj ponovo.",
  };
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-black/10 p-4">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-500">
        {icon}
      </span>

      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700">
          {label}
        </div>

        <div className="mt-1 break-words text-sm font-medium text-zinc-300">
          {value}
        </div>
      </div>
    </div>
  );
}

export default function StaffGoogleCalendarManager({
  connection,
  oauthStatus,
}: StaffGoogleCalendarManagerProps) {
  const router =
    useRouter();

  const [
    pending,
    startTransition,
  ] = useTransition();

  const [
    message,
    setMessage,
  ] = useState<Message | null>(
    getOAuthMessage(
      oauthStatus
    )
  );

  function syncUpcoming() {
    if (pending) {
      return;
    }

    setMessage(null);

    startTransition(
      async () => {
        const result =
          await syncUpcomingStaffBookingsAction();

        setMessage({
          type:
            result.ok
              ? "success"
              : "error",
          text:
            result.message,
        });

        router.refresh();
      }
    );
  }

  function disconnect() {
    if (pending) {
      return;
    }

    const confirmed =
      window.confirm(
        "Da li želiš da odspojiš svoj Google Calendar? Postojeći događaji ostaju u kalendaru, ali nove izmene više neće biti sinhronizovane."
      );

    if (!confirmed) {
      return;
    }

    setMessage(null);

    startTransition(
      async () => {
        const result =
          await disconnectStaffGoogleCalendarAction();

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
      }
    );
  }

  const calendarLabel =
    connection.calendarName
      ?.trim() ||
    connection.calendarId
      ?.trim() ||
    "Primary calendar";

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.07] to-blue-400/[0.035] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-200">
              <CalendarDays className="h-4 w-4" />
              Lični kalendar
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Moj Google Calendar
            </h1>

            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Tvoje potvrđene rezervacije se upisuju u tvoj lični kalendar. Salon istu rezervaciju nezavisno čuva i u zajedničkom kalendaru vlasnika.
            </p>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              connection.connected &&
              connection.isActive
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : "border-zinc-700 bg-white/[0.03] text-zinc-500"
            }`}
          >
            {connection.connected &&
            connection.isActive ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}

            {connection.connected &&
            connection.isActive
              ? "Povezan"
              : "Nije povezan"}
          </div>
        </div>
      </section>

      {message && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            message.type ===
            "success"
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

      {connection.lastError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4 text-red-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <div className="text-sm font-semibold">
              Poslednja sync greška
            </div>

            <div className="mt-1 break-words text-sm leading-6 text-red-200/70">
              {connection.lastError}
            </div>
          </div>
        </div>
      )}

      <section className="rounded-[2rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
        {connection.connected ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Detail
                icon={
                  <Mail className="h-4 w-4" />
                }
                label="Google nalog"
                value={
                  connection.accountEmail ??
                  "Email nije dostupan"
                }
              />

              <Detail
                icon={
                  <CalendarDays className="h-4 w-4" />
                }
                label="Kalendar"
                value={
                  calendarLabel
                }
              />

              <Detail
                icon={
                  <Link2 className="h-4 w-4" />
                }
                label="Povezan"
                value={
                  formatDateTime(
                    connection.connectedAt
                  )
                }
              />

              <Detail
                icon={
                  <Clock3 className="h-4 w-4" />
                }
                label="Poslednji sync"
                value={
                  formatDateTime(
                    connection.lastSyncedAt
                  )
                }
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row">
              <a
                href="/api/staff/google-calendar/connect"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                <RefreshCw className="h-4 w-4" />
                Ponovo poveži
              </a>

              <button
                type="button"
                disabled={pending}
                onClick={
                  syncUpcoming
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-blue-400/[0.06] px-5 text-sm font-semibold text-blue-200 transition hover:bg-blue-400/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <CalendarSync className="h-4 w-4" />
                )}
                Sinhronizuj termine
              </button>

              <button
                type="button"
                disabled={pending}
                onClick={
                  disconnect
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-5 text-sm font-semibold text-red-300 transition hover:bg-red-400/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Unplug className="h-4 w-4" />
                )}
                Odspoji
              </button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-200">
              <CalendarDays className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Poveži svoj kalendar
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-zinc-500">
              Nakon povezivanja, potvrđeni i pomereni termini automatski će se pojavljivati u tvom primarnom Google kalendaru. Otkazani termini se uklanjaju.
            </p>

            <a
              href="/api/staff/google-calendar/connect"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-300 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-blue-200"
            >
              <Link2 className="h-4 w-4" />
              Poveži Google Calendar
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
