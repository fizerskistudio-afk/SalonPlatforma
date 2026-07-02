import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ASSET_BUCKET = "salon-assets";

const assetTypes = [
  "hero",
  "logo",
] as const;

type AssetType =
  (typeof assetTypes)[number];

type AssetRequestBody = {
  assetType?: unknown;
  path?: unknown;
};

type BusinessAssetRow = {
  hero_image_url: string | null;
  logo_url: string | null;
};

function isAssetType(
  value: unknown
): value is AssetType {
  return (
    typeof value === "string" &&
    assetTypes.includes(
      value as AssetType
    )
  );
}

function isOwnedAssetPath(
  path: string,
  businessId: string,
  assetType: AssetType
): boolean {
  const prefix =
    `${businessId}/${assetType}/`;

  if (!path.startsWith(prefix)) {
    return false;
  }

  const fileName =
    path.slice(prefix.length);

  return /^[0-9]+-[0-9a-f-]+\.(jpg|png|webp)$/i.test(
    fileName
  );
}

function extractOwnedStoragePath(
  publicUrl: string | null,
  businessId: string,
  assetType: AssetType
): string | null {
  if (!publicUrl) {
    return null;
  }

  try {
    const url = new URL(publicUrl);

    const marker =
      `/storage/v1/object/public/${ASSET_BUCKET}/`;

    const markerIndex =
      url.pathname.indexOf(marker);

    if (markerIndex < 0) {
      return null;
    }

    const encodedPath =
      url.pathname.slice(
        markerIndex + marker.length
      );

    const path =
      decodeURIComponent(encodedPath);

    return isOwnedAssetPath(
      path,
      businessId,
      assetType
    )
      ? path
      : null;
  } catch {
    return null;
  }
}

function getCurrentAssetUrl(
  business: BusinessAssetRow,
  assetType: AssetType
): string | null {
  return assetType === "hero"
    ? business.hero_image_url
    : business.logo_url;
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

function revalidateAssetPages() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/api/catalog");
}

export async function PATCH(
  request: Request
) {
  try {
    const admin =
      await requireAdmin();

    const body =
      (await request.json()) as AssetRequestBody;

    if (
      !isAssetType(
        body.assetType
      )
    ) {
      return errorResponse(
        400,
        "Vrsta fotografije nije ispravna.",
        "INVALID_ASSET_TYPE"
      );
    }

    if (
      typeof body.path !== "string" ||
      !isOwnedAssetPath(
        body.path,
        admin.business.id,
        body.assetType
      )
    ) {
      return errorResponse(
        400,
        "Putanja fotografije nije ispravna.",
        "INVALID_ASSET_PATH"
      );
    }

    const supabase =
      createAdminClient();

    const {
      data: businessData,
      error: businessError,
    } = await supabase
      .from("businesses")
      .select(
        "hero_image_url, logo_url"
      )
      .eq(
        "id",
        admin.business.id
      )
      .single();

    if (
      businessError ||
      !businessData
    ) {
      return errorResponse(
        500,
        "Nije moguće učitati trenutnu fotografiju.",
        "BUSINESS_ASSET_LOAD_FAILED"
      );
    }

    const business =
      businessData as unknown as BusinessAssetRow;

    const {
      data: publicUrlData,
    } = supabase.storage
      .from(ASSET_BUCKET)
      .getPublicUrl(body.path);

    const publicUrl =
      publicUrlData.publicUrl;

    const updatePayload =
      body.assetType === "hero"
        ? {
            hero_image_url:
              publicUrl,
            updated_at:
              new Date().toISOString(),
          }
        : {
            logo_url:
              publicUrl,
            updated_at:
              new Date().toISOString(),
          };

    const {
      error: updateError,
    } = await supabase
      .from("businesses")
      .update(updatePayload)
      .eq(
        "id",
        admin.business.id
      );

    if (updateError) {
      console.error(
        "Failed to save business asset URL:",
        updateError
      );

      await supabase.storage
        .from(ASSET_BUCKET)
        .remove([body.path]);

      return errorResponse(
        500,
        "Fotografija je uploadovana, ali nije sačuvana u salonu.",
        "BUSINESS_ASSET_SAVE_FAILED"
      );
    }

    const previousUrl =
      getCurrentAssetUrl(
        business,
        body.assetType
      );

    const previousPath =
      extractOwnedStoragePath(
        previousUrl,
        admin.business.id,
        body.assetType
      );

    if (
      previousPath &&
      previousPath !== body.path
    ) {
      const {
        error: removeError,
      } = await supabase.storage
        .from(ASSET_BUCKET)
        .remove([previousPath]);

      if (removeError) {
        console.error(
          "Failed to remove previous business asset:",
          removeError
        );
      }
    }

    revalidateAssetPages();

    return NextResponse.json(
      {
        ok: true,
        assetType:
          body.assetType,
        path: body.path,
        url: publicUrl,
        message:
          body.assetType === "hero"
            ? "Hero fotografija je uspešno sačuvana."
            : "Logo je uspešno sačuvan.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Unexpected business asset finalize error:",
      error
    );

    return errorResponse(
      500,
      "Došlo je do greške prilikom čuvanja fotografije.",
      "UNKNOWN_ASSET_SAVE_ERROR"
    );
  }
}

export async function DELETE(
  request: Request
) {
  try {
    const admin =
      await requireAdmin();

    const body =
      (await request.json()) as AssetRequestBody;

    if (
      !isAssetType(
        body.assetType
      )
    ) {
      return errorResponse(
        400,
        "Vrsta fotografije nije ispravna.",
        "INVALID_ASSET_TYPE"
      );
    }

    const supabase =
      createAdminClient();

    const {
      data: businessData,
      error: businessError,
    } = await supabase
      .from("businesses")
      .select(
        "hero_image_url, logo_url"
      )
      .eq(
        "id",
        admin.business.id
      )
      .single();

    if (
      businessError ||
      !businessData
    ) {
      return errorResponse(
        500,
        "Nije moguće učitati trenutnu fotografiju.",
        "BUSINESS_ASSET_LOAD_FAILED"
      );
    }

    const business =
      businessData as unknown as BusinessAssetRow;

    const currentUrl =
      getCurrentAssetUrl(
        business,
        body.assetType
      );

    const updatePayload =
      body.assetType === "hero"
        ? {
            hero_image_url: null,
            updated_at:
              new Date().toISOString(),
          }
        : {
            logo_url: null,
            updated_at:
              new Date().toISOString(),
          };

    const {
      error: updateError,
    } = await supabase
      .from("businesses")
      .update(updatePayload)
      .eq(
        "id",
        admin.business.id
      );

    if (updateError) {
      return errorResponse(
        500,
        "Fotografija nije uklonjena iz podešavanja salona.",
        "BUSINESS_ASSET_REMOVE_FAILED"
      );
    }

    const currentPath =
      extractOwnedStoragePath(
        currentUrl,
        admin.business.id,
        body.assetType
      );

    if (currentPath) {
      const {
        error: removeError,
      } = await supabase.storage
        .from(ASSET_BUCKET)
        .remove([currentPath]);

      if (removeError) {
        console.error(
          "Failed to remove business asset from storage:",
          removeError
        );
      }
    }

    revalidateAssetPages();

    return NextResponse.json(
      {
        ok: true,
        assetType:
          body.assetType,
        message:
          body.assetType === "hero"
            ? "Hero fotografija je uklonjena."
            : "Logo je uklonjen.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Unexpected business asset delete error:",
      error
    );

    return errorResponse(
      500,
      "Došlo je do greške prilikom uklanjanja fotografije.",
      "UNKNOWN_ASSET_REMOVE_ERROR"
    );
  }
}
