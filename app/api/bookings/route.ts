import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_BUSINESS_SLUG =
  "lumiere-studio";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
        "Cache-Control": "no-store",
      },
    }
  );
}

function optionalTrimmedString(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}

export async function POST(
  request: NextRequest
) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        400,
        "Invalid JSON request body.",
        "INVALID_JSON"
      );
    }

    if (!isJsonRecord(body)) {
      return errorResponse(
        400,
        "Invalid booking request.",
        "INVALID_REQUEST"
      );
    }

    const businessSlug =
      optionalTrimmedString(
        body.businessSlug
      ) ?? DEFAULT_BUSINESS_SLUG;

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
      isJsonRecord(body.customer)
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
          )?.toLowerCase() ?? null
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
      !UUID_PATTERN.test(serviceId)
    ) {
      return errorResponse(
        400,
        "Invalid service ID.",
        "INVALID_SERVICE_ID"
      );
    }

    if (
      !employeeId ||
      !UUID_PATTERN.test(employeeId)
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
      customerName.length < 2 ||
      customerName.length > 120
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
        customerPhone.length > 40 ||
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
        customerEmail.length > 254 ||
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
      customerNote.length > 2000
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
    } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", businessSlug)
      .eq("is_active", true)
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
    } = await supabase.rpc(
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
      const databaseMessage = [
        error.message,
        error.details,
        error.hint,
      ]
        .filter(Boolean)
        .join(" ")
        .toUpperCase();

      console.error(
        "Failed to create booking:",
        error
      );

      if (
        databaseMessage.includes(
          "SLOT_UNAVAILABLE"
        ) ||
        error.code === "23P01"
      ) {
        return errorResponse(
          409,
          "The selected time is no longer available.",
          "SLOT_UNAVAILABLE"
        );
      }

      if (
        databaseMessage.includes(
          "INVALID_BUSINESS"
        )
      ) {
        return errorResponse(
          404,
          "Active business was not found.",
          "BUSINESS_NOT_FOUND"
        );
      }

      if (
        databaseMessage.includes(
          "INVALID_"
        ) ||
        databaseMessage.includes(
          "CUSTOMER_"
        )
      ) {
        return errorResponse(
          400,
          "Invalid booking information.",
          "INVALID_BOOKING_DATA"
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

    return NextResponse.json(
      {
        ok: true,
        booking,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
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