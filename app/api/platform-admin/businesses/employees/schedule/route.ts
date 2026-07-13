import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  getPlatformAdminAccess,
} from "@/lib/auth/platform-admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const TIME_PATTERN =
  /^(?:[01]\d|2[0-3]):[0-5]\d$/;

type RequestBody = {
  businessSlug?: unknown;
  employeeSlug?: unknown;
  useBusinessHours?: unknown;
  workingHours?: unknown;
};

type WorkingHourInput = {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getString(
  value: unknown
): string | null {
  return typeof value === "string"
    ? value.trim()
    : null;
}

function getInteger(
  value: unknown
): number | null {
  return typeof value === "number" &&
    Number.isInteger(value)
    ? value
    : null;
}

function normalizeTime(
  value: unknown
): string | null {
  const rawValue =
    getString(value);

  if (!rawValue) {
    return null;
  }

  const match =
    /^(\d{2}):(\d{2})/.exec(
      rawValue
    );

  if (!match) {
    return null;
  }

  const normalized =
    `${match[1]}:${match[2]}`;

  return TIME_PATTERN.test(
    normalized
  )
    ? normalized
    : null;
}

function normalizeWorkingHours(
  value: unknown
): WorkingHourInput[] | null {
  if (
    !Array.isArray(value) ||
    value.length !== 7
  ) {
    return null;
  }

  const result:
    WorkingHourInput[] = [];

  const usedDays =
    new Set<number>();

  for (const rawHour of value) {
    if (!isRecord(rawHour)) {
      return null;
    }

    const dayOfWeek =
      getInteger(
        rawHour.dayOfWeek
      );

    if (
      dayOfWeek === null ||
      dayOfWeek < 0 ||
      dayOfWeek > 6 ||
      usedDays.has(dayOfWeek) ||
      typeof rawHour.isClosed !==
        "boolean"
    ) {
      return null;
    }

    usedDays.add(dayOfWeek);

    if (rawHour.isClosed) {
      result.push({
        dayOfWeek,
        isClosed: true,
        openTime: null,
        closeTime: null,
      });

      continue;
    }

    const openTime =
      normalizeTime(
        rawHour.openTime
      );

    const closeTime =
      normalizeTime(
        rawHour.closeTime
      );

    if (
      !openTime ||
      !closeTime ||
      openTime >= closeTime
    ) {
      return null;
    }

    result.push({
      dayOfWeek,
      isClosed: false,
      openTime,
      closeTime,
    });
  }

  return result.sort(
    (first, second) =>
      first.dayOfWeek -
      second.dayOfWeek
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

export async function PUT(
  request: NextRequest
) {
  const access =
    await getPlatformAdminAccess(
      "tenant.schedule.write"
    );

  if (!("context" in access)) {
    if (
      access.status ===
      "unauthenticated"
    ) {
      return errorResponse(
        401,
        "Platform admin sesija nije aktivna.",
        "PLATFORM_ADMIN_UNAUTHENTICATED"
      );
    }

    return errorResponse(
      403,
      "Nemaš dozvolu za izmenu radnog vremena zaposlenog.",
      "PLATFORM_ADMIN_FORBIDDEN"
    );
  }

  let bodyValue: unknown;

  try {
    bodyValue =
      await request.json();
  } catch {
    return errorResponse(
      400,
      "Request body nije validan JSON.",
      "INVALID_JSON"
    );
  }

  if (!isRecord(bodyValue)) {
    return errorResponse(
      400,
      "Request body mora biti JSON objekat.",
      "INVALID_REQUEST_BODY"
    );
  }

  const body =
    bodyValue as RequestBody;

  const businessSlug =
    getString(
      body.businessSlug
    )?.toLowerCase() ?? null;

  const employeeSlug =
    getString(
      body.employeeSlug
    )?.toLowerCase() ?? null;

  if (
    !businessSlug ||
    businessSlug.length > 80 ||
    !SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    return errorResponse(
      400,
      "Slug salona nije ispravan.",
      "INVALID_BUSINESS_SLUG"
    );
  }

  if (
    !employeeSlug ||
    employeeSlug.length > 80 ||
    !SLUG_PATTERN.test(
      employeeSlug
    )
  ) {
    return errorResponse(
      400,
      "Slug zaposlenog nije ispravan.",
      "INVALID_EMPLOYEE_SLUG"
    );
  }

  if (
    typeof body.useBusinessHours !==
    "boolean"
  ) {
    return errorResponse(
      400,
      "Režim radnog vremena nije ispravan.",
      "INVALID_SCHEDULE_MODE"
    );
  }

  const workingHours =
    body.useBusinessHours
      ? []
      : normalizeWorkingHours(
          body.workingHours
        );

  if (
    !body.useBusinessHours &&
    !workingHours
  ) {
    return errorResponse(
      400,
      "Radno vreme mora sadržati svih sedam dana sa ispravnim vremenima.",
      "INVALID_WORKING_HOURS"
    );
  }

  try {
    const supabase =
      createAdminClient();

    const {
      data,
      error,
    } = await supabase.rpc(
      "update_business_employee_schedule",
      {
        input_payload: {
          businessSlug,
          employeeSlug,
          useBusinessHours:
            body.useBusinessHours,
          workingHours:
            workingHours ?? [],
        },
      }
    );

    if (error) {
      console.error(
        "Employee schedule RPC failed:",
        error
      );

      if (
        error.message.includes(
          "BUSINESS_NOT_FOUND"
        )
      ) {
        return errorResponse(
          404,
          "Salon nije pronađen.",
          "BUSINESS_NOT_FOUND"
        );
      }

      if (
        error.message.includes(
          "EMPLOYEE_NOT_FOUND"
        )
      ) {
        return errorResponse(
          404,
          "Zaposleni nije pronađen.",
          "EMPLOYEE_NOT_FOUND"
        );
      }

      if (
        error.code === "PGRST202" ||
        error.message.includes(
          "update_business_employee_schedule"
        )
      ) {
        return errorResponse(
          503,
          "Migracija za radno vreme zaposlenih još nije aktivirana.",
          "EMPLOYEE_SCHEDULE_RPC_NOT_AVAILABLE"
        );
      }

      if (
        error.message.includes(
          "INVALID_"
        )
      ) {
        return errorResponse(
          400,
          "Podaci radnog vremena nisu ispravni.",
          "INVALID_EMPLOYEE_SCHEDULE"
        );
      }

      return errorResponse(
        500,
        "Čuvanje radnog vremena zaposlenog nije uspelo.",
        "EMPLOYEE_SCHEDULE_SAVE_FAILED"
      );
    }

    return NextResponse.json(
      {
        ok: true,
        result: data,
        updatedBy: {
          userId:
            access.context.userId,
          email:
            access.context.email,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Unexpected employee schedule error:",
      error
    );

    return errorResponse(
      500,
      "Došlo je do neočekivane greške pri čuvanju radnog vremena.",
      "UNKNOWN_EMPLOYEE_SCHEDULE_ERROR"
    );
  }
}
