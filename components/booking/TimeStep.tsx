"use client";

import { useMemo } from "react";
import type { Locale } from "@/lib/types";
import { getMockAvailability } from "@/lib/mockAvailability";
import {
  t,
  translations,
} from "@/lib/translations";
import { Clock } from "lucide-react";
import EmptyState from "../shared/EmptyState";
import SectionHeader from "../shared/SectionHeader";

type EmployeePreference = "any" | string | null;

type TimeStepProps = {
  locale: Locale;
  selectedServiceId: string | null;
  selectedDate: string | null;
  selectedEmployeePreference: EmployeePreference;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
};

export default function TimeStep({
  locale,
  selectedServiceId,
  selectedDate,
  selectedEmployeePreference,
  selectedTime,
  onSelectTime,
}: TimeStepProps) {
  const availableTimes = useMemo(() => {
    const slots = getMockAvailability({
      serviceId: selectedServiceId,
      date: selectedDate,
      employeePreference: selectedEmployeePreference,
    });

    const uniqueTimes = new Set(
      slots
        .filter((slot) => slot.available)
        .map((slot) => slot.time)
    );

    return Array.from(uniqueTimes).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [
    selectedServiceId,
    selectedDate,
    selectedEmployeePreference,
  ]);

  const hasRequiredSelections =
    Boolean(selectedServiceId) &&
    Boolean(selectedDate) &&
    Boolean(selectedEmployeePreference);

  if (!hasRequiredSelections) {
    return (
      <EmptyState
        title={
          translations.booking.completePreviousSteps
        }
        description={
          translations.booking
            .completePreviousStepsDescription
        }
        icon={Clock}
        locale={locale}
      />
    );
  }

  if (availableTimes.length === 0) {
    return (
      <EmptyState
        title={translations.common.noTimes}
        description={
          translations.common.noTimesDescription
        }
        icon={Clock}
        locale={locale}
      />
    );
  }

  const timeLabel = t(
    translations.common.time,
    locale
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title={translations.booking.selectTime}
        subtitle={
          translations.booking.selectTimeDescription
        }
        locale={locale}
        align="left"
      />

      <div
        className="grid grid-cols-3 gap-2 sm:grid-cols-4"
        role="group"
        aria-label={t(
          translations.booking.selectTime,
          locale
        )}
      >
        {availableTimes.map((time) => {
          const isSelected = selectedTime === time;

          return (
            <button
              key={time}
              type="button"
              onClick={() => onSelectTime(time)}
              aria-pressed={isSelected}
              aria-label={`${timeLabel}: ${time}`}
              className={`rounded-2xl border-2 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none ${
                isSelected
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--brand-surface)]"
                  : "border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] hover:border-[var(--brand-primary)]"
              }`}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}