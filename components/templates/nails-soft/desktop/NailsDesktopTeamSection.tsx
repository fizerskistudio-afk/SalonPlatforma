"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  PenTool,
} from "lucide-react";

import {
  t,
} from "@/lib/translations";

import type {
  Employee,
  Locale,
} from "@/lib/types";

import {
  nailsLabels,
} from "../nails-utils";

type NailsDesktopTeamSectionProps = {
  employees: Employee[];
  locale: Locale;
  onBookEmployee: (
    employeeId: string
  ) => void;
};

const ARTIST_SHADES = [
  "#bd346b",
  "#742c4b",
  "#e8896e",
  "#d96891",
] as const;

export default function NailsDesktopTeamSection({
  employees,
  locale,
  onBookEmployee,
}: NailsDesktopTeamSectionProps) {
  return (
    <section
      id="nails-team"
      className="relative isolate overflow-hidden border-b border-[var(--brand-border)] bg-[var(--brand-secondary)]/28"
      data-nails-atelier="artist-desk"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,transparent_56%,color-mix(in_srgb,var(--brand-surface)_70%,transparent)_56%,color-mix(in_srgb,var(--brand-surface)_70%,transparent)_100%)]" />

      <div className="relative mx-auto max-w-[1320px] px-8 py-20 xl:px-10 xl:py-24">
        <header className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary)]/20 bg-[var(--brand-surface)]/75 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)] backdrop-blur">
              <PenTool
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              {t(
                nailsLabels.artistDesk,
                locale
              )}
            </p>

            <h2 className="mt-6 max-w-[12ch] font-display text-[clamp(3.6rem,5vw,5.7rem)] font-medium italic leading-[0.86] tracking-[-0.05em]">
              {t(
                nailsLabels.artistsTitle,
                locale
              )}
            </h2>
          </div>

          <p className="text-sm leading-7 text-[var(--brand-muted)]">
            {t(
              nailsLabels.artistsIntro,
              locale
            )}
          </p>
        </header>

        {employees.length >
        0 ? (
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {employees.map(
              (
                employee,
                index
              ) => (
                <article
                  key={employee.id}
                  className={`group grid min-h-[350px] overflow-hidden border border-white/70 bg-[var(--brand-surface)] shadow-[0_22px_60px_rgba(55,28,42,0.09)] ${index % 2 === 0 ? "grid-cols-[0.9fr_1.1fr] rounded-[3.25rem_1.25rem_3.25rem_1.25rem]" : "grid-cols-[1.1fr_0.9fr] rounded-[1.25rem_3.25rem_1.25rem_3.25rem]"}`}
                >
                  <div className={`relative min-h-[350px] bg-[var(--brand-background)] ${index % 2 === 1 ? "order-2" : ""}`}>
                    {employee.image ? (
                      <Image
                        src={employee.image}
                        alt={employee.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.035] motion-reduce:transform-none motion-reduce:transition-none"
                        sizes="(max-width: 1200px) 25vw, 360px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(255,255,255,0.9),transparent_20%),linear-gradient(145deg,var(--brand-secondary),var(--brand-surface))]">
                        <span
                          className="absolute left-1/2 top-1/2 h-[64%] w-[28%] -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] rounded-[999px_999px_45%_45%] shadow-2xl"
                          style={{
                            backgroundColor:
                              ARTIST_SHADES[
                                index %
                                  ARTIST_SHADES.length
                              ],
                          }}
                          aria-hidden="true"
                        />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    <span className="absolute bottom-5 left-5 rounded-full border border-white/30 bg-black/15 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                      {t(
                        employee.role,
                        locale
                      )}
                    </span>
                  </div>

                  <div className="relative flex flex-col justify-between p-7 xl:p-8">
                    <div>
                      <span
                        className="block h-12 w-12 rounded-full border-[6px] border-white shadow-md"
                        style={{
                          backgroundColor:
                            ARTIST_SHADES[
                              index %
                                ARTIST_SHADES.length
                            ],
                        }}
                        aria-hidden="true"
                      />

                      <h3 className="mt-6 font-display text-3xl font-medium italic leading-none tracking-[-0.035em]">
                        {employee.name}
                      </h3>

                      <p className="mt-4 line-clamp-4 text-sm leading-6 text-[var(--brand-muted)]">
                        {t(
                          employee.bio,
                          locale
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onBookEmployee(
                          employee.id
                        )
                      }
                      className="mt-8 inline-flex min-h-12 w-full items-center justify-between rounded-full border border-[var(--brand-primary)]/25 px-5 text-xs font-semibold text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary)] hover:text-[var(--brand-background)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] motion-reduce:transition-none"
                    >
                      <span>
                        {t(
                          nailsLabels.bookArtist,
                          locale
                        )}{" "}
                        {employee.name}
                      </span>

                      <ArrowUpRight
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        ) : (
          <div className="mt-12 grid min-h-[280px] overflow-hidden rounded-[3.25rem_1.25rem_3.25rem_1.25rem] border border-dashed border-[var(--brand-primary)]/25 bg-[var(--brand-surface)] lg:grid-cols-[1fr_280px]">
            <div className="flex items-center p-10">
              <p className="max-w-xl font-display text-3xl font-medium italic leading-tight">
                {t(
                  nailsLabels.noTeam,
                  locale
                )}
              </p>
            </div>

            <div className="flex items-end justify-center gap-3 bg-[var(--brand-background)] p-8" aria-hidden="true">
              {ARTIST_SHADES.map(
                (
                  shade,
                  index
                ) => (
                  <span
                    key={shade}
                    className="rounded-[999px_999px_45%_45%] shadow-lg"
                    style={{
                      width:
                        `${44 + index * 3}px`,
                      height:
                        `${150 + (index % 2) * 45}px`,
                      backgroundColor:
                        shade,
                    }}
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
