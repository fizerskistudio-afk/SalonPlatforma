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

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type UpdateBusinessProfileRequestBody = {
  businessSlug?: unknown;
  expectedUpdatedAt?: unknown;
  profile?: unknown;
};

type BusinessProfileInput = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  tagline?: unknown;
  description?: unknown;
  address?: unknown;
  city?: unknown;
  country?: unknown;
  isActive?: unknown;
};

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  tagline: unknown;
  description: unknown;
  address: unknown;
  city: unknown;
  country: unknown;
  phone: string | null;
  email: string | null;
  default_locale: string;
  is_active: boolean;
  updated_at: string;
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
    value !== null &&
    !Array.isArray(
      value
    )
  );
}

function getTrimmedString(
  value: unknown
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  return value.trim();
}

function normalizeOptionalString(
  value: unknown
): string | null {
  const normalizedValue =
    getTrimmedString(
      value
    );

  return normalizedValue &&
    normalizedValue.length >
      0
    ? normalizedValue
    : null;
}

function normalizeText(
  value: unknown
): string | null {
  const normalizedValue =
    getTrimmedString(
      value
    );

  return normalizedValue ??
    null;
}

function mergeLocalizedValue(
  currentValue: unknown,
  locale: string,
  nextValue: string
): Record<string, string> {
  const mergedValue:
    Record<string, string> = {};

  if (
    isJsonRecord(
      currentValue
    )
  ) {
    for (
      const [
        key,
        value,
      ] of Object.entries(
        currentValue
      )
    ) {
      if (
        typeof value ===
        "string"
      ) {
        mergedValue[key] =
          value;
      }
    }
  }

  for (
    const requiredLocale of
    [
      "mk",
      "sq",
      "en",
    ]
  ) {
    if (
      typeof mergedValue[
        requiredLocale
      ] !== "string"
    ) {
      mergedValue[
        requiredLocale
      ] = "";
    }
  }

  mergedValue[locale] =
    nextValue;

  return mergedValue;
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
        "Cache-Control":
          "no-store",
      },
    }
  );
}

export async function PUT(
  request: NextRequest
) {
  const access =
    await getPlatformAdminAccess(
      "tenant.profile.write"
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
      "Nemaš dozvolu za uređivanje salona.",
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
      UpdateBusinessProfileRequestBody;

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
    businessSlug.length >
      80 ||
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

  if (
    !expectedUpdatedAt
  ) {
    return errorResponse(
      400,
      "Nedostaje verzija podataka salona.",
      "MISSING_UPDATED_AT"
    );
  }

  if (
    !isJsonRecord(
      body.profile
    )
  ) {
    return errorResponse(
      400,
      "Podaci profila salona nisu ispravni.",
      "INVALID_PROFILE_DATA"
    );
  }

  const profile =
    body.profile as
      BusinessProfileInput;

  const name =
    getTrimmedString(
      profile.name
    );

  const phone =
    normalizeOptionalString(
      profile.phone
    );

  const email =
    normalizeOptionalString(
      profile.email
    );

  const tagline =
    normalizeText(
      profile.tagline
    );

  const description =
    normalizeText(
      profile.description
    );

  const address =
    normalizeText(
      profile.address
    );

  const city =
    normalizeText(
      profile.city
    );

  const country =
    normalizeText(
      profile.country
    );

  const isActive =
    profile.isActive;

  if (
    !name ||
    name.length < 2 ||
    name.length > 120
  ) {
    return errorResponse(
      400,
      "Naziv salona mora imati između 2 i 120 karaktera.",
      "INVALID_BUSINESS_NAME"
    );
  }

  if (
    phone &&
    phone.length > 40
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
      email.length > 254 ||
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
    tagline === null ||
    tagline.length > 240
  ) {
    return errorResponse(
      400,
      "Slogan salona može imati najviše 240 karaktera.",
      "INVALID_BUSINESS_TAGLINE"
    );
  }

  if (
    description === null ||
    description.length > 3000
  ) {
    return errorResponse(
      400,
      "Opis salona može imati najviše 3000 karaktera.",
      "INVALID_BUSINESS_DESCRIPTION"
    );
  }

  if (
    address === null ||
    address.length > 240
  ) {
    return errorResponse(
      400,
      "Adresa salona može imati najviše 240 karaktera.",
      "INVALID_BUSINESS_ADDRESS"
    );
  }

  if (
    city === null ||
    city.length > 120
  ) {
    return errorResponse(
      400,
      "Grad može imati najviše 120 karaktera.",
      "INVALID_BUSINESS_CITY"
    );
  }

  if (
    country === null ||
    country.length > 120
  ) {
    return errorResponse(
      400,
      "Država može imati najviše 120 karaktera.",
      "INVALID_BUSINESS_COUNTRY"
    );
  }

  if (
    typeof isActive !==
    "boolean"
  ) {
    return errorResponse(
      400,
      "Status salona nije ispravan.",
      "INVALID_BUSINESS_STATUS"
    );
  }

  try {
    const supabase =
      createAdminClient();

    const {
      data: businessData,
      error: businessError,
    } = await supabase
      .from(
        "businesses"
      )
      .select(
        `
          id,
          slug,
          name,
          tagline,
          description,
          address,
          city,
          country,
          phone,
          email,
          default_locale,
          is_active,
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
        "Failed to load business profile for update:",
        businessError
      );

      return errorResponse(
        500,
        "Nije moguće učitati salon.",
        "BUSINESS_QUERY_FAILED"
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
      businessData as
        unknown as
        BusinessRow;

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

    const updatePayload = {
      name,
      phone,
      email,

      tagline:
        mergeLocalizedValue(
          business.tagline,
          business.default_locale,
          tagline
        ),

      description:
        mergeLocalizedValue(
          business.description,
          business.default_locale,
          description
        ),

      address:
        mergeLocalizedValue(
          business.address,
          business.default_locale,
          address
        ),

      city:
        mergeLocalizedValue(
          business.city,
          business.default_locale,
          city
        ),

      country:
        mergeLocalizedValue(
          business.country,
          business.default_locale,
          country
        ),

      is_active:
        isActive,
    };

    const {
      data: updatedData,
      error: updateError,
    } = await supabase
      .from(
        "businesses"
      )
      .update(
        updatePayload
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
          slug,
          name,
          phone,
          email,
          default_locale,
          is_active,
          updated_at
        `
      )
      .maybeSingle();

    if (updateError) {
      console.error(
        "Failed to update business profile:",
        updateError
      );

      return errorResponse(
        500,
        "Izmene salona nisu mogle da se sačuvaju.",
        "BUSINESS_UPDATE_FAILED"
      );
    }

    if (!updatedData) {
      return errorResponse(
        409,
        "Podaci salona su promenjeni pre čuvanja. Osveži stranicu i pokušaj ponovo.",
        "BUSINESS_CHANGED"
      );
    }

    return NextResponse.json(
      {
        ok: true,

        updatedBy: {
          userId:
            access.context
              .userId,

          email:
            access.context
              .email,
        },

        business:
          updatedData,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Unexpected business profile update error:",
      error
    );

    return errorResponse(
      500,
      "Došlo je do neočekivane greške pri čuvanju salona.",
      "UNKNOWN_BUSINESS_UPDATE_ERROR"
    );
  }
}
