import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  jsonError,
} from "@/lib/api/http";
import {
  createRequestId,
  logServerError,
  logServerEvent,
  withRequestId,
} from "@/lib/monitoring/server";
import {
  consumeRateLimit,
  getClientAddress,
  getRateLimitHeaders,
} from "@/lib/security/rate-limit";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type AvailableSlotRow = {
  employee_id: string;
  employee_name: string;
  starts_at: string;
  ends_at: string;
};

type ErrorResponder =
  typeof jsonError;

function createErrorResponder(
  requestId: string
): ErrorResponder {
  return (
    status,
    message,
    code,
    options = {}
  ) =>
    withRequestId(
      jsonError(
        status,
        message,
        code,
        options
      ),
      requestId
    );
}

function isValidDateString(
  value: string
): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return false;
  }

  const [year, month, day] =
    value
      .split("-")
      .map(Number);

  const parsedDate = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  return (
    parsedDate.getUTCFullYear() ===
      year &&
    parsedDate.getUTCMonth() ===
      month - 1 &&
    parsedDate.getUTCDate() ===
      day
  );
}

export async function GET(
  request: NextRequest
) {
  const requestId =
    createRequestId(
      request.headers
    );
  const errorResponse =
    createErrorResponder(
      requestId
    );

  try {
    const searchParams =
      request.nextUrl.searchParams;

    const businessSlug =
      searchParams
        .get("businessSlug")
        ?.trim() ?? "";

    const serviceId =
      searchParams.get(
        "serviceId"
      );

    const date =
      searchParams.get("date");

    const employeeId =
      searchParams.get(
        "employeeId"
      );

    if (!businessSlug) {
      return errorResponse(
        400,
        "Missing businessSlug.",
        "BUSINESS_SLUG_REQUIRED"
      );
    }

    if (
      !SLUG_PATTERN.test(
        businessSlug
      )
    ) {
      return errorResponse(
        400,
        "Invalid businessSlug.",
        "INVALID_BUSINESS_SLUG"
      );
    }

    if (!serviceId) {
      return errorResponse(
        400,
        "Missing serviceId.",
        "SERVICE_ID_REQUIRED"
      );
    }

    if (
      !UUID_PATTERN.test(
        serviceId
      )
    ) {
      return errorResponse(
        400,
        "Invalid serviceId.",
        "INVALID_SERVICE_ID"
      );
    }

    if (!date) {
      return errorResponse(
        400,
        "Missing date.",
        "DATE_REQUIRED"
      );
    }

    if (
      !isValidDateString(
        date
      )
    ) {
      return errorResponse(
        400,
        "Invalid date. Use YYYY-MM-DD.",
        "INVALID_DATE"
      );
    }

    if (
      employeeId &&
      !UUID_PATTERN.test(
        employeeId
      )
    ) {
      return errorResponse(
        400,
        "Invalid employeeId.",
        "INVALID_EMPLOYEE_ID"
      );
    }

    const availabilityLimit =
      await consumeRateLimit({
        scope:
          "availability-address-tenant",
        parts: [
          getClientAddress(
            request.headers
          ),
          businessSlug,
        ],
        limit: 90,
        windowSeconds: 60,
        failureMode: "open",
        requestId,
      });

    if (
      availabilityLimit.unavailable
    ) {
      logServerEvent(
        "warn",
        "availability.rate_limit.unavailable",
        {
          requestId,
          businessSlug,
          scope:
            "availability-address-tenant",
        }
      );
    }

    if (
      !availabilityLimit.allowed
    ) {
      logServerEvent(
        "warn",
        "availability.rate_limit.blocked",
        {
          requestId,
          businessSlug,
          scope:
            "availability-address-tenant",
        }
      );

      return errorResponse(
        429,
        "Too many availability requests. Please try again shortly.",
        "RATE_LIMITED",
        {
          headers:
            getRateLimitHeaders(
              availabilityLimit
            ),
        }
      );
    }

    const supabase =
      createAdminClient();

    const {
      data: business,
      error: businessError,
    } = await supabase
      .from("businesses")
      .select(
        "id, slug, timezone"
      )
      .eq(
        "slug",
        businessSlug
      )
      .eq(
        "is_active",
        true
      )
      .eq(
        "publication_status",
        "published"
      )
      .maybeSingle();

    if (businessError) {
      logServerError(
        "availability.business_query.failed",
        businessError,
        {
          requestId,
          businessSlug,
        }
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
      "get_available_slots",
      {
        p_business_id:
          business.id,
        p_service_id:
          serviceId,
        p_date: date,
        p_employee_id:
          employeeId ?? null,
      }
    );

    if (error) {
      logServerError(
        "availability.query.failed",
        error,
        {
          requestId,
          businessSlug,
          serviceId,
        }
      );

      return errorResponse(
        500,
        "Failed to calculate available slots.",
        "AVAILABILITY_QUERY_FAILED"
      );
    }

    const rows =
      (data ?? []) as AvailableSlotRow[];

    const slots = rows.map(
      (row) => ({
        employeeId:
          row.employee_id,
        employeeName:
          row.employee_name,
        startsAt:
          row.starts_at,
        endsAt:
          row.ends_at,
      })
    );

    return withRequestId(
      NextResponse.json(
        {
          ok: true,
          business: {
            id: business.id,
            slug: business.slug,
            timezone:
              business.timezone,
          },
          request: {
            serviceId,
            date,
            employeeId:
              employeeId ?? null,
          },
          count:
            slots.length,
          slots,
        },
        {
          headers: {
            "Cache-Control":
              "no-store",
            ...getRateLimitHeaders(
              availabilityLimit
            ),
          },
        }
      ),
      requestId
    );
  } catch (error) {
    logServerError(
      "availability.unexpected",
      error,
      {
        requestId,
      }
    );

    return errorResponse(
      500,
      "Availability is temporarily unavailable.",
      "UNKNOWN_AVAILABILITY_ERROR"
    );
  }
}
