import {
  revalidatePath,
} from "next/cache";

import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  getPlatformAdminAccess,
} from "@/lib/auth/platform-admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  isTemplateKey,
  type TemplateKey,
} from "@/lib/templates/registry";

export const dynamic =
  "force-dynamic";

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type UpdateThemeRequest = {
  businessSlug?: unknown;
  templateKey?: unknown;
  expectedUpdatedAt?: unknown;
};

function jsonError(
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

function readString(
  value: unknown
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

export async function PUT(
  request: NextRequest
) {
  const access =
    await getPlatformAdminAccess();

  if (
    access.status !==
    "authorized"
  ) {
    return jsonError(
      access.status ===
        "unauthenticated"
        ? 401
        : 403,
      access.status ===
        "unauthenticated"
        ? "Platform admin sesija nije aktivna."
        : "Nemaš pristup platform-admin funkcijama.",
      access.status ===
        "unauthenticated"
        ? "UNAUTHENTICATED"
        : "FORBIDDEN"
    );
  }

  let body:
    UpdateThemeRequest;

  try {
    body =
      await request.json() as
        UpdateThemeRequest;
  } catch {
    return jsonError(
      400,
      "Zahtev nije ispravan JSON.",
      "INVALID_JSON"
    );
  }

  const businessSlug =
    readString(
      body.businessSlug
    ).toLowerCase();

  const expectedUpdatedAt =
    readString(
      body.expectedUpdatedAt
    );

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
    !isTemplateKey(
      body.templateKey
    )
  ) {
    return jsonError(
      400,
      "Izabrani theme pack nije podržan.",
      "INVALID_TEMPLATE_KEY"
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
      "Verzija salona nije ispravna.",
      "INVALID_EXPECTED_UPDATED_AT"
    );
  }

  const templateKey:
    TemplateKey =
      body.templateKey;

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
        template_key:
          templateKey,

        /*
         * Config je vezan za konkretan template.
         * Pri promeni pack-a resetujemo ga da stara
         * konfiguracija ne utiče na novi renderer.
         */
        template_config:
          {},
      })
      .eq(
        "slug",
        businessSlug
      )
      .eq(
        "updated_at",
        expectedUpdatedAt
      )
      .select(
        `
          template_key,
          updated_at
        `
      )
      .maybeSingle();

  if (error) {
    console.error(
      "Unable to update business theme:",
      error
    );

    return jsonError(
      500,
      "Theme pack nije sačuvan.",
      "THEME_UPDATE_FAILED"
    );
  }

  if (!data) {
    return jsonError(
      409,
      "Salon je u međuvremenu promenjen. Osveži stranicu i pokušaj ponovo.",
      "STALE_BUSINESS_VERSION"
    );
  }

  const updated =
    data as unknown as {
      template_key:
        TemplateKey;
      updated_at:
        string;
    };

  revalidatePath(
    `/salon/${businessSlug}`
  );

  revalidatePath(
    `/platform-admin/businesses/${businessSlug}`
  );

  revalidatePath(
    `/platform-admin/businesses/${businessSlug}/theme`
  );

  return NextResponse.json(
    {
      ok:
        true,
      message:
        "Theme pack je sačuvan.",
      business: {
        templateKey:
          updated.template_key,
        updatedAt:
          updated.updated_at,
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
