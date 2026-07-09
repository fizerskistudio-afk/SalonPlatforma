import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  loadPublicCatalog,
  PublicCatalogError,
} from "@/lib/catalog/server";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

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
          "no-store, max-age=0",
      },
    }
  );
}

export async function GET(
  request: NextRequest
) {
  const businessSlug =
    request.nextUrl.searchParams
      .get("businessSlug")
      ?.trim()
      .toLowerCase();

  if (!businessSlug) {
    return errorResponse(
      400,
      "Business slug is required.",
      "BUSINESS_SLUG_REQUIRED"
    );
  }

  try {
    const result =
      await loadPublicCatalog(
        businessSlug
      );

    if (!result) {
      return errorResponse(
        404,
        "Active business was not found.",
        "BUSINESS_NOT_FOUND"
      );
    }

    return NextResponse.json(
      {
        ok: true,
        source: "supabase",
        catalog:
          result.catalog,
        counts:
          result.counts,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    if (
      error instanceof
      PublicCatalogError
    ) {
      return errorResponse(
        error.status,
        error.message,
        error.code
      );
    }

    console.error(
      "Unexpected catalog error:",
      error
    );

    return errorResponse(
      500,
      "Unexpected catalog error.",
      "UNKNOWN_CATALOG_ERROR"
    );
  }
}
