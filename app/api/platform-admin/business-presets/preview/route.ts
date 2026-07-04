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
  getBusinessPresetOptions,
  materializeBusinessPreset,
  type BusinessPresetCurrency,
  type BusinessPresetKey,
  type BusinessPresetLocale,
} from "@/lib/business-presets";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

type PreviewRequestBody = {
  presetKey?: unknown;
  locale?: unknown;
  currency?: unknown;
  supportedLocales?: unknown;
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

function normalizePresetKey(
  value: unknown
): BusinessPresetKey | null {
  if (
    typeof value !==
      "string"
  ) {
    return null;
  }

  const normalizedValue =
    value
      .trim()
      .toLowerCase()
      .replaceAll(
        "_",
        "-"
      )
      .replace(/\s+/g, "-");

  switch (
    normalizedValue
  ) {
    case "hair-salon":
    case "hairsalon":
    case "salon":
    case "frizerski-salon":
    case "frizerskisalon":
      return "hair-salon";

    case "barbershop":
    case "barber-shop":
    case "barber":
    case "berbernica":
      return "barbershop";

    default:
      return null;
  }
}

function normalizePresetLocale(
  value: unknown,
  fallback:
    BusinessPresetLocale =
      "sr-Latn"
): BusinessPresetLocale {
  if (
    typeof value !==
      "string"
  ) {
    return fallback;
  }

  const normalizedValue =
    value
      .trim()
      .replaceAll(
        "_",
        "-"
      )
      .toLowerCase();

  switch (
    normalizedValue
  ) {
    case "sr":
    case "sr-rs":
    case "sr-latn":
    case "sr-latn-rs":
      return "sr-Latn";

    case "en":
    case "en-gb":
    case "en-us":
      return "en";

    case "de":
    case "de-de":
    case "de-at":
    case "de-ch":
      return "de";

    default:
      return fallback;
  }
}

function normalizePresetCurrency(
  value: unknown,
  fallback:
    BusinessPresetCurrency =
      "RSD"
): BusinessPresetCurrency {
  if (
    typeof value !==
      "string"
  ) {
    return fallback;
  }

  const normalizedValue =
    value
      .trim()
      .toUpperCase();

  if (
    BUSINESS_PRESET_CURRENCIES.includes(
      normalizedValue as
        BusinessPresetCurrency
    )
  ) {
    return normalizedValue as
      BusinessPresetCurrency;
  }

  return fallback;
}

function normalizeSupportedLocales(
  value: unknown,
  defaultLocale:
    BusinessPresetLocale
): BusinessPresetLocale[] {
  const normalizedLocales:
    BusinessPresetLocale[] =
      [];

  if (
    Array.isArray(
      value
    )
  ) {
    for (
      const requestedLocale of
      value
    ) {
      if (
        typeof requestedLocale !==
          "string" ||
        requestedLocale
          .trim()
          .length ===
          0
      ) {
        continue;
      }

      const normalizedLocale =
        normalizePresetLocale(
          requestedLocale,
          defaultLocale
        );

      if (
        !normalizedLocales.includes(
          normalizedLocale
        )
      ) {
        normalizedLocales.push(
          normalizedLocale
        );
      }
    }
  }

  if (
    !normalizedLocales.includes(
      defaultLocale
    )
  ) {
    normalizedLocales.unshift(
      defaultLocale
    );
  }

  return normalizedLocales;
}

function describeReceivedValue(
  value: unknown
): string {
  if (
    value ===
      undefined
  ) {
    return "undefined";
  }

  if (
    value ===
      null
  ) {
    return "null";
  }

  if (
    typeof value ===
      "string"
  ) {
    return JSON.stringify(
      value
    );
  }

  try {
    return JSON.stringify(
      value
    );
  } catch {
    return typeof value;
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

function successResponse(
  payload:
    Record<string, unknown>
) {
  return NextResponse.json(
    {
      ok: true,
      ...payload,
    },
    {
      status: 200,

      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}

async function authorizePlatformAdmin() {
  const access =
    await getPlatformAdminAccess();

  if (
    "context" in
    access
  ) {
    return null;
  }

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
    "Nemaš dozvolu za pristup Platform Admin panelu.",
    "PLATFORM_ADMIN_FORBIDDEN"
  );
}

function createPreview({
  presetKey,
  locale,
  currency,
  supportedLocales,
}: {
  presetKey:
    BusinessPresetKey;

  locale:
    BusinessPresetLocale;

  currency:
    BusinessPresetCurrency;

  supportedLocales:
    readonly BusinessPresetLocale[];
}) {
  return materializeBusinessPreset({
    presetKey,
    locale,
    currency,
    supportedLocales,
  });
}

export async function GET(
  request: NextRequest
) {
  const authorizationError =
    await authorizePlatformAdmin();

  if (
    authorizationError
  ) {
    return authorizationError;
  }

  const searchParams =
    request.nextUrl.searchParams;

  const locale =
    normalizePresetLocale(
      searchParams.get(
        "locale"
      )
    );

  const rawPresetKey =
    searchParams.get(
      "presetKey"
    );

  if (!rawPresetKey) {
    return successResponse({
      locale,

      presets:
        getBusinessPresetOptions(
          locale
        ),

      locales: [
        ...BUSINESS_PRESET_LOCALES,
      ],

      currencies: [
        ...BUSINESS_PRESET_CURRENCIES,
      ],
    });
  }

  const presetKey =
    normalizePresetKey(
      rawPresetKey
    );

  if (!presetKey) {
    return errorResponse(
      400,
      [
        "Izabrani poslovni preset nije podržan.",
        "Primljeno:",
        describeReceivedValue(
          rawPresetKey
        ),
      ].join(" "),
      "INVALID_BUSINESS_PRESET"
    );
  }

  const currency =
    normalizePresetCurrency(
      searchParams.get(
        "currency"
      )
    );

  const rawSupportedLocales =
    searchParams.get(
      "supportedLocales"
    );

  const requestedLocales =
    rawSupportedLocales
      ? rawSupportedLocales
          .split(",")
          .map(
            (value) =>
              value.trim()
          )
          .filter(
            (value) =>
              value.length >
              0
          )
      : [];

  const supportedLocales =
    normalizeSupportedLocales(
      requestedLocales,
      locale
    );

  try {
    const preview =
      createPreview({
        presetKey,
        locale,
        currency,
        supportedLocales,
      });

    return successResponse({
      preview,

      normalizedInput: {
        presetKey,
        locale,
        currency,
        supportedLocales,
      },
    });
  } catch (error) {
    console.error(
      "Failed to materialize business preset preview:",
      error
    );

    return errorResponse(
      500,
      "Nije moguće napraviti preview poslovnog preseta.",
      "PRESET_MATERIALIZATION_FAILED"
    );
  }
}

export async function POST(
  request: NextRequest
) {
  const authorizationError =
    await authorizePlatformAdmin();

  if (
    authorizationError
  ) {
    return authorizationError;
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
      PreviewRequestBody;

  const presetKey =
    normalizePresetKey(
      body.presetKey
    );

  if (!presetKey) {
    console.warn(
      "Invalid business preset preview request:",
      {
        receivedPresetKey:
          body.presetKey,

        receivedLocale:
          body.locale,

        receivedCurrency:
          body.currency,

        receivedSupportedLocales:
          body.supportedLocales,
      }
    );

    return errorResponse(
      400,
      [
        "Izabrani poslovni preset nije podržan.",
        "Primljeno:",
        describeReceivedValue(
          body.presetKey
        ),
      ].join(" "),
      "INVALID_BUSINESS_PRESET"
    );
  }

  const locale =
    normalizePresetLocale(
      body.locale,
      "sr-Latn"
    );

  const currency =
    normalizePresetCurrency(
      body.currency,
      "RSD"
    );

  const supportedLocales =
    normalizeSupportedLocales(
      body.supportedLocales,
      locale
    );

  try {
    const preview =
      createPreview({
        presetKey,
        locale,
        currency,
        supportedLocales,
      });

    return successResponse({
      preview,

      normalizedInput: {
        presetKey,
        locale,
        currency,
        supportedLocales,
      },
    });
  } catch (error) {
    console.error(
      "Failed to materialize business preset preview:",
      error
    );

    return errorResponse(
      500,
      "Nije moguće pripremiti poslovni preset.",
      "PRESET_MATERIALIZATION_FAILED"
    );
  }
}