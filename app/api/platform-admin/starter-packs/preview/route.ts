import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  getPlatformAdminAccess,
} from "@/lib/auth/platform-admin";

import {
  createStarterPackServiceDrafts,
  getRecommendedStarterPackTemplate,
  isStarterPackModuleId,
  isStarterPackVertical,
} from "@/lib/content-starter-packs/provisioning";

import {
  resolveStarterPackPreview,
  StarterPackPreviewError,
} from "@/lib/content-starter-packs/preview";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

const MAX_BODY_BYTES =
  32 * 1024;

type PreviewRequestBody = {
  packId?: unknown;
  selectedModules?: unknown;
};

function errorResponse(
  status: number,
  message: string,
  code: string
) {
  return NextResponse.json(
    {
      ok:
        false,
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

export async function POST(
  request:
    NextRequest
) {
  const access =
    await getPlatformAdminAccess(
      "tenant.preview.read"
    );

  if (
    access.status !==
    "authorized"
  ) {
    return errorResponse(
      access.status ===
        "unauthenticated"
        ? 401
        : 403,
      access.status ===
        "unauthenticated"
        ? "Platform admin sesija nije aktivna."
        : "Nemaš dozvolu za starter-pack preview.",
      access.status ===
        "unauthenticated"
        ? "PLATFORM_ADMIN_UNAUTHENTICATED"
        : "PLATFORM_ADMIN_FORBIDDEN"
    );
  }

  const contentLength =
    Number(
      request.headers.get(
        "content-length"
      ) ??
      "0"
    );

  if (
    Number.isFinite(
      contentLength
    ) &&
    contentLength >
      MAX_BODY_BYTES
  ) {
    return errorResponse(
      413,
      "Starter-pack preview zahtev je prevelik.",
      "STARTER_PACK_PREVIEW_TOO_LARGE"
    );
  }

  let body:
    PreviewRequestBody;

  try {
    body =
      await request.json() as
        PreviewRequestBody;
  } catch {
    return errorResponse(
      400,
      "Request body nije validan JSON.",
      "INVALID_JSON"
    );
  }

  if (
    !isStarterPackVertical(
      body.packId
    )
  ) {
    return errorResponse(
      400,
      "Starter pack nije podržan.",
      "INVALID_STARTER_PACK"
    );
  }

  if (
    !Array.isArray(
      body.selectedModules
    ) ||
    !body.selectedModules.every(
      isStarterPackModuleId
    )
  ) {
    return errorResponse(
      400,
      "Lista starter-pack modula nije ispravna.",
      "INVALID_STARTER_PACK_MODULES"
    );
  }

  try {
    const preview =
      resolveStarterPackPreview({
        packId:
          body.packId,
        locale:
          "sr-Latn",
        selectedModules:
          body.selectedModules,
      });

    return NextResponse.json(
      {
        ok:
          true,
        preview,
        recommendedTemplateKey:
          getRecommendedStarterPackTemplate(
            body.packId
          ),
        serviceDrafts:
          createStarterPackServiceDrafts(
            preview
          ),
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
  } catch (
    error
  ) {
    if (
      error instanceof
      StarterPackPreviewError
    ) {
      return errorResponse(
        400,
        error.message,
        error.code
      );
    }

    console.error(
      "Starter-pack preview failed:",
      error
    );

    return errorResponse(
      500,
      "Starter-pack preview nije moguće pripremiti.",
      "STARTER_PACK_PREVIEW_FAILED"
    );
  }
}
