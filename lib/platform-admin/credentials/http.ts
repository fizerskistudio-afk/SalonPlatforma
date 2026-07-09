import "server-only";

import {
  NextResponse,
} from "next/server";

import {
  getPlatformAdminAccess,
} from "@/lib/auth/platform-admin";

export function jsonResponse(
  body: Record<
    string,
    unknown
  >,
  status: number
) {
  return NextResponse.json(
    body,
    {
      status,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
        Pragma:
          "no-cache",
      },
    }
  );
}

export function jsonError(
  status: number,
  message: string,
  code: string
) {
  return jsonResponse(
    {
      ok: false,
      message,
      code,
    },
    status
  );
}

export async function authorizePlatformAdmin() {
  const access =
    await getPlatformAdminAccess();

  if (
    "context" in
    access
  ) {
    return {
      context:
        access.context,
    } as const;
  }

  if (
    access.status ===
    "unauthenticated"
  ) {
    return {
      error:
        jsonError(
          401,
          "Platform admin sesija nije aktivna.",
          "PLATFORM_ADMIN_UNAUTHENTICATED"
        ),
    } as const;
  }

  return {
    error:
      jsonError(
        403,
        "Nemaš dozvolu za upravljanje owner pristupom.",
        "PLATFORM_ADMIN_FORBIDDEN"
      ),
  } as const;
}
