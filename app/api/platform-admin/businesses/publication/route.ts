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
  hasPlatformAdminPermission,
} from "@/lib/auth/platform-admin-policy";
import {
  getPublicationPermission,
} from "@/lib/platform-admin/publication-permissions";

import {
  isBusinessPublicationStatus,
  shouldBusinessBeOperational,
} from "@/lib/publishing/status";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}

export async function PATCH(
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
        : "Nemaš dozvolu da menjaš publishing status.",
      access.status ===
        "unauthenticated"
        ? "PLATFORM_ADMIN_UNAUTHENTICATED"
        : "PLATFORM_ADMIN_FORBIDDEN"
    );
  }

  let body:
    unknown;

  try {
    body =
      await request.json();
  } catch {
    return jsonError(
      400,
      "Request body nije validan JSON.",
      "INVALID_JSON"
    );
  }

  if (
    !isRecord(
      body
    )
  ) {
    return jsonError(
      400,
      "Request body mora biti JSON objekat.",
      "INVALID_REQUEST_BODY"
    );
  }

  const businessSlug =
    typeof body.businessSlug ===
      "string"
      ? body.businessSlug
          .trim()
          .toLowerCase()
      : "";

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

  if (
    !isBusinessPublicationStatus(
      body.status
    )
  ) {
    return jsonError(
      400,
      "Publishing status nije podržan.",
      "INVALID_PUBLICATION_STATUS"
    );
  }

  const publicationStatus =
    body.status;

  const requiredPermission =
    getPublicationPermission(
      publicationStatus
    );

  if (
    !hasPlatformAdminPermission(
      access.context.role,
      requiredPermission
    )
  ) {
    return jsonError(
      403,
      "Tvoja platformska rola nema dozvolu za ovu lifecycle akciju.",
      "PLATFORM_ADMIN_PERMISSION_DENIED"
    );
  }

  const isActive =
    shouldBusinessBeOperational(
      publicationStatus
    );

  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "businesses"
      )
      .update({
        publication_status:
          publicationStatus,
        is_active:
          isActive,
      })
      .eq(
        "slug",
        businessSlug
      )
      .select(
        "slug, publication_status, is_active"
      )
      .maybeSingle();

  if (error) {
    console.error(
      "Failed to update business publication status:",
      error
    );

    return jsonError(
      500,
      "Publishing status nije moguće sačuvati.",
      "PUBLICATION_UPDATE_FAILED"
    );
  }

  if (!data) {
    return jsonError(
      404,
      "Salon nije pronađen.",
      "BUSINESS_NOT_FOUND"
    );
  }

  return NextResponse.json(
    {
      ok:
        true,
      business: {
        slug:
          data.slug,
        publicationStatus:
          data.publication_status,
        isActive:
          data.is_active,
      },
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
