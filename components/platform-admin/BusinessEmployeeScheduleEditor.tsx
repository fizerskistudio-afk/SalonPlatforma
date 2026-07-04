"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Save,
  UserRound,
} from "lucide-react";

import {
  type EmployeeScheduleHour,
  normalizeTimeValue,
} from "@/lib/platform-admin/business-employee-schedule";

type Props = {
  businessSlug: string;
  employeeSlug: string;
  employeeName: string;
  initialUseBusinessHours: boolean;
  salonHours:
    readonly EmployeeScheduleHour[];
  initialWorkingHours:
    readonly EmployeeScheduleHour[];
};

type ApiResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
};

const TIME_PATTERN =
  /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function cloneHours(
  hours:
    readonly EmployeeScheduleHour[]
): EmployeeScheduleHour[] {
  return hours.map(
    (hour) => ({
      ...hour,
      openTime:
        normalizeTimeValue(
          hour.openTime
        ),
      closeTime:
        normalizeTimeValue(
          hour.closeTime
        ),
    })
  );
}

export default function BusinessEmployeeScheduleEditor({
  businessSlug,
  employeeSlug,
  employeeName,
  initialUseBusinessHours,
  salonHours,
  initialWorkingHours,
}: Props) {
  const [
    useBusinessHours,
    setUseBusinessHours,
  ] = useState(
    initialUseBusinessHours
  );

  const [
    workingHours,
    setWorkingHours,
  ] = useState<
    EmployeeScheduleHour[]
  >(
    cloneHours(
      initialWorkingHours
    )
  );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  const [success, setSuccess] =
    useState<string | null>(
      null
    );

  function chooseBusinessHours() {
    setUseBusinessHours(true);
    setError(null);
    setSuccess(null);
  }

  function chooseCustomHours() {
    if (useBusinessHours) {
      setWorkingHours(
        cloneHours(salonHours)
      );
    }

    setUseBusinessHours(false);
    setError(null);
    setSuccess(null);
  }

  function updateHour(
    dayOfWeek: number,
    update:
      Partial<EmployeeScheduleHour>
  ) {
    setWorkingHours(
      (currentHours) =>
        currentHours.map(
          (hour) =>
            hour.dayOfWeek ===
            dayOfWeek
              ? {
                  ...hour,
                  ...update,
                }
              : hour
        )
    );

    setError(null);
    setSuccess(null);
  }

  function validateHours():
    string | null {
    if (
      workingHours.length !== 7
    ) {
      return "Radno vreme mora sadržati svih sedam dana.";
    }

    for (const hour of workingHours) {
      if (hour.isClosed) {
        continue;
      }

      const openTime =
        normalizeTimeValue(
          hour.openTime
        );

      const closeTime =
        normalizeTimeValue(
          hour.closeTime
        );

      if (
        !TIME_PATTERN.test(
          openTime
        ) ||
        !TIME_PATTERN.test(
          closeTime
        ) ||
        openTime >= closeTime
      ) {
        return `${hour.label} ima neispravno radno vreme.`;
      }
    }

    return null;
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!useBusinessHours) {
      const validationError =
        validateHours();

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/platform-admin/businesses/employees/schedule",
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              businessSlug,
              employeeSlug,
              useBusinessHours,
              workingHours:
                workingHours.map(
                  (hour) => ({
                    dayOfWeek:
                      hour.dayOfWeek,
                    isClosed:
                      hour.isClosed,
                    openTime:
                      hour.isClosed
                        ? null
                        : normalizeTimeValue(
                            hour.openTime
                          ),
                    closeTime:
                      hour.isClosed
                        ? null
                        : normalizeTimeValue(
                            hour.closeTime
                          ),
                  })
                ),
            }),
          }
        );

      const payload =
        await response.json() as
          ApiResponse;

      if (!response.ok) {
        setError(
          payload.message ??
            "Čuvanje radnog vremena nije uspelo."
        );
        return;
      }

      setSuccess(
        useBusinessHours
          ? `${employeeName} sada koristi radno vreme salona.`
          : `Posebno radno vreme za ${employeeName} je sačuvano.`
      );
    } catch {
      setError(
        "Mrežna greška. Proveri vezu i pokušaj ponovo."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayedHours =
    useBusinessHours
      ? salonHours
      : workingHours;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <section
        className="grid gap-4 md:grid-cols-2"
      >
        <button
          type="button"
          onClick={
            chooseBusinessHours
          }
          className={[
            "rounded-2xl",
            "border",
            "p-5",
            "text-left",
            "transition",
            useBusinessHours
              ? "border-amber-300/40 bg-amber-300/10"
              : "border-white/10 bg-white/[0.03] hover:border-white/20",
          ].join(" ")}
        >
          <div
            className="flex items-center gap-3"
          >
            <Building2
              size={21}
              className={
                useBusinessHours
                  ? "text-amber-200"
                  : "text-zinc-500"
              }
            />

            <p
              className="font-semibold"
            >
              Nasleđuje salon
            </p>
          </div>

          <p
            className="mt-2 text-sm leading-6 text-zinc-500"
          >
            Zaposleni automatski prati svaku buduću izmenu radnog vremena salona.
          </p>
        </button>

        <button
          type="button"
          onClick={
            chooseCustomHours
          }
          className={[
            "rounded-2xl",
            "border",
            "p-5",
            "text-left",
            "transition",
            !useBusinessHours
              ? "border-amber-300/40 bg-amber-300/10"
              : "border-white/10 bg-white/[0.03] hover:border-white/20",
          ].join(" ")}
        >
          <div
            className="flex items-center gap-3"
          >
            <UserRound
              size={21}
              className={
                !useBusinessHours
                  ? "text-amber-200"
                  : "text-zinc-500"
              }
            />

            <p
              className="font-semibold"
            >
              Poseban raspored
            </p>
          </div>

          <p
            className="mt-2 text-sm leading-6 text-zinc-500"
          >
            Definiši svih sedam dana posebno samo za ovog zaposlenog.
          </p>
        </button>
      </section>

      <section
        className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
      >
        <div
          className="border-b border-white/10 px-5 py-4 md:px-6"
        >
          <div
            className="flex items-center gap-2"
          >
            <Clock3
              size={18}
              className="text-amber-300"
            />

            <h3
              className="font-semibold"
            >
              {useBusinessHours
                ? "Pregled salonskog rasporeda"
                : "Individualni raspored"}
            </h3>
          </div>

          <p
            className="mt-1 text-sm text-zinc-500"
          >
            {useBusinessHours
              ? "Ovaj pregled se menja zajedno sa radnim vremenom salona."
              : "Zatvoren dan nema početak i kraj radnog vremena."}
          </p>
        </div>

        <div
          className="divide-y divide-white/10"
        >
          {displayedHours.map(
            (hour) => (
              <ScheduleRow
                key={
                  hour.dayOfWeek
                }
                hour={hour}
                disabled={
                  useBusinessHours ||
                  isSubmitting
                }
                onChange={
                  updateHour
                }
              />
            )
          )}
        </div>
      </section>

      {error ? (
        <div
          className="flex gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"
        >
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <p>{error}</p>
        </div>
      ) : null}

      {success ? (
        <div
          className="flex gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200"
        >
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />

          <p>{success}</p>
        </div>
      ) : null}

      <div
        className="flex justify-end"
      >
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
          ) : (
            <Save size={18} />
          )}

          {isSubmitting
            ? "Čuvanje..."
            : "Sačuvaj radno vreme"}
        </button>
      </div>
    </form>
  );
}

type ScheduleRowProps = {
  hour: EmployeeScheduleHour;
  disabled: boolean;
  onChange: (
    dayOfWeek: number,
    update:
      Partial<EmployeeScheduleHour>
  ) => void;
};

function ScheduleRow({
  hour,
  disabled,
  onChange,
}: ScheduleRowProps) {
  function handleClosedChange(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    onChange(
      hour.dayOfWeek,
      {
        isClosed:
          event.target.checked,
      }
    );
  }

  function handleOpenChange(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    onChange(
      hour.dayOfWeek,
      {
        openTime:
          event.target.value,
      }
    );
  }

  function handleCloseChange(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    onChange(
      hour.dayOfWeek,
      {
        closeTime:
          event.target.value,
      }
    );
  }

  return (
    <div
      className="grid gap-4 px-5 py-4 md:grid-cols-[170px_140px_minmax(0,1fr)] md:items-center md:px-6"
    >
      <p
        className="font-medium text-zinc-200"
      >
        {hour.label}
      </p>

      <label
        className="flex items-center gap-2 text-sm text-zinc-400"
      >
        <input
          type="checkbox"
          checked={
            hour.isClosed
          }
          disabled={disabled}
          onChange={
            handleClosedChange
          }
          className="h-4 w-4 accent-amber-300"
        />

        Neradni dan
      </label>

      {hour.isClosed ? (
        <p
          className="text-sm text-zinc-600"
        >
          Zatvoreno
        </p>
      ) : (
        <div
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"
        >
          <input
            type="time"
            value={
              normalizeTimeValue(
                hour.openTime
              )
            }
            disabled={disabled}
            onChange={
              handleOpenChange
            }
            className="min-h-10 rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none transition focus:border-amber-300 disabled:opacity-60"
          />

          <span
            className="text-sm text-zinc-600"
          >
            do
          </span>

          <input
            type="time"
            value={
              normalizeTimeValue(
                hour.closeTime
              )
            }
            disabled={disabled}
            onChange={
              handleCloseChange
            }
            className="min-h-10 rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none transition focus:border-amber-300 disabled:opacity-60"
          />
        </div>
      )}
    </div>
  );
}
