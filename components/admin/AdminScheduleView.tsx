"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  Building2,
  CalendarClock,
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  Clock3,
  EyeOff,
  UserRound,
  UsersRound,
} from "lucide-react";

import type {
  AdminEmployeeScheduleDay,
  AdminScheduleResult,
  AdminTimeOff,
  AdminWorkingHoursRule,
} from "@/lib/admin/schedule";

type AdminScheduleViewProps = {
  data: AdminScheduleResult;
};

type TimeOffFilter =
  | "active"
  | "upcoming"
  | "ongoing"
  | "past"
  | "all";

const timeOffFilterLabels: Record<
  TimeOffFilter,
  string
> = {
  active: "Aktuelna i buduća",
  upcoming: "Buduća",
  ongoing: "Trenutno aktivna",
  past: "Prošla",
  all: "Sva odsustva",
};

function formatTime(
  value: string | null
): string {
  if (!value) {
    return "—";
  }

  return value.slice(0, 5);
}

function formatWorkingHoursRule(
  rule: AdminWorkingHoursRule | null
): string {
  if (!rule) {
    return "Nije podešeno";
  }

  if (rule.isClosed) {
    return "Zatvoreno";
  }

  return `${formatTime(
    rule.openTime
  )} – ${formatTime(rule.closeTime)}`;
}

function formatDateTime(
  value: string,
  timezone: string
): string {
  return new Intl.DateTimeFormat(
    "sr-Latn-RS",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone,
    }
  ).format(new Date(value));
}

function formatTimeOffType(
  value: string
): string {
  if (value === "time_off") {
    return "Odsustvo";
  }

  return value
    .replaceAll("_", " ")
    .replace(/^\p{L}/u, (letter) =>
      letter.toLocaleUpperCase()
    );
}

function getTimeOffStatus(
  entry: AdminTimeOff
): {
  label: string;
  className: string;
} {
  if (entry.isOngoing) {
    return {
      label: "U toku",
      className:
        "border-red-400/20 bg-red-400/[0.08] text-red-300",
    };
  }

  if (entry.isUpcoming) {
    return {
      label: "Predstoji",
      className:
        "border-blue-400/20 bg-blue-400/[0.08] text-blue-300",
    };
  }

  return {
    label: "Završeno",
    className:
      "border-zinc-500/20 bg-zinc-500/[0.08] text-zinc-500",
  };
}

function WorkingHoursStatus({
  rule,
}: {
  rule: AdminWorkingHoursRule | null;
}) {
  if (!rule) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-2.5 py-1 text-[10px] font-semibold text-amber-200/70">
        Nije podešeno
      </span>
    );
  }

  if (rule.isClosed) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-500/15 bg-zinc-500/[0.06] px-2.5 py-1 text-[10px] font-semibold text-zinc-500">
        <EyeOff
          className="h-3 w-3"
          aria-hidden="true"
        />

        Zatvoreno
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
      <CheckCircle2
        className="h-3 w-3"
        aria-hidden="true"
      />

      Otvoreno
    </span>
  );
}

function ScheduleSourceBadge({
  day,
}: {
  day: AdminEmployeeScheduleDay;
}) {
  if (day.effectiveSource === "employee") {
    return (
      <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-2.5 py-1 text-[10px] font-semibold text-amber-200/70">
        Posebno radno vreme
      </span>
    );
  }

  if (day.effectiveSource === "business") {
    return (
      <span className="rounded-full border border-blue-400/15 bg-blue-400/[0.06] px-2.5 py-1 text-[10px] font-semibold text-blue-300/70">
        Nasleđuje salon
      </span>
    );
  }

  return (
    <span className="rounded-full border border-red-400/15 bg-red-400/[0.06] px-2.5 py-1 text-[10px] font-semibold text-red-300/70">
      Bez pravila
    </span>
  );
}

export default function AdminScheduleView({
  data,
}: AdminScheduleViewProps) {
  const [
    selectedEmployeeId,
    setSelectedEmployeeId,
  ] = useState(
    data.employeeSchedules[0]?.employee
      .id ?? ""
  );

  const [
    timeOffFilter,
    setTimeOffFilter,
  ] =
    useState<TimeOffFilter>("active");

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

  const filteredTimeOff = useMemo(
    () =>
      data.timeOff.filter((entry) => {
        if (timeOffFilter === "all") {
          return true;
        }

        if (
          timeOffFilter === "active"
        ) {
          return (
            entry.isUpcoming ||
            entry.isOngoing
          );
        }

        if (
          timeOffFilter === "upcoming"
        ) {
          return entry.isUpcoming;
        }

        if (
          timeOffFilter === "ongoing"
        ) {
          return entry.isOngoing;
        }

        return entry.isPast;
      }),
    [data.timeOff, timeOffFilter]
  );

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
          {data.business.name}
        </div>

        <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Raspored
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Pregled radnog vremena
              salona, posebnih rasporeda
              zaposlenih, slobodnih dana
              i vremenskih blokada.
            </p>
          </div>

          <div className="inline-flex self-start items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-xs text-zinc-500">
            <Clock3
              className="h-4 w-4 text-amber-300"
              aria-hidden="true"
            />

            Vremenska zona:

            <span className="font-semibold text-white">
              {data.business.timezone}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-500">
              Radni dani
            </div>

            <Building2
              className="h-5 w-5 text-zinc-600"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-white">
            {
              data.metrics
                .openBusinessDays
            }
          </div>

          <div className="mt-2 text-xs text-zinc-600">
            otvorenih dana nedeljno
          </div>
        </article>

        <article className="rounded-3xl border border-zinc-500/15 bg-zinc-500/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-400">
              Neradni dani
            </div>

            <Ban
              className="h-5 w-5 text-zinc-500"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-zinc-300">
            {
              data.metrics
                .closedBusinessDays
            }
          </div>

          <div className="mt-2 text-xs text-zinc-600">
            zatvorenih dana nedeljno
          </div>
        </article>

        <article className="rounded-3xl border border-blue-400/15 bg-blue-400/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-200/70">
              Zaposleni
            </div>

            <UsersRound
              className="h-5 w-5 text-blue-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-blue-100">
            {
              data.metrics
                .activeEmployees
            }
          </div>

          <div className="mt-2 text-xs text-blue-300/50">
            aktivnih članova tima
          </div>
        </article>

        <article className="rounded-3xl border border-amber-300/15 bg-amber-300/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-200/70">
              Posebna pravila
            </div>

            <CalendarClock
              className="h-5 w-5 text-amber-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-amber-100">
            {
              data.metrics
                .configuredEmployeeOverrides
            }
          </div>

          <div className="mt-2 text-xs text-amber-300/50">
            override pravila zaposlenih
          </div>
        </article>

        <article className="rounded-3xl border border-red-400/15 bg-red-400/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-red-200/70">
              Aktivne blokade
            </div>

            <CalendarX2
              className="h-5 w-5 text-red-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-red-100">
            {data.metrics.ongoingTimeOff +
              data.metrics.upcomingTimeOff}
          </div>

          <div className="mt-2 text-xs text-red-300/50">
            tekućih i budućih
          </div>
        </article>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <div className="flex flex-col justify-between gap-3 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
              <Building2
                className="h-4 w-4"
                aria-hidden="true"
              />

              Salon
            </div>

            <h3 className="mt-2 text-xl font-semibold text-white">
              Opšte radno vreme
            </h3>

            <p className="mt-1 text-sm text-zinc-600">
              Osnovni raspored koji
              zaposleni nasleđuju kada
              nemaju posebno pravilo.
            </p>
          </div>

          <span className="self-start rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs text-zinc-500">
            {
              data.metrics
                .configuredBusinessDays
            }
            /7 podešenih dana
          </span>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4 2xl:grid-cols-7">
          {data.businessSchedule.map(
            (day) => (
              <article
                key={day.dayOfWeek}
                className="rounded-2xl border border-white/[0.07] bg-black/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      {day.shortLabel}
                    </div>

                    <div className="mt-1 font-semibold text-white">
                      {day.label}
                    </div>
                  </div>

                  <WorkingHoursStatus
                    rule={day.rule}
                  />
                </div>

                <div
                  className={`mt-5 text-lg font-semibold ${
                    day.rule?.isClosed
                      ? "text-zinc-600"
                      : day.rule
                        ? "text-emerald-100"
                        : "text-amber-200/60"
                  }`}
                >
                  {formatWorkingHoursRule(
                    day.rule
                  )}
                </div>
              </article>
            )
          )}
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:p-6 xl:flex-row xl:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
              <UserRound
                className="h-4 w-4"
                aria-hidden="true"
              />

              Tim
            </div>

            <h3 className="mt-2 text-xl font-semibold text-white">
              Raspored zaposlenih
            </h3>

            <p className="mt-1 max-w-2xl text-sm text-zinc-600">
              Efektivno radno vreme
              uključuje posebna pravila
              zaposlenog ili nasleđeni
              raspored salona.
            </p>
          </div>

          <label className="block min-w-64">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
              Izaberi zaposlenog
            </span>

            <select
              value={selectedEmployeeId}
              disabled={
                data.employeeSchedules
                  .length === 0
              }
              onChange={(event) =>
                setSelectedEmployeeId(
                  event.target.value
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-zinc-300 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15 disabled:opacity-40"
            >
              {data.employeeSchedules
                .length === 0 ? (
                <option value="">
                  Nema zaposlenih
                </option>
              ) : (
                data.employeeSchedules.map(
                  (schedule) => (
                    <option
                      key={
                        schedule.employee.id
                      }
                      value={
                        schedule.employee.id
                      }
                    >
                      {
                        schedule.employee
                          .name
                      }
                    </option>
                  )
                )
              )}
            </select>
          </label>
        </div>

        {!selectedEmployeeSchedule ? (
          <div className="flex min-h-56 flex-col items-center justify-center p-6 text-center">
            <UsersRound
              className="h-7 w-7 text-zinc-700"
              aria-hidden="true"
            />

            <div className="mt-4 font-semibold text-white">
              Nema zaposlenih
            </div>

            <p className="mt-2 text-sm text-zinc-600">
              Dodaj zaposlenog da bi mu
              mogao biti podešen raspored.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 border-b border-white/[0.07] p-5 sm:grid-cols-4 sm:p-6">
              <article className="rounded-2xl border border-white/[0.07] bg-black/10 p-4">
                <div className="text-xs text-zinc-600">
                  Zaposleni
                </div>

                <div className="mt-2 font-semibold text-white">
                  {
                    selectedEmployeeSchedule
                      .employee.name
                  }
                </div>

                <div
                  className={`mt-1 text-xs ${
                    selectedEmployeeSchedule
                      .employee.isActive
                      ? "text-emerald-300"
                      : "text-zinc-600"
                  }`}
                >
                  {selectedEmployeeSchedule
                    .employee.isActive
                    ? "Aktivan profil"
                    : "Neaktivan profil"}
                </div>
              </article>

              <article className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.035] p-4">
                <div className="text-xs text-emerald-300/60">
                  Radni dani
                </div>

                <div className="mt-2 text-2xl font-semibold text-emerald-100">
                  {
                    selectedEmployeeSchedule
                      .metrics.openDays
                  }
                </div>
              </article>

              <article className="rounded-2xl border border-zinc-500/10 bg-zinc-500/[0.035] p-4">
                <div className="text-xs text-zinc-500">
                  Neradni dani
                </div>

                <div className="mt-2 text-2xl font-semibold text-zinc-300">
                  {
                    selectedEmployeeSchedule
                      .metrics.closedDays
                  }
                </div>
              </article>

              <article className="rounded-2xl border border-amber-300/10 bg-amber-300/[0.035] p-4">
                <div className="text-xs text-amber-300/60">
                  Posebna pravila
                </div>

                <div className="mt-2 text-2xl font-semibold text-amber-100">
                  {
                    selectedEmployeeSchedule
                      .metrics
                      .configuredOverrides
                  }
                </div>
              </article>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {selectedEmployeeSchedule.days.map(
                (day) => (
                  <article
                    key={day.dayOfWeek}
                    className="grid gap-4 p-5 sm:grid-cols-[minmax(8rem,0.45fr)_minmax(12rem,0.8fr)_minmax(12rem,1fr)] sm:items-center sm:p-6"
                  >
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                        {day.shortLabel}
                      </div>

                      <div className="mt-1 font-semibold text-white">
                        {day.label}
                      </div>
                    </div>

                    <div>
                      <div
                        className={`text-lg font-semibold ${
                          day.effectiveRule
                            ?.isClosed
                            ? "text-zinc-600"
                            : day.effectiveRule
                              ? "text-emerald-100"
                              : "text-red-300/70"
                        }`}
                      >
                        {formatWorkingHoursRule(
                          day.effectiveRule
                        )}
                      </div>

                      <div className="mt-2">
                        <WorkingHoursStatus
                          rule={
                            day.effectiveRule
                          }
                        />
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <ScheduleSourceBadge
                        day={day}
                      />

                      {day.employeeOverride &&
                        day.businessRule && (
                          <div className="mt-2 text-xs text-zinc-700">
                            Salon:{" "}
                            {formatWorkingHoursRule(
                              day.businessRule
                            )}
                          </div>
                        )}
                    </div>
                  </article>
                )
              )}
            </div>
          </>
        )}
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:p-6 xl:flex-row xl:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
              <CalendarX2
                className="h-4 w-4"
                aria-hidden="true"
              />

              Blokade termina
            </div>

            <h3 className="mt-2 text-xl font-semibold text-white">
              Odsustva i zatvaranja
            </h3>

            <p className="mt-1 max-w-2xl text-sm text-zinc-600">
              Blokada salona utiče na sve
              zaposlene, dok lično
              odsustvo utiče samo na
              izabranog člana tima.
            </p>
          </div>

          <label className="block min-w-56">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
              Prikaz
            </span>

            <select
              value={timeOffFilter}
              onChange={(event) =>
                setTimeOffFilter(
                  event.target
                    .value as TimeOffFilter
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-zinc-300 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
            >
              {(
                Object.keys(
                  timeOffFilterLabels
                ) as TimeOffFilter[]
              ).map((filter) => (
                <option
                  key={filter}
                  value={filter}
                >
                  {
                    timeOffFilterLabels[
                      filter
                    ]
                  }
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-white/[0.07] px-5 py-4 text-xs sm:px-6">
          <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-zinc-500">
            Ukupno:{" "}
            {data.metrics.totalTimeOff}
          </span>

          <span className="rounded-full border border-red-400/15 bg-red-400/[0.05] px-3 py-1.5 text-red-300/70">
            U toku:{" "}
            {data.metrics.ongoingTimeOff}
          </span>

          <span className="rounded-full border border-blue-400/15 bg-blue-400/[0.05] px-3 py-1.5 text-blue-300/70">
            Buduća:{" "}
            {data.metrics.upcomingTimeOff}
          </span>

          <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-zinc-500">
            Salon:{" "}
            {
              data.metrics
                .businessWideBlocks
            }
          </span>

          <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-zinc-500">
            Zaposleni:{" "}
            {data.metrics.employeeBlocks}
          </span>
        </div>

        {filteredTimeOff.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-700">
              <CalendarDays
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            <h4 className="mt-5 font-semibold text-white">
              Nema odsustava
            </h4>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600">
              U izabranom prikazu nema
              zatvaranja salona, odmora,
              bolovanja ili drugih
              vremenskih blokada.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filteredTimeOff.map(
              (entry) => {
                const status =
                  getTimeOffStatus(entry);

                return (
                  <article
                    key={entry.id}
                    className="p-5 sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
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
                            <h4 className="font-semibold text-white">
                              {entry.isBusinessWide
                                ? "Ceo salon"
                                : entry.employeeName ??
                                  "Nepoznat zaposleni"}
                            </h4>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </div>

                          <div className="mt-1 text-xs text-zinc-600">
                            {formatTimeOffType(
                              entry.blockType
                            )}
                          </div>

                          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                            {entry.reason ??
                              "Razlog nije unet."}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4 lg:min-w-72">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-700">
                          Početak
                        </div>

                        <div className="mt-1 text-sm font-medium text-white">
                          {formatDateTime(
                            entry.startsAt,
                            data.business.timezone
                          )}
                        </div>

                        <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-700">
                          Kraj
                        </div>

                        <div className="mt-1 text-sm font-medium text-white">
                          {formatDateTime(
                            entry.endsAt,
                            data.business.timezone
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}