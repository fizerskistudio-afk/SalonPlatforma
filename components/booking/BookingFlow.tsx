"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

import type {
  BookingDraft,
  Locale,
} from "@/lib/types";
import {
  employees,
  services,
} from "@/lib/mockData";
import { bookingConfig } from "@/lib/config";
import {
  t,
  translations,
} from "@/lib/translations";

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

type EditableBookingStep = Exclude<
  BookingStep,
  "summary" | "success"
>;

const stepOrder: BookingStep[] = [
  "service",
  "employee",
  "date",
  "time",
  "customer",
  "summary",
  "success",
];

const progressSteps = [
  {
    id: "service",
    label: translations.booking.selectService,
  },
  {
    id: "employee",
    label: translations.booking.selectEmployee,
  },
  {
    id: "date",
    label: translations.booking.selectDate,
  },
  {
    id: "time",
    label: translations.booking.selectTime,
  },
  {
    id: "customer",
    label: translations.booking.yourInfo,
  },
  {
    id: "summary",
    label: translations.booking.summary,
  },
];

function isActiveService(
  serviceId: string | null
): boolean {
  if (!serviceId) {
    return false;
  }

  return services.some(
    (service) =>
      service.id === serviceId &&
      service.isActive
  );
}

function isValidEmployeePreference(
  preference: BookingDraft["employeePreference"],
  serviceId: string | null
): boolean {
  if (!serviceId) {
    return false;
  }

  if (preference === "any") {
    return bookingConfig.allowAnyEmployee;
  }

  if (!preference) {
    return false;
  }

  return employees.some(
    (employee) =>
      employee.id === preference &&
      employee.isActive &&
      employee.serviceIds.includes(serviceId)
  );
}

function isCustomerValid(
  customer: BookingDraft["customer"]
): boolean {
  if (!customer.name.trim()) {
    return false;
  }

  if (
    bookingConfig.requirePhone &&
    !customer.phone.trim()
  ) {
    return false;
  }

  if (
    bookingConfig.requireEmail &&
    !customer.email.trim()
  ) {
    return false;
  }

  return true;
}

function isDraftComplete(
  draft: BookingDraft
): boolean {
  return (
    isActiveService(draft.serviceId) &&
    isValidEmployeePreference(
      draft.employeePreference,
      draft.serviceId
    ) &&
    Boolean(draft.date?.trim()) &&
    Boolean(draft.time?.trim()) &&
    isCustomerValid(draft.customer)
  );
}

function createInitialDraft(
  initialServiceId: string | null,
  initialEmployeeId: string | null
): BookingDraft {
  const initialService = initialServiceId
    ? services.find(
        (service) =>
          service.id === initialServiceId &&
          service.isActive
      )
    : undefined;

  const validServiceId =
    initialService?.id ?? null;

  let employeePreference: BookingDraft["employeePreference"] =
    null;

  if (
    initialEmployeeId === "any" &&
    bookingConfig.allowAnyEmployee
  ) {
    employeePreference = "any";
  } else if (initialEmployeeId) {
    const initialEmployee = employees.find(
      (employee) =>
        employee.id === initialEmployeeId &&
        employee.isActive
    );

    const employeeSupportsService =
      !validServiceId ||
      Boolean(
        initialEmployee?.serviceIds.includes(
          validServiceId
        )
      );

    if (
      initialEmployee &&
      employeeSupportsService
    ) {
      employeePreference =
        initialEmployee.id;
    }
  }

  return {
    serviceId: validServiceId,
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

  const currentStepIndex =
    stepOrder.indexOf(currentStep);

  const handleSelectService = (
    serviceId: string
  ) => {
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
        const selectedEmployee =
          employees.find(
            (employee) =>
              employee.id ===
              previousDraft.employeePreference
          );

        const employeeIsValid =
          Boolean(selectedEmployee?.isActive) &&
          Boolean(
            selectedEmployee?.serviceIds.includes(
              serviceId
            )
          );

        if (!employeeIsValid) {
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
    setDraft((previousDraft) => ({
      ...previousDraft,
      date,
      time: null,
    }));
  };

  const handleSelectTime = (
    time: string
  ) => {
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
    step: EditableBookingStep
  ) => {
    setCurrentStep(step);
  };

  const canGoNext = (() => {
    switch (currentStep) {
      case "service":
        return isActiveService(
          draft.serviceId
        );

      case "employee":
        return isValidEmployeePreference(
          draft.employeePreference,
          draft.serviceId
        );

      case "date":
        return Boolean(draft.date?.trim());

      case "time":
        return Boolean(draft.time?.trim());

      case "customer":
        return isCustomerValid(
          draft.customer
        );

      case "summary":
        return isDraftComplete(draft);

      case "success":
        return false;
    }
  })();

  const handleNext = () => {
    if (!canGoNext) {
      return;
    }

    const nextStep =
      stepOrder[currentStepIndex + 1];

    if (nextStep) {
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    const previousStep =
      stepOrder[currentStepIndex - 1];

    if (previousStep) {
      setCurrentStep(previousStep);
    }
  };

  const handleConfirm = () => {
    if (!isDraftComplete(draft)) {
      return;
    }

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
            onSelectDate={handleSelectDate}
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
            onSelectTime={handleSelectTime}
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
    }
  };

  return (
    <div className="flex h-full flex-col">
      {currentStep !== "success" && (
        <div className="border-b border-[var(--brand-border)] px-6 py-4">
          <BookingProgress
            steps={progressSteps}
            currentStepIndex={
              currentStepIndex
            }
            locale={locale}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-8">
        {renderStep()}
      </div>

      {currentStep !== "success" && (
        <div className="flex items-center justify-between gap-4 border-t border-[var(--brand-border)] px-6 py-4">
          {currentStepIndex > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-border)] px-5 py-2.5 font-medium text-[var(--brand-text)] transition-colors hover:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
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
            <div aria-hidden="true" />
          )}

          {currentStep === "summary" ? (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canGoNext}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 py-2.5 font-medium text-[var(--brand-surface)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
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
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 py-2.5 font-medium text-[var(--brand-surface)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
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