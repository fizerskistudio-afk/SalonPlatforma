"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  Scissors,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  t,
} from "@/lib/translations";

import type {
  Employee,
  Locale,
} from "@/lib/types";

import {
  barberLabels,
} from "../barber-utils";
import { useBarberSectionReveal } from "./useBarberSectionReveal";

type BarberDesktopTeamSectionProps = {
  employees: Employee[];
  locale: Locale;
  onBookEmployee: (
    employeeId: string
  ) => void;
};

function formatRosterIndex(
  index: number
): string {
  return String(
    index + 1
  ).padStart(
    2,
    "0"
  );
}

export default function BarberDesktopTeamSection({
  employees,
  locale,
  onBookEmployee,
}: BarberDesktopTeamSectionProps) {
  const [
    activeEmployeeId,
    setActiveEmployeeId,
  ] =
    useState(
      () =>
        employees[0]?.id ??
        ""
    );

  useEffect(
    () => {
      if (
        employees.length ===
        0
      ) {
        if (
          activeEmployeeId
        ) {
          setActiveEmployeeId(
            ""
          );
        }

        return;
      }

      const activeStillExists =
        employees.some(
          (
            employee
          ) =>
            employee.id ===
            activeEmployeeId
        );

      if (
        !activeStillExists
      ) {
        setActiveEmployeeId(
          employees[0].id
        );
      }
    },
    [
      activeEmployeeId,
      employees,
    ]
  );

  const activeEmployee =
    useMemo(
      () =>
        employees.find(
          (
            employee
          ) =>
            employee.id ===
            activeEmployeeId
        ) ??
        employees[0] ??
        null,
      [
        activeEmployeeId,
        employees,
      ]
    );

  const activeIndex =
    Math.max(
      0,
      employees.findIndex(
        (
          employee
        ) =>
          employee.id ===
          activeEmployee?.id
      )
    );

  const {
    isRevealed,
    sectionRef,
  } =
    useBarberSectionReveal({
      rootMargin:
        "0px 0px -8% 0px",
      threshold:
        0.14,
    });

  if (!activeEmployee) {
    return (
      <section
        ref={sectionRef}
        id="barbers"
        data-barber-revealed={
          isRevealed
            ? "true"
            : "false"
        }
        className="relative isolate scroll-mt-20 overflow-hidden border-y border-[var(--brand-border)] bg-[var(--brand-background)]"
      >
        <div className="pointer-events-none absolute -right-8 top-4 font-display text-[18rem] font-semibold leading-none tracking-[-0.08em] text-[var(--brand-primary)]/[0.025]">
          02
        </div>

        <div className="relative mx-auto flex min-h-[70dvh] max-w-[1500px] flex-col justify-center px-8 py-24 xl:px-12 xl:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
            02 /{" "}
            {t(
              barberLabels.navBarbers,
              locale
            )}
          </p>

          <h2 className="mt-6 max-w-4xl font-display text-[clamp(4rem,6vw,7rem)] font-medium leading-[0.86] tracking-[-0.055em]">
            {t(
              barberLabels.barbersTitle,
              locale
            )}
          </h2>

          <div className="mt-14 rounded-[1.6rem] border border-dashed border-[var(--brand-border)] bg-white/[0.02] px-8 py-20 text-center text-[var(--brand-muted)]">
            {t(
              barberLabels.barbersEmpty,
              locale
            )}
          </div>
        </div>
      </section>
    );
  }

  const activeRole =
    t(
      activeEmployee.role,
      locale
    );

  const activeBio =
    t(
      activeEmployee.bio,
      locale
    );

  return (
    <section
      ref={sectionRef}
      id="barbers"
      data-barber-revealed={
        isRevealed
          ? "true"
          : "false"
      }
      className="relative isolate scroll-mt-20 overflow-hidden border-y border-[var(--brand-border)] bg-[var(--brand-background)]"
    >
      <div className="pointer-events-none absolute -right-8 top-4 font-display text-[18rem] font-semibold leading-none tracking-[-0.08em] text-[var(--brand-primary)]/[0.025]">
        02
      </div>

      <div className="relative mx-auto grid min-h-[calc(100dvh-5rem)] max-w-[1500px] grid-cols-[minmax(0,1.12fr)_minmax(420px,0.88fr)] items-stretch">
        <div className="barber-team-enter-left relative isolate min-h-[720px] overflow-hidden border-r border-[var(--brand-border)] bg-[var(--brand-secondary)]">
          <div className="absolute inset-0">
            {employees.map(
              (
                employee,
                index
              ) => {
                const active =
                  employee.id ===
                  activeEmployee.id;

                return (
                  <div
                    key={
                      employee.id
                    }
                    data-barber-portrait={
                      employee.id
                    }
                    data-active={
                      active
                        ? "true"
                        : "false"
                    }
                    aria-hidden={
                      !active
                    }
                    className={`absolute inset-0 transition-[opacity,transform,filter] duration-700 ease-out motion-reduce:transition-opacity motion-reduce:duration-150 ${
                      active
                        ? "scale-100 opacity-100 grayscale-[0.2] saturate-[0.82] brightness-[0.82]"
                        : "scale-[1.045] opacity-0 grayscale saturate-50 brightness-50"
                    }`}
                  >
                    {employee.image ? (
                      <Image
                        src={
                          employee.image
                        }
                        alt={
                          active
                            ? employee.name
                            : ""
                        }
                        fill
                        priority={
                          index ===
                          0
                        }
                        className="object-cover [object-position:center_24%]"
                        sizes="58vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_24%,color-mix(in_srgb,var(--brand-primary)_30%,transparent),transparent_31%),linear-gradient(145deg,var(--brand-secondary),var(--brand-surface))]">
                        <span className="font-display text-[13rem] font-medium leading-none text-[var(--brand-primary)]/45">
                          {
                            employee.name
                              .trim()
                              .charAt(
                                0
                              ) ||
                            "B"
                          }
                        </span>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,4,3,0.08)_0%,rgba(4,4,3,0.02)_48%,rgba(4,4,3,0.46)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
          <div className="absolute inset-0 opacity-[0.045] [background-image:radial-gradient(circle_at_center,white_0.7px,transparent_0.7px)] [background-size:5px_5px]" />

          <div className="absolute left-8 top-8 z-10 inline-flex items-center gap-3 rounded-full border border-white/18 bg-black/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/78 backdrop-blur-md xl:left-12 xl:top-10">
            <Scissors
              className="h-3.5 w-3.5 text-[var(--brand-primary)]"
              aria-hidden="true"
            />

            {t(
              barberLabels.heroTrust2,
              locale
            )}
          </div>

          <div
            key={
              `portrait-copy-${activeEmployee.id}`
            }
            className="barber-team-copy absolute inset-x-0 bottom-0 z-10 p-8 text-white xl:p-12"
            aria-live="polite"
          >
            <div className="flex items-end justify-between gap-8 border-b border-white/18 pb-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
                  {formatRosterIndex(
                    activeIndex
                  )}{" "}
                  /{" "}
                  {formatRosterIndex(
                    employees.length
                  )}
                </p>

                <h3 className="mt-4 max-w-[12ch] font-display text-[clamp(4rem,5.8vw,7rem)] font-medium leading-[0.82] tracking-[-0.06em]">
                  {
                    activeEmployee.name
                  }
                </h3>
              </div>

              {activeRole && (
                <p className="max-w-[16rem] pb-2 text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-white/58">
                  {
                    activeRole
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="barber-team-enter-right relative flex min-h-[720px] flex-col overflow-hidden bg-[color-mix(in_srgb,var(--brand-surface)_93%,black)] px-8 py-10 xl:px-12 xl:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_92%_8%,color-mix(in_srgb,var(--brand-primary)_10%,transparent),transparent_30%),linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.24)_100%)]" />

          <div className="relative z-10 flex min-h-full flex-col">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
                  02 /{" "}
                  {t(
                    barberLabels.navBarbers,
                    locale
                  )}
                </p>

                <h2 className="mt-6 max-w-[9ch] font-display text-[clamp(3.8rem,4.8vw,6rem)] font-medium leading-[0.86] tracking-[-0.055em]">
                  {t(
                    barberLabels.barbersTitle,
                    locale
                  )}
                </h2>
              </div>

              <span className="pt-1 font-display text-4xl text-[var(--brand-primary)]/28">
                {
                  formatRosterIndex(
                    employees.length
                  )
                }
              </span>
            </div>

            <div
              key={
                `team-details-${activeEmployee.id}`
              }
              className="barber-team-copy mt-7 border-l-2 border-[var(--brand-primary)] pl-5"
            >
              {activeRole && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
                  {
                    activeRole
                  }
                </p>
              )}

              {activeBio && (
                <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--brand-muted)]">
                  {
                    activeBio
                  }
                </p>
              )}
            </div>

            <div
              className="mt-8 border-t border-[var(--brand-border)]"
              role="list"
            >
              {employees.map(
                (
                  employee,
                  index
                ) => {
                  const active =
                    employee.id ===
                    activeEmployee.id;

                  const role =
                    t(
                      employee.role,
                      locale
                    );

                  return (
                    <button
                      key={
                        employee.id
                      }
                      type="button"
                      role="listitem"
                      aria-pressed={
                        active
                      }
                      onMouseEnter={() =>
                        setActiveEmployeeId(
                          employee.id
                        )
                      }
                      onFocus={() =>
                        setActiveEmployeeId(
                          employee.id
                        )
                      }
                      onClick={() =>
                        setActiveEmployeeId(
                          employee.id
                        )
                      }
                      className={`barber-team-roster-entry group relative grid min-h-[78px] xl:min-h-[82px] w-full grid-cols-[2.6rem_minmax(0,1fr)_2.8rem] items-center gap-4 border-b border-[var(--brand-border)] px-3 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand-primary)] ${
                        active
                          ? "bg-[color-mix(in_srgb,var(--brand-primary)_8%,transparent)] text-[var(--brand-primary)]"
                          : "text-[var(--brand-text)] hover:bg-white/[0.025] hover:text-[var(--brand-primary)]"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute inset-y-3 left-0 w-[2px] origin-center bg-[var(--brand-primary)] transition-transform duration-300 motion-reduce:transition-none ${
                          active
                            ? "scale-y-100"
                            : "scale-y-0 group-hover:scale-y-60"
                        }`}
                      />

                      <span className="font-display text-base tabular-nums text-[var(--brand-muted)]/55">
                        {formatRosterIndex(
                          index
                        )}
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate font-display text-[1.55rem] font-medium tracking-[-0.03em]">
                          {
                            employee.name
                          }
                        </span>

                        {role && (
                          <span className="mt-1 block truncate text-[9px] font-semibold uppercase tracking-[0.17em] text-[var(--brand-muted)]">
                            {
                              role
                            }
                          </span>
                        )}
                      </span>

                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border transition duration-200 motion-reduce:transition-none ${
                          active
                            ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--brand-background)]"
                            : "border-[var(--brand-border)] text-[var(--brand-muted)] group-hover:border-[var(--brand-primary)] group-hover:text-[var(--brand-primary)]"
                        }`}
                      >
                        <ArrowUpRight
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            <div className="mt-auto pt-7">
              <button
                type="button"
                onClick={() =>
                  onBookEmployee(
                    activeEmployee.id
                  )
                }
                className="group inline-flex min-h-14 w-full items-center justify-between rounded-full bg-[var(--brand-primary)] px-6 text-sm font-semibold text-[var(--brand-background)] transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-surface)] motion-reduce:transform-none motion-reduce:transition-none"
                aria-label={`${t(
                  barberLabels.bookBarber,
                  locale
                )} ${activeEmployee.name}`}
              >
                <span>
                  {t(
                    barberLabels.bookBarber,
                    locale
                  )}{" "}
                  {
                    activeEmployee.name
                  }
                </span>

                <ArrowUpRight
                  className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          .barber-team-enter-left,
          .barber-team-enter-right {
            transition:
              opacity 760ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 760ms cubic-bezier(0.16, 1, 0.3, 1);
            will-change: opacity, transform;
          }

          [data-barber-revealed="false"] .barber-team-enter-left {
            opacity: 0;
            transform: translateX(-28px) translateY(18px);
          }

          [data-barber-revealed="true"] .barber-team-enter-left {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }

          [data-barber-revealed="false"] .barber-team-enter-right {
            opacity: 0;
            transform: translateX(34px);
          }

          [data-barber-revealed="true"] .barber-team-enter-right {
            opacity: 1;
            transform: translateX(0);
          }

          .barber-team-roster-entry {
            transition:
              opacity 540ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 540ms cubic-bezier(0.16, 1, 0.3, 1),
              color 200ms ease,
              background-color 200ms ease;
            will-change: opacity, transform;
          }

          [data-barber-revealed="false"] .barber-team-roster-entry {
            opacity: 0;
            transform: translateX(24px);
          }

          [data-barber-revealed="true"] .barber-team-roster-entry {
            opacity: 1;
            transform: translateX(0);
          }

          [data-barber-revealed="true"] .barber-team-roster-entry:nth-child(1) {
            transition-delay: 160ms;
          }

          [data-barber-revealed="true"] .barber-team-roster-entry:nth-child(2) {
            transition-delay: 225ms;
          }

          [data-barber-revealed="true"] .barber-team-roster-entry:nth-child(3) {
            transition-delay: 290ms;
          }

          [data-barber-revealed="true"] .barber-team-roster-entry:nth-child(4) {
            transition-delay: 355ms;
          }
        }

        @keyframes barberTeamCopyIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .barber-team-copy {
          animation: barberTeamCopyIn 420ms
            cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .barber-team-copy {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
