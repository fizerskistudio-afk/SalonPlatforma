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
  materializeStarterPackProvisioning,
  StarterPackProvisioningError,
} from "@/lib/content-starter-packs/provisioning";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  isTemplateKey,
} from "@/lib/templates/registry";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

const MAX_BODY_BYTES =
  256 * 1024;

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ProvisionRequestBody = {
  business?: unknown;
  packId?: unknown;
  selectedModules?: unknown;
  locale?: unknown;
  currency?: unknown;
  templateKey?: unknown;
  applyKey?: unknown;
  confirmed?: unknown;
  serviceEdits?: unknown;
};

type BusinessInput = {
  name?: unknown;
  slug?: unknown;
  city?: unknown;
  country?: unknown;
  phone?: unknown;
  email?: unknown;
  timezone?: unknown;
};

type ExistingBusiness = {
  id: string;
  slug: string;
  name: string;
  template_key: string | null;
  template_config:
    unknown;
};

function isJsonRecord(
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

function readString(
  value: unknown
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function isValidTimeZone(
  value: string
): boolean {
  try {
    new Intl.DateTimeFormat(
      "en",
      {
        timeZone:
          value,
      }
    ).format();

    return true;
  } catch {
    return false;
  }
}

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

function getStoredApplyKey(
  templateConfig:
    unknown
): string | null {
  if (
    !isJsonRecord(
      templateConfig
    ) ||
    !isJsonRecord(
      templateConfig
        .starterPack
    )
  ) {
    return null;
  }

  return typeof templateConfig
    .starterPack
    .applyKey ===
    "string"
    ? templateConfig
        .starterPack
        .applyKey
    : null;
}

async function findBusinessBySlug(
  slug: string
): Promise<{
  data:
    ExistingBusiness | null;
  error:
    unknown;
}> {
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
      .select(
        `
          id,
          slug,
          name,
          template_key,
          template_config
        `
      )
      .eq(
        "slug",
        slug
      )
      .maybeSingle();

  return {
    data:
      data as
        ExistingBusiness | null,
    error,
  };
}

function idempotentResponse({
  business,
  applyKey,
}: {
  business:
    ExistingBusiness;
  applyKey:
    string;
}) {
  return NextResponse.json(
    {
      ok:
        true,
      alreadyApplied:
        true,
      applyKey,
      result: {
        businessId:
          business.id,
        slug:
          business.slug,
        name:
          business.name,
        templateKey:
          business.template_key,
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

export async function POST(
  request:
    NextRequest
) {
  const access =
    await getPlatformAdminAccess(
      "tenant.create"
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
        : "Nemaš dozvolu za kreiranje salona.",
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
      "Starter-pack provisioning zahtev je prevelik.",
      "STARTER_PACK_PROVISIONING_TOO_LARGE"
    );
  }

  let body:
    ProvisionRequestBody;

  try {
    body =
      await request.json() as
        ProvisionRequestBody;
  } catch {
    return errorResponse(
      400,
      "Request body nije validan JSON.",
      "INVALID_JSON"
    );
  }

  if (
    !isJsonRecord(
      body.business
    )
  ) {
    return errorResponse(
      400,
      "Podaci salona nisu ispravni.",
      "INVALID_BUSINESS_DATA"
    );
  }

  const business =
    body.business as
      BusinessInput;

  const name =
    readString(
      business.name
    );

  const slug =
    readString(
      business.slug
    ).toLowerCase();

  const city =
    readString(
      business.city
    );

  const country =
    readString(
      business.country
    );

  const phone =
    readString(
      business.phone
    );

  const rawEmail =
    readString(
      business.email
    );

  const email =
    rawEmail.length >
    0
      ? rawEmail.toLowerCase()
      : null;

  const timezone =
    readString(
      business.timezone
    );

  if (
    name.length <
      2 ||
    name.length >
      120
  ) {
    return errorResponse(
      400,
      "Naziv salona mora imati između 2 i 120 karaktera.",
      "INVALID_BUSINESS_NAME"
    );
  }

  if (
    slug.length >
      80 ||
    !SLUG_PATTERN.test(
      slug
    )
  ) {
    return errorResponse(
      400,
      "URL slug salona nije ispravan.",
      "INVALID_BUSINESS_SLUG"
    );
  }

  if (
    city.length <
      2 ||
    city.length >
      100 ||
    country.length <
      2 ||
    country.length >
      100
  ) {
    return errorResponse(
      400,
      "Lokacija salona nije ispravna.",
      "INVALID_BUSINESS_LOCATION"
    );
  }

  if (
    phone.length <
      5 ||
    phone.length >
      40
  ) {
    return errorResponse(
      400,
      "Telefon salona nije ispravan.",
      "INVALID_BUSINESS_PHONE"
    );
  }

  if (
    email &&
    (
      email.length >
        254 ||
      !EMAIL_PATTERN.test(
        email
      )
    )
  ) {
    return errorResponse(
      400,
      "Email salona nije ispravan.",
      "INVALID_BUSINESS_EMAIL"
    );
  }

  if (
    timezone.length >
      100 ||
    !isValidTimeZone(
      timezone
    )
  ) {
    return errorResponse(
      400,
      "Vremenska zona salona nije ispravna.",
      "INVALID_BUSINESS_TIMEZONE"
    );
  }

  if (
    !isTemplateKey(
      body.templateKey
    )
  ) {
    return errorResponse(
      400,
      "Izabrani theme pack nije podržan.",
      "INVALID_TEMPLATE_KEY"
    );
  }

  let preset:
    ReturnType<
      typeof materializeStarterPackProvisioning
    >;

  try {
    preset =
      materializeStarterPackProvisioning({
        packId:
          body.packId,
        selectedModules:
          body.selectedModules,
        locale:
          body.locale,
        currency:
          body.currency,
        templateKey:
          body.templateKey,
        applyKey:
          body.applyKey,
        confirmed:
          body.confirmed,
        serviceEdits:
          body.serviceEdits,
      });
  } catch (
    error
  ) {
    if (
      error instanceof
      StarterPackProvisioningError
    ) {
      return errorResponse(
        400,
        error.message,
        error.code
      );
    }

    console.error(
      "Unable to materialize starter pack:",
      error
    );

    return errorResponse(
      500,
      "Starter pack nije moguće pripremiti za provisioning.",
      "STARTER_PACK_MATERIALIZATION_FAILED"
    );
  }

  const applyKey =
    preset
      .templateConfig
      .starterPack
      .applyKey;

  const existingLookup =
    await findBusinessBySlug(
      slug
    );

  if (
    existingLookup.error
  ) {
    console.error(
      "Unable to check starter-pack idempotency:",
      existingLookup.error
    );

    return errorResponse(
      500,
      "Nije moguće proveriti postojeći salon.",
      "STARTER_PACK_IDEMPOTENCY_CHECK_FAILED"
    );
  }

  if (
    existingLookup.data
  ) {
    if (
      getStoredApplyKey(
        existingLookup
          .data
          .template_config
      ) ===
      applyKey
    ) {
      return idempotentResponse({
        business:
          existingLookup.data,
        applyKey,
      });
    }

    return errorResponse(
      409,
      "Salon sa ovim URL slugom već postoji.",
      "BUSINESS_SLUG_EXISTS"
    );
  }

  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "provision_business",
      {
        input_payload: {
          business: {
            name,
            slug,
            city,
            country,
            phone,
            email,
            timezone,
          },
          preset,
        },
      }
    );

  if (
    error
  ) {
    console.error(
      "Starter-pack business provisioning failed:",
      error
    );

    if (
      error.code ===
        "23505"
    ) {
      const raceLookup =
        await findBusinessBySlug(
          slug
        );

      if (
        !raceLookup.error &&
        raceLookup.data &&
        getStoredApplyKey(
          raceLookup
            .data
            .template_config
        ) ===
        applyKey
      ) {
        return idempotentResponse({
          business:
            raceLookup.data,
          applyKey,
        });
      }

      return errorResponse(
        409,
        "Salon sa ovim URL slugom već postoji.",
        "BUSINESS_SLUG_EXISTS"
      );
    }

    if (
      error.code ===
        "PGRST202" ||
      error.message.includes(
        "provision_business"
      )
    ) {
      return errorResponse(
        503,
        "Provisioning migracija još nije aktivirana u Supabase-u.",
        "PROVISIONING_RPC_NOT_AVAILABLE"
      );
    }

    return errorResponse(
      500,
      "Starter-pack provisioning nije uspeo.",
      "STARTER_PACK_PROVISIONING_FAILED"
    );
  }

  revalidatePath(
    "/platform-admin/businesses"
  );

  revalidatePath(
    `/platform-admin/businesses/${slug}`
  );

  revalidatePath(
    `/salon/${slug}`
  );

  return NextResponse.json(
    {
      ok:
        true,
      alreadyApplied:
        false,
      applyKey,
      provisionedBy: {
        userId:
          access.context.userId,
        email:
          access.context.email,
      },
      result:
        data,
    },
    {
      status:
        201,
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}
