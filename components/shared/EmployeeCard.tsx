"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import { Check } from "lucide-react";

import type {
  Employee,
  Locale,
} from "@/lib/types";
import {
  t,
  translations,
} from "@/lib/translations";

type EmployeeCardBaseProps = {
  employee: Employee;
  locale: Locale;
};

type EmployeeCardSelectableProps =
  EmployeeCardBaseProps & {
    mode: "selectable";
    isSelected: boolean;
    onSelect: (
      employeeId: string
    ) => void;
  };

type EmployeeCardDisplayProps =
  EmployeeCardBaseProps & {
    mode: "display";
    onBookWith: (
      employeeId: string
    ) => void;
  };

type EmployeeCardProps =
  | EmployeeCardSelectableProps
  | EmployeeCardDisplayProps;

export default function EmployeeCard(
  props: EmployeeCardProps
) {
  const { employee, locale } = props;

  const employeeLabel = `${employee.name} - ${t(
    employee.role,
    locale
  )}`;

  if (props.mode === "selectable") {
    const { isSelected, onSelect } =
      props;

    return (
      <button
        type="button"
        onClick={() =>
          onSelect(employee.id)
        }
        aria-pressed={isSelected}
        aria-label={employeeLabel}
        className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border-2 bg-[var(--brand-surface)] p-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none ${
          isSelected
            ? "border-[var(--brand-primary)] shadow-md"
            : "border-[var(--brand-border)] hover:border-[var(--brand-primary)] hover:shadow-sm"
        }`}
      >
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--brand-secondary)] sm:h-28 sm:w-28">
          <Image
            src={employee.image}
            alt={employeeLabel}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
            sizes="112px"
          />
        </div>

        <div className="min-w-0 flex-1 py-1">
          <h3 className="font-display truncate text-lg font-semibold text-[var(--brand-text)]">
            {employee.name}
          </h3>

          <div className="mt-0.5 text-sm font-medium text-[var(--brand-primary)]">
            {t(employee.role, locale)}
          </div>

          <p className="mt-2 text-sm leading-snug text-[var(--brand-muted)]">
            {t(employee.bio, locale)}
          </p>
        </div>

        {isSelected && (
          <span
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[var(--brand-surface)]"
            aria-hidden="true"
          >
            <Check className="h-4 w-4" />
          </span>
        )}
      </button>
    );
  }

  if (props.mode === "display") {
    const { onBookWith } = props;

    const handleBookWith = (
      event: MouseEvent<HTMLButtonElement>
    ) => {
      event.stopPropagation();
      onBookWith(employee.id);
    };

    const bookWithLabel = `${t(
      translations.common.bookWith,
      locale
    )} ${employee.name}`;

    return (
      <article className="group relative overflow-hidden rounded-3xl border-2 border-[var(--brand-border)] bg-[var(--brand-surface)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--brand-secondary)]">
          <Image
            src={employee.image}
            alt={employeeLabel}
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
            {t(employee.role, locale)}
          </div>

          <p className="mb-4 text-sm leading-relaxed text-[var(--brand-muted)]">
            {t(employee.bio, locale)}
          </p>

          <button
            type="button"
            onClick={handleBookWith}
            aria-label={bookWithLabel}
            className="w-full rounded-xl bg-[var(--brand-text)] py-2.5 text-sm font-medium text-[var(--brand-surface)] transition-colors hover:bg-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
          >
            {bookWithLabel}
          </button>
        </div>
      </article>
    );
  }

  return null;
}