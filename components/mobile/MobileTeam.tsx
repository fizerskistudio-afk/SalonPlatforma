"use client";

import { Users } from "lucide-react";

import { useCatalogData } from "@/lib/catalogContext";
import { translations } from "@/lib/translations";
import type { Locale } from "@/lib/types";

import EmployeeCard from "../shared/EmployeeCard";
import EmptyState from "../shared/EmptyState";
import SectionHeader from "../shared/SectionHeader";

type MobileTeamProps = {
  locale: Locale;

  onBookEmployee: (
    employeeId: string
  ) => void;
};

export default function MobileTeam({
  locale,
  onBookEmployee,
}: MobileTeamProps) {
  const {
    employees,
  } = useCatalogData();

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.isActive
    );

  if (
    activeEmployees.length === 0
  ) {
    return (
      <div
        className="min-h-screen bg-[var(--brand-background)]"
        style={{
          paddingTop:
            "calc(4.5rem + env(safe-area-inset-top))",

          paddingBottom:
            "calc(6rem + env(safe-area-inset-bottom))",
        }}
      >
        <EmptyState
          title={
            translations.common
              .noEmployees
          }
          description={
            translations.common
              .noEmployeesDescription
          }
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
        paddingTop:
          "calc(4.5rem + env(safe-area-inset-top))",

        paddingBottom:
          "calc(6rem + env(safe-area-inset-bottom))",
      }}
    >
      <div className="pb-4 pt-6">
        <SectionHeader
          title={
            translations.sections
              .teamTitle
          }
          subtitle={
            translations.sections
              .teamSub
          }
          locale={locale}
          align="left"
        />
      </div>

      <div className="space-y-4">
        {activeEmployees.map(
          (employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              locale={locale}
              mode="display"
              onBookWith={
                onBookEmployee
              }
            />
          )
        )}
      </div>
    </div>
  );
}