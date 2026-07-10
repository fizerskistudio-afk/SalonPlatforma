import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  jsonError,
} from "@/lib/api/http";

import {
  getPlatformAdminAccess,
} from "@/lib/auth/platform-admin";

import {
  buildTenantPublicUrl,
} from "@/lib/tenancy/hostname";

export const dynamic =
  "force-dynamic";

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(
  request: NextRequest
) {
  const access =
    await getPlatformAdminAccess();

  if (
    !(
      "context" in
      access
    )
  ) {
    return jsonError(
      access.status ===
        "unauthenticated"
        ? 401
        : 403,

      access.status ===
        "unauthenticated"
        ? "Platform admin sesija nije aktivna."
        : "Nemaš pristup platform-admin podacima.",

      access.status ===
        "unauthenticated"
        ? "PLATFORM_ADMIN_UNAUTHENTICATED"
        : "PLATFORM_ADMIN_FORBIDDEN"
    );
  }

  const businessSlug =
    (
      request
        .nextUrl
        .searchParams
        .get(
          "businessSlug"
        ) ??
      ""
    )
      .trim()
      .toLowerCase();

  if (
    !BUSINESS_SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    return jsonError(
      400,
      "Slug salona nije ispravan.",
      "INVALID_BUSINESS_SLUG"
    );
  }

  let publicUrl:
    string;

  try {
    publicUrl =
      buildTenantPublicUrl(
        businessSlug
      );
  } catch (error) {
    console.error(
      "Unable to build tenant public URL:",
      error
    );

    return jsonError(
      500,
      "Javni URL salona nije moguće formirati.",
      "TENANT_PUBLIC_URL_FAILED"
    );
  }

  return NextResponse.json(
    {
      ok:
        true,

      publicUrl,
    },
    {
      status:
        200,

      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}
