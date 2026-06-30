"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  Mail,
  Phone as PhoneIcon,
  StickyNote,
  User,
} from "lucide-react";

import {
  type CustomerValidationCode,
  type CustomerValidationField,
  validateBookingCustomer,
} from "@/lib/bookingValidation";
import { useCatalogData } from "@/lib/catalogContext";
import {
  t,
  translations,
} from "@/lib/translations";
import type {
  BookingDraft,
  Locale,
} from "@/lib/types";

import SectionHeader from "../shared/SectionHeader";

type CustomerField =
  keyof BookingDraft["customer"];

type CustomerStepProps = {
  locale: Locale;
  customer: BookingDraft["customer"];

  onCustomerChange: (
    field: CustomerField,
    value: string
  ) => void;
};

type LocalizedMessage = Record<
  Locale,
  string
>;

type TouchedFields = Partial<
  Record<
    CustomerValidationField,
    boolean
  >
>;

const validationMessages: Record<
  CustomerValidationCode,
  LocalizedMessage
> = {
  NAME_REQUIRED: {
    mk: "Внесете име и презиме.",
    sq: "Shkruani emrin dhe mbiemrin.",
    en: "Enter your full name.",
  },

  NAME_TOO_SHORT: {
    mk: "Името мора да има најмалку 2 знаци.",
    sq: "Emri duhet të ketë të paktën 2 karaktere.",
    en: "The name must contain at least 2 characters.",
  },

  NAME_TOO_LONG: {
    mk: "Името може да има најмногу 120 знаци.",
    sq: "Emri mund të ketë maksimumi 120 karaktere.",
    en: "The name can contain at most 120 characters.",
  },

  PHONE_REQUIRED: {
    mk: "Телефонскиот број е задолжителен.",
    sq: "Numri i telefonit është i detyrueshëm.",
    en: "A phone number is required.",
  },

  PHONE_INVALID: {
    mk: "Внесете валиден телефонски број со најмалку 6 цифри.",
    sq: "Shkruani një numër telefoni të vlefshëm me të paktën 6 shifra.",
    en: "Enter a valid phone number containing at least 6 digits.",
  },

  EMAIL_REQUIRED: {
    mk: "Електронската адреса е задолжителна.",
    sq: "Adresa e emailit është e detyrueshme.",
    en: "An email address is required.",
  },

  EMAIL_INVALID: {
    mk: "Внесете валидна електронска адреса.",
    sq: "Shkruani një adresë emaili të vlefshme.",
    en: "Enter a valid email address.",
  },

  CONTACT_REQUIRED: {
    mk: "Внесете телефонски број или електронска адреса.",
    sq: "Shkruani një numër telefoni ose adresë emaili.",
    en: "Enter a phone number or email address.",
  },

  NOTE_TOO_LONG: {
    mk: "Забелешката може да има најмногу 2000 знаци.",
    sq: "Shënimi mund të ketë maksimumi 2000 karaktere.",
    en: "The note can contain at most 2,000 characters.",
  },
};

const optionalLabels: LocalizedMessage =
  {
    mk: "Опционално",
    sq: "Opsionale",
    en: "Optional",
  };

function getFieldClassName(
  hasError: boolean
): string {
  return `w-full rounded-2xl border bg-[var(--brand-surface)] text-[var(--brand-text)] transition-colors placeholder:text-[var(--brand-muted)] focus:outline-none focus:ring-2 motion-reduce:transition-none ${
    hasError
      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
      : "border-[var(--brand-border)] focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20"
  }`;
}

function FieldError({
  id,
  message,
}: {
  id: string;
  message: string;
}) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-red-300"
    >
      <AlertCircle
        className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
        aria-hidden="true"
      />

      <span>{message}</span>
    </p>
  );
}

export default function CustomerStep({
  locale,
  customer,
  onCustomerChange,
}: CustomerStepProps) {
  const {
    booking,
  } = useCatalogData();

  const {
    requirePhone,
    requireEmail,
    allowNotes,
  } = booking;

  const [
    touchedFields,
    setTouchedFields,
  ] =
    useState<TouchedFields>({});

  const validationErrors =
    useMemo(
      () =>
        validateBookingCustomer(
          customer,
          {
            requirePhone,
            requireEmail,
            allowNotes,
          }
        ),
      [
        allowNotes,
        customer,
        requireEmail,
        requirePhone,
      ]
    );

  const markFieldTouched = (
    field: CustomerValidationField
  ) => {
    setTouchedFields(
      (current) => ({
        ...current,
        [field]: true,
      })
    );
  };

  const getVisibleError = (
    field: CustomerValidationField
  ): string | null => {
    if (!touchedFields[field]) {
      return null;
    }

    const code =
      validationErrors[field];

    if (!code) {
      return null;
    }

    return validationMessages[code][
      locale
    ];
  };

  const nameError =
    getVisibleError("name");

  const phoneError =
    getVisibleError("phone");

  const emailError =
    getVisibleError("email");

  const noteError =
    getVisibleError("note");

  return (
    <div className="space-y-6">
      <SectionHeader
        title={
          translations.booking.yourInfo
        }
        subtitle={
          translations.booking
            .yourInfoDescription
        }
        locale={locale}
        align="left"
      />

      <div className="space-y-5">
        <div>
          <label
            htmlFor="customer-name"
            className="mb-2 block text-sm font-medium text-[var(--brand-text)]"
          >
            {t(
              translations.booking
                .fullName,
              locale
            )}

            <span
              className="ml-1 text-[var(--brand-primary)]"
              aria-hidden="true"
            >
              *
            </span>
          </label>

          <div className="relative">
            <User
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-muted)]"
              aria-hidden="true"
            />

            <input
              id="customer-name"
              type="text"
              value={customer.name}
              onChange={(event) =>
                onCustomerChange(
                  "name",
                  event.target.value
                )
              }
              onBlur={() =>
                markFieldTouched(
                  "name"
                )
              }
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
              aria-required="true"
              aria-invalid={
                Boolean(nameError)
              }
              aria-describedby={
                nameError
                  ? "customer-name-error"
                  : undefined
              }
              placeholder={t(
                translations.customer
                  .namePlaceholder,
                locale
              )}
              className={`${getFieldClassName(
                Boolean(nameError)
              )} py-3.5 pl-11 pr-4`}
            />
          </div>

          {nameError && (
            <FieldError
              id="customer-name-error"
              message={nameError}
            />
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="customer-phone"
              className="text-sm font-medium text-[var(--brand-text)]"
            >
              {t(
                translations.booking
                  .phone,
                locale
              )}

              {requirePhone && (
                <span
                  className="ml-1 text-[var(--brand-primary)]"
                  aria-hidden="true"
                >
                  *
                </span>
              )}
            </label>

            {!requirePhone && (
              <span className="text-xs text-[var(--brand-muted)]">
                {
                  optionalLabels[
                    locale
                  ]
                }
              </span>
            )}
          </div>

          <div className="relative">
            <PhoneIcon
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-muted)]"
              aria-hidden="true"
            />

            <input
              id="customer-phone"
              type="tel"
              inputMode="tel"
              value={customer.phone}
              onChange={(event) =>
                onCustomerChange(
                  "phone",
                  event.target.value
                )
              }
              onBlur={() =>
                markFieldTouched(
                  "phone"
                )
              }
              autoComplete="tel"
              required={requirePhone}
              maxLength={40}
              aria-required={
                requirePhone
              }
              aria-invalid={
                Boolean(phoneError)
              }
              aria-describedby={
                phoneError
                  ? "customer-phone-error"
                  : undefined
              }
              placeholder={t(
                translations.customer
                  .phonePlaceholder,
                locale
              )}
              className={`${getFieldClassName(
                Boolean(phoneError)
              )} py-3.5 pl-11 pr-4`}
            />
          </div>

          {phoneError && (
            <FieldError
              id="customer-phone-error"
              message={phoneError}
            />
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="customer-email"
              className="text-sm font-medium text-[var(--brand-text)]"
            >
              {t(
                translations.booking
                  .email,
                locale
              )}

              {requireEmail && (
                <span
                  className="ml-1 text-[var(--brand-primary)]"
                  aria-hidden="true"
                >
                  *
                </span>
              )}
            </label>

            {!requireEmail && (
              <span className="text-xs text-[var(--brand-muted)]">
                {
                  optionalLabels[
                    locale
                  ]
                }
              </span>
            )}
          </div>

          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-muted)]"
              aria-hidden="true"
            />

            <input
              id="customer-email"
              type="email"
              inputMode="email"
              value={customer.email}
              onChange={(event) =>
                onCustomerChange(
                  "email",
                  event.target.value
                )
              }
              onBlur={() =>
                markFieldTouched(
                  "email"
                )
              }
              autoComplete="email"
              required={requireEmail}
              maxLength={254}
              aria-required={
                requireEmail
              }
              aria-invalid={
                Boolean(emailError)
              }
              aria-describedby={
                emailError
                  ? "customer-email-error"
                  : undefined
              }
              placeholder={t(
                translations.customer
                  .emailPlaceholder,
                locale
              )}
              className={`${getFieldClassName(
                Boolean(emailError)
              )} py-3.5 pl-11 pr-4`}
            />
          </div>

          {emailError && (
            <FieldError
              id="customer-email-error"
              message={emailError}
            />
          )}
        </div>

        {allowNotes && (
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="customer-note"
                className="text-sm font-medium text-[var(--brand-text)]"
              >
                {t(
                  translations.booking
                    .note,
                  locale
                )}
              </label>

              <span className="text-xs text-[var(--brand-muted)]">
                {
                  customer.note.length
                }
                /2000
              </span>
            </div>

            <div className="relative">
              <StickyNote
                className="absolute left-4 top-4 h-4 w-4 text-[var(--brand-muted)]"
                aria-hidden="true"
              />

              <textarea
                id="customer-note"
                value={customer.note}
                onChange={(event) =>
                  onCustomerChange(
                    "note",
                    event.target.value
                  )
                }
                onBlur={() =>
                  markFieldTouched(
                    "note"
                  )
                }
                rows={3}
                maxLength={2000}
                aria-invalid={
                  Boolean(noteError)
                }
                aria-describedby={
                  noteError
                    ? "customer-note-error"
                    : undefined
                }
                placeholder={t(
                  translations.customer
                    .notePlaceholder,
                  locale
                )}
                className={`${getFieldClassName(
                  Boolean(noteError)
                )} resize-none py-3 pl-11 pr-4`}
              />
            </div>

            {noteError && (
              <FieldError
                id="customer-note-error"
                message={noteError}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}