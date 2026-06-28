"use client";

import type { Locale } from "@/lib/types";
import { employees } from "@/lib/mockData";
import { translations } from "@/lib/translations";
import EmployeeCard from "../shared/EmployeeCard";
import SectionHeader from "../shared/SectionHeader";
import EmptyState from "../shared/EmptyState";
import { Users } from "lucide-react";

type MobileTeamProps = {
  locale: Locale;
  onBookEmployee: (employeeId: string) => void;
};

/**
 * Mobilni ekran za tim.
 * Prikazuje aktivne zaposlene sa njihovim karticama.
 * Kompaktan dizajn prilagođen mobilnim uređajima.
 */
export default function MobileTeam({ locale, onBookEmployee }: MobileTeamProps) {
  const activeEmployees = employees.filter((emp) => emp.isActive);

  // Ako nema aktivnih zaposlenih
  if (activeEmployees.length === 0) {
    return (
      <div
        className="min-h-screen bg-[var(--brand-background)]"
        style={{
          paddingTop: "calc(4.5rem + env(safe-area-inset-top))",
          paddingBottom: "calc(6rem + env(safe-area-inset-bottom))",
        }}
      >
        <EmptyState
          title={translations.common.noEmployees}
          description={translations.common.noEmployeesDescription}
          icon={Users}
          locale={locale}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[var(--brand-background)] px-4"
      style={{
        paddingTop: "calc(4.5rem + env(safe-area-inset-top))",
        paddingBottom: "calc(6rem + env(safe-area-inset-bottom))",
      }}
    >
      {/* Header */}
      <div className="pt-6 pb-4">
        <SectionHeader
          title={translations.sections.teamTitle}
          subtitle={translations.sections.teamSub}
          locale={locale}
          align="left"
        />
      </div>

      {/* Employees list */}
      <div className="space-y-4">
        {activeEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            locale={locale}
            mode="display"
            onBookWith={onBookEmployee}
          />
        ))}
      </div>
    </div>
  );
}