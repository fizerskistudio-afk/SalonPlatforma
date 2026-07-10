type JsonRecord = Record<
  string,
  unknown
>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NormalizedPublicBookingRequest = {
  businessSlug: string;
  serviceId: string;
  employeeId: string;
  startsAt: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  customerNote: string | null;
};

export type PublicBookingValidationError = {
  status: 400;
  message: string;
  code:
    | "INVALID_REQUEST"
    | "MISSING_BUSINESS_SLUG"
    | "INVALID_BUSINESS_SLUG"
    | "INVALID_SERVICE_ID"
    | "INVALID_EMPLOYEE_ID"
    | "INVALID_START_TIME"
    | "INVALID_CUSTOMER_NAME"
    | "CUSTOMER_CONTACT_REQUIRED"
    | "INVALID_CUSTOMER_PHONE"
    | "INVALID_CUSTOMER_EMAIL"
    | "CUSTOMER_NOTE_TOO_LONG";
};

export type PublicBookingValidationResult =
  | {
      ok: true;
      value:
        NormalizedPublicBookingRequest;
    }
  | {
      ok: false;
      error:
        PublicBookingValidationError;
    };

function isJsonRecord(
  value: unknown
): value is JsonRecord {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}

function optionalTrimmedString(
  value: unknown
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}

function invalid(
  message: string,
  code:
    PublicBookingValidationError["code"]
): PublicBookingValidationResult {
  return {
    ok: false,
    error: {
      status: 400,
      message,
      code,
    },
  };
}

export function validatePublicBookingRequest(
  input: unknown
): PublicBookingValidationResult {
  if (
    !isJsonRecord(
      input
    )
  ) {
    return invalid(
      "Invalid booking request.",
      "INVALID_REQUEST"
    );
  }

  const businessSlug =
    optionalTrimmedString(
      input.businessSlug
    );

  const serviceId =
    optionalTrimmedString(
      input.serviceId
    );

  const employeeId =
    optionalTrimmedString(
      input.employeeId
    );

  const startsAt =
    optionalTrimmedString(
      input.startsAt
    );

  const customer =
    isJsonRecord(
      input.customer
    )
      ? input.customer
      : null;

  const customerName =
    customer
      ? optionalTrimmedString(
          customer.name
        )
      : null;

  const customerPhone =
    customer
      ? optionalTrimmedString(
          customer.phone
        )
      : null;

  const customerEmail =
    customer
      ? optionalTrimmedString(
          customer.email
        )?.toLowerCase() ??
        null
      : null;

  const customerNote =
    customer
      ? optionalTrimmedString(
          customer.note
        )
      : null;

  if (!businessSlug) {
    return invalid(
      "Business slug is required.",
      "MISSING_BUSINESS_SLUG"
    );
  }

  if (
    !SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    return invalid(
      "Invalid business slug.",
      "INVALID_BUSINESS_SLUG"
    );
  }

  if (
    !serviceId ||
    !UUID_PATTERN.test(
      serviceId
    )
  ) {
    return invalid(
      "Invalid service ID.",
      "INVALID_SERVICE_ID"
    );
  }

  if (
    !employeeId ||
    !UUID_PATTERN.test(
      employeeId
    )
  ) {
    return invalid(
      "Invalid employee ID.",
      "INVALID_EMPLOYEE_ID"
    );
  }

  if (
    !startsAt ||
    Number.isNaN(
      Date.parse(
        startsAt
      )
    )
  ) {
    return invalid(
      "Invalid booking start time.",
      "INVALID_START_TIME"
    );
  }

  if (
    !customerName ||
    customerName.length <
      2 ||
    customerName.length >
      120
  ) {
    return invalid(
      "Invalid customer name.",
      "INVALID_CUSTOMER_NAME"
    );
  }

  if (
    !customerPhone &&
    !customerEmail
  ) {
    return invalid(
      "Phone or email is required.",
      "CUSTOMER_CONTACT_REQUIRED"
    );
  }

  if (
    customerPhone &&
    (
      customerPhone.length >
        40 ||
      customerPhone.replace(
        /\D/g,
        ""
      ).length <
        6
    )
  ) {
    return invalid(
      "Invalid customer phone.",
      "INVALID_CUSTOMER_PHONE"
    );
  }

  if (
    customerEmail &&
    (
      customerEmail.length >
        254 ||
      !EMAIL_PATTERN.test(
        customerEmail
      )
    )
  ) {
    return invalid(
      "Invalid customer email.",
      "INVALID_CUSTOMER_EMAIL"
    );
  }

  if (
    customerNote &&
    customerNote.length >
      2000
  ) {
    return invalid(
      "Customer note is too long.",
      "CUSTOMER_NOTE_TOO_LONG"
    );
  }

  return {
    ok: true,
    value: {
      businessSlug,
      serviceId,
      employeeId,
      startsAt,
      customerName,
      customerPhone,
      customerEmail,
      customerNote,
    },
  };
}
