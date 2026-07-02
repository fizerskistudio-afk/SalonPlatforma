import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  syncBookingToGoogleCalendar,
} from "@/lib/google-calendar/sync";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

const DEFAULT_BUSINESS_SLUG =
  "lumiere-studio";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DATABASE_ERROR_CODES = [
  "SLOT_UNAVAILABLE",
  "INVALID_BUSINESS",
  "INVALID_SERVICE",
  "INVALID_EMPLOYEE",
  "INVALID_START_TIME",
  "INVALID_CUSTOMER_NAME",
  "CUSTOMER_PHONE_REQUIRED",
  "CUSTOMER_EMAIL_REQUIRED",
  "CUSTOMER_CONTACT_REQUIRED",
  "INVALID_CUSTOMER_PHONE",
  "INVALID_CUSTOMER_EMAIL",
  "CUSTOMER_NOTE_TOO_LONG",
] as const;

type DatabaseErrorCode =
  (typeof DATABASE_ERROR_CODES)[number];

type JsonRecord = Record<
  string,
  unknown
>;

type BookingResult = {
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

type DatabaseErrorPayload = {
  message?: string | null;
  details?: string | null;
  hint?: string | null;
  code?: string | null;
};

function isJsonRecord(
  value: unknown
): value is JsonRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function errorResponse(
  status: number,
  message: string,
  code: string
) {
  return NextResponse.json(
    {
      ok: false,
      message,
      code,
    },
    {
      status,
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
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

function extractDatabaseErrorCode(
  error: DatabaseErrorPayload
): DatabaseErrorCode | null {
  const databaseMessage = [
    error.message,
    error.details,
    error.hint,
  ]
    .filter(
      (
        value
      ): value is string =>
        typeof value ===
        "string"
    )
    .join(" ")
    .toUpperCase();

  for (
    const code of
    DATABASE_ERROR_CODES
  ) {
    if (
      databaseMessage.includes(
        code
      )
    ) {
      return code;
    }
  }

  if (
    error.code ===
    "23P01"
  ) {
    return "SLOT_UNAVAILABLE";
  }

  return null;
}

function databaseErrorResponse(
  code: DatabaseErrorCode
) {
  switch (code) {
    case "SLOT_UNAVAILABLE":
      return errorResponse(
        409,
        "The selected time is no longer available.",
        code
      );

    case "INVALID_BUSINESS":
      return errorResponse(
        404,
        "Active business was not found.",
        code
      );

    case "INVALID_SERVICE":
      return errorResponse(
        400,
        "The selected service is invalid.",
        code
      );

    case "INVALID_EMPLOYEE":
      return errorResponse(
        400,
        "The selected employee is invalid.",
        code
      );

    case "INVALID_START_TIME":
      return errorResponse(
        400,
        "The selected booking time is invalid.",
        code
      );

    case "INVALID_CUSTOMER_NAME":
      return errorResponse(
        400,
        "Customer name is invalid.",
        code
      );

    case "CUSTOMER_PHONE_REQUIRED":
      return errorResponse(
        400,
        "Customer phone is required.",
        code
      );

    case "CUSTOMER_EMAIL_REQUIRED":
      return errorResponse(
        400,
        "Customer email is required.",
        code
      );

    case "CUSTOMER_CONTACT_REQUIRED":
      return errorResponse(
        400,
        "Customer phone or email is required.",
        code
      );

    case "INVALID_CUSTOMER_PHONE":
      return errorResponse(
        400,
        "Customer phone is invalid.",
        code
      );

    case "INVALID_CUSTOMER_EMAIL":
      return errorResponse(
        400,
        "Customer email is invalid.",
        code
      );

    case "CUSTOMER_NOTE_TOO_LONG":
      return errorResponse(
        400,
        "Customer note is too long.",
        code
      );
  }
}

async function synchronizeConfirmedBooking(
  booking: BookingResult
): Promise<void> {
  if (
    booking.status !==
    "confirmed"
  ) {
    return;
  }

  try {
    const syncResult =
      await syncBookingToGoogleCalendar(
        booking.id
      );

    if (!syncResult.ok) {
      console.error(
        "Booking was created, but Google Calendar synchronization failed:",
        {
          bookingId:
            booking.id,

          action:
            syncResult.action,

          message:
            syncResult.message,
        }
      );

      return;
    }

    console.info(
      "Booking synchronized with Google Calendar:",
      {
        bookingId:
          booking.id,

        action:
          syncResult.action,

        eventId:
          syncResult.eventId ??
          null,
      }
    );
  } catch (error) {
    /*
     * Calendar sinhronizacija nikada ne sme
     * da poništi uspešno kreiranu rezervaciju.
     */
    console.error(
      "Unexpected Google Calendar synchronization error:",
      {
        bookingId:
          booking.id,

        error,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    let body: unknown;

    try {
      body =
        await request.json();
    } catch {
      return errorResponse(
        400,
        "Invalid JSON request body.",
        "INVALID_JSON"
      );
    }

    if (
      !isJsonRecord(body)
    ) {
      return errorResponse(
        400,
        "Invalid booking request.",
        "INVALID_REQUEST"
      );
    }

    const businessSlug =
      optionalTrimmedString(
        body.businessSlug
      ) ??
      DEFAULT_BUSINESS_SLUG;

    const serviceId =
      optionalTrimmedString(
        body.serviceId
      );

    const employeeId =
      optionalTrimmedString(
        body.employeeId
      );

    const startsAt =
      optionalTrimmedString(
        body.startsAt
      );

    const customer =
      isJsonRecord(
        body.customer
      )
        ? body.customer
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

    if (
      !SLUG_PATTERN.test(
        businessSlug
      )
    ) {
      return errorResponse(
        400,
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
      return errorResponse(
        400,
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
      return errorResponse(
        400,
        "Invalid employee ID.",
        "INVALID_EMPLOYEE_ID"
      );
    }

    if (
      !startsAt ||
      Number.isNaN(
        Date.parse(startsAt)
      )
    ) {
      return errorResponse(
        400,
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
      return errorResponse(
        400,
        "Invalid customer name.",
        "INVALID_CUSTOMER_NAME"
      );
    }

    if (
      !customerPhone &&
      !customerEmail
    ) {
      return errorResponse(
        400,
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
        ).length < 6
      )
    ) {
      return errorResponse(
        400,
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
      return errorResponse(
        400,
        "Invalid customer email.",
        "INVALID_CUSTOMER_EMAIL"
      );
    }

    if (
      customerNote &&
      customerNote.length >
        2000
    ) {
      return errorResponse(
        400,
        "Customer note is too long.",
        "CUSTOMER_NOTE_TOO_LONG"
      );
    }

    const supabase =
      createAdminClient();

    const {
      data: business,
      error: businessError,
    } =
      await supabase
        .from("businesses")
        .select("id")
        .eq(
          "slug",
          businessSlug
        )
        .eq(
          "is_active",
          true
        )
        .maybeSingle();

    if (businessError) {
      console.error(
        "Failed to load business:",
        businessError
      );

      return errorResponse(
        500,
        "Failed to load business.",
        "BUSINESS_QUERY_FAILED"
      );
    }

    if (!business) {
      return errorResponse(
        404,
        "Active business was not found.",
        "BUSINESS_NOT_FOUND"
      );
    }

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "create_public_booking",
        {
          p_business_id:
            business.id,

          p_service_id:
            serviceId,

          p_employee_id:
            employeeId,

          p_starts_at:
            new Date(
              startsAt
            ).toISOString(),

          p_customer_name:
            customerName,

          p_customer_phone:
            customerPhone,

          p_customer_email:
            customerEmail,

          p_customer_note:
            customerNote,
        }
      );

    if (error) {
      console.error(
        "Failed to create booking:",
        error
      );

      const databaseErrorCode =
        extractDatabaseErrorCode(
          error
        );

      if (
        databaseErrorCode
      ) {
        return databaseErrorResponse(
          databaseErrorCode
        );
      }

      return errorResponse(
        500,
        "Failed to create booking.",
        "BOOKING_CREATE_FAILED"
      );
    }

    if (
      !data ||
      !isJsonRecord(data)
    ) {
      return errorResponse(
        500,
        "Booking was created but no result was returned.",
        "INVALID_BOOKING_RESULT"
      );
    }

    const booking =
      data as BookingResult;

    /*
     * Čekamo rezultat da sinhronizacija pouzdano
     * završi i u serverless okruženju.
     *
     * Greška Calendar-a se hvata unutar funkcije
     * i ne utiče na uspešan booking odgovor.
     */
    await synchronizeConfirmedBooking(
      booking
    );

    return NextResponse.json(
      {
        ok: true,
        booking,
      },
      {
        status: 201,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Unexpected booking error:",
      error
    );

    return errorResponse(
      500,
      "Unexpected booking error.",
      "UNKNOWN_BOOKING_ERROR"
    );
  }
}