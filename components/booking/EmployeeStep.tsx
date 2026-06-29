"use client";

import { Users } from "lucide-react";

import { useCatalogData } from "@/lib/catalogContext";
import {
  t,
  translations,
} from "@/lib/translations";
import type { Locale } from "@/lib/types";

import EmptyState from "../shared/EmptyState";
import EmployeeCard from "../shared/EmployeeCard";
import SectionHeader from "../shared/SectionHeader";

type EmployeeStepProps = {
  locale: Locale;
  selectedServiceId:
    | string
    | null;
  selectedEmployeePreference:
    | "any"
    | string
    | null;
  onSelectEmployeePreference: (
    preference: "any" | string
  ) => void;
};

export default function EmployeeStep({
  locale,
  selectedServiceId,
  selectedEmployeePreference,
  onSelectEmployeePreference,
}: EmployeeStepProps) {
  const {
    employees,
    booking,
  } = useCatalogData();

  if (!selectedServiceId) {
    return (
      <EmptyState
        title={
          translations.booking
            .selectServiceFirst
        }
        description={
          translations.booking
            .selectServiceFirstDescription
        }
        icon={Users}
        locale={locale}
      />
    );
  }

  const availableEmployees =
    employees.filter(
      (employee) =>
        employee.isActive &&
        employee.serviceIds.includes(
          selectedServiceId
        )
    );

  if (
    availableEmployees.length === 0
  ) {
    return (
      <EmptyState
        title={
          translations.common
            .noEmployees
        }
        description={
          translations.common
            .noEmployeesForService
        }
        icon={Users}
        locale={locale}
      />
    );
  }

  const isAnySelected =
    selectedEmployeePreference ===
    "any";

  return (
    <div className="space-y-6">
      <SectionHeader
        title={
          translations.booking
            .selectEmployee
        }
        subtitle={
          translations.sections.teamSub
        }
        locale={locale}
        align="left"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {booking.allowAnyEmployee && (
          <button
            type="button"
            onClick={() =>
              onSelectEmployeePreference(
                "any"
              )
            }
            className={`group relative w-full rounded-3xl border-2 bg-[var(--brand-surface)] p-6 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none ${
              isAnySelected
                ? "border-[var(--brand-primary)] shadow-lg"
                : "border-[var(--brand-border)] hover:border-[var(--brand-primary)] hover:shadow-md"
            }`}
            aria-pressed={
              isAnySelected
            }
          >
            <span className="flex items-center gap-4">
              <span
                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)]"
                aria-hidden="true"
              >
                <Users className="h-8 w-8 text-[var(--brand-surface)]" />
              </span>

              <span className="flex-1">
                <span className="font-display mb-1 block text-lg font-semibold text-[var(--brand-text)]">
                  {t(
                    translations.booking
                      .any,
                    locale
                  )}
                </span>

                <span className="block text-sm text-[var(--brand-muted)]">
                  {t(
                    translations.booking
                      .anyAvailable,
                    locale
                  )}
                </span>
              </span>

              {isAnySelected && (
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] font-bold text-[var(--brand-surface)]"
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}
            </span>
          </button>
        )}

        {availableEmployees.map(
          (employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              locale={locale}
              mode="selectable"
              isSelected={
                selectedEmployeePreference ===
                employee.id
              }
              onSelect={
                onSelectEmployeePreference
              }
            />
          )
        )}
      </div>
    </div>
  );
}