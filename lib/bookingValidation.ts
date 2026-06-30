import type {
  BookingDraft,
} from "@/lib/types";

export type CustomerValidationField =
  keyof BookingDraft["customer"];

export type CustomerValidationCode =
  | "NAME_REQUIRED"
  | "NAME_TOO_SHORT"
  | "NAME_TOO_LONG"
  | "PHONE_REQUIRED"
  | "PHONE_INVALID"
  | "EMAIL_REQUIRED"
  | "EMAIL_INVALID"
  | "CONTACT_REQUIRED"
  | "NOTE_TOO_LONG";

export type CustomerValidationErrors =
  Partial<
    Record<
      CustomerValidationField,
      CustomerValidationCode
    >
  >;

export type CustomerValidationRules = {
  requirePhone: boolean;
  requireEmail: boolean;
  allowNotes: boolean;
};

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateBookingCustomer(
  customer: BookingDraft["customer"],
  rules: CustomerValidationRules
): CustomerValidationErrors {
  const errors: CustomerValidationErrors =
    {};

  const name =
    customer.name.trim();

  const phone =
    customer.phone.trim();

  const email =
    customer.email
      .trim()
      .toLowerCase();

  const note =
    customer.note.trim();

  if (!name) {
    errors.name =
      "NAME_REQUIRED";
  } else if (name.length < 2) {
    errors.name =
      "NAME_TOO_SHORT";
  } else if (name.length > 120) {
    errors.name =
      "NAME_TOO_LONG";
  }

  if (
    rules.requirePhone &&
    !phone
  ) {
    errors.phone =
      "PHONE_REQUIRED";
  }

  if (phone) {
    const phoneDigits =
      phone.replace(/\D/g, "");

    if (
      phone.length > 40 ||
      phoneDigits.length < 6
    ) {
      errors.phone =
        "PHONE_INVALID";
    }
  }

  if (
    rules.requireEmail &&
    !email
  ) {
    errors.email =
      "EMAIL_REQUIRED";
  }

  if (
    email &&
    (
      email.length > 254 ||
      !EMAIL_PATTERN.test(email)
    )
  ) {
    errors.email =
      "EMAIL_INVALID";
  }

  if (
    !phone &&
    !email &&
    !rules.requirePhone &&
    !rules.requireEmail
  ) {
    errors.phone =
      "CONTACT_REQUIRED";
  }

  if (
    rules.allowNotes &&
    note.length > 2000
  ) {
    errors.note =
      "NOTE_TOO_LONG";
  }

  return errors;
}

export function isBookingCustomerValid(
  customer: BookingDraft["customer"],
  rules: CustomerValidationRules
): boolean {
  return (
    Object.keys(
      validateBookingCustomer(
        customer,
        rules
      )
    ).length === 0
  );
}