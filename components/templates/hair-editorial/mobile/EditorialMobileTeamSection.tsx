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

type EditorialMobileTeamSectionProps = {
  employees: Employee[];
  locale: Locale;
  onBookEmployee: (
    employeeId: string
  ) => void;
};

export default function EditorialMobileTeamSection({
  employees,
  locale,
  onBookEmployee,
}: EditorialMobileTeamSectionProps) {
  return (
    <section
      id="editorial-mobile-team"
      className="py-12"
    >
      <div className="px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
          02 /{" "}
          {t(
            translations.nav.team,
            locale
          )}
        </p>

        <h2 className="font-display mt-4 text-4xl font-medium leading-[0.95] tracking-[-0.035em]">
          {t(
            editorialLabels
              .meetArtists,
            locale
          )}
        </h2>

        <p className="mt-4 text-sm leading-6 text-[var(--brand-muted)]">
          {t(
            editorialLabels
              .teamIntro,
            locale
          )}
        </p>
      </div>

      <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2">
        {employees.map(
          (
            employee
          ) => (
            <article
              key={employee.id}
              className="w-[78vw] max-w-[330px] shrink-0 snap-center overflow-hidden rounded-[1.8rem] border border-[var(--brand-border)] bg-[var(--brand-surface)]"
            >
              <div className="relative aspect-[4/5] bg-[var(--brand-secondary)]">
                {employee.image ? (
                  <Image
                    src={
                      employee.image
                    }
                    alt={
                      employee.name
                    }
                    fill
                    className="object-cover"
                    sizes="78vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-surface)]" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="font-display text-3xl font-medium">
                    {employee.name}
                  </h3>

                  <p className="mt-1 text-sm text-white/70">
                    {t(
                      employee.role,
                      locale
                    )}
                  </p>
                </div>
              </div>

              <div className="p-4">
                <p className="line-clamp-2 text-sm leading-6 text-[var(--brand-muted)]">
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
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-between rounded-full border border-[var(--brand-border)] px-4 text-xs font-semibold transition hover:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
                >
                  <span>
                    {t(
                      editorialLabels
                        .bookArtist,
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
          <div className="w-full rounded-[1.5rem] border border-dashed border-[var(--brand-border)] px-5 py-12 text-center text-sm text-[var(--brand-muted)]">
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
