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

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LOCAL_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const BLOCK_TYPES = new Set([
  "time_off",
  "break",
  "blocked",
]);

type RequestMode =
  | "create"
  | "update"
  | "delete";

type RequestBody = {
  businessSlug?: unknown;
  blockId?: unknown;
  expectedUpdatedAt?: unknown;
  block?: unknown;
};

type BlockInput = {
  employeeSlug?: unknown;
  blockType?: unknown;
  startsLocal?: unknown;
  endsLocal?: unknown;
  reason?: unknown;
};

type NormalizedBlock = {
  employeeSlug: string | null;
  blockType: string;
  startsLocal: string;
  endsLocal: string;
  reason: string | null;
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

function trimmedString(
  value: unknown
): string | null {
  return typeof value === "string"
    ? value.trim()
    : null;
}

function isValidLocalDateTime(
  value: string
): boolean {
  if (!LOCAL_DATE_TIME_PATTERN.test(value)) {
    return false;
  }

  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart
    .split("-")
    .map(Number);
  const [hour, minute] = timePart
    .split(":")
    .map(Number);
  const parsed = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute
    )
  );

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day &&
    parsed.getUTCHours() === hour &&
    parsed.getUTCMinutes() === minute
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

function mapRpcError(error: {
  code?: string;
  message: string;
}) {
  const message = error.message;

  if (message.includes("BUSINESS_NOT_FOUND")) {
    return errorResponse(
      404,
      "Salon nije pronađen.",
      "BUSINESS_NOT_FOUND"
    );
  }

  if (message.includes("EMPLOYEE_NOT_FOUND")) {
    return errorResponse(
      404,
      "Zaposleni nije pronađen.",
      "EMPLOYEE_NOT_FOUND"
    );
  }

  if (message.includes("TIME_OFF_NOT_FOUND")) {
    return errorResponse(
      404,
      "Blokirani period nije pronađen.",
      "TIME_OFF_NOT_FOUND"
    );
  }

  if (message.includes("TIME_OFF_CONFLICT")) {
    return errorResponse(
      409,
      "Blokada je promenjena u drugom tabu. Osveži stranicu i pokušaj ponovo.",
      "TIME_OFF_CONFLICT"
    );
  }

  if (message.includes("TIME_OFF_OVERLAP")) {
    return errorResponse(
      409,
      "Izabrani period se preklapa sa postojećom blokadom za salon ili zaposlenog.",
      "TIME_OFF_OVERLAP"
    );
  }

  if (message.includes("TIME_OFF_BOOKING_CONFLICT")) {
    return errorResponse(
      409,
      "Izabrani period preseca postojeću aktivnu rezervaciju. Prvo pomeri ili otkaži rezervaciju.",
      "TIME_OFF_BOOKING_CONFLICT"
    );
  }

  if (
    error.code === "PGRST202" ||
    message.includes("manage_business_time_off")
  ) {
    return errorResponse(
      503,
      "Migracija za upravljanje blokadama još nije aktivirana.",
      "TIME_OFF_RPC_NOT_AVAILABLE"
    );
  }

  return errorResponse(
    500,
    "Čuvanje blokiranog perioda nije uspelo.",
    "TIME_OFF_SAVE_FAILED"
  );
}

function normalizeBlock(value: unknown):
  | {
      block: NormalizedBlock;
    }
  | {
      error: string;
      code: string;
    } {
  if (!isRecord(value)) {
    return {
      error: "Podaci blokade nisu ispravni.",
      code: "INVALID_BLOCK_DATA",
    };
  }

  const input = value as BlockInput;
  const employeeSlug =
    trimmedString(input.employeeSlug) || null;
  const blockType =
    trimmedString(input.blockType);
  const startsLocal =
    trimmedString(input.startsLocal);
  const endsLocal =
    trimmedString(input.endsLocal);
  const reason =
    trimmedString(input.reason) || null;

  if (
    employeeSlug &&
    !SLUG_PATTERN.test(employeeSlug)
  ) {
    return {
      error: "Zaposleni nije ispravno izabran.",
      code: "INVALID_EMPLOYEE_SLUG",
    };
  }

  if (
    !blockType ||
    !BLOCK_TYPES.has(blockType)
  ) {
    return {
      error: "Tip blokade nije ispravan.",
      code: "INVALID_BLOCK_TYPE",
    };
  }

  if (
    !startsLocal ||
    !endsLocal ||
    !isValidLocalDateTime(startsLocal) ||
    !isValidLocalDateTime(endsLocal) ||
    endsLocal <= startsLocal
  ) {
    return {
      error: "Početak i kraj blokade nisu ispravni.",
      code: "INVALID_BLOCK_RANGE",
    };
  }

  if (reason && reason.length > 500) {
    return {
      error: "Razlog može imati najviše 500 karaktera.",
      code: "INVALID_BLOCK_REASON",
    };
  }

  return {
    block: {
      employeeSlug,
      blockType,
      startsLocal,
      endsLocal,
      reason,
    },
  };
}

async function handleRequest(
  request: NextRequest,
  mode: RequestMode
) {
  const access =
    await getPlatformAdminAccess(
      "tenant.schedule.write"
    );

  if (!("context" in access)) {
    if (access.status === "unauthenticated") {
      return errorResponse(
        401,
        "Platform admin sesija nije aktivna.",
        "PLATFORM_ADMIN_UNAUTHENTICATED"
      );
    }

    return errorResponse(
      403,
      "Nemaš dozvolu za upravljanje blokadama.",
      "PLATFORM_ADMIN_FORBIDDEN"
    );
  }

  let bodyValue: unknown;

  try {
    bodyValue = await request.json();
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

  const body = bodyValue as RequestBody;
  const businessSlug =
    trimmedString(body.businessSlug);

  if (
    !businessSlug ||
    businessSlug.length > 80 ||
    !SLUG_PATTERN.test(businessSlug)
  ) {
    return errorResponse(
      400,
      "Slug salona nije ispravan.",
      "INVALID_BUSINESS_SLUG"
    );
  }

  const blockId =
    trimmedString(body.blockId);
  const expectedUpdatedAt =
    trimmedString(body.expectedUpdatedAt);

  if (mode !== "create") {
    if (!blockId || !UUID_PATTERN.test(blockId)) {
      return errorResponse(
        400,
        "ID blokade nije ispravan.",
        "INVALID_BLOCK_ID"
      );
    }

    if (
      !expectedUpdatedAt ||
      Number.isNaN(Date.parse(expectedUpdatedAt))
    ) {
      return errorResponse(
        400,
        "Verzija blokade nije ispravna.",
        "INVALID_EXPECTED_UPDATED_AT"
      );
    }
  }

  let block: NormalizedBlock | null = null;

  if (mode !== "delete") {
    const normalized = normalizeBlock(body.block);

    if ("error" in normalized) {
      return errorResponse(
        400,
        normalized.error,
        normalized.code
      );
    }

    block = normalized.block;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc(
      "manage_business_time_off",
      {
        input_payload: {
          mode,
          businessSlug,
          ...(blockId ? { blockId } : {}),
          ...(expectedUpdatedAt
            ? { expectedUpdatedAt }
            : {}),
          ...(block ? { block } : {}),
        },
      }
    );

    if (error) {
      console.error(
        "Time-off management RPC failed:",
        error
      );
      return mapRpcError(error);
    }

    return NextResponse.json(
      {
        ok: true,
        result: data,
      },
      {
        status: mode === "create" ? 201 : 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Unexpected time-off management error:",
      error
    );
    return errorResponse(
      500,
      "Došlo je do neočekivane greške pri upravljanju blokadama.",
      "UNKNOWN_TIME_OFF_ERROR"
    );
  }
}

export async function POST(request: NextRequest) {
  return handleRequest(request, "create");
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, "update");
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, "delete");
}
