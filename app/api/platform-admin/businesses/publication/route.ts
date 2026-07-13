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
  isLifecycleTransitionAllowed,
} from "@/lib/platform-admin/tenant-lifecycle";
import {
  loadTenantLifecycleContext,
  TenantLifecycleLoadError,
} from "@/lib/platform-admin/tenant-lifecycle-server";
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
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function canManageLifecycle(
  role: Parameters<
    typeof hasPlatformAdminPermission
  >[0]
): boolean {
  return [
    "tenant.publish",
    "tenant.unpublish",
    "tenant.deactivate",
    "tenant.reactivate",
  ].some(
    (permission) =>
      hasPlatformAdminPermission(
        role,
        permission as Parameters<
          typeof hasPlatformAdminPermission
        >[1]
      )
  );
}

export async function PATCH(
  request: NextRequest
) {
  const access =
    await getPlatformAdminAccess();

  if (!("context" in access)) {
    return jsonError(
      access.status === "unauthenticated"
        ? 401
        : 403,
      access.status === "unauthenticated"
        ? "Platform admin sesija nije aktivna."
        : "Nemaš dozvolu da menjaš publishing status.",
      access.status === "unauthenticated"
        ? "PLATFORM_ADMIN_UNAUTHENTICATED"
        : "PLATFORM_ADMIN_FORBIDDEN"
    );
  }

  if (
    !canManageLifecycle(
      access.context.role
    )
  ) {
    return jsonError(
      403,
      "Tvoja platformska rola nema dozvolu za lifecycle akcije.",
      "PLATFORM_ADMIN_PERMISSION_DENIED"
    );
  }

  let body: unknown;

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

  if (!isRecord(body)) {
    return jsonError(
      400,
      "Request body mora biti JSON objekat.",
      "INVALID_REQUEST_BODY"
    );
  }

  const businessSlug =
    typeof body.businessSlug === "string"
      ? body.businessSlug.trim().toLowerCase()
      : "";
  const expectedUpdatedAt =
    typeof body.expectedUpdatedAt === "string"
      ? body.expectedUpdatedAt.trim()
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
    !expectedUpdatedAt ||
    Number.isNaN(
      Date.parse(
        expectedUpdatedAt
      )
    )
  ) {
    return jsonError(
      400,
      "Nedostaje validna verzija lifecycle stanja.",
      "INVALID_EXPECTED_UPDATED_AT"
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

  const nextStatus =
    body.status;

  let lifecycle;

  try {
    lifecycle =
      await loadTenantLifecycleContext(
        businessSlug
      );
  } catch (error) {
    console.error(
      "Failed to load tenant lifecycle context:",
      error
    );

    return jsonError(
      500,
      error instanceof TenantLifecycleLoadError
        ? error.message
        : "Lifecycle tenant-a trenutno nije moguće proveriti.",
      "LIFECYCLE_LOAD_FAILED"
    );
  }

  if (!lifecycle) {
    return jsonError(
      404,
      "Salon nije pronađen.",
      "BUSINESS_NOT_FOUND"
    );
  }

  const {
    business,
    readiness,
  } = lifecycle;

  if (
    business.updatedAt !==
    expectedUpdatedAt
  ) {
    return jsonError(
      409,
      "Lifecycle je u međuvremenu promenjen. Osveži stranicu i pokušaj ponovo.",
      "LIFECYCLE_CHANGED"
    );
  }

  const requiredPermission =
    getPublicationPermission(
      business.publicationStatus,
      nextStatus
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

  if (
    business.publicationStatus ===
    nextStatus
  ) {
    return NextResponse.json(
      {
        ok: true,
        unchanged: true,
        business,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  if (
    !isLifecycleTransitionAllowed(
      business.publicationStatus,
      nextStatus
    )
  ) {
    return jsonError(
      409,
      "Ovaj lifecycle prelaz nije dozvoljen. Reaktiviraj arhiviran tenant prvo kao draft.",
      "INVALID_LIFECYCLE_TRANSITION"
    );
  }

  if (
    nextStatus === "published" &&
    !readiness.productionReady
  ) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Tenant nije spreman za objavu. Završi navedene blokatore i pokušaj ponovo.",
        code: "TENANT_NOT_READY",
        blockers: readiness.blockers,
        readiness: {
          technicalReady:
            readiness.technicalReady,
          contentReady:
            readiness.contentReady,
          bookingReady:
            readiness.bookingReady,
          ownerAccessReady:
            readiness.ownerAccessReady,
          previewReady:
            readiness.previewReady,
          productionReady:
            readiness.productionReady,
        },
      },
      {
        status: 409,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const isActive =
    shouldBusinessBeOperational(
      nextStatus
    );
  const supabase =
    createAdminClient();
  const {
    data,
    error,
  } = await supabase
    .from("businesses")
    .update({
      publication_status:
        nextStatus,
      is_active:
        isActive,
    })
    .eq(
      "id",
      business.id
    )
    .eq(
      "updated_at",
      expectedUpdatedAt
    )
    .select(
      "id, slug, publication_status, is_active, updated_at"
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
      409,
      "Lifecycle je promenjen pre čuvanja. Osveži stranicu i pokušaj ponovo.",
      "LIFECYCLE_CHANGED"
    );
  }

  console.info(
    "Platform admin lifecycle event:",
    {
      event:
        "tenant.lifecycle.changed",
      actorId:
        access.context.userId,
      actorEmail:
        access.context.email,
      actorRole:
        access.context.role,
      businessId:
        business.id,
      businessSlug:
        business.slug,
      previousStatus:
        business.publicationStatus,
      nextStatus,
      previousIsActive:
        business.isActive,
      nextIsActive:
        data.is_active,
      previousUpdatedAt:
        business.updatedAt,
      nextUpdatedAt:
        data.updated_at,
    }
  );

  return NextResponse.json(
    {
      ok: true,
      business: {
        slug:
          data.slug,
        publicationStatus:
          data.publication_status,
        isActive:
          data.is_active,
        updatedAt:
          data.updated_at,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
