import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  getPlatformAdminAccess,
} from "@/lib/auth/platform-admin";
import {
  buildBusinessPackageAssignmentUpdate,
} from "@/lib/platform-admin/business-package-assignment";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type UpdateBusinessPackageRequestBody = {
  businessSlug?: unknown;
  packageKey?: unknown;
  expectedUpdatedAt?: unknown;
};

type BusinessPackageRow = {
  id: string;
  slug: string;
  package_key: string | null;
  package_contract_version:
    number | null;
  package_assigned_at:
    string | null;
  package_assigned_by_user_id:
    string | null;
  updated_at: string;
};

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

function getTrimmedString(
  value: unknown
): string | null {
  return typeof value ===
    "string"
    ? value.trim()
    : null;
}

function isJsonRecord(
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

export async function PATCH(
  request: NextRequest
) {
  const access =
    await getPlatformAdminAccess(
      "tenant.package.write"
    );

  if (
    !(
      "context" in
      access
    )
  ) {
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
      "Nemaš dozvolu za promenu paketa salona.",
      "PLATFORM_ADMIN_FORBIDDEN"
    );
  }

  let bodyValue:
    unknown;

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

  if (
    !isJsonRecord(
      bodyValue
    )
  ) {
    return errorResponse(
      400,
      "Request body mora biti JSON objekat.",
      "INVALID_REQUEST_BODY"
    );
  }

  const body =
    bodyValue as
      UpdateBusinessPackageRequestBody;

  const businessSlug =
    getTrimmedString(
      body.businessSlug
    );

  const expectedUpdatedAt =
    getTrimmedString(
      body.expectedUpdatedAt
    );

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

  if (!expectedUpdatedAt) {
    return errorResponse(
      400,
      "Nedostaje verzija podataka salona.",
      "MISSING_UPDATED_AT"
    );
  }

  const assignment =
    buildBusinessPackageAssignmentUpdate({
      packageKey:
        body.packageKey,
      actorUserId:
        access.context.userId,
      assignedAt:
        new Date().toISOString(),
    });

  if (!assignment) {
    return errorResponse(
      400,
      "Izabrani paket nije ispravan.",
      "INVALID_PACKAGE_KEY"
    );
  }

  try {
    const supabase =
      createAdminClient();

    const {
      data: businessData,
      error: businessError,
    } = await supabase
      .from("businesses")
      .select(
        `
          id,
          slug,
          package_key,
          package_contract_version,
          package_assigned_at,
          package_assigned_by_user_id,
          updated_at
        `
      )
      .eq(
        "slug",
        businessSlug
      )
      .maybeSingle();

    if (businessError) {
      console.error(
        "Failed to load business package for update:",
        businessError
      );

      return errorResponse(
        500,
        "Nije moguće učitati paket salona.",
        "BUSINESS_PACKAGE_QUERY_FAILED"
      );
    }

    if (!businessData) {
      return errorResponse(
        404,
        "Salon nije pronađen.",
        "BUSINESS_NOT_FOUND"
      );
    }

    const business =
      businessData as unknown as
        BusinessPackageRow;

    if (
      business.updated_at !==
      expectedUpdatedAt
    ) {
      return errorResponse(
        409,
        "Podaci salona su u međuvremenu izmenjeni. Osveži stranicu i pokušaj ponovo.",
        "BUSINESS_CHANGED"
      );
    }

    const {
      data: updatedData,
      error: updateError,
    } = await supabase
      .from("businesses")
      .update(
        assignment
      )
      .eq(
        "id",
        business.id
      )
      .eq(
        "updated_at",
        expectedUpdatedAt
      )
      .select(
        `
          id,
          slug,
          package_key,
          package_contract_version,
          package_assigned_at,
          package_assigned_by_user_id,
          updated_at
        `
      )
      .maybeSingle();

    if (updateError) {
      console.error(
        "Failed to update business package:",
        updateError
      );

      return errorResponse(
        500,
        "Paket salona nije moguće sačuvati.",
        "BUSINESS_PACKAGE_UPDATE_FAILED"
      );
    }

    if (!updatedData) {
      return errorResponse(
        409,
        "Podaci salona su u međuvremenu izmenjeni. Osveži stranicu i pokušaj ponovo.",
        "BUSINESS_CHANGED"
      );
    }

    const updated =
      updatedData as unknown as
        BusinessPackageRow;

    return NextResponse.json(
      {
        ok: true,
        message:
          "Paket salona je sačuvan.",
        business: {
          slug:
            updated.slug,
          packageKey:
            updated.package_key,
          packageContractVersion:
            updated.package_contract_version,
          packageAssignedAt:
            updated.package_assigned_at,
          packageAssignedByUserId:
            updated.package_assigned_by_user_id,
          updatedAt:
            updated.updated_at,
        },
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
      "Unexpected business package update error:",
      error
    );

    return errorResponse(
      500,
      "Došlo je do neočekivane greške pri čuvanju paketa.",
      "BUSINESS_PACKAGE_UNEXPECTED_ERROR"
    );
  }
}
