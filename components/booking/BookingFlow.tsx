"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LoaderCircle,
} from "lucide-react";

import {
  isBookingCustomerValid,
} from "@/lib/bookingValidation";
import { useCatalogData } from "@/lib/catalogContext";
import {
  t,
  translations,
} from "@/lib/translations";
import type {
  BookingDraft,
  Employee,
  Locale,
  Service,
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

type SubmitStatus =
  | "idle"
  | "submitting";

type CreatedBooking = {
  id: string;
  referenceCode: string;
  status: string;
  businessId: string;
  serviceId: string;
  employeeId: string;
  customerId: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  priceAmount: number;
  currency: string;
};

type CreateBookingSuccessResponse = {
  ok: true;
  booking: CreatedBooking;
};

type CreateBookingErrorResponse = {
  ok: false;
  message: string;
  code: string;
};

type CreateBookingResponse =
  | CreateBookingSuccessResponse
  | CreateBookingErrorResponse;

type LocalizedErrorMessage = Record<
  Locale,
  string
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

const unavailableMessages: LocalizedErrorMessage =
  {
    mk: "Терминот штотуку беше резервиран. Изберете друг слободен термин.",
    sq: "Ky orar sapo u rezervua. Zgjidhni një orar tjetër të lirë.",
    en: "That time was just booked. Please choose another available time.",
  };

const genericErrorMessages: LocalizedErrorMessage =
  {
    mk: "Резервацијата не можеше да се зачува. Обидете се повторно.",
    sq: "Rezervimi nuk mund të ruhej. Ju lutemi provoni përsëri.",
    en: "The booking could not be saved. Please try again.",
  };

const submittingMessages: LocalizedErrorMessage =
  {
    mk: "Се резервира...",
    sq: "Duke rezervuar...",
    en: "Booking...",
  };

const bookingErrorMessages: Record<
  string,
  LocalizedErrorMessage
> = {
  INVALID_CUSTOMER_NAME: {
    mk: "Внесете име и презиме со најмалку 2 знаци.",
    sq: "Shkruani emrin dhe mbiemrin me të paktën 2 karaktere.",
    en: "Enter a name with at least 2 characters.",
  },

  CUSTOMER_PHONE_REQUIRED: {
    mk: "Телефонскиот број е задолжителен.",
    sq: "Numri i telefonit është i detyrueshëm.",
    en: "A phone number is required.",
  },

  CUSTOMER_EMAIL_REQUIRED: {
    mk: "Електронската адреса е задолжителна.",
    sq: "Adresa e emailit është e detyrueshme.",
    en: "An email address is required.",
  },

  CUSTOMER_CONTACT_REQUIRED: {
    mk: "Внесете телефонски број или електронска адреса.",
    sq: "Shkruani një numër telefoni ose adresë emaili.",
    en: "Enter a phone number or email address.",
  },

  INVALID_CUSTOMER_PHONE: {
    mk: "Телефонскиот број не е валиден. Внесете најмалку 6 цифри.",
    sq: "Numri i telefonit nuk është i vlefshëm. Shkruani të paktën 6 shifra.",
    en: "The phone number is invalid. Enter at least 6 digits.",
  },

  INVALID_CUSTOMER_EMAIL: {
    mk: "Електронската адреса не е валидна.",
    sq: "Adresa e emailit nuk është e vlefshme.",
    en: "The email address is invalid.",
  },

  CUSTOMER_NOTE_TOO_LONG: {
    mk: "Забелешката е предолга. Максимумот е 2000 знаци.",
    sq: "Shënimi është shumë i gjatë. Maksimumi është 2000 karaktere.",
    en: "The note is too long. The maximum is 2,000 characters.",
  },

  INVALID_SERVICE_ID: {
    mk: "Избраната услуга повеќе не е достапна. Изберете друга услуга.",
    sq: "Shërbimi i zgjedhur nuk është më i disponueshëm. Zgjidhni një shërbim tjetër.",
    en: "The selected service is no longer available. Choose another service.",
  },

  INVALID_SERVICE: {
    mk: "Избраната услуга повеќе не е достапна. Изберете друга услуга.",
    sq: "Shërbimi i zgjedhur nuk është më i disponueshëm. Zgjidhni një shërbim tjetër.",
    en: "The selected service is no longer available. Choose another service.",
  },

  INVALID_EMPLOYEE_ID: {
    mk: "Избраниот вработен повеќе не е достапен. Изберете друг вработен.",
    sq: "Punonjësi i zgjedhur nuk është më i disponueshëm. Zgjidhni një punonjës tjetër.",
    en: "The selected employee is no longer available. Choose another employee.",
  },

  INVALID_EMPLOYEE: {
    mk: "Избраниот вработен повеќе не е достапен. Изберете друг вработен.",
    sq: "Punonjësi i zgjedhur nuk është më i disponueshëm. Zgjidhni një punonjës tjetër.",
    en: "The selected employee is no longer available. Choose another employee.",
  },

  INVALID_START_TIME: {
    mk: "Избраниот термин не е валиден. Изберете друг термин.",
    sq: "Orari i zgjedhur nuk është i vlefshëm. Zgjidhni një orar tjetër.",
    en: "The selected time is invalid. Choose another time.",
  },

  BUSINESS_NOT_FOUND: {
    mk: "Салонот моментално не е достапен за онлајн резервации.",
    sq: "Salloni aktualisht nuk është i disponueshëm për rezervime online.",
    en: "The salon is currently unavailable for online bookings.",
  },

  INVALID_BUSINESS: {
    mk: "Салонот моментално не е достапен за онлајн резервации.",
    sq: "Salloni aktualisht nuk është i disponueshëm për rezervime online.",
    en: "The salon is currently unavailable for online bookings.",
  },
};

const customerErrorCodes =
  new Set([
    "INVALID_CUSTOMER_NAME",
    "CUSTOMER_PHONE_REQUIRED",
    "CUSTOMER_EMAIL_REQUIRED",
    "CUSTOMER_CONTACT_REQUIRED",
    "INVALID_CUSTOMER_PHONE",
    "INVALID_CUSTOMER_EMAIL",
    "CUSTOMER_NOTE_TOO_LONG",
  ]);

const serviceErrorCodes =
  new Set([
    "INVALID_SERVICE_ID",
    "INVALID_SERVICE",
  ]);

const employeeErrorCodes =
  new Set([
    "INVALID_EMPLOYEE_ID",
    "INVALID_EMPLOYEE",
  ]);

function getBookingErrorMessage(
  code: string,
  locale: Locale
): string {
  return (
    bookingErrorMessages[code]?.[
      locale
    ] ??
    genericErrorMessages[locale]
  );
}

function createInitialDraft(
  initialServiceId:
    | string
    | null,
  initialEmployeeId:
    | string
    | null,
  services: Service[],
  employees: Employee[]
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
  const {
    business,
    booking,
    services,
    employees,
  } = useCatalogData();

  const [
    currentStep,
    setCurrentStep,
  ] =
    useState<BookingStep>(
      "service"
    );

  const [
    draft,
    setDraft,
  ] =
    useState<BookingDraft>(() =>
      createInitialDraft(
        initialServiceId,
        initialEmployeeId,
        services,
        employees
      )
    );

  const [
    resolvedEmployeeId,
    setResolvedEmployeeId,
  ] =
    useState<string | null>(
      null
    );

  const [
    selectedStartsAt,
    setSelectedStartsAt,
  ] =
    useState<string | null>(
      null
    );

  const [
    createdBooking,
    setCreatedBooking,
  ] =
    useState<CreatedBooking | null>(
      null
    );

  const [
    submitStatus,
    setSubmitStatus,
  ] =
    useState<SubmitStatus>(
      "idle"
    );

  const [
    submitError,
    setSubmitError,
  ] =
    useState<string | null>(
      null
    );

  const customerIsValid =
    useMemo(
      () =>
        isBookingCustomerValid(
          draft.customer,
          {
            requirePhone:
              booking.requirePhone,

            requireEmail:
              booking.requireEmail,

            allowNotes:
              booking.allowNotes,
          }
        ),
      [
        booking.allowNotes,
        booking.requireEmail,
        booking.requirePhone,
        draft.customer,
      ]
    );

  const currentStepIndex =
    stepOrder.indexOf(
      currentStep
    );

  const progressSteps =
    useMemo(
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
            translations.booking
              .selectDate,
        },
        {
          id: "time",
          label:
            translations.booking
              .selectTime,
        },
        {
          id: "customer",
          label:
            translations.booking
              .yourInfo,
        },
        {
          id: "summary",
          label:
            translations.booking
              .summary,
        },
      ],
      []
    );

  const resetResolvedTime =
    () => {
      setResolvedEmployeeId(
        null
      );

      setSelectedStartsAt(
        null
      );

      setCreatedBooking(null);
      setSubmitError(null);
    };

  const handleSelectService = (
    serviceId: string
  ) => {
    resetResolvedTime();

    setDraft(
      (previousDraft) => {
        const nextDraft: BookingDraft =
          {
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
          const employee =
            employees.find(
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
      }
    );
  };

  const handleSelectEmployee = (
    preference:
      | "any"
      | string
  ) => {
    resetResolvedTime();

    setDraft(
      (previousDraft) => ({
        ...previousDraft,
        employeePreference:
          preference,
        date: null,
        time: null,
      })
    );
  };

  const handleSelectDate = (
    date: string
  ) => {
    resetResolvedTime();

    setDraft(
      (previousDraft) => ({
        ...previousDraft,
        date,
        time: null,
      })
    );
  };

  const handleSelectTime = (
    time: string,
    employeeId: string,
    startsAt: string
  ) => {
    setSubmitError(null);
    setCreatedBooking(null);

    setResolvedEmployeeId(
      employeeId
    );

    setSelectedStartsAt(
      startsAt
    );

    setDraft(
      (previousDraft) => ({
        ...previousDraft,
        time,
      })
    );
  };

  const handleCustomerChange = (
    field:
      keyof BookingDraft["customer"],
    value: string
  ) => {
    setSubmitError(null);

    setDraft(
      (previousDraft) => ({
        ...previousDraft,

        customer: {
          ...previousDraft.customer,
          [field]: value,
        },
      })
    );
  };

  const handleChangeStep = (
    step:
      | "service"
      | "employee"
      | "date"
      | "time"
      | "customer"
  ) => {
    setSubmitError(null);
    setCurrentStep(step);
  };

  const canGoNext =
    useMemo(() => {
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
            return booking
              .allowAnyEmployee;
          }

          if (
            !draft.employeePreference ||
            !draft.serviceId
          ) {
            return false;
          }

          const employee =
            employees.find(
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
          return (
            draft.date !== null
          );

        case "time":
          return Boolean(
            draft.time &&
              selectedStartsAt &&
              resolvedEmployeeId
          );

        case "customer":
          return customerIsValid;

        case "summary":
          return Boolean(
            draft.serviceId &&
              draft.employeePreference &&
              draft.date &&
              draft.time &&
              selectedStartsAt &&
              resolvedEmployeeId &&
              customerIsValid
          );

        default:
          return false;
      }
    }, [
      booking.allowAnyEmployee,
      currentStep,
      customerIsValid,
      draft.date,
      draft.employeePreference,
      draft.serviceId,
      draft.time,
      employees,
      resolvedEmployeeId,
      selectedStartsAt,
      services,
    ]);

  const handleNext = () => {
    if (!canGoNext) {
      return;
    }

    setSubmitError(null);

    const currentIndex =
      stepOrder.indexOf(
        currentStep
      );

    if (
      currentIndex <
      stepOrder.length - 1
    ) {
      setCurrentStep(
        stepOrder[
          currentIndex + 1
        ]
      );
    }
  };

  const handleBack = () => {
    setSubmitError(null);

    const currentIndex =
      stepOrder.indexOf(
        currentStep
      );

    if (currentIndex > 0) {
      setCurrentStep(
        stepOrder[
          currentIndex - 1
        ]
      );
    }
  };

  const handleConfirm =
    async () => {
      if (
        !canGoNext ||
        submitStatus ===
          "submitting"
      ) {
        return;
      }

      if (
        !draft.serviceId ||
        !resolvedEmployeeId ||
        !selectedStartsAt
      ) {
        setSubmitError(
          genericErrorMessages[
            locale
          ]
        );

        return;
      }

      setSubmitStatus(
        "submitting"
      );

      setSubmitError(null);

      try {
        const response =
          await fetch(
            "/api/bookings",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              cache: "no-store",

              body: JSON.stringify(
                {
                  businessSlug:
                    business.slug,

                  serviceId:
                    draft.serviceId,

                  employeeId:
                    resolvedEmployeeId,

                  startsAt:
                    selectedStartsAt,

                  customer: {
                    name:
                      draft.customer
                        .name,

                    phone:
                      draft.customer
                        .phone,

                    email:
                      draft.customer
                        .email,

                    note:
                      booking.allowNotes
                        ? draft.customer
                            .note
                        : "",
                  },
                }
              ),
            }
          );

        const payload =
          (await response.json()) as CreateBookingResponse;

        if (
          !response.ok ||
          !payload.ok
        ) {
          const errorCode =
            payload.ok
              ? "UNKNOWN"
              : payload.code;

          if (
            response.status ===
              409 ||
            errorCode ===
              "SLOT_UNAVAILABLE"
          ) {
            setResolvedEmployeeId(
              null
            );

            setSelectedStartsAt(
              null
            );

            setDraft(
              (
                previousDraft
              ) => ({
                ...previousDraft,
                time: null,
              })
            );

            setSubmitError(
              unavailableMessages[
                locale
              ]
            );

            setCurrentStep(
              "time"
            );

            return;
          }

          if (
            customerErrorCodes.has(
              errorCode
            )
          ) {
            setSubmitError(
              getBookingErrorMessage(
                errorCode,
                locale
              )
            );

            setCurrentStep(
              "customer"
            );

            return;
          }

          if (
            serviceErrorCodes.has(
              errorCode
            )
          ) {
            setDraft(
              (
                previousDraft
              ) => ({
                ...previousDraft,
                serviceId: null,
                employeePreference:
                  null,
                date: null,
                time: null,
              })
            );

            resetResolvedTime();

            setSubmitError(
              getBookingErrorMessage(
                errorCode,
                locale
              )
            );

            setCurrentStep(
              "service"
            );

            return;
          }

          if (
            employeeErrorCodes.has(
              errorCode
            )
          ) {
            setDraft(
              (
                previousDraft
              ) => ({
                ...previousDraft,
                employeePreference:
                  null,
                date: null,
                time: null,
              })
            );

            resetResolvedTime();

            setSubmitError(
              getBookingErrorMessage(
                errorCode,
                locale
              )
            );

            setCurrentStep(
              "employee"
            );

            return;
          }

          if (
            errorCode ===
            "INVALID_START_TIME"
          ) {
            setResolvedEmployeeId(
              null
            );

            setSelectedStartsAt(
              null
            );

            setDraft(
              (
                previousDraft
              ) => ({
                ...previousDraft,
                time: null,
              })
            );

            setSubmitError(
              getBookingErrorMessage(
                errorCode,
                locale
              )
            );

            setCurrentStep(
              "time"
            );

            return;
          }

          setSubmitError(
            getBookingErrorMessage(
              errorCode,
              locale
            )
          );

          return;
        }

        setCreatedBooking(
          payload.booking
        );

        setCurrentStep(
          "success"
        );
      } catch (error) {
        console.error(
          "Failed to create booking:",
          error
        );

        setSubmitError(
          genericErrorMessages[
            locale
          ]
        );
      } finally {
        setSubmitStatus(
          "idle"
        );
      }
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
            selectedDate={
              draft.date
            }
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
            selectedDate={
              draft.date
            }
            selectedEmployeePreference={
              draft.employeePreference
            }
            selectedTime={
              draft.time
            }
            onSelectTime={
              handleSelectTime
            }
          />
        );

      case "customer":
        return (
          <CustomerStep
            locale={locale}
            customer={
              draft.customer
            }
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
            resolvedEmployeeId={
              resolvedEmployeeId
            }
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
            booking={
              createdBooking
            }
            onDone={onDone}
          />
        );

      default:
        return null;
    }
  };

  const isSubmitting =
    submitStatus ===
    "submitting";

  return (
    <div className="flex h-full min-h-0 flex-col">
      {currentStep !==
        "success" && (
        <div className="shrink-0 border-b border-[var(--brand-border)] px-4 py-3 sm:px-6 sm:py-4">
          <BookingProgress
            steps={
              progressSteps
            }
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

      {currentStep !==
        "success" && (
        <div className="shrink-0 border-t border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 shadow-[0_-12px_30px_rgba(0,0,0,0.18)] sm:px-6 sm:py-4">
          {submitError && (
            <p
              role="alert"
              aria-live="assertive"
              className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {submitError}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            {currentStepIndex >
            0 ? (
              <button
                type="button"
                onClick={
                  handleBack
                }
                disabled={
                  isSubmitting
                }
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 py-2.5 font-medium text-[var(--brand-text)] transition-colors hover:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:px-5"
              >
                <ArrowLeft
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                {t(
                  translations.booking
                    .back,
                  locale
                )}
              </button>
            ) : (
              <div />
            )}

            {currentStep ===
            "summary" ? (
              <button
                type="button"
                onClick={
                  handleConfirm
                }
                disabled={
                  !canGoNext ||
                  isSubmitting
                }
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-2.5 font-medium text-[var(--brand-background)] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:px-6"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle
                      className="h-4 w-4 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />

                    {
                      submittingMessages[
                        locale
                      ]
                    }
                  </>
                ) : (
                  <>
                    {t(
                      translations.booking
                        .confirm,
                      locale
                    )}

                    <Check
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={
                  handleNext
                }
                disabled={
                  !canGoNext ||
                  isSubmitting
                }
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-2.5 font-medium text-[var(--brand-background)] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:px-6"
              >
                {t(
                  translations.booking
                    .next,
                  locale
                )}

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}