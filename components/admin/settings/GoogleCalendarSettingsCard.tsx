"use client";

import {
  useEffect,
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
  X,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";

import {
  disconnectGoogleCalendarAction,
} from "@/app/admin/(protected)/settings/google-calendar-actions";

type GoogleCalendarConnection = {
  connected: boolean;
  isActive: boolean;

  accountEmail: string | null;

  calendarId: string | null;
  calendarName: string | null;

  connectedAt: string | null;
  lastSyncedAt: string | null;

  lastError: string | null;
};

type GoogleCalendarSettingsCardProps = {
  connection: GoogleCalendarConnection;
  timezone: string;
};

type ActionMessage = {
  type: "success" | "error";
  text: string;
};

function formatDateTime(
  value: string | null,
  timezone: string
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

  try {
    return new Intl.DateTimeFormat(
      "sr-Latn-RS",
      {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: timezone,
      }
    ).format(date);
  } catch {
    return date.toISOString();
  }
}

function ConnectionDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-black/10 p-4">
      <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-500">
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

export default function GoogleCalendarSettingsCard({
  connection,
  timezone,
}: GoogleCalendarSettingsCardProps) {
  const router =
    useRouter();

  const [
    disconnectPending,
    startDisconnectTransition,
  ] = useTransition();

  const [
    message,
    setMessage,
  ] =
    useState<ActionMessage | null>(
      null
    );

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const oauthStatus =
      params.get(
        "googleCalendar"
      );

    if (!oauthStatus) {
      return;
    }

    if (
      oauthStatus ===
      "connected"
    ) {
      setMessage({
        type: "success",
        text: "Google Calendar je uspešno povezan.",
      });

      return;
    }

    if (
      oauthStatus ===
        "cancelled" ||
      oauthStatus ===
        "access_denied"
    ) {
      setMessage({
        type: "error",
        text: "Povezivanje sa Google Calendar-om je otkazano.",
      });

      return;
    }

    setMessage({
      type: "error",
      text: "Google Calendar trenutno nije moguće povezati. Proveri Google nalog i pokušaj ponovo.",
    });
  }, []);

  const clearOAuthMessage =
    (): void => {
      setMessage(null);

      const url =
        new URL(
          window.location.href
        );

      url.searchParams.delete(
        "googleCalendar"
      );

      router.replace(
        `${url.pathname}${url.search}`,
        {
          scroll: false,
        }
      );
    };

  const handleDisconnect =
    (): void => {
      if (
        disconnectPending
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Da li želiš da odspojiš Google Calendar? Postojeći događaji neće biti obrisani, ali nove rezervacije više neće biti sinhronizovane."
        );

      if (!confirmed) {
        return;
      }

      setMessage(null);

      startDisconnectTransition(
        async () => {
          try {
            const result =
              await disconnectGoogleCalendarAction();

            setMessage({
              type: result.ok
                ? "success"
                : "error",

              text:
                result.message,
            });

            if (result.ok) {
              router.refresh();
            }
          } catch {
            setMessage({
              type: "error",
              text: "Došlo je do neočekivane greške prilikom odspajanja Google Calendar-a.",
            });
          }
        }
      );
    };

  const calendarLabel =
    connection.calendarName
      ?.trim() ||
    connection.calendarId
      ?.trim() ||
    "Primary calendar";

  return (
    <div className="px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <div className="flex flex-col justify-between gap-5 border-b border-white/[0.07] p-5 sm:p-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-300">
              <CalendarSync
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300/70">
                Integracija
              </div>

              <h2 className="mt-1 text-xl font-semibold text-white">
                Google Calendar
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
                Automatski kreira,
                ažurira i briše
                događaje kada se
                promeni rezervacija.
              </p>
            </div>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              connection.connected
                ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                : "border-zinc-700 bg-white/[0.03] text-zinc-500"
            }`}
          >
            {connection.connected ? (
              <CheckCircle2
                className="h-4 w-4"
                aria-hidden="true"
              />
            ) : (
              <AlertCircle
                className="h-4 w-4"
                aria-hidden="true"
              />
            )}

            {connection.connected
              ? "Povezan"
              : "Nije povezan"}
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {message && (
            <div
              aria-live="polite"
              className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${
                message.type ===
                "success"
                  ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
                  : "border-red-400/20 bg-red-400/[0.07] text-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {message.type ===
                "success" ? (
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <AlertCircle
                    className="mt-0.5 h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                  />
                )}

                <span className="text-sm leading-relaxed">
                  {message.text}
                </span>
              </div>

              <button
                type="button"
                onClick={
                  clearOAuthMessage
                }
                className="rounded-lg p-1 transition hover:bg-white/10"
                aria-label="Zatvori poruku"
              >
                <X
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
            </div>
          )}

          {connection.lastError && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4 text-red-200">
              <AlertCircle
                className="mt-0.5 h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              />

              <div>
                <div className="text-sm font-semibold">
                  Poslednja sync
                  greška
                </div>

                <div className="mt-1 break-words text-sm leading-relaxed text-red-200/70">
                  {
                    connection.lastError
                  }
                </div>
              </div>
            </div>
          )}

          {connection.connected ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <ConnectionDetail
                  icon={
                    <Mail
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  }
                  label="Google nalog"
                  value={
                    connection.accountEmail ??
                    "Email nije dostupan"
                  }
                />

                <ConnectionDetail
                  icon={
                    <CalendarDays
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  }
                  label="Kalendar"
                  value={
                    calendarLabel
                  }
                />

                <ConnectionDetail
                  icon={
                    <Link2
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  }
                  label="Povezan"
                  value={formatDateTime(
                    connection.connectedAt,
                    timezone
                  )}
                />

                <ConnectionDetail
                  icon={
                    <Clock3
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  }
                  label="Poslednji sync"
                  value={formatDateTime(
                    connection.lastSyncedAt,
                    timezone
                  )}
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row">
                <a
                  href="/api/admin/google-calendar/connect"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                >
                  <RefreshCw
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Ponovo poveži
                </a>

                <button
                  type="button"
                  disabled={
                    disconnectPending
                  }
                  onClick={
                    handleDisconnect
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-5 text-sm font-semibold text-red-300 transition hover:border-red-400/35 hover:bg-red-400/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {disconnectPending ? (
                    <LoaderCircle
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Unplug
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  )}

                  {disconnectPending
                    ? "Odspajanje..."
                    : "Odspoji Calendar"}
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/[0.1] bg-black/10 p-6 text-center sm:p-8">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-300">
                <CalendarDays
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </span>

              <h3 className="mt-4 text-base font-semibold text-white">
                Poveži kalendar salona
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-zinc-600">
                Salon će se jednom
                prijaviti na svoj
                Google nalog. Nakon
                toga će potvrđene
                rezervacije automatski
                ulaziti u Calendar.
              </p>

              <a
                href="/api/admin/google-calendar/connect"
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-400 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-blue-300"
              >
                <Link2
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Poveži Google Calendar
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}