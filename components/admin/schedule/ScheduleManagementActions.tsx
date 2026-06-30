"use client";

import type { FormEvent } from "react";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  EyeOff,
  LoaderCircle,
  Pencil,
  RotateCcw,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  removeEmployeeWorkingHoursAction,
  removeTimeOffAction,
  saveTimeOffAction,
  saveWorkingHoursAction,
} from "@/app/admin/(protected)/schedule/actions";
import type {
  AdminScheduleResult,
  AdminTimeOff,
} from "@/lib/admin/schedule";
import {
  SCHEDULE_DAYS,
  type ScheduleDayOfWeek,
} from "@/lib/admin/schedule-shared";

type ScheduleManagementActionsProps = {
  data: AdminScheduleResult;
};

type ScheduleTarget =
  | "business"
  | "employee";

type ScheduleRuleMode =
  | "inherit"
  | "open"
  | "closed";

type TimeOffScope =
  | "business"
  | "employee";

type ActionMessage = {
  type: "success" | "error";
  text: string;
};

type ZonedDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function padNumber(value: number): string {
  return String(value).padStart(2, "0");
}

function formatWorkingTime(
  openTime: string | null,
  closeTime: string | null,
  isClosed: boolean
): string {
  if (isClosed) {
    return "Zatvoreno";
  }

  if (!openTime || !closeTime) {
    return "Nije podešeno";
  }

  return `${openTime.slice(
    0,
    5
  )} – ${closeTime.slice(0, 5)}`;
}

function getZonedDateTimeParts(
  date: Date,
  timezone: string
): ZonedDateTimeParts {
  const formatter =
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

  const parts =
    formatter.formatToParts(date);

  const values = new Map(
    parts.map((part) => [
      part.type,
      part.value,
    ])
  );

  return {
    year: Number(values.get("year")),
    month: Number(values.get("month")),
    day: Number(values.get("day")),
    hour: Number(values.get("hour")),
    minute: Number(values.get("minute")),
  };
}

function formatIsoAsDateTimeLocal(
  isoValue: string,
  timezone: string
): string {
  const parts =
    getZonedDateTimeParts(
      new Date(isoValue),
      timezone
    );

  return `${parts.year}-${padNumber(
    parts.month
  )}-${padNumber(parts.day)}T${padNumber(
    parts.hour
  )}:${padNumber(parts.minute)}`;
}

function parseDateTimeLocal(
  value: string
): ZonedDateTimeParts | null {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
  );

  if (!match) {
    return null;
  }

  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
  };

  if (
    parts.month < 1 ||
    parts.month > 12 ||
    parts.day < 1 ||
    parts.day > 31 ||
    parts.hour < 0 ||
    parts.hour > 23 ||
    parts.minute < 0 ||
    parts.minute > 59
  ) {
    return null;
  }

  return parts;
}

function zonedDateTimeLocalToIso(
  value: string,
  timezone: string
): string | null {
  const target =
    parseDateTimeLocal(value);

  if (!target) {
    return null;
  }

  const targetAsUtc = Date.UTC(
    target.year,
    target.month - 1,
    target.day,
    target.hour,
    target.minute
  );

  let timestamp = targetAsUtc;

  for (
    let iteration = 0;
    iteration < 4;
    iteration += 1
  ) {
    const represented =
      getZonedDateTimeParts(
        new Date(timestamp),
        timezone
      );

    const representedAsUtc = Date.UTC(
      represented.year,
      represented.month - 1,
      represented.day,
      represented.hour,
      represented.minute
    );

    const difference =
      targetAsUtc - representedAsUtc;

    if (difference === 0) {
      break;
    }

    timestamp += difference;
  }

  const finalParts =
    getZonedDateTimeParts(
      new Date(timestamp),
      timezone
    );

  const matchesTarget =
    finalParts.year === target.year &&
    finalParts.month === target.month &&
    finalParts.day === target.day &&
    finalParts.hour === target.hour &&
    finalParts.minute === target.minute;

  if (!matchesTarget) {
    return null;
  }

  return new Date(timestamp).toISOString();
}

function formatPseudoLocalDate(
  date: Date,
  hour: number,
  minute: number
): string {
  return `${date.getUTCFullYear()}-${padNumber(
    date.getUTCMonth() + 1
  )}-${padNumber(
    date.getUTCDate()
  )}T${padNumber(hour)}:${padNumber(
    minute
  )}`;
}

function createDefaultTimeOffRange(
  timezone: string
): {
  startsAt: string;
  endsAt: string;
} {
  const currentParts =
    getZonedDateTimeParts(
      new Date(),
      timezone
    );

  const tomorrow = new Date(
    Date.UTC(
      currentParts.year,
      currentParts.month - 1,
      currentParts.day + 1
    )
  );

  return {
    startsAt: formatPseudoLocalDate(
      tomorrow,
      9,
      0
    ),

    endsAt: formatPseudoLocalDate(
      tomorrow,
      18,
      0
    ),
  };
}

function formatDateTime(
  value: string,
  timezone: string
): string {
  return new Intl.DateTimeFormat(
    "sr-Latn-RS",
    {
      timeZone: timezone,
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

function TimeOffStatus({
  entry,
}: {
  entry: AdminTimeOff;
}) {
  if (entry.isOngoing) {
    return (
      <span className="rounded-full border border-red-400/20 bg-red-400/[0.08] px-2.5 py-1 text-[10px] font-semibold text-red-300">
        U toku
      </span>
    );
  }

  if (entry.isUpcoming) {
    return (
      <span className="rounded-full border border-blue-400/20 bg-blue-400/[0.08] px-2.5 py-1 text-[10px] font-semibold text-blue-300">
        Predstoji
      </span>
    );
  }

  return (
    <span className="rounded-full border border-zinc-500/20 bg-zinc-500/[0.08] px-2.5 py-1 text-[10px] font-semibold text-zinc-500">
      Završeno
    </span>
  );
}

export default function ScheduleManagementActions({
  data,
}: ScheduleManagementActionsProps) {
  const router = useRouter();

  const [
    schedulePending,
    startScheduleTransition,
  ] = useTransition();

  const [
    timeOffPending,
    startTimeOffTransition,
  ] = useTransition();

  const [
    scheduleTarget,
    setScheduleTarget,
  ] =
    useState<ScheduleTarget>("business");

  const [
    selectedEmployeeId,
    setSelectedEmployeeId,
  ] = useState(
    data.employees[0]?.id ?? ""
  );

  const [
    selectedDayOfWeek,
    setSelectedDayOfWeek,
  ] =
    useState<ScheduleDayOfWeek>(1);

  const [
    scheduleRuleMode,
    setScheduleRuleMode,
  ] =
    useState<ScheduleRuleMode>("open");

  const [openTime, setOpenTime] =
    useState("09:00");

  const [closeTime, setCloseTime] =
    useState("18:00");

  const [
    scheduleMessage,
    setScheduleMessage,
  ] =
    useState<ActionMessage | null>(null);

  const [
    timeOffDialogOpen,
    setTimeOffDialogOpen,
  ] = useState(false);

  const [
    editingTimeOffId,
    setEditingTimeOffId,
  ] = useState<string | null>(null);

  const [
    timeOffScope,
    setTimeOffScope,
  ] =
    useState<TimeOffScope>("business");

  const [
    timeOffEmployeeId,
    setTimeOffEmployeeId,
  ] = useState(
    data.employees[0]?.id ?? ""
  );

  const defaultTimeOffRange =
    useMemo(
      () =>
        createDefaultTimeOffRange(
          data.business.timezone
        ),
      [data.business.timezone]
    );

  const [
    timeOffStartsAt,
    setTimeOffStartsAt,
  ] = useState(
    defaultTimeOffRange.startsAt
  );

  const [
    timeOffEndsAt,
    setTimeOffEndsAt,
  ] = useState(
    defaultTimeOffRange.endsAt
  );

  const [
    timeOffReason,
    setTimeOffReason,
  ] = useState("");

  const [
    timeOffMessage,
    setTimeOffMessage,
  ] =
    useState<ActionMessage | null>(null);

  const selectedBusinessDay =
    useMemo(
      () =>
        data.businessSchedule.find(
          (day) =>
            day.dayOfWeek ===
            selectedDayOfWeek
        ) ?? null,
      [
        data.businessSchedule,
        selectedDayOfWeek,
      ]
    );

  const selectedEmployeeSchedule =
    useMemo(
      () =>
        data.employeeSchedules.find(
          (schedule) =>
            schedule.employee.id ===
            selectedEmployeeId
        ) ?? null,
      [
        data.employeeSchedules,
        selectedEmployeeId,
      ]
    );

  const selectedEmployeeDay =
    useMemo(
      () =>
        selectedEmployeeSchedule?.days.find(
          (day) =>
            day.dayOfWeek ===
            selectedDayOfWeek
        ) ?? null,
      [
        selectedEmployeeSchedule,
        selectedDayOfWeek,
      ]
    );

  const currentBusinessRule =
    selectedBusinessDay?.rule ?? null;

  const currentEmployeeOverride =
    selectedEmployeeDay
      ?.employeeOverride ?? null;

  const sortedTimeOff = useMemo(
    () =>
      [...data.timeOff].sort(
        (first, second) =>
          new Date(
            second.startsAt
          ).getTime() -
          new Date(
            first.startsAt
          ).getTime()
      ),
    [data.timeOff]
  );

  useEffect(() => {
    if (data.employees.length === 0) {
      setSelectedEmployeeId("");
      setTimeOffEmployeeId("");
      return;
    }

    if (
      !data.employees.some(
        (employee) =>
          employee.id ===
          selectedEmployeeId
      )
    ) {
      setSelectedEmployeeId(
        data.employees[0].id
      );
    }

    if (
      !data.employees.some(
        (employee) =>
          employee.id ===
          timeOffEmployeeId
      )
    ) {
      setTimeOffEmployeeId(
        data.employees[0].id
      );
    }
  }, [
    data.employees,
    selectedEmployeeId,
    timeOffEmployeeId,
  ]);

  useEffect(() => {
    setScheduleMessage(null);

    if (
      scheduleTarget === "business"
    ) {
      const rule =
        currentBusinessRule;

      if (!rule) {
        setScheduleRuleMode("open");
        setOpenTime("09:00");
        setCloseTime("18:00");
        return;
      }

      if (rule.isClosed) {
        setScheduleRuleMode("closed");
        setOpenTime("09:00");
        setCloseTime("18:00");
        return;
      }

      setScheduleRuleMode("open");
      setOpenTime(
        rule.openTime ?? "09:00"
      );
      setCloseTime(
        rule.closeTime ?? "18:00"
      );

      return;
    }

    const override =
      currentEmployeeOverride;

    if (!override) {
      setScheduleRuleMode("inherit");

      setOpenTime(
        selectedEmployeeDay
          ?.businessRule?.openTime ??
          "09:00"
      );

      setCloseTime(
        selectedEmployeeDay
          ?.businessRule?.closeTime ??
          "18:00"
      );

      return;
    }

    if (override.isClosed) {
      setScheduleRuleMode("closed");
      setOpenTime("09:00");
      setCloseTime("18:00");
      return;
    }

    setScheduleRuleMode("open");

    setOpenTime(
      override.openTime ?? "09:00"
    );

    setCloseTime(
      override.closeTime ?? "18:00"
    );
  }, [
    currentBusinessRule,
    currentEmployeeOverride,
    scheduleTarget,
    selectedEmployeeDay,
  ]);

  useEffect(() => {
    if (!timeOffDialogOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape" &&
        !timeOffPending
      ) {
        setTimeOffDialogOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    timeOffDialogOpen,
    timeOffPending,
  ]);

  const openCreateTimeOffDialog =
    () => {
      const range =
        createDefaultTimeOffRange(
          data.business.timezone
        );

      setEditingTimeOffId(null);
      setTimeOffScope("business");

      setTimeOffEmployeeId(
        data.employees[0]?.id ?? ""
      );

      setTimeOffStartsAt(
        range.startsAt
      );

      setTimeOffEndsAt(range.endsAt);
      setTimeOffReason("");

      setTimeOffMessage(null);
      setTimeOffDialogOpen(true);
    };

  const openEditTimeOffDialog = (
    entry: AdminTimeOff
  ) => {
    setEditingTimeOffId(entry.id);

    setTimeOffScope(
      entry.isBusinessWide
        ? "business"
        : "employee"
    );

    setTimeOffEmployeeId(
      entry.employeeId ??
        data.employees[0]?.id ??
        ""
    );

    setTimeOffStartsAt(
      formatIsoAsDateTimeLocal(
        entry.startsAt,
        data.business.timezone
      )
    );

    setTimeOffEndsAt(
      formatIsoAsDateTimeLocal(
        entry.endsAt,
        data.business.timezone
      )
    );

    setTimeOffReason(
      entry.reason ?? ""
    );

    setTimeOffMessage(null);
    setTimeOffDialogOpen(true);
  };

  const closeTimeOffDialog = () => {
    if (timeOffPending) {
      return;
    }

    setTimeOffDialogOpen(false);
    setEditingTimeOffId(null);
  };

  const handleScheduleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (schedulePending) {
      return;
    }

    if (
      scheduleTarget === "employee" &&
      !selectedEmployeeId
    ) {
      setScheduleMessage({
        type: "error",
        text: "Izaberi zaposlenog.",
      });

      return;
    }

    setScheduleMessage(null);

    startScheduleTransition(
      async () => {
        try {
          if (
            scheduleTarget ===
              "employee" &&
            scheduleRuleMode ===
              "inherit"
          ) {
            const result =
              await removeEmployeeWorkingHoursAction(
                {
                  employeeId:
                    selectedEmployeeId,

                  dayOfWeek:
                    selectedDayOfWeek,
                }
              );

            setScheduleMessage({
              type: result.ok
                ? "success"
                : "error",

              text: result.message,
            });

            if (result.ok) {
              router.refresh();
            }

            return;
          }

          const result =
            await saveWorkingHoursAction(
              {
                employeeId:
                  scheduleTarget ===
                  "employee"
                    ? selectedEmployeeId
                    : null,

                dayOfWeek:
                  selectedDayOfWeek,

                isClosed:
                  scheduleRuleMode ===
                  "closed",

                openTime:
                  scheduleRuleMode ===
                  "open"
                    ? openTime
                    : null,

                closeTime:
                  scheduleRuleMode ===
                  "open"
                    ? closeTime
                    : null,
              }
            );

          setScheduleMessage({
            type: result.ok
              ? "success"
              : "error",

            text: result.message,
          });

          if (result.ok) {
            router.refresh();
          }
        } catch {
          setScheduleMessage({
            type: "error",
            text: "Došlo je do greške prilikom čuvanja radnog vremena.",
          });
        }
      }
    );
  };

  const handleTimeOffSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (timeOffPending) {
      return;
    }

    if (
      timeOffScope === "employee" &&
      !timeOffEmployeeId
    ) {
      setTimeOffMessage({
        type: "error",
        text: "Izaberi zaposlenog.",
      });

      return;
    }

    const startsAt =
      zonedDateTimeLocalToIso(
        timeOffStartsAt,
        data.business.timezone
      );

    const endsAt =
      zonedDateTimeLocalToIso(
        timeOffEndsAt,
        data.business.timezone
      );

    if (!startsAt || !endsAt) {
      setTimeOffMessage({
        type: "error",
        text: "Početak ili kraj blokade nije ispravan za vremensku zonu salona.",
      });

      return;
    }

    setTimeOffMessage(null);

    startTimeOffTransition(
      async () => {
        try {
          const result =
            await saveTimeOffAction({
              timeOffId:
                editingTimeOffId ??
                undefined,

              employeeId:
                timeOffScope ===
                "employee"
                  ? timeOffEmployeeId
                  : null,

              startsAt,
              endsAt,

              reason: timeOffReason,
            });

          setTimeOffMessage({
            type: result.ok
              ? "success"
              : "error",

            text: result.message,
          });

          if (result.ok) {
            setTimeOffDialogOpen(
              false
            );

            setEditingTimeOffId(null);

            router.refresh();
          }
        } catch {
          setTimeOffMessage({
            type: "error",
            text: "Došlo je do greške prilikom čuvanja odsustva ili blokade.",
          });
        }
      }
    );
  };

  const handleRemoveTimeOff = (
    entry: AdminTimeOff
  ) => {
    if (timeOffPending) {
      return;
    }

    const subject =
      entry.isBusinessWide
        ? "blokadu celog salona"
        : `odsustvo za ${
            entry.employeeName ??
            "zaposlenog"
          }`;

    const confirmed = window.confirm(
      `Da li sigurno želiš da ukloniš ${subject}?`
    );

    if (!confirmed) {
      return;
    }

    setTimeOffMessage(null);

    startTimeOffTransition(
      async () => {
        try {
          const result =
            await removeTimeOffAction({
              timeOffId: entry.id,
            });

          setTimeOffMessage({
            type: result.ok
              ? "success"
              : "error",

            text: result.message,
          });

          if (result.ok) {
            if (
              editingTimeOffId ===
              entry.id
            ) {
              setTimeOffDialogOpen(
                false
              );

              setEditingTimeOffId(
                null
              );
            }

            router.refresh();
          }
        } catch {
          setTimeOffMessage({
            type: "error",
            text: "Došlo je do greške prilikom uklanjanja blokade.",
          });
        }
      }
    );
  };

  const selectedDayLabel =
    SCHEDULE_DAYS.find(
      (day) =>
        day.value ===
        selectedDayOfWeek
    )?.label ?? "Dan";

  const inheritedRule =
    selectedEmployeeDay
      ?.businessRule ?? null;

  return (
    <>
      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
          <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:p-6 xl:flex-row xl:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                <CalendarClock
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Upravljanje rasporedom
              </div>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Radno vreme
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                Promene odmah utiču na
                termine koji se nude u
                javnom booking procesu.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-xs text-zinc-500">
              Vremenska zona salona:{" "}
              <strong className="text-zinc-200">
                {data.business.timezone}
              </strong>
            </div>
          </div>

          <form
            onSubmit={
              handleScheduleSubmit
            }
            className="space-y-5 p-5 sm:p-6"
          >
            {scheduleMessage && (
              <div
                aria-live="polite"
                className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${
                  scheduleMessage.type ===
                  "success"
                    ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
                    : "border-red-400/20 bg-red-400/[0.07] text-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {scheduleMessage.type ===
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
                    {
                      scheduleMessage.text
                    }
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setScheduleMessage(
                      null
                    )
                  }
                  aria-label="Zatvori poruku"
                >
                  <X
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </button>
              </div>
            )}

            <section className="grid gap-4 rounded-2xl border border-white/[0.08] bg-black/10 p-5 md:grid-cols-3">
              <label>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                  Raspored za
                </span>

                <select
                  value={scheduleTarget}
                  onChange={(event) =>
                    setScheduleTarget(
                      event.target
                        .value as ScheduleTarget
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-zinc-300 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                >
                  <option value="business">
                    Ceo salon
                  </option>

                  <option
                    value="employee"
                    disabled={
                      data.employees
                        .length === 0
                    }
                  >
                    Pojedinačni zaposleni
                  </option>
                </select>
              </label>

              <label>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                  Dan
                </span>

                <select
                  value={
                    selectedDayOfWeek
                  }
                  onChange={(event) =>
                    setSelectedDayOfWeek(
                      Number(
                        event.target.value
                      ) as ScheduleDayOfWeek
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-zinc-300 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                >
                  {SCHEDULE_DAYS.map(
                    (day) => (
                      <option
                        key={day.value}
                        value={day.value}
                      >
                        {day.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                  Zaposleni
                </span>

                <select
                  value={
                    selectedEmployeeId
                  }
                  disabled={
                    scheduleTarget !==
                      "employee" ||
                    data.employees
                      .length === 0
                  }
                  onChange={(event) =>
                    setSelectedEmployeeId(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-zinc-300 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {data.employees.length ===
                  0 ? (
                    <option value="">
                      Nema zaposlenih
                    </option>
                  ) : (
                    data.employees.map(
                      (employee) => (
                        <option
                          key={
                            employee.id
                          }
                          value={
                            employee.id
                          }
                        >
                          {
                            employee.name
                          }
                        </option>
                      )
                    )
                  )}
                </select>
              </label>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                    Izabrano pravilo
                  </div>

                  <div className="mt-1 font-semibold text-white">
                    {selectedDayLabel}
                    {" · "}
                    {scheduleTarget ===
                    "business"
                      ? "Salon"
                      : selectedEmployeeSchedule
                          ?.employee.name ??
                        "Zaposleni"}
                  </div>
                </div>

                {scheduleTarget ===
                  "employee" && (
                  <div className="rounded-xl border border-blue-400/10 bg-blue-400/[0.04] px-4 py-3 text-xs text-blue-200/60">
                    Salon:{" "}
                    <strong className="text-blue-100">
                      {inheritedRule
                        ? formatWorkingTime(
                            inheritedRule.openTime,
                            inheritedRule.closeTime,
                            inheritedRule.isClosed
                          )
                        : "Nije podešeno"}
                    </strong>
                  </div>
                )}
              </div>

              <div
                className={`mt-5 grid gap-3 ${
                  scheduleTarget ===
                  "employee"
                    ? "sm:grid-cols-3"
                    : "sm:grid-cols-2"
                }`}
              >
                {scheduleTarget ===
                  "employee" && (
                  <label
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      scheduleRuleMode ===
                      "inherit"
                        ? "border-blue-400/30 bg-blue-400/[0.08]"
                        : "border-white/[0.07] bg-black/10 hover:border-white/15"
                    }`}
                  >
                    <input
                      type="radio"
                      name="schedule-rule"
                      value="inherit"
                      checked={
                        scheduleRuleMode ===
                        "inherit"
                      }
                      onChange={() =>
                        setScheduleRuleMode(
                          "inherit"
                        )
                      }
                      className="sr-only"
                    />

                    <RotateCcw
                      className="h-5 w-5 text-blue-300"
                      aria-hidden="true"
                    />

                    <div className="mt-3 font-semibold text-white">
                      Nasledi salon
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                      Uklanja posebno
                      pravilo zaposlenog za
                      ovaj dan.
                    </p>
                  </label>
                )}

                <label
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    scheduleRuleMode ===
                    "open"
                      ? "border-emerald-400/30 bg-emerald-400/[0.08]"
                      : "border-white/[0.07] bg-black/10 hover:border-white/15"
                  }`}
                >
                  <input
                    type="radio"
                    name="schedule-rule"
                    value="open"
                    checked={
                      scheduleRuleMode ===
                      "open"
                    }
                    onChange={() =>
                      setScheduleRuleMode(
                        "open"
                      )
                    }
                    className="sr-only"
                  />

                  <Clock3
                    className="h-5 w-5 text-emerald-300"
                    aria-hidden="true"
                  />

                  <div className="mt-3 font-semibold text-white">
                    Radni dan
                  </div>

                  <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                    Podešava vreme početka
                    i završetka rada.
                  </p>
                </label>

                <label
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    scheduleRuleMode ===
                    "closed"
                      ? "border-zinc-400/30 bg-zinc-400/[0.08]"
                      : "border-white/[0.07] bg-black/10 hover:border-white/15"
                  }`}
                >
                  <input
                    type="radio"
                    name="schedule-rule"
                    value="closed"
                    checked={
                      scheduleRuleMode ===
                      "closed"
                    }
                    onChange={() =>
                      setScheduleRuleMode(
                        "closed"
                      )
                    }
                    className="sr-only"
                  />

                  <EyeOff
                    className="h-5 w-5 text-zinc-400"
                    aria-hidden="true"
                  />

                  <div className="mt-3 font-semibold text-white">
                    Neradni dan
                  </div>

                  <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                    Tog dana nema
                    dostupnih termina.
                  </p>
                </label>
              </div>
            </section>

            {scheduleRuleMode ===
              "open" && (
              <section className="grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-medium text-zinc-300">
                    Početak rada
                  </span>

                  <input
                    type="time"
                    required
                    value={openTime}
                    onChange={(event) =>
                      setOpenTime(
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </label>

                <label>
                  <span className="text-sm font-medium text-zinc-300">
                    Kraj rada
                  </span>

                  <input
                    type="time"
                    required
                    value={closeTime}
                    onChange={(event) =>
                      setCloseTime(
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </label>
              </section>
            )}

            <div className="flex justify-end border-t border-white/[0.08] pt-5">
              <button
                type="submit"
                disabled={
                  schedulePending ||
                  (scheduleTarget ===
                    "employee" &&
                    !selectedEmployeeId)
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-50"
              >
                {schedulePending ? (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : scheduleRuleMode ===
                    "inherit" ? (
                  <RotateCcw
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                ) : (
                  <Save
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                )}

                {schedulePending
                  ? "Čuvanje..."
                  : scheduleRuleMode ===
                      "inherit"
                    ? "Vrati na raspored salona"
                    : "Sačuvaj radno vreme"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
          <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:p-6 xl:flex-row xl:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                <CalendarPlus
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Upravljanje blokadama
              </div>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Odsustva i zatvaranja
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                Blokiraj ceo salon ili
                samo jednog zaposlenog u
                određenom vremenskom
                periodu.
              </p>
            </div>

            <button
              type="button"
              onClick={
                openCreateTimeOffDialog
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
            >
              <CalendarPlus
                className="h-4 w-4"
                aria-hidden="true"
              />

              Dodaj blokadu
            </button>
          </div>

          {timeOffMessage &&
            !timeOffDialogOpen && (
              <div
                aria-live="polite"
                className={`m-5 flex items-start justify-between gap-4 rounded-2xl border p-4 sm:m-6 ${
                  timeOffMessage.type ===
                  "success"
                    ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
                    : "border-red-400/20 bg-red-400/[0.07] text-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {timeOffMessage.type ===
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

                  <span className="text-sm">
                    {
                      timeOffMessage.text
                    }
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setTimeOffMessage(
                      null
                    )
                  }
                  aria-label="Zatvori poruku"
                >
                  <X
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </button>
              </div>
            )}

          {sortedTimeOff.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center p-6 text-center">
              <CalendarClock
                className="h-7 w-7 text-zinc-700"
                aria-hidden="true"
              />

              <h3 className="mt-4 font-semibold text-white">
                Nema blokada
              </h3>

              <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600">
                Trenutno nema zatvaranja
                salona, odmora, bolovanja
                ili drugih odsustava.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {sortedTimeOff.map(
                (entry) => (
                  <article
                    key={entry.id}
                    className="flex flex-col justify-between gap-4 p-5 sm:p-6 lg:flex-row lg:items-center"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div
                        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                          entry.isBusinessWide
                            ? "bg-red-400/10 text-red-300"
                            : "bg-blue-400/10 text-blue-300"
                        }`}
                      >
                        {entry.isBusinessWide ? (
                          <Building2
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        ) : (
                          <UserRound
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-white">
                            {entry.isBusinessWide
                              ? "Ceo salon"
                              : entry.employeeName ??
                                "Zaposleni"}
                          </h3>

                          <TimeOffStatus
                            entry={entry}
                          />
                        </div>

                        <div className="mt-2 text-sm text-zinc-400">
                          {formatDateTime(
                            entry.startsAt,
                            data.business
                              .timezone
                          )}
                          {" — "}
                          {formatDateTime(
                            entry.endsAt,
                            data.business
                              .timezone
                          )}
                        </div>

                        <p className="mt-2 text-sm text-zinc-600">
                          {entry.reason ??
                            "Razlog nije unet."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        disabled={
                          timeOffPending
                        }
                        onClick={() =>
                          openEditTimeOffDialog(
                            entry
                          )
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
                      >
                        <Pencil
                          className="h-4 w-4"
                          aria-hidden="true"
                        />

                        Uredi
                      </button>

                      <button
                        type="button"
                        disabled={
                          timeOffPending
                        }
                        onClick={() =>
                          handleRemoveTimeOff(
                            entry
                          )
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.055] px-4 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:opacity-40"
                      >
                        <Trash2
                          className="h-4 w-4"
                          aria-hidden="true"
                        />

                        Ukloni
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {timeOffDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            aria-label="Zatvori dijalog"
            onClick={closeTimeOffDialog}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-950 shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-zinc-950/90 px-5 py-5 backdrop-blur-xl sm:px-7">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-zinc-600">
                  Blokada termina
                </div>

                <h3 className="mt-1 text-lg font-semibold text-white">
                  {editingTimeOffId
                    ? "Uredi blokadu"
                    : "Nova blokada"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeTimeOffDialog}
                disabled={timeOffPending}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-500 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <form
              onSubmit={
                handleTimeOffSubmit
              }
              className="space-y-5 p-5 sm:p-7"
            >
              {timeOffMessage && (
                <div
                  aria-live="polite"
                  className={`flex items-start gap-3 rounded-2xl border p-4 ${
                    timeOffMessage.type ===
                    "success"
                      ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
                      : "border-red-400/20 bg-red-400/[0.07] text-red-200"
                  }`}
                >
                  {timeOffMessage.type ===
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

                  <span className="text-sm">
                    {
                      timeOffMessage.text
                    }
                  </span>
                </div>
              )}

              <section className="grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-medium text-zinc-300">
                    Blokiraj
                  </span>

                  <select
                    value={timeOffScope}
                    onChange={(event) =>
                      setTimeOffScope(
                        event.target
                          .value as TimeOffScope
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-zinc-300 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  >
                    <option value="business">
                      Ceo salon
                    </option>

                    <option
                      value="employee"
                      disabled={
                        data.employees
                          .length === 0
                      }
                    >
                      Jednog zaposlenog
                    </option>
                  </select>
                </label>

                <label>
                  <span className="text-sm font-medium text-zinc-300">
                    Zaposleni
                  </span>

                  <select
                    value={
                      timeOffEmployeeId
                    }
                    disabled={
                      timeOffScope !==
                        "employee" ||
                      data.employees
                        .length === 0
                    }
                    onChange={(event) =>
                      setTimeOffEmployeeId(
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-zinc-300 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15 disabled:opacity-40"
                  >
                    {data.employees.map(
                      (employee) => (
                        <option
                          key={
                            employee.id
                          }
                          value={
                            employee.id
                          }
                        >
                          {
                            employee.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>
              </section>

              <section className="grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-medium text-zinc-300">
                    Početak
                  </span>

                  <input
                    type="datetime-local"
                    required
                    value={
                      timeOffStartsAt
                    }
                    onChange={(event) =>
                      setTimeOffStartsAt(
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </label>

                <label>
                  <span className="text-sm font-medium text-zinc-300">
                    Kraj
                  </span>

                  <input
                    type="datetime-local"
                    required
                    value={timeOffEndsAt}
                    onChange={(event) =>
                      setTimeOffEndsAt(
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </label>

                <div className="sm:col-span-2 rounded-xl border border-blue-400/10 bg-blue-400/[0.04] px-4 py-3 text-xs leading-relaxed text-blue-200/60">
                  Vreme se unosi u
                  vremenskoj zoni salona:{" "}
                  <strong className="text-blue-100">
                    {
                      data.business
                        .timezone
                    }
                  </strong>
                </div>
              </section>

              <label className="block rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <span className="text-sm font-medium text-zinc-300">
                  Razlog ili napomena
                </span>

                <textarea
                  rows={5}
                  maxLength={1000}
                  value={timeOffReason}
                  onChange={(event) =>
                    setTimeOffReason(
                      event.target.value
                    )
                  }
                  placeholder="Godišnji odmor, bolovanje, praznik, renoviranje..."
                  className="mt-2 w-full resize-y rounded-xl border border-white/[0.08] bg-zinc-950 px-4 py-3 text-sm leading-relaxed text-white outline-none placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                />

                <span className="mt-1 block text-right text-[10px] text-zinc-700">
                  {timeOffReason.length}
                  /1000
                </span>
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeTimeOffDialog}
                  disabled={timeOffPending}
                  className="min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] disabled:opacity-40"
                >
                  Odustani
                </button>

                <button
                  type="submit"
                  disabled={timeOffPending}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-50"
                >
                  {timeOffPending ? (
                    <LoaderCircle
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Save
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  )}

                  {timeOffPending
                    ? "Čuvanje..."
                    : editingTimeOffId
                      ? "Sačuvaj blokadu"
                      : "Dodaj blokadu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}