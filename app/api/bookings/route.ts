import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  consumeRateLimit,
  getClientAddress,
  getRateLimitHeaders,
} from "@/lib/security/rate-limit";
import {
  readJsonBodyWithLimit,
} from "@/lib/security/request-body";
import {
  validatePublicBookingRequest,
} from "@/lib/booking/public-validation";
import {
  syncBookingToAllGoogleCalendars,
} from "@/lib/google-calendar/dual-sync";
import {
  notifyBookingCreatedSafely,
} from "@/lib/notifications/booking";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

const MAX_BOOKING_REQUEST_BYTES =
  16 * 1024;

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
  code: string,
  extraHeaders: Record<
    string,
    string
  > = {}
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
        ...extraHeaders,
      },
    }
  );
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
      await syncBookingToAllGoogleCalendars(
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
    const bodyResult =
      await readJsonBodyWithLimit(
        request,
        MAX_BOOKING_REQUEST_BYTES
      );

    if (!bodyResult.ok) {
      return errorResponse(
        bodyResult.status,
        bodyResult.message,
        bodyResult.code
      );
    }

    const validationResult =
      validatePublicBookingRequest(
        bodyResult.value
      );

    if (
      !validationResult.ok
    ) {
      return errorResponse(
        validationResult
          .error.status,
        validationResult
          .error.message,
        validationResult
          .error.code
      );
    }

    const {
      businessSlug,
      serviceId,
      employeeId,
      startsAt,
      customerName,
      customerPhone,
      customerEmail,
      customerNote,
    } =
      validationResult.value;

    const clientAddress =
      getClientAddress(
        request.headers
      );

    const contactIdentity =
      customerEmail ??
      customerPhone?.replace(
        /\D/g,
        ""
      ) ??
      "missing-contact";

    const [
      addressLimit,
      contactLimit,
    ] = await Promise.all([
      consumeRateLimit({
        scope:
          "booking-address-tenant",
        parts: [
          clientAddress,
          businessSlug,
        ],
        limit: 10,
        windowSeconds: 10 * 60,
        failureMode: "closed",
      }),

      consumeRateLimit({
        scope:
          "booking-contact-tenant",
        parts: [
          businessSlug,
          contactIdentity,
        ],
        limit: 4,
        windowSeconds: 30 * 60,
        failureMode: "closed",
      }),
    ]);

    const blockedLimit =
      !addressLimit.allowed
        ? addressLimit
        : !contactLimit.allowed
          ? contactLimit
          : null;

    if (blockedLimit) {
      if (
        blockedLimit.unavailable
      ) {
        return errorResponse(
          503,
          "Booking protection is temporarily unavailable.",
          "RATE_LIMIT_UNAVAILABLE"
        );
      }

      return errorResponse(
        429,
        "Too many booking attempts. Please try again later.",
        "RATE_LIMITED",
        getRateLimitHeaders(
          blockedLimit
        )
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

    await notifyBookingCreatedSafely(
      booking.id
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
          ...getRateLimitHeaders(
            addressLimit
          ),
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