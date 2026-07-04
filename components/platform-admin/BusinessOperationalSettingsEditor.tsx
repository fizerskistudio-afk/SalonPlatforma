"use client";

import {
  type FormEvent,
  useState,
} from "react";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Save,
  Settings2,
} from "lucide-react";

type BookingSettings = {
  slotIntervalMinutes: number;
  bookingWindowDays: number;
  minimumAdvanceMinutes: number;
  allowAnyEmployee: boolean;
  requireEmail: boolean;
  requirePhone: boolean;
  allowNotes: boolean;
  autoConfirm: boolean;
};

type WorkingHour = {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
};

type BusinessOperationalSettingsEditorProps = {
  businessSlug: string;
  initialSettings:
    BookingSettings;
  initialWorkingHours:
    readonly WorkingHour[];
};

type ApiResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
};

const DAY_NAMES = [
  "Nedelja",
  "Ponedeljak",
  "Utorak",
  "Sreda",
  "Četvrtak",
  "Petak",
  "Subota",
] as const;

const TIME_PATTERN =
  /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const DATABASE_TIME_PATTERN =
  /^((?:[01]\d|2[0-3]):[0-5]\d)(?::[0-5]\d(?:\.\d+)?)?$/;

function normalizeTimeValue(
  value: string
): string {
  const match =
    DATABASE_TIME_PATTERN.exec(
      value.trim()
    );

  return match
    ? match[1]
    : value.trim();
}

export default function BusinessOperationalSettingsEditor({
  businessSlug,
  initialSettings,
  initialWorkingHours,
}: BusinessOperationalSettingsEditorProps) {
  const router =
    useRouter();

  const [
    settings,
    setSettings,
  ] =
    useState<BookingSettings>(
      initialSettings
    );

  const [
    workingHours,
    setWorkingHours,
  ] =
    useState<WorkingHour[]>(
      initialWorkingHours.map(
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
      )
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null
    );

  function updateSetting<
    Key extends keyof BookingSettings,
  >(
    key: Key,
    value: BookingSettings[Key]
  ) {
    setSettings(
      (currentSettings) => ({
        ...currentSettings,
        [key]: value,
      })
    );

    clearMessages();
  }

  function updateWorkingHour(
    dayOfWeek: number,
    update:
      Partial<WorkingHour>
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

    clearMessages();
  }

  function clearMessages() {
    setError(
      null
    );

    setSuccess(
      null
    );
  }

  function validate(): string | null {
    if (
      !Number.isInteger(
        settings.slotIntervalMinutes
      ) ||
      settings.slotIntervalMinutes < 5 ||
      settings.slotIntervalMinutes > 240
    ) {
      return "Interval termina mora biti između 5 i 240 minuta.";
    }

    if (
      !Number.isInteger(
        settings.bookingWindowDays
      ) ||
      settings.bookingWindowDays < 1 ||
      settings.bookingWindowDays > 365
    ) {
      return "Prozor rezervacije mora biti između 1 i 365 dana.";
    }

    if (
      !Number.isInteger(
        settings.minimumAdvanceMinutes
      ) ||
      settings.minimumAdvanceMinutes < 0 ||
      settings.minimumAdvanceMinutes > 10080
    ) {
      return "Minimalna najava mora biti između 0 i 10080 minuta.";
    }

    if (
      workingHours.length !== 7
    ) {
      return "Radno vreme mora sadržati svih sedam dana.";
    }

    const usedDays =
      new Set<number>();

    for (
      const hour of workingHours
    ) {
      if (
        hour.dayOfWeek < 0 ||
        hour.dayOfWeek > 6 ||
        usedDays.has(
          hour.dayOfWeek
        )
      ) {
        return "Radno vreme sadrži neispravan ili dupliran dan.";
      }

      usedDays.add(
        hour.dayOfWeek
      );

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
        openTime >=
          closeTime
      ) {
        return `${DAY_NAMES[hour.dayOfWeek]} ima neispravno radno vreme.`;
      }
    }

    return null;
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    clearMessages();

    const validationError =
      validate();

    if (validationError) {
      setError(
        validationError
      );

      return;
    }

    setIsSubmitting(
      true
    );

    try {
      const response =
        await fetch(
          "/api/platform-admin/businesses/operational-settings",
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            cache: "no-store",
            body:
              JSON.stringify({
                businessSlug,
                settings,
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
        (await response.json()) as
          ApiResponse;

      if (
        !response.ok ||
        !payload.ok
      ) {
        setError(
          payload.message ??
            "Podešavanja nisu mogla da se sačuvaju."
        );

        return;
      }

      setSuccess(
        "Booking pravila i radno vreme su sačuvani."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Failed to update operational settings:",
        error
      );

      setError(
        "Došlo je do greške pri povezivanju sa serverom."
      );
    } finally {
      setIsSubmitting(
        false
      );
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-7"
    >
      <section
        className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
      >
        <div
          className="border-b border-white/10 px-5 py-5 md:px-6"
        >
          <div
            className="flex items-center gap-2"
          >
            <Settings2
              size={19}
              className="text-amber-300"
            />

            <h3
              className="text-lg font-semibold"
            >
              Booking pravila
            </h3>
          </div>

          <p
            className="mt-2 text-sm leading-6 text-zinc-500"
          >
            Kontroliši način na koji klijenti biraju i potvrđuju termine.
          </p>
        </div>

        <div
          className="grid gap-5 p-5 md:grid-cols-3 md:p-6"
        >
          <NumberField
            label="Interval termina"
            helper="5–240 minuta"
            value={
              settings.slotIntervalMinutes
            }
            min={5}
            max={240}
            onChange={
              (value) =>
                updateSetting(
                  "slotIntervalMinutes",
                  value
                )
            }
          />

          <NumberField
            label="Prozor rezervacije"
            helper="1–365 dana unapred"
            value={
              settings.bookingWindowDays
            }
            min={1}
            max={365}
            onChange={
              (value) =>
                updateSetting(
                  "bookingWindowDays",
                  value
                )
            }
          />

          <NumberField
            label="Minimalna najava"
            helper="U minutima"
            value={
              settings.minimumAdvanceMinutes
            }
            min={0}
            max={10080}
            onChange={
              (value) =>
                updateSetting(
                  "minimumAdvanceMinutes",
                  value
                )
            }
          />
        </div>

        <div
          className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-2 md:p-6 xl:grid-cols-4"
        >
          <BooleanField
            label="Prvi slobodan zaposleni"
            description="Klijent može izabrati bilo kog dostupnog člana tima."
            checked={
              settings.allowAnyEmployee
            }
            onChange={
              (checked) =>
                updateSetting(
                  "allowAnyEmployee",
                  checked
                )
            }
          />

          <BooleanField
            label="Telefon je obavezan"
            description="Rezervacija zahteva broj telefona klijenta."
            checked={
              settings.requirePhone
            }
            onChange={
              (checked) =>
                updateSetting(
                  "requirePhone",
                  checked
                )
            }
          />

          <BooleanField
            label="Email je obavezan"
            description="Rezervacija zahteva email adresu klijenta."
            checked={
              settings.requireEmail
            }
            onChange={
              (checked) =>
                updateSetting(
                  "requireEmail",
                  checked
                )
            }
          />

          <BooleanField
            label="Napomena klijenta"
            description="Klijent može dodati napomenu uz rezervaciju."
            checked={
              settings.allowNotes
            }
            onChange={
              (checked) =>
                updateSetting(
                  "allowNotes",
                  checked
                )
            }
          />

          <BooleanField
            label="Automatska potvrda"
            description="Novi termin odmah dobija confirmed status."
            checked={
              settings.autoConfirm
            }
            onChange={
              (checked) =>
                updateSetting(
                  "autoConfirm",
                  checked
                )
            }
          />
        </div>
      </section>

      <section
        className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
      >
        <div
          className="border-b border-white/10 px-5 py-5 md:px-6"
        >
          <div
            className="flex items-center gap-2"
          >
            <CalendarDays
              size={19}
              className="text-amber-300"
            />

            <h3
              className="text-lg font-semibold"
            >
              Radno vreme salona
            </h3>
          </div>

          <p
            className="mt-2 text-sm leading-6 text-zinc-500"
          >
            Ovo je osnovni raspored salona. Individualni rasporedi zaposlenih ostaju sačuvani.
          </p>
        </div>

        <div
          className="divide-y divide-white/10"
        >
          {workingHours.map(
            (hour) => (
              <div
                key={
                  hour.dayOfWeek
                }
                className="grid gap-4 px-5 py-4 md:grid-cols-[180px_160px_minmax(0,1fr)] md:items-center md:px-6"
              >
                <div>
                  <p
                    className="font-semibold text-zinc-200"
                  >
                    {
                      DAY_NAMES[
                        hour.dayOfWeek
                      ]
                    }
                  </p>
                </div>

                <label
                  className="flex cursor-pointer items-center gap-3 text-sm text-zinc-400"
                >
                  <input
                    type="checkbox"
                    checked={
                      hour.isClosed
                    }
                    onChange={
                      (event) =>
                        updateWorkingHour(
                          hour.dayOfWeek,
                          {
                            isClosed:
                              event.target.checked,
                          }
                        )
                    }
                    className="h-4 w-4 rounded border-white/20 bg-zinc-950 text-amber-300 focus:ring-amber-300"
                  />

                  Zatvoreno
                </label>

                <div
                  className="grid grid-cols-2 gap-3"
                >
                  <TimeField
                    label="Otvaranje"
                    value={
                      hour.openTime
                    }
                    disabled={
                      hour.isClosed
                    }
                    onChange={
                      (value) =>
                        updateWorkingHour(
                          hour.dayOfWeek,
                          {
                            openTime: value,
                          }
                        )
                    }
                  />

                  <TimeField
                    label="Zatvaranje"
                    value={
                      hour.closeTime
                    }
                    disabled={
                      hour.isClosed
                    }
                    onChange={
                      (value) =>
                        updateWorkingHour(
                          hour.dayOfWeek,
                          {
                            closeTime: value,
                          }
                        )
                    }
                  />
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-4 text-sm text-red-200"
        >
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <span>
            {error}
          </span>
        </div>
      ) : null}

      {success ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-200"
        >
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />

          <span>
            {success}
          </span>
        </div>
      ) : null}

      <div
        className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end"
      >
        <Link
          href={
            `/platform-admin/businesses/${businessSlug}`
          }
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
        >
          Otkaži
        </Link>

        <button
          type="submit"
          disabled={
            isSubmitting
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoaderCircle
              size={18}
              className="animate-spin motion-reduce:animate-none"
            />
          ) : (
            <Save
              size={18}
            />
          )}

          {isSubmitting
            ? "Čuvanje..."
            : "Sačuvaj podešavanja"}
        </button>
      </div>
    </form>
  );
}

function NumberField({
  label,
  helper,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  helper: string;
  value: number;
  min: number;
  max: number;
  onChange: (
    value: number
  ) => void;
}) {
  return (
    <label
      className="block"
    >
      <span
        className="text-sm font-semibold text-zinc-300"
      >
        {label}
      </span>

      <span
        className="mt-1 block text-xs text-zinc-600"
      >
        {helper}
      </span>

      <input
        type="number"
        value={
          value
        }
        min={min}
        max={max}
        onChange={
          (event) =>
            onChange(
              Number(
                event.target.value
              )
            )
        }
        className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/20"
      />
    </label>
  );
}

function BooleanField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (
    checked: boolean
  ) => void;
}) {
  return (
    <label
      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-zinc-950/50 p-4"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={
          (event) =>
            onChange(
              event.target.checked
            )
        }
        className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-zinc-950 text-amber-300 focus:ring-amber-300"
      />

      <span>
        <span
          className="block text-sm font-semibold text-zinc-300"
        >
          {label}
        </span>

        <span
          className="mt-1 block text-xs leading-5 text-zinc-600"
        >
          {description}
        </span>
      </span>
    </label>
  );
}

function TimeField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <label
      className="block"
    >
      <span
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-600"
      >
        <Clock3
          size={13}
        />

        {label}
      </span>

      <input
        type="time"
        value={value}
        disabled={disabled}
        onChange={
          (event) =>
            onChange(
              event.target.value
            )
        }
        className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/20 disabled:cursor-not-allowed disabled:opacity-40"
      />
    </label>
  );
}
