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

type NailsMobileTeamSectionProps = {
  employees: Employee[];
  locale: Locale;
  onBookEmployee: (
    employeeId: string
  ) => void;
};

const MOBILE_ARTIST_SHADES = [
  "#bd346b",
  "#742c4b",
  "#e8896e",
] as const;

export default function NailsMobileTeamSection({
  employees,
  locale,
  onBookEmployee,
}: NailsMobileTeamSectionProps) {
  return (
    <section
      id="nails-mobile-team"
      className="border-y border-[var(--brand-border)] bg-[var(--brand-secondary)]/28 py-9"
      data-nails-atelier="mobile-artist-desk"
    >
      <header className="px-5">
        <p className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary)]/20 bg-[var(--brand-surface)] px-3.5 py-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
          <PenTool
            className="h-3 w-3"
            aria-hidden="true"
          />

          {t(
            nailsLabels.artistDesk,
            locale
          )}
        </p>

        <h2 className="mt-4 max-w-[11ch] font-display text-[2.45rem] font-medium italic leading-[0.88] tracking-[-0.05em]">
          {t(
            nailsLabels.artistsTitle,
            locale
          )}
        </h2>

        <p className="mt-4 text-[13px] leading-5 text-[var(--brand-muted)]">
          {t(
            nailsLabels.artistsIntro,
            locale
          )}
        </p>
      </header>

      <div className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-4">
        {employees.map(
          (
            employee,
            index
          ) => (
            <article
              key={employee.id}
              className={`w-[82vw] max-w-[350px] shrink-0 snap-center overflow-hidden border border-white/70 bg-[var(--brand-surface)] shadow-[0_18px_50px_rgba(55,28,42,0.12)] ${index % 2 === 0 ? "rounded-[3.5rem_1rem_3.5rem_1rem]" : "rounded-[1rem_3.5rem_1rem_3.5rem]"}`}
            >
              <div className="relative aspect-[5/4] bg-[var(--brand-background)]">
                {employee.image ? (
                  <Image
                    src={employee.image}
                    alt={employee.name}
                    fill
                    className="object-cover"
                    sizes="82vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(255,255,255,0.9),transparent_20%),linear-gradient(145deg,var(--brand-secondary),var(--brand-surface))]">
                    <span
                      className="absolute left-1/2 top-1/2 h-[68%] w-[24%] -translate-x-1/2 -translate-y-1/2 rotate-[-7deg] rounded-[999px_999px_45%_45%] shadow-xl"
                      style={{
                        backgroundColor:
                          MOBILE_ARTIST_SHADES[
                            index %
                              MOBILE_ARTIST_SHADES.length
                          ],
                      }}
                      aria-hidden="true"
                    />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <p className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-black/15 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur">
                  {t(
                    employee.role,
                    locale
                  )}
                </p>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3">
                  <span
                    className="h-8 w-8 rounded-full border-4 border-white shadow-md"
                    style={{
                      backgroundColor:
                        MOBILE_ARTIST_SHADES[
                          index %
                            MOBILE_ARTIST_SHADES.length
                        ],
                    }}
                    aria-hidden="true"
                  />

                  <h3 className="font-display text-3xl font-medium italic tracking-[-0.035em]">
                    {employee.name}
                  </h3>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--brand-muted)]">
                  {t(
                    employee.bio,
                    locale
                  )}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    onBookEmployee(
                      employee.id
                    )
                  }
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-between rounded-full border border-[var(--brand-primary)]/30 px-4 text-xs font-semibold text-[var(--brand-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
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

        {employees.length ===
          0 && (
          <div className="w-full rounded-[3rem_1rem_3rem_1rem] border border-dashed border-[var(--brand-primary)]/25 bg-[var(--brand-surface)] px-6 py-14 text-center">
            <div className="mx-auto flex w-fit items-end gap-2" aria-hidden="true">
              {MOBILE_ARTIST_SHADES.map(
                (
                  shade,
                  index
                ) => (
                  <span
                    key={shade}
                    className="rounded-[999px_999px_45%_45%] shadow-lg"
                    style={{
                      width:
                        `${38 + index * 3}px`,
                      height:
                        `${110 + index * 20}px`,
                      backgroundColor:
                        shade,
                    }}
                  />
                )
              )}
            </div>

            <p className="mt-7 font-display text-2xl font-medium italic leading-tight text-[var(--brand-muted)]">
              {t(
                nailsLabels.noTeam,
                locale
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
