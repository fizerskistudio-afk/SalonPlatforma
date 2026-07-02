import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ASSET_BUCKET = "salon-assets";
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

const assetTypes = [
  "hero",
  "logo",
] as const;

type AssetType =
  (typeof assetTypes)[number];

type UploadRequestBody = {
  assetType?: unknown;
  contentType?: unknown;
  size?: unknown;
};

const contentTypeExtensions: Record<
  string,
  "jpg" | "png" | "webp"
> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
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

export async function POST(
  request: Request
) {
  try {
    const admin =
      await requireAdmin();

    const body =
      (await request.json()) as UploadRequestBody;

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
      typeof body.contentType !==
      "string"
    ) {
      return errorResponse(
        400,
        "Tip fajla nije ispravan.",
        "INVALID_CONTENT_TYPE"
      );
    }

    const extension =
      contentTypeExtensions[
        body.contentType
      ];

    if (!extension) {
      return errorResponse(
        400,
        "Dozvoljeni su JPG, PNG i WebP fajlovi.",
        "UNSUPPORTED_IMAGE_TYPE"
      );
    }

    if (
      typeof body.size !== "number" ||
      !Number.isInteger(body.size) ||
      body.size <= 0 ||
      body.size > MAX_FILE_SIZE_BYTES
    ) {
      return errorResponse(
        400,
        "Fotografija mora biti manja od 8 MB.",
        "INVALID_FILE_SIZE"
      );
    }

    const path = [
      admin.business.id,
      body.assetType,
      `${Date.now()}-${randomUUID()}.${extension}`,
    ].join("/");

    const supabase =
      createAdminClient();

    const {
      data,
      error,
    } = await supabase.storage
      .from(ASSET_BUCKET)
      .createSignedUploadUrl(
        path,
        {
          upsert: false,
        }
      );

    if (
      error ||
      !data?.token
    ) {
      console.error(
        "Failed to create signed asset upload URL:",
        error
      );

      return errorResponse(
        500,
        "Upload trenutno nije moguće pokrenuti.",
        "SIGNED_UPLOAD_CREATE_FAILED"
      );
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from(ASSET_BUCKET)
      .getPublicUrl(path);

    return NextResponse.json(
      {
        ok: true,
        bucket: ASSET_BUCKET,
        path,
        token: data.token,
        publicUrl:
          publicUrlData.publicUrl,
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
      "Unexpected signed asset upload error:",
      error
    );

    return errorResponse(
      500,
      "Došlo je do greške prilikom pripreme uploada.",
      "UNKNOWN_SIGNED_UPLOAD_ERROR"
    );
  }
}
