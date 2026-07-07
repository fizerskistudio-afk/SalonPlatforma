"use client";

import {
  useState,
  useTransition,
} from "react";
import {
  useRouter,
} from "next/navigation";
import {
  BellRing,
  Clock3,
  Play,
  Save,
} from "lucide-react";

import {
  runReminderScanAction,
  updateReminderSettingsAction,
} from "@/app/admin/(protected)/notifications/reminder-actions";
import type {
  AdminReminderSettingsData,
} from "@/lib/admin/reminders";

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

function Toggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 flex-shrink-0 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-40 ${
        checked
          ? "border-amber-300 bg-amber-300"
          : "border-white/15 bg-white/[0.06]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-zinc-950 shadow transition-transform ${
          checked
            ? "translate-x-5"
            : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function AdminReminderSettings({
  data,
}: {
  data: AdminReminderSettingsData;
}) {
  const router = useRouter();
  const [isPending, startTransition] =
    useTransition();
  const [feedback, setFeedback] =
    useState<Feedback>(null);
  const [runningScan, setRunningScan] =
    useState(false);
  const [reminder24hEnabled, setReminder24hEnabled] =
    useState(data.reminder24hEnabled);
  const [reminder2hEnabled, setReminder2hEnabled] =
    useState(data.reminder2hEnabled);

  const editingDisabled =
    !data.ownerCanEdit ||
    !data.customerNotificationsEnabled ||
    isPending;

  function saveSettings() {
    setFeedback(null);

    startTransition(async () => {
      const result =
        await updateReminderSettingsAction({
          reminder24hEnabled,
          reminder2hEnabled,
        });

      setFeedback({
        type: result.ok
          ? "success"
          : "error",
        message: result.message,
      });

      if (result.ok) {
        router.refresh();
      }
    });
  }

  function runScan() {
    setFeedback(null);
    setRunningScan(true);

    startTransition(async () => {
      try {
        const result =
          await runReminderScanAction();

        setFeedback({
          type: result.ok
            ? "success"
            : "error",
          message: result.message,
        });

        router.refresh();
      } finally {
        setRunningScan(false);
      }
    });
  }

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 sm:p-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
              <BellRing
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Automatski podsetnici
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Email podsetnici za potvrđene termine koji imaju email kupca.
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-zinc-400">
            Cron proverava buduće termine periodično. Ako je propušten 24h podsetnik,
            u poslednja dva sata se ne šalju oba emaila — šalje se samo hitniji 2h podsetnik.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-80">
          <div className="rounded-2xl border border-white/[0.07] bg-zinc-950/45 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
              Budući termini
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {data.upcomingConfirmedWithEmail}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-zinc-950/45 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
              Naredna 24h
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {data.next24HoursCount}
            </div>
          </div>
        </div>
      </div>

      {!data.customerNotificationsEnabled && (
        <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Glavni prekidač za poruke kupcima je isključen. Uključi ga u email pravilima ispod da bi podsetnici radili.
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="flex items-start justify-between gap-5 rounded-2xl border border-white/[0.07] bg-zinc-950/40 p-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Clock3
                className="h-4 w-4 text-amber-300"
                aria-hidden="true"
              />
              Podsetnik 24 sata pre termina
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Preporučeni osnovni podsetnik za naredni dan.
            </p>
          </div>

          <Toggle
            checked={reminder24hEnabled}
            disabled={editingDisabled}
            label="Podsetnik 24 sata pre termina"
            onChange={setReminder24hEnabled}
          />
        </div>

        <div className="flex items-start justify-between gap-5 rounded-2xl border border-white/[0.07] bg-zinc-950/40 p-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Clock3
                className="h-4 w-4 text-amber-300"
                aria-hidden="true"
              />
              Podsetnik 2 sata pre termina
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Dodatni kratki podsetnik neposredno pre dolaska.
            </p>
          </div>

          <Toggle
            checked={reminder2hEnabled}
            disabled={editingDisabled}
            label="Podsetnik 2 sata pre termina"
            onChange={setReminder2hEnabled}
          />
        </div>
      </div>

      {feedback && (
        <div
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
              : "border-red-400/20 bg-red-400/10 text-red-100"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-zinc-600">
          Ručna provera koristi isti dedupe sistem kao produkcioni cron i ne pravi duple emailove.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={runScan}
            disabled={
              isPending ||
              runningScan ||
              !data.customerNotificationsEnabled
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Play
              className="h-4 w-4"
              aria-hidden="true"
            />
            {runningScan
              ? "Provera u toku..."
              : "Proveri podsetnike sada"}
          </button>

          {data.ownerCanEdit && (
            <button
              type="button"
              onClick={saveSettings}
              disabled={editingDisabled}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Save
                className="h-4 w-4"
                aria-hidden="true"
              />
              Sačuvaj podsetnike
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
