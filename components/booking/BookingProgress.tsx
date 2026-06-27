import type {
  Locale,
  LocalizedText,
} from "@/lib/types";
import { t, translations } from "@/lib/translations";
import { Check } from "lucide-react";

type BookingStep = {
  id: string;
  label: LocalizedText;
};

type BookingProgressProps = {
  steps: BookingStep[];
  currentStepIndex: number;
  locale: Locale;
};

export default function BookingProgress({
  steps,
  currentStepIndex,
  locale,
}: BookingProgressProps) {
  return (
    <nav
      aria-label={t(
        translations.booking.progressLabel,
        locale
      )}
    >
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const stepLabel = t(step.label, locale);

          return (
            <li
              key={step.id}
              className="flex flex-1 items-center gap-2"
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors motion-reduce:transition-none ${
                  isCompleted
                    ? "bg-[var(--brand-primary)] text-[var(--brand-surface)]"
                    : isCurrent
                      ? "bg-[var(--brand-text)] text-[var(--brand-surface)]"
                      : "bg-[var(--brand-secondary)] text-[var(--brand-muted)]"
                }`}
              >
                {isCompleted ? (
                  <Check
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                ) : (
                  <span>{index + 1}</span>
                )}
              </span>

              <span
                className={`hidden text-sm font-medium transition-colors motion-reduce:transition-none sm:block ${
                  isCurrent
                    ? "text-[var(--brand-text)]"
                    : isCompleted
                      ? "text-[var(--brand-primary)]"
                      : "text-[var(--brand-muted)]"
                }`}
              >
                {stepLabel}
              </span>

              <span className="sr-only sm:hidden">
                {stepLabel}
              </span>

              {index < steps.length - 1 && (
                <span
                  className={`h-0.5 flex-1 transition-colors motion-reduce:transition-none ${
                    isCompleted
                      ? "bg-[var(--brand-primary)]"
                      : "bg-[var(--brand-secondary)]"
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}