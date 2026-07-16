"use client";

import Image from "next/image";
import {
  ArrowUpRight,
} from "lucide-react";

import {
  t,
  translations,
} from "@/lib/translations";

import type {
  Employee,
  Locale,
} from "@/lib/types";

import {
  editorialLabels,
} from "../editorial-utils";

type EditorialDesktopTeamSectionProps = {
  employees: Employee[];
  locale: Locale;
  onBookEmployee: (
    employeeId: string
  ) => void;
};

export default function EditorialDesktopTeamSection({
  employees,
  locale,
  onBookEmployee,
}: EditorialDesktopTeamSectionProps) {
  return (
    <section
      id="editorial-team"
      className="mx-auto max-w-[1500px] px-8 py-24 xl:px-12 xl:py-32"
    >
      <div className="flex items-end justify-between gap-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
            02 /{" "}
            {t(
              translations.nav.team,
              locale
            )}
          </p>

          <h2 className="font-display mt-6 max-w-3xl text-6xl font-medium leading-[0.92] tracking-[-0.04em]">
            {t(
              editorialLabels
                .meetArtists,
              locale
            )}
          </h2>
        </div>

        <p className="max-w-md text-right text-base leading-7 text-[var(--brand-muted)]">
          {t(
            editorialLabels
              .teamIntro,
            locale
          )}
        </p>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-5">
        {employees.map(
          (
            employee,
            index
          ) => (
            <article
              key={employee.id}
              className={`group ${
                index === 1
                  ? "mt-14"
                  : ""
              }`}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[var(--brand-surface)]">
                {employee.image ? (
                  <Image
                    src={
                      employee.image
                    }
                    alt={
                      employee.name
                    }
                    fill
                    className="object-cover grayscale-[20%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0 motion-reduce:transform-none motion-reduce:transition-none"
                    sizes="(max-width: 1200px) 33vw, 470px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-surface)]" />
                )}

                <button
                  type="button"
                  onClick={() =>
                    onBookEmployee(
                      employee.id
                    )
                  }
                  className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-text)] text-[var(--brand-background)] shadow-xl transition hover:scale-105 hover:bg-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-black/40 motion-reduce:transform-none motion-reduce:transition-none"
                  aria-label={`${t(
                    editorialLabels
                      .bookArtist,
                    locale
                  )} ${employee.name}`}
                >
                  <ArrowUpRight
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div className="flex items-start justify-between gap-5 px-1 pt-5">
                <div>
                  <h3 className="font-display text-2xl font-medium">
                    {employee.name}
                  </h3>

                  <p className="mt-1 text-sm text-[var(--brand-primary)]">
                    {t(
                      employee.role,
                      locale
                    )}
                  </p>
                </div>

                <span className="pt-1 text-xs text-[var(--brand-muted)]">
                  {String(
                    index + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>
              </div>

              <p className="mt-4 line-clamp-3 max-w-md px-1 text-sm leading-6 text-[var(--brand-muted)]">
                {t(
                  employee.bio,
                  locale
                )}
              </p>
            </article>
          )
        )}

        {employees.length ===
          0 && (
          <div className="col-span-3 rounded-[2rem] border border-dashed border-[var(--brand-border)] px-8 py-20 text-center text-[var(--brand-muted)]">
            {t(
              editorialLabels.noTeam,
              locale
            )}
          </div>
        )}
      </div>
    </section>
  );
}
