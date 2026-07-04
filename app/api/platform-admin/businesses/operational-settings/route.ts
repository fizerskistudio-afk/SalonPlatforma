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

const DATABASE_TIME_PATTERN =
  /^((?:[01]\d|2[0-3]):[0-5]\d)(?::[0-5]\d(?:\.\d+)?)?$/;

type OperationalSettingsRequestBody = {
  businessSlug?: unknown;
  settings?: unknown;
  workingHours?: unknown;
};

type BookingSettingsInput = {
  slotIntervalMinutes: number;
  bookingWindowDays: number;
  minimumAdvanceMinutes: number;
  allowAnyEmployee: boolean;
  requireEmail: boolean;
  requirePhone: boolean;
  allowNotes: boolean;
  autoConfirm: boolean;
};

type WorkingHourInput = {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
};

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value
    )
  );
}

function getTrimmedString(
  value: unknown
): string | null {
  return typeof value ===
    "string"
    ? value.trim()
    : null;
}

function normalizeTime(
  value: unknown
): string | null {
  const normalizedValue =
    getTrimmedString(
      value
    );

  if (!normalizedValue) {
    return null;
  }

  const match =
    DATABASE_TIME_PATTERN.exec(
      normalizedValue
    );

  return match
    ? match[1]
    : null;
}

function getInteger(
  value: unknown
): number | null {
  return typeof value ===
      "number" &&
    Number.isInteger(
      value
    )
    ? value
    : null;
}

function normalizeSettings(
  value: unknown
): BookingSettingsInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const slotIntervalMinutes =
    getInteger(
      value.slotIntervalMinutes
    );

  const bookingWindowDays =
    getInteger(
      value.bookingWindowDays
    );

  const minimumAdvanceMinutes =
    getInteger(
      value.minimumAdvanceMinutes
    );

  if (
    slotIntervalMinutes ===
      null ||
    slotIntervalMinutes < 5 ||
    slotIntervalMinutes > 240 ||
    bookingWindowDays ===
      null ||
    bookingWindowDays < 1 ||
    bookingWindowDays > 365 ||
    minimumAdvanceMinutes ===
      null ||
    minimumAdvanceMinutes < 0 ||
    minimumAdvanceMinutes > 10080 ||
    typeof value.allowAnyEmployee !==
      "boolean" ||
    typeof value.requireEmail !==
      "boolean" ||
    typeof value.requirePhone !==
      "boolean" ||
    typeof value.allowNotes !==
      "boolean" ||
    typeof value.autoConfirm !==
      "boolean"
  ) {
    return null;
  }

  return {
    slotIntervalMinutes,
    bookingWindowDays,
    minimumAdvanceMinutes,
    allowAnyEmployee:
      value.allowAnyEmployee,
    requireEmail:
      value.requireEmail,
    requirePhone:
      value.requirePhone,
    allowNotes:
      value.allowNotes,
    autoConfirm:
      value.autoConfirm,
  };
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

  for (
    const rawHour of value
  ) {
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
      usedDays.has(
        dayOfWeek
      ) ||
      typeof rawHour.isClosed !==
        "boolean"
    ) {
      return null;
    }

    usedDays.add(
      dayOfWeek
    );

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
      !TIME_PATTERN.test(
        openTime
      ) ||
      !TIME_PATTERN.test(
        closeTime
      ) ||
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
    (
      firstHour,
      secondHour
    ) =>
      firstHour.dayOfWeek -
      secondHour.dayOfWeek
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
    await getPlatformAdminAccess();

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
      "Nemaš dozvolu za izmenu booking podešavanja.",
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
    bodyValue as
      OperationalSettingsRequestBody;

  const businessSlug =
    getTrimmedString(
      body.businessSlug
    )?.toLowerCase() ??
    null;

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

  const settings =
    normalizeSettings(
      body.settings
    );

  if (!settings) {
    return errorResponse(
      400,
      "Booking pravila nisu ispravna.",
      "INVALID_BOOKING_SETTINGS"
    );
  }

  const workingHours =
    normalizeWorkingHours(
      body.workingHours
    );

  if (!workingHours) {
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
      "update_business_operational_settings",
      {
        input_payload: {
          businessSlug,
          settings,
          workingHours,
        },
      }
    );

    if (error) {
      console.error(
        "Operational settings RPC failed:",
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
        error.code ===
          "PGRST202" ||
        error.message.includes(
          "update_business_operational_settings"
        )
      ) {
        return errorResponse(
          503,
          "Migracija za operativna podešavanja još nije aktivirana.",
          "OPERATIONAL_SETTINGS_RPC_NOT_AVAILABLE"
        );
      }

      if (
        error.message.includes(
          "INVALID_"
        )
      ) {
        return errorResponse(
          400,
          "Booking pravila ili radno vreme nisu ispravni.",
          "INVALID_OPERATIONAL_SETTINGS"
        );
      }

      return errorResponse(
        500,
        "Operativna podešavanja nisu mogla da se sačuvaju.",
        "OPERATIONAL_SETTINGS_UPDATE_FAILED"
      );
    }

    return NextResponse.json(
      {
        ok: true,
        updatedBy: {
          userId:
            access.context.userId,
          email:
            access.context.email,
        },
        result: data,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Unexpected operational settings error:",
      error
    );

    return errorResponse(
      500,
      "Došlo je do neočekivane greške pri čuvanju podešavanja.",
      "UNKNOWN_OPERATIONAL_SETTINGS_ERROR"
    );
  }
}
