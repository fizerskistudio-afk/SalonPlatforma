"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

import { bookingConfig } from "@/lib/config";
import {
  employees,
  services,
} from "@/lib/mockData";
import {
  t,
  translations,
} from "@/lib/translations";
import type {
  BookingDraft,
  Locale,
} from "@/lib/types";

import BookingProgress from "./BookingProgress";
import BookingSummary from "./BookingSummary";
import CustomerStep from "./CustomerStep";
import DateStep from "./DateStep";
import EmployeeStep from "./EmployeeStep";
import ServiceStep from "./ServiceStep";
import SuccessStep from "./SuccessStep";
import TimeStep from "./TimeStep";

type BookingFlowProps = {
  locale: Locale;
  initialServiceId?: string | null;
  initialEmployeeId?: string | null;
  onDone: () => void;
};

type BookingStep =
  | "service"
  | "employee"
  | "date"
  | "time"
  | "customer"
  | "summary"
  | "success";

const stepOrder: BookingStep[] = [
  "service",
  "employee",
  "date",
  "time",
  "customer",
  "summary",
  "success",
];

function createInitialDraft(
  initialServiceId: string | null,
  initialEmployeeId: string | null
): BookingDraft {
  const validService =
    initialServiceId
      ? services.find(
          (service) =>
            service.id ===
              initialServiceId &&
            service.isActive
        )
      : undefined;

  const validEmployee =
    initialEmployeeId
      ? employees.find(
          (employee) =>
            employee.id ===
              initialEmployeeId &&
            employee.isActive
        )
      : undefined;

  const serviceId =
    validService?.id ?? null;

  let employeePreference =
    validEmployee?.id ?? null;

  if (
    serviceId &&
    validEmployee &&
    !validEmployee.serviceIds.includes(
      serviceId
    )
  ) {
    employeePreference = null;
  }

  return {
    serviceId,
    employeePreference,
    date: null,
    time: null,
    customer: {
      name: "",
      phone: "",
      email: "",
      note: "",
    },
  };
}

export default function BookingFlow({
  locale,
  initialServiceId = null,
  initialEmployeeId = null,
  onDone,
}: BookingFlowProps) {
  const [currentStep, setCurrentStep] =
    useState<BookingStep>("service");

  const [draft, setDraft] =
    useState<BookingDraft>(() =>
      createInitialDraft(
        initialServiceId,
        initialEmployeeId
      )
    );

  const [
    resolvedEmployeeBackendId,
    setResolvedEmployeeBackendId,
  ] = useState<string | null>(null);

  const currentStepIndex =
    stepOrder.indexOf(currentStep);

  const progressSteps = useMemo(
    () => [
      {
        id: "service",
        label:
          translations.booking
            .selectService,
      },
      {
        id: "employee",
        label:
          translations.booking
            .selectEmployee,
      },
      {
        id: "date",
        label:
          translations.booking.selectDate,
      },
      {
        id: "time",
        label:
          translations.booking.selectTime,
      },
      {
        id: "customer",
        label:
          translations.booking.yourInfo,
      },
      {
        id: "summary",
        label:
          translations.booking.summary,
      },
    ],
    []
  );

  const handleSelectService = (
    serviceId: string
  ) => {
    setResolvedEmployeeBackendId(null);

    setDraft((previousDraft) => {
      const nextDraft: BookingDraft = {
        ...previousDraft,
        serviceId,
        date: null,
        time: null,
      };

      if (
        previousDraft.employeePreference &&
        previousDraft.employeePreference !==
          "any"
      ) {
        const employee = employees.find(
          (item) =>
            item.id ===
            previousDraft.employeePreference
        );

        if (
          !employee ||
          !employee.isActive ||
          !employee.serviceIds.includes(
            serviceId
          )
        ) {
          nextDraft.employeePreference =
            null;
        }
      }

      return nextDraft;
    });
  };

  const handleSelectEmployee = (
    preference: "any" | string
  ) => {
    setResolvedEmployeeBackendId(null);

    setDraft((previousDraft) => ({
      ...previousDraft,
      employeePreference: preference,
      date: null,
      time: null,
    }));
  };

  const handleSelectDate = (
    date: string
  ) => {
    setResolvedEmployeeBackendId(null);

    setDraft((previousDraft) => ({
      ...previousDraft,
      date,
      time: null,
    }));
  };

  const handleSelectTime = (
    time: string,
    employeeBackendId: string
  ) => {
    setResolvedEmployeeBackendId(
      employeeBackendId
    );

    setDraft((previousDraft) => ({
      ...previousDraft,
      time,
    }));
  };

  const handleCustomerChange = (
    field: keyof BookingDraft["customer"],
    value: string
  ) => {
    setDraft((previousDraft) => ({
      ...previousDraft,
      customer: {
        ...previousDraft.customer,
        [field]: value,
      },
    }));
  };

  const handleChangeStep = (
    step:
      | "service"
      | "employee"
      | "date"
      | "time"
      | "customer"
  ) => {
    setCurrentStep(step);
  };

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case "service":
        return Boolean(
          draft.serviceId &&
            services.some(
              (service) =>
                service.id ===
                  draft.serviceId &&
                service.isActive
            )
        );

      case "employee": {
        if (
          draft.employeePreference ===
          "any"
        ) {
          return bookingConfig
            .allowAnyEmployee;
        }

        if (
          !draft.employeePreference ||
          !draft.serviceId
        ) {
          return false;
        }

        const employee = employees.find(
          (item) =>
            item.id ===
            draft.employeePreference
        );

        return Boolean(
          employee?.isActive &&
            employee.serviceIds.includes(
              draft.serviceId
            )
        );
      }

      case "date":
        return draft.date !== null;

      case "time":
        return Boolean(
          draft.time &&
            resolvedEmployeeBackendId
        );

      case "customer": {
        const {
          name,
          phone,
          email,
        } = draft.customer;

        if (!name.trim()) {
          return false;
        }

        if (
          bookingConfig.requirePhone &&
          !phone.trim()
        ) {
          return false;
        }

        if (
          bookingConfig.requireEmail &&
          !email.trim()
        ) {
          return false;
        }

        return true;
      }

      case "summary":
        return Boolean(
          draft.serviceId &&
            draft.employeePreference &&
            draft.date &&
            draft.time &&
            resolvedEmployeeBackendId &&
            draft.customer.name.trim() &&
            (!bookingConfig.requirePhone ||
              draft.customer.phone.trim()) &&
            (!bookingConfig.requireEmail ||
              draft.customer.email.trim())
        );

      default:
        return false;
    }
  }, [
    currentStep,
    draft,
    resolvedEmployeeBackendId,
  ]);

  const handleNext = () => {
    if (!canGoNext) {
      return;
    }

    const currentIndex =
      stepOrder.indexOf(currentStep);

    if (
      currentIndex <
      stepOrder.length - 1
    ) {
      setCurrentStep(
        stepOrder[currentIndex + 1]
      );
    }
  };

  const handleBack = () => {
    const currentIndex =
      stepOrder.indexOf(currentStep);

    if (currentIndex > 0) {
      setCurrentStep(
        stepOrder[currentIndex - 1]
      );
    }
  };

  const handleConfirm = () => {
    if (!canGoNext) {
      return;
    }

    /*
     * U Fazi 8.8 ovde šaljemo:
     * - draft
     * - resolvedEmployeeBackendId
     * ka API ruti za kreiranje rezervacije.
     */

    setCurrentStep("success");
  };

  const renderStep = () => {
    switch (currentStep) {
      case "service":
        return (
          <ServiceStep
            locale={locale}
            selectedServiceId={
              draft.serviceId
            }
            onSelectService={
              handleSelectService
            }
          />
        );

      case "employee":
        return (
          <EmployeeStep
            locale={locale}
            selectedServiceId={
              draft.serviceId
            }
            selectedEmployeePreference={
              draft.employeePreference
            }
            onSelectEmployeePreference={
              handleSelectEmployee
            }
          />
        );

      case "date":
        return (
          <DateStep
            locale={locale}
            selectedDate={draft.date}
            onSelectDate={
              handleSelectDate
            }
          />
        );

      case "time":
        return (
          <TimeStep
            locale={locale}
            selectedServiceId={
              draft.serviceId
            }
            selectedDate={draft.date}
            selectedEmployeePreference={
              draft.employeePreference
            }
            selectedTime={draft.time}
            onSelectTime={
              handleSelectTime
            }
          />
        );

      case "customer":
        return (
          <CustomerStep
            locale={locale}
            customer={draft.customer}
            onCustomerChange={
              handleCustomerChange
            }
          />
        );

      case "summary":
        return (
          <BookingSummary
            locale={locale}
            draft={draft}
            onChangeStep={
              handleChangeStep
            }
          />
        );

      case "success":
        return (
          <SuccessStep
            locale={locale}
            draft={draft}
            onDone={onDone}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {currentStep !== "success" && (
        <div className="shrink-0 border-b border-[var(--brand-border)] px-4 py-3 sm:px-6 sm:py-4">
          <BookingProgress
            steps={progressSteps}
            currentStepIndex={
              currentStepIndex
            }
            locale={locale}
          />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-8">
        {renderStep()}
      </div>

      {currentStep !== "success" && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 shadow-[0_-12px_30px_rgba(0,0,0,0.18)] sm:px-6 sm:py-4">
          {currentStepIndex > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 py-2.5 font-medium text-[var(--brand-text)] transition-colors hover:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transition-none sm:px-5"
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden="true"
              />

              {t(
                translations.booking.back,
                locale
              )}
            </button>
          ) : (
            <div />
          )}

          {currentStep === "summary" ? (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canGoNext}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-2.5 font-medium text-[var(--brand-background)] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:px-6"
            >
              {t(
                translations.booking.confirm,
                locale
              )}

              <Check
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-2.5 font-medium text-[var(--brand-background)] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:px-6"
            >
              {t(
                translations.booking.next,
                locale
              )}

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}