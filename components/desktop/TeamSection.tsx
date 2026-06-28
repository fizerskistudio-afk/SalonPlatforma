"use client";

import type { Locale } from "@/lib/types";
import { employees } from "@/lib/mockData";
import { translations } from "@/lib/translations";
import EmployeeCard from "../shared/EmployeeCard";
import SectionHeader from "../shared/SectionHeader";
import EmptyState from "../shared/EmptyState";
import { Users } from "lucide-react";

type TeamSectionProps = {
  locale: Locale;
  onBookEmployee: (employeeId: string) => void;
};

export default function TeamSection({
  locale,
  onBookEmployee,
}: TeamSectionProps) {
  const activeEmployees = employees.filter(
    (employee) => employee.isActive
  );

  return (
    <section
      id="team"
      className="bg-[var(--brand-surface)] px-8 py-24"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title={translations.sections.teamTitle}
          subtitle={translations.sections.teamSub}
          locale={locale}
        />

        {activeEmployees.length > 0 ? (
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
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
        ) : (
          <EmptyState
            title={translations.common.noEmployees}
            description={
              translations.common
                .noEmployeesDescription
            }
            icon={Users}
            locale={locale}
          />
        )}
      </div>
    </section>
  );
}