"use client";

import type { Employee, Locale } from "@/lib/types";
import { t, translations } from "@/lib/translations";
import Image from "next/image";

type EmployeeCardBaseProps = {
  employee: Employee;
  locale: Locale;
};

type EmployeeCardSelectableProps = EmployeeCardBaseProps & {
  mode: "selectable";
  isSelected: boolean;
  onSelect: (employeeId: string) => void;
};

type EmployeeCardDisplayProps = EmployeeCardBaseProps & {
  mode: "display";
  onBookWith: (employeeId: string) => void;
};

type EmployeeCardProps =
  | EmployeeCardSelectableProps
  | EmployeeCardDisplayProps;

export default function EmployeeCard(
  props: EmployeeCardProps
) {
  const { employee, locale } = props;

  const employeeRole = t(employee.role, locale);
  const employeeBio = t(employee.bio, locale);

  if (props.mode === "selectable") {
    const { isSelected, onSelect } = props;

    return (
      <button
        type="button"
        onClick={() => onSelect(employee.id)}
        className={`group relative w-full overflow-hidden rounded-3xl border-2 bg-[var(--brand-surface)] text-left transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none ${
          isSelected
            ? "border-[var(--brand-primary)] shadow-lg"
            : "border-[var(--brand-border)] hover:border-[var(--brand-primary)] hover:shadow-md"
        }`}
        aria-pressed={isSelected}
        aria-label={`${employee.name} - ${employeeRole}`}
      >
        <span className="relative block aspect-[4/5] overflow-hidden bg-[var(--brand-secondary)]">
          <Image
            src={employee.image}
            alt={`${employee.name} - ${employeeRole}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {isSelected && (
            <span
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-primary)] font-bold text-[var(--brand-surface)]"
              aria-hidden="true"
            >
              ✓
            </span>
          )}
        </span>

        <span className="block p-6">
          <span className="font-display mb-1 block text-xl font-semibold text-[var(--brand-text)]">
            {employee.name}
          </span>

          <span className="mb-3 block text-sm font-medium text-[var(--brand-primary)]">
            {employeeRole}
          </span>

          <span className="block text-sm leading-relaxed text-[var(--brand-muted)]">
            {employeeBio}
          </span>
        </span>
      </button>
    );
  }

  const bookWithLabel = `${t(
    translations.common.bookWith,
    locale
  )} ${employee.name}`;

  return (
    <article className="group relative overflow-hidden rounded-3xl border-2 border-[var(--brand-border)] bg-[var(--brand-surface)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--brand-secondary)]">
        <Image
          src={employee.image}
          alt={`${employee.name} - ${employeeRole}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="p-6">
        <h3 className="font-display mb-1 text-xl font-semibold text-[var(--brand-text)]">
          {employee.name}
        </h3>

        <div className="mb-3 text-sm font-medium text-[var(--brand-primary)]">
          {employeeRole}
        </div>

        <p className="mb-4 text-sm leading-relaxed text-[var(--brand-muted)]">
          {employeeBio}
        </p>

        <button
          type="button"
          onClick={() => props.onBookWith(employee.id)}
          className="w-full rounded-xl bg-[var(--brand-text)] py-2.5 text-sm font-medium text-[var(--brand-surface)] transition-colors hover:bg-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
          aria-label={bookWithLabel}
        >
          {bookWithLabel}
        </button>
      </div>
    </article>
  );
}