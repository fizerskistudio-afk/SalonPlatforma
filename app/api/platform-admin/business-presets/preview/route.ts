import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { requireAdmin } from "@/lib/auth/admin";
import {
  BUSINESS_PRESET_CURRENCIES,
  BUSINESS_PRESET_LOCALES,
  getBusinessPresetOptions,
  isBusinessPresetKey,
  materializeBusinessPreset,
  type BusinessPresetCurrency,
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
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isBusinessPresetLocale(
  value: unknown
): value is BusinessPresetLocale {
  return (
    typeof value === "string" &&
    BUSINESS_PRESET_LOCALES.includes(
      value as BusinessPresetLocale
    )
  );
}

function isBusinessPresetCurrency(
  value: unknown
): value is BusinessPresetCurrency {
  return (
    typeof value === "string" &&
    BUSINESS_PRESET_CURRENCIES.includes(
      value as BusinessPresetCurrency
    )
  );
}

function isSupportedLocaleList(
  value: unknown
): value is BusinessPresetLocale[] {
  return (
    Array.isArray(value) &&
    value.every(
      isBusinessPresetLocale
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
        "Cache-Control":
          "no-store",
      },
    }
  );
}

function successResponse(
  payload: Record<string, unknown>
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

function createPreview({
  presetKey,
  locale,
  currency,
  supportedLocales,
}: {
  presetKey: Parameters<
    typeof materializeBusinessPreset
  >[0]["presetKey"];

  locale: BusinessPresetLocale;

  currency:
    BusinessPresetCurrency;

  supportedLocales?:
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
  /*
   * Poziv je namerno izvan try/catch bloka.
   * Ako admin sesija nije validna,
   * Next.js redirect ka login stranici mora
   * slobodno da se izvrši.
   */
  await requireAdmin();

  const searchParams =
    request.nextUrl.searchParams;

  const rawLocale =
    searchParams.get(
      "locale"
    );

  const locale:
    BusinessPresetLocale =
      rawLocale === null
        ? "sr-Latn"
        : isBusinessPresetLocale(
              rawLocale
            )
          ? rawLocale
          : "sr-Latn";

  if (
    rawLocale !== null &&
    !isBusinessPresetLocale(
      rawLocale
    )
  ) {
    return errorResponse(
      400,
      "Jezik preseta nije podržan.",
      "INVALID_PRESET_LOCALE"
    );
  }

  const rawPresetKey =
    searchParams.get(
      "presetKey"
    );

  /*
   * Bez presetKey vraćamo metadata paket
   * koji će budući onboarding UI koristiti
   * za dropdown liste.
   */
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

  if (
    !isBusinessPresetKey(
      rawPresetKey
    )
  ) {
    return errorResponse(
      400,
      "Izabrani poslovni preset nije podržan.",
      "INVALID_BUSINESS_PRESET"
    );
  }

  const rawCurrency =
    searchParams.get(
      "currency"
    );

  const currency:
    BusinessPresetCurrency =
      rawCurrency === null
        ? "RSD"
        : isBusinessPresetCurrency(
              rawCurrency
            )
          ? rawCurrency
          : "RSD";

  if (
    rawCurrency !== null &&
    !isBusinessPresetCurrency(
      rawCurrency
    )
  ) {
    return errorResponse(
      400,
      "Valuta preseta nije podržana.",
      "INVALID_PRESET_CURRENCY"
    );
  }

  const rawSupportedLocales =
    searchParams.get(
      "supportedLocales"
    );

  let supportedLocales:
    BusinessPresetLocale[] |
    undefined;

  if (rawSupportedLocales) {
    const requestedLocales =
      rawSupportedLocales
        .split(",")
        .map(
          (value) =>
            value.trim()
        )
        .filter(
          (value) =>
            value.length > 0
        );

    if (
      requestedLocales.length === 0 ||
      !requestedLocales.every(
        isBusinessPresetLocale
      )
    ) {
      return errorResponse(
        400,
        "Lista podržanih jezika nije ispravna.",
        "INVALID_SUPPORTED_LOCALES"
      );
    }

    supportedLocales =
      requestedLocales;
  }

  try {
    const preview =
      createPreview({
        presetKey:
          rawPresetKey,

        locale,

        currency,

        supportedLocales,
      });

    return successResponse({
      preview,
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
  await requireAdmin();

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
    bodyValue as PreviewRequestBody;

  if (
    !isBusinessPresetKey(
      body.presetKey
    )
  ) {
    return errorResponse(
      400,
      "Izabrani poslovni preset nije podržan.",
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
      "Jezik preseta nije podržan.",
      "INVALID_PRESET_LOCALE"
    );
  }

  if (
    !isBusinessPresetCurrency(
      body.currency
    )
  ) {
    return errorResponse(
      400,
      "Valuta preseta nije podržana.",
      "INVALID_PRESET_CURRENCY"
    );
  }

  if (
    body.supportedLocales !==
      undefined &&
    !isSupportedLocaleList(
      body.supportedLocales
    )
  ) {
    return errorResponse(
      400,
      "Lista podržanih jezika nije ispravna.",
      "INVALID_SUPPORTED_LOCALES"
    );
  }

  try {
    const preview =
      createPreview({
        presetKey:
          body.presetKey,

        locale:
          body.locale,

        currency:
          body.currency,

        supportedLocales:
          body.supportedLocales,
      });

    return successResponse({
      preview,
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