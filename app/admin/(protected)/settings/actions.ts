"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export type SettingsActionResult = {
  ok: boolean;
  message: string;
  entityId?: string;
};

export type SettingsLocalizedTextInput = {
  mk: string;
  sq: string;
  en: string;
};

export type SettingsThemeInput = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
};

export type SaveBusinessSettingsInput = {
  name: string;
  slug: string;

  tagline: SettingsLocalizedTextInput;
  description: SettingsLocalizedTextInput;

  address: SettingsLocalizedTextInput;
  city: SettingsLocalizedTextInput;
  country: SettingsLocalizedTextInput;

  phone?: string;
  email?: string;

  instagramHandle?: string;
  instagramUrl?: string;

  heroImageUrl?: string;
  logoUrl?: string;

  theme: SettingsThemeInput;

  defaultLocale: "mk" | "sq" | "en";
  currency: string;
  timezone: string;
};

export type SaveBookingSettingsInput = {
  slotIntervalMinutes: number;
  bookingWindowDays: number;
  minAdvanceMinutes: number;

  allowAnyEmployee: boolean;
  requireEmail: boolean;
  requirePhone: boolean;
  allowNotes: boolean;
  autoConfirm: boolean;
};

type IdRow = {
  id: string;
};

const HEX_COLOR_PATTERN =
  /^#[0-9A-Fa-f]{6}$/;

function normalizeText(
  value: string
): string {
  return value.trim();
}

function normalizeOptionalText(
  value: string | undefined
): string | null {
  const normalized =
    value?.trim() ?? "";

  return normalized.length > 0
    ? normalized
    : null;
}

function normalizeLocalizedText(
  value: SettingsLocalizedTextInput
): SettingsLocalizedTextInput {
  return {
    mk: value.mk.trim(),
    sq: value.sq.trim(),
    en: value.en.trim(),
  };
}

function localizedTextExceedsLength(
  value: SettingsLocalizedTextInput,
  maximumLength: number
): boolean {
  return Object.values(value).some(
    (text) =>
      text.length > maximumLength
  );
}

function normalizeSlug(
  value: string
): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function isValidEmail(
  value: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

function isValidHttpUrl(
  value: string
): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

function isValidTimezone(
  value: string
): boolean {
  try {
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: value,
      }
    ).format();

    return true;
  } catch {
    return false;
  }
}

function isValidDefaultLocale(
  value: string
): value is "mk" | "sq" | "en" {
  return (
    value === "mk" ||
    value === "sq" ||
    value === "en"
  );
}

function isIntegerWithinRange(
  value: number,
  minimum: number,
  maximum: number
): boolean {
  return (
    Number.isInteger(value) &&
    value >= minimum &&
    value <= maximum
  );
}

function isValidThemeInput(
  value: unknown
): value is SettingsThemeInput {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const theme =
    value as Record<string, unknown>;

  const keys: Array<
    keyof SettingsThemeInput
  > = [
    "primary",
    "secondary",
    "background",
    "surface",
    "text",
    "muted",
    "border",
  ];

  return keys.every(
    (key) =>
      typeof theme[key] === "string" &&
      HEX_COLOR_PATTERN.test(
        theme[key] as string
      )
  );
}

function normalizeTheme(
  value: SettingsThemeInput
): SettingsThemeInput {
  return {
    primary:
      value.primary.toUpperCase(),

    secondary:
      value.secondary.toUpperCase(),

    background:
      value.background.toUpperCase(),

    surface:
      value.surface.toUpperCase(),

    text:
      value.text.toUpperCase(),

    muted:
      value.muted.toUpperCase(),

    border:
      value.border.toUpperCase(),
  };
}

function refreshSettingsPages() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/schedule");

  revalidatePath("/api/catalog");
  revalidatePath("/api/availability");
  revalidatePath("/api/bookings");
}

export async function saveBusinessSettingsAction(
  input: SaveBusinessSettingsInput
): Promise<SettingsActionResult> {
  const admin = await requireAdmin();

  const name =
    normalizeText(input.name);

  if (
    name.length < 2 ||
    name.length > 160
  ) {
    return {
      ok: false,
      message:
        "Naziv salona mora imati između 2 i 160 karaktera.",
    };
  }

  const slug =
    normalizeSlug(input.slug);

  if (
    slug.length < 2 ||
    slug.length > 120
  ) {
    return {
      ok: false,
      message:
        "Slug mora imati između 2 i 120 karaktera.",
    };
  }

  const tagline =
    normalizeLocalizedText(
      input.tagline
    );

  const description =
    normalizeLocalizedText(
      input.description
    );

  const address =
    normalizeLocalizedText(
      input.address
    );

  const city =
    normalizeLocalizedText(
      input.city
    );

  const country =
    normalizeLocalizedText(
      input.country
    );

  if (
    localizedTextExceedsLength(
      tagline,
      300
    )
  ) {
    return {
      ok: false,
      message:
        "Tagline može imati najviše 300 karaktera po jeziku.",
    };
  }

  if (
    localizedTextExceedsLength(
      description,
      5000
    )
  ) {
    return {
      ok: false,
      message:
        "Opis može imati najviše 5000 karaktera po jeziku.",
    };
  }

  if (
    localizedTextExceedsLength(
      address,
      500
    ) ||
    localizedTextExceedsLength(
      city,
      200
    ) ||
    localizedTextExceedsLength(
      country,
      200
    )
  ) {
    return {
      ok: false,
      message:
        "Podaci o lokaciji su predugački.",
    };
  }

  const phone =
    normalizeOptionalText(
      input.phone
    );

  const email =
    normalizeOptionalText(
      input.email
    );

  const instagramHandle =
    normalizeOptionalText(
      input.instagramHandle
    );

  const instagramUrl =
    normalizeOptionalText(
      input.instagramUrl
    );

  const heroImageUrl =
    normalizeOptionalText(
      input.heroImageUrl
    );

  const logoUrl =
    normalizeOptionalText(
      input.logoUrl
    );

  if (
    phone &&
    phone.length > 80
  ) {
    return {
      ok: false,
      message:
        "Broj telefona može imati najviše 80 karaktera.",
    };
  }

  if (
    email &&
    (!isValidEmail(email) ||
      email.length > 320)
  ) {
    return {
      ok: false,
      message:
        "Email adresa nije ispravna.",
    };
  }

  if (
    instagramHandle &&
    instagramHandle.length > 120
  ) {
    return {
      ok: false,
      message:
        "Instagram korisničko ime je predugačko.",
    };
  }

  const urlFields = [
    {
      value: instagramUrl,
      label: "Instagram URL",
    },
    {
      value: heroImageUrl,
      label: "Link hero fotografije",
    },
    {
      value: logoUrl,
      label: "Link logotipa",
    },
  ];

  for (const field of urlFields) {
    if (
      field.value &&
      (!isValidHttpUrl(field.value) ||
        field.value.length > 2000)
    ) {
      return {
        ok: false,
        message: `${field.label} nije ispravan.`,
      };
    }
  }

  if (
    !isValidThemeInput(
      input.theme
    )
  ) {
    return {
      ok: false,
      message:
        "Sve Brand Kit boje moraju biti u HEX formatu, na primer #D6B98C.",
    };
  }

  const theme =
    normalizeTheme(input.theme);

  if (
    !isValidDefaultLocale(
      input.defaultLocale
    )
  ) {
    return {
      ok: false,
      message:
        "Podrazumevani jezik nije ispravan.",
    };
  }

  const currency = input.currency
    .trim()
    .toUpperCase();

  if (
    !/^[A-Z]{3}$/.test(currency)
  ) {
    return {
      ok: false,
      message:
        "Valuta mora biti ISO oznaka od tačno 3 slova, na primer EUR ili MKD.",
    };
  }

  const timezone =
    input.timezone.trim();

  if (
    timezone.length < 3 ||
    timezone.length > 100 ||
    !isValidTimezone(timezone)
  ) {
    return {
      ok: false,
      message:
        "Vremenska zona nije ispravna.",
    };
  }

  const supabase =
    await createClient();

  const {
    data: duplicateBusiness,
    error: duplicateError,
  } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", slug)
    .neq("id", admin.business.id)
    .limit(1)
    .maybeSingle();

  if (duplicateError) {
    return {
      ok: false,
      message:
        "Nije moguće proveriti dostupnost sluga.",
    };
  }

  if (duplicateBusiness) {
    return {
      ok: false,
      message:
        "Ovaj slug već koristi drugi salon.",
    };
  }

  const {
    data: businessData,
    error: businessError,
  } = await supabase
    .from("businesses")
    .update({
      name,
      slug,

      tagline,
      description,

      address,
      city,
      country,

      phone,
      email,

      instagram_handle:
        instagramHandle,

      instagram_url:
        instagramUrl,

      hero_image_url:
        heroImageUrl,

      logo_url:
        logoUrl,

      brand_primary:
        theme.primary,

      brand_secondary:
        theme.secondary,

      brand_background:
        theme.background,

      brand_surface:
        theme.surface,

      brand_text:
        theme.text,

      brand_muted:
        theme.muted,

      brand_border:
        theme.border,

      default_locale:
        input.defaultLocale,

      currency,
      timezone,

      updated_at:
        new Date().toISOString(),
    })
    .eq("id", admin.business.id)
    .select("id")
    .single();

  if (
    businessError ||
    !businessData
  ) {
    return {
      ok: false,
      message:
        "Podešavanja salona nisu sačuvana.",
    };
  }

  const business =
    businessData as unknown as IdRow;

  refreshSettingsPages();

  return {
    ok: true,
    entityId: business.id,
    message:
      "Podaci salona i Brand Kit su uspešno sačuvani.",
  };
}

export async function saveBookingSettingsAction(
  input: SaveBookingSettingsInput
): Promise<SettingsActionResult> {
  const admin = await requireAdmin();

  if (
    !isIntegerWithinRange(
      input.slotIntervalMinutes,
      5,
      240
    )
  ) {
    return {
      ok: false,
      message:
        "Interval termina mora biti ceo broj između 5 i 240 minuta.",
    };
  }

  if (
    !isIntegerWithinRange(
      input.bookingWindowDays,
      1,
      365
    )
  ) {
    return {
      ok: false,
      message:
        "Period zakazivanja mora biti između 1 i 365 dana.",
    };
  }

  if (
    !isIntegerWithinRange(
      input.minAdvanceMinutes,
      0,
      10080
    )
  ) {
    return {
      ok: false,
      message:
        "Minimalno vreme unapred mora biti između 0 i 10080 minuta.",
    };
  }

  if (
    typeof input.allowAnyEmployee !==
      "boolean" ||
    typeof input.requireEmail !==
      "boolean" ||
    typeof input.requirePhone !==
      "boolean" ||
    typeof input.allowNotes !==
      "boolean" ||
    typeof input.autoConfirm !==
      "boolean"
  ) {
    return {
      ok: false,
      message:
        "Jedno ili više booking pravila nije ispravno.",
    };
  }

  if (
    !input.requirePhone &&
    !input.requireEmail
  ) {
    return {
      ok: false,
      message:
        "Najmanje telefon ili email moraju biti obavezni.",
    };
  }

  const supabase =
    await createClient();

  const {
    data: bookingData,
    error: bookingError,
  } = await supabase
    .from("booking_settings")
    .upsert(
      {
        business_id:
          admin.business.id,

        slot_interval_minutes:
          input.slotIntervalMinutes,

        booking_window_days:
          input.bookingWindowDays,

        min_advance_minutes:
          input.minAdvanceMinutes,

        allow_any_employee:
          input.allowAnyEmployee,

        require_email:
          input.requireEmail,

        require_phone:
          input.requirePhone,

        allow_notes:
          input.allowNotes,

        auto_confirm:
          input.autoConfirm,

        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "business_id",
      }
    )
    .select("business_id")
    .single();

  if (
    bookingError ||
    !bookingData
  ) {
    return {
      ok: false,
      message:
        "Booking pravila nisu sačuvana.",
    };
  }

  refreshSettingsPages();

  return {
    ok: true,
    entityId:
      admin.business.id,

    message:
      "Booking pravila su uspešno sačuvana.",
  };
}
