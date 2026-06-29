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

type AvailableSlotRow = {
  employee_id: string;
  employee_name: string;
  starts_at: string;
  ends_at: string;
};

function isValidDateString(
  value: string
): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  const parsedDate = new Date(
    Date.UTC(year, month - 1, day)
  );

  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() ===
      month - 1 &&
    parsedDate.getUTCDate() === day
  );
}

function validationError(
  message: string
) {
  return NextResponse.json(
    {
      ok: false,
      message,
    },
    {
      status: 400,
    }
  );
}

export async function GET(
  request: NextRequest
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const businessSlug =
      searchParams.get("businessSlug") ??
      DEFAULT_BUSINESS_SLUG;

    const serviceId =
      searchParams.get("serviceId");

    const date = searchParams.get("date");

    const employeeId =
      searchParams.get("employeeId");

    if (
      !SLUG_PATTERN.test(businessSlug)
    ) {
      return validationError(
        "Invalid businessSlug."
      );
    }

    if (!serviceId) {
      return validationError(
        "Missing serviceId."
      );
    }

    if (
      !UUID_PATTERN.test(serviceId)
    ) {
      return validationError(
        "Invalid serviceId."
      );
    }

    if (!date) {
      return validationError(
        "Missing date."
      );
    }

    if (!isValidDateString(date)) {
      return validationError(
        "Invalid date. Use YYYY-MM-DD."
      );
    }

    if (
      employeeId &&
      !UUID_PATTERN.test(employeeId)
    ) {
      return validationError(
        "Invalid employeeId."
      );
    }

    const supabase =
      createAdminClient();

    const {
      data: business,
      error: businessError,
    } = await supabase
      .from("businesses")
      .select("id, slug, timezone")
      .eq("slug", businessSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (businessError) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Failed to load business.",
          error:
            businessError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!business) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Active business was not found.",
        },
        {
          status: 404,
        }
      );
    }

    const {
      data,
      error,
    } = await supabase.rpc(
      "get_available_slots",
      {
        p_business_id: business.id,
        p_service_id: serviceId,
        p_date: date,
        p_employee_id:
          employeeId ?? null,
      }
    );

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Failed to calculate available slots.",
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    const rows =
      (data ?? []) as AvailableSlotRow[];

    const slots = rows.map((row) => ({
      employeeId: row.employee_id,
      employeeName:
        row.employee_name,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
    }));

    return NextResponse.json({
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
      count: slots.length,
      slots,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown availability error.";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      {
        status: 500,
      }
    );
  }
}