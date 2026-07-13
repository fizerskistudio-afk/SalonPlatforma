import "server-only";

import {
  jsonError as sharedJsonError,
  jsonResponse as sharedJsonResponse,
} from "@/lib/api/http";
import {
  getPlatformAdminAccess,
} from "@/lib/auth/platform-admin";

const PLATFORM_ADMIN_RESPONSE_HEADERS:
  HeadersInit = {
    "Cache-Control":
      "no-store, no-cache, must-revalidate",
    Pragma:
      "no-cache",
  };

export function jsonResponse(
  body: Record<
    string,
    unknown
  >,
  status: number
) {
  return sharedJsonResponse(
    body,
    status,
    {
      headers:
        PLATFORM_ADMIN_RESPONSE_HEADERS,
    }
  );
}

export function jsonError(
  status: number,
  message: string,
  code: string
) {
  return sharedJsonError(
    status,
    message,
    code,
    {
      headers:
        PLATFORM_ADMIN_RESPONSE_HEADERS,
    }
  );
}

export async function authorizePlatformAdmin() {
  const access =
    await getPlatformAdminAccess(
      "tenant.owner_access.write"
    );

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
