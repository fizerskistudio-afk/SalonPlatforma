import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  getPlatformAdminAccess,
} from "@/lib/auth/platform-admin";

import {
  BUSINESS_PRESET_CURRENCIES,
  BUSINESS_PRESET_LOCALES,
  isBusinessPresetKey,
  materializeBusinessPreset,
  type BusinessPresetCurrency,
  type BusinessPresetLocale,
} from "@/lib/business-presets";

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

type ProvisionRequestBody = {
  business?: unknown;
  presetKey?: unknown;
  locale?: unknown;
  currency?: unknown;
  supportedLocales?: unknown;
};

type ProvisionBusinessInput = {
  name?: unknown;
  slug?: unknown;
  city?: unknown;
  country?: unknown;
  phone?: unknown;
  email?: unknown;
  timezone?: unknown;
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

function isBusinessPresetLocale(
  value: unknown
): value is BusinessPresetLocale {
  return (
    typeof value ===
      "string" &&
    BUSINESS_PRESET_LOCALES.includes(
      value as
        BusinessPresetLocale
    )
  );
}

function isBusinessPresetCurrency(
  value: unknown
): value is BusinessPresetCurrency {
  return (
    typeof value ===
      "string" &&
    BUSINESS_PRESET_CURRENCIES.includes(
      value as
        BusinessPresetCurrency
    )
  );
}

function isSupportedLocaleList(
  value: unknown
): value is
  BusinessPresetLocale[] {
  return (
    Array.isArray(
      value
    ) &&
    value.length > 0 &&
    value.every(
      isBusinessPresetLocale
    )
  );
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

export async function POST(
  request: NextRequest
) {
  const access =
    await getPlatformAdminAccess();

  /*
   * Eksplicitna provera "context" polja omogućava
   * TypeScript-u da bezbedno suzi union tip.
   */
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
      "Nemaš dozvolu za provisioning salona.",
      "PLATFORM_ADMIN_FORBIDDEN"
    );
  }

  const platformAdmin =
    access.context;

  let bodyValue: unknown;

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
      ProvisionRequestBody;

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

  const businessInput =
    body.business as
      ProvisionBusinessInput;

  const name =
    getTrimmedString(
      businessInput.name
    );

  const slug =
    getTrimmedString(
      businessInput.slug
    );

  const city =
    getTrimmedString(
      businessInput.city
    );

  const country =
    getTrimmedString(
      businessInput.country
    );

  const phone =
    getTrimmedString(
      businessInput.phone
    );

  const timezone =
    getTrimmedString(
      businessInput.timezone
    );

  const rawEmail =
    getTrimmedString(
      businessInput.email
    );

  const email =
    rawEmail &&
    rawEmail.length > 0
      ? rawEmail.toLowerCase()
      : null;

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
    !slug ||
    slug.length > 80 ||
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
    !city ||
    city.length < 2 ||
    city.length > 100
  ) {
    return errorResponse(
      400,
      "Grad salona nije ispravan.",
      "INVALID_BUSINESS_CITY"
    );
  }

  if (
    !country ||
    country.length < 2 ||
    country.length > 100
  ) {
    return errorResponse(
      400,
      "Država salona nije ispravna.",
      "INVALID_BUSINESS_COUNTRY"
    );
  }

  if (
    !phone ||
    phone.length < 5 ||
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
    !timezone ||
    timezone.length > 100 ||
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
    !isBusinessPresetKey(
      body.presetKey
    )
  ) {
    return errorResponse(
      400,
      "Izabrani business preset nije podržan.",
      "INVALID_BUSINESS_PRESET"
    );
  }

  if (
    !isBusinessPresetLocale(
      body.locale
    )
  ) {
    return errorResponse(
      400,
      "Glavni jezik salona nije podržan.",
      "INVALID_BUSINESS_LOCALE"
    );
  }

  if (
    !isBusinessPresetCurrency(
      body.currency
    )
  ) {
    return errorResponse(
      400,
      "Valuta salona nije podržana.",
      "INVALID_BUSINESS_CURRENCY"
    );
  }

  if (
    !isSupportedLocaleList(
      body.supportedLocales
    )
  ) {
    return errorResponse(
      400,
      "Lista aktivnih jezika nije ispravna.",
      "INVALID_SUPPORTED_LOCALES"
    );
  }

  if (
    !body.supportedLocales.includes(
      body.locale
    )
  ) {
    return errorResponse(
      400,
      "Glavni jezik mora biti deo aktivnih jezika.",
      "DEFAULT_LOCALE_NOT_SUPPORTED"
    );
  }

  let preset:
    ReturnType<
      typeof materializeBusinessPreset
    >;

  try {
    preset =
      materializeBusinessPreset({
        presetKey:
          body.presetKey,

        locale:
          body.locale,

        currency:
          body.currency,

        supportedLocales:
          body.supportedLocales,
      });
  } catch (error) {
    console.error(
      "Failed to materialize provisioning preset:",
      error
    );

    return errorResponse(
      500,
      "Nije moguće pripremiti provisioning preset.",
      "PRESET_MATERIALIZATION_FAILED"
    );
  }

  try {
    const supabase =
      createAdminClient();

    const {
      data,
      error,
    } = await supabase.rpc(
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

    if (error) {
      console.error(
        "Business provisioning RPC failed:",
        error
      );

      if (
        error.code ===
          "23505"
      ) {
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
        "Provisioning salona nije uspeo.",
        "BUSINESS_PROVISIONING_FAILED"
      );
    }

    return NextResponse.json(
      {
        ok: true,

        provisionedBy: {
          userId:
            platformAdmin.userId,

          email:
            platformAdmin.email,
        },

        result:
          data,
      },
      {
        status: 201,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Unexpected business provisioning error:",
      error
    );

    return errorResponse(
      500,
      "Došlo je do neočekivane greške pri provisioningu.",
      "UNKNOWN_PROVISIONING_ERROR"
    );
  }
}