import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  LocalizedText,
  ThemeColors,
} from "@/lib/types";

export type AdminDefaultLocale =
  | "mk"
  | "sq"
  | "en";

export type AdminBusinessSettings = {
  id: string;

  slug: string;
  name: string;

  tagline: LocalizedText;
  description: LocalizedText;

  address: LocalizedText;
  city: LocalizedText;
  country: LocalizedText;

  phone: string | null;
  email: string | null;

  instagramHandle: string | null;
  instagramUrl: string | null;

  heroImageUrl: string | null;
  logoUrl: string | null;

  theme: ThemeColors;

  defaultLocale: AdminDefaultLocale;
  currency: string;
  timezone: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

export type AdminBookingSettings = {
  businessId: string;

  slotIntervalMinutes: number;
  bookingWindowDays: number;
  minAdvanceMinutes: number;

  allowAnyEmployee: boolean;
  requireEmail: boolean;
  requirePhone: boolean;
  allowNotes: boolean;
  autoConfirm: boolean;

  createdAt: string;
  updatedAt: string;
};

export type AdminGoogleCalendarSettings = {
  connected: boolean;
  isActive: boolean;

  accountEmail: string | null;

  calendarId: string | null;
  calendarName: string | null;

  connectedAt: string | null;
  lastSyncedAt: string | null;

  lastError: string | null;
};

export type AdminSettingsResult = {
  business: AdminBusinessSettings;
  booking: AdminBookingSettings;

  googleCalendar: AdminGoogleCalendarSettings;

  summary: {
    bookingWindowHours: number;
    minimumAdvanceHours: number;
    estimatedDailySlotStarts: number;
  };
};

type BusinessDatabaseRow = {
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

  instagram_handle: string | null;
  instagram_url: string | null;

  hero_image_url: string | null;
  logo_url: string | null;

  brand_primary: string;
  brand_secondary: string;
  brand_background: string;
  brand_surface: string;
  brand_text: string;
  brand_muted: string;
  brand_border: string;

  default_locale: string;
  currency: string;
  timezone: string;

  is_active: boolean;

  created_at: string;
  updated_at: string;
};

type BookingSettingsDatabaseRow = {
  business_id: string;

  slot_interval_minutes: number;
  booking_window_days: number;
  min_advance_minutes: number;

  allow_any_employee: boolean;
  require_email: boolean;
  require_phone: boolean;
  allow_notes: boolean;
  auto_confirm: boolean;

  created_at: string;
  updated_at: string;
};

type GoogleCalendarConnectionDatabaseRow = {
  business_id: string;

  google_account_email:
    | string
    | null;

  calendar_id:
    | string
    | null;

  calendar_name:
    | string
    | null;

  is_active: boolean;

  connected_at:
    | string
    | null;

  last_synced_at:
    | string
    | null;

  last_error:
    | string
    | null;
};

function normalizeLocalizedText(
  value: unknown
): LocalizedText {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return {
      mk: "",
      sq: "",
      en: "",
    };
  }

  const record =
    value as Record<
      string,
      unknown
    >;

  return {
    mk:
      typeof record.mk ===
      "string"
        ? record.mk
        : "",

    sq:
      typeof record.sq ===
      "string"
        ? record.sq
        : "",

    en:
      typeof record.en ===
      "string"
        ? record.en
        : "",
  };
}

function normalizeDefaultLocale(
  value: string
): AdminDefaultLocale {
  if (
    value === "mk" ||
    value === "sq" ||
    value === "en"
  ) {
    return value;
  }

  return "mk";
}

function normalizeCurrency(
  value: string
): string {
  return value
    .trim()
    .toUpperCase();
}

function calculateEstimatedDailySlotStarts(
  slotIntervalMinutes: number
): number {
  const assumedWorkingMinutes =
    8 * 60;

  if (
    slotIntervalMinutes <= 0
  ) {
    return 0;
  }

  return Math.floor(
    assumedWorkingMinutes /
      slotIntervalMinutes
  );
}

export async function getAdminSettings(): Promise<AdminSettingsResult> {
  const admin =
    await requireAdmin();

  const supabase =
    createAdminClient();

  const [
    businessResult,
    bookingSettingsResult,
    googleCalendarResult,
  ] = await Promise.all([
    supabase
      .from("businesses")
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
          instagram_handle,
          instagram_url,
          hero_image_url,
          logo_url,
          brand_primary,
          brand_secondary,
          brand_background,
          brand_surface,
          brand_text,
          brand_muted,
          brand_border,
          default_locale,
          currency,
          timezone,
          is_active,
          created_at,
          updated_at
        `
      )
      .eq(
        "id",
        admin.business.id
      )
      .single(),

    supabase
      .from(
        "booking_settings"
      )
      .select(
        `
          business_id,
          slot_interval_minutes,
          booking_window_days,
          min_advance_minutes,
          allow_any_employee,
          require_email,
          require_phone,
          allow_notes,
          auto_confirm,
          created_at,
          updated_at
        `
      )
      .eq(
        "business_id",
        admin.business.id
      )
      .single(),

    supabase
      .from(
        "google_calendar_connections"
      )
      .select(
        `
          business_id,
          google_account_email,
          calendar_id,
          calendar_name,
          is_active,
          connected_at,
          last_synced_at,
          last_error
        `
      )
      .eq(
        "business_id",
        admin.business.id
      )
      .maybeSingle(),
  ]);

  if (
    businessResult.error ||
    !businessResult.data
  ) {
    throw new Error(
      "Nije moguće učitati podešavanja salona."
    );
  }

  if (
    bookingSettingsResult.error ||
    !bookingSettingsResult.data
  ) {
    throw new Error(
      "Nije moguće učitati booking podešavanja."
    );
  }

  if (
    googleCalendarResult.error
  ) {
    throw new Error(
      "Nije moguće učitati Google Calendar konekciju."
    );
  }

  const businessRow =
    businessResult
      .data as unknown as BusinessDatabaseRow;

  const bookingRow =
    bookingSettingsResult
      .data as unknown as BookingSettingsDatabaseRow;

  const googleCalendarRow =
    googleCalendarResult.data
      ? googleCalendarResult
          .data as unknown as GoogleCalendarConnectionDatabaseRow
      : null;

  const business: AdminBusinessSettings = {
    id: businessRow.id,

    slug:
      businessRow.slug,

    name:
      businessRow.name,

    tagline:
      normalizeLocalizedText(
        businessRow.tagline
      ),

    description:
      normalizeLocalizedText(
        businessRow.description
      ),

    address:
      normalizeLocalizedText(
        businessRow.address
      ),

    city:
      normalizeLocalizedText(
        businessRow.city
      ),

    country:
      normalizeLocalizedText(
        businessRow.country
      ),

    phone:
      businessRow.phone,

    email:
      businessRow.email,

    instagramHandle:
      businessRow
        .instagram_handle,

    instagramUrl:
      businessRow
        .instagram_url,

    heroImageUrl:
      businessRow
        .hero_image_url,

    logoUrl:
      businessRow.logo_url,

    theme: {
      primary:
        businessRow.brand_primary,

      secondary:
        businessRow.brand_secondary,

      background:
        businessRow.brand_background,

      surface:
        businessRow.brand_surface,

      text:
        businessRow.brand_text,

      muted:
        businessRow.brand_muted,

      border:
        businessRow.brand_border,
    },

    defaultLocale:
      normalizeDefaultLocale(
        businessRow
          .default_locale
      ),

    currency:
      normalizeCurrency(
        businessRow.currency
      ),

    timezone:
      businessRow.timezone,

    isActive:
      businessRow.is_active,

    createdAt:
      businessRow.created_at,

    updatedAt:
      businessRow.updated_at,
  };

  const booking: AdminBookingSettings = {
    businessId:
      bookingRow.business_id,

    slotIntervalMinutes:
      bookingRow
        .slot_interval_minutes,

    bookingWindowDays:
      bookingRow
        .booking_window_days,

    minAdvanceMinutes:
      bookingRow
        .min_advance_minutes,

    allowAnyEmployee:
      bookingRow
        .allow_any_employee,

    requireEmail:
      bookingRow.require_email,

    requirePhone:
      bookingRow.require_phone,

    allowNotes:
      bookingRow.allow_notes,

    autoConfirm:
      bookingRow.auto_confirm,

    createdAt:
      bookingRow.created_at,

    updatedAt:
      bookingRow.updated_at,
  };

  const googleCalendar: AdminGoogleCalendarSettings =
    {
      connected:
        Boolean(
          googleCalendarRow &&
            googleCalendarRow.is_active
        ),

      isActive:
        googleCalendarRow
          ?.is_active ?? false,

      accountEmail:
        googleCalendarRow
          ?.google_account_email ??
        null,

      calendarId:
        googleCalendarRow
          ?.calendar_id ?? null,

      calendarName:
        googleCalendarRow
          ?.calendar_name ?? null,

      connectedAt:
        googleCalendarRow
          ?.connected_at ?? null,

      lastSyncedAt:
        googleCalendarRow
          ?.last_synced_at ??
        null,

      lastError:
        googleCalendarRow
          ?.last_error ?? null,
    };

  return {
    business,
    booking,
    googleCalendar,

    summary: {
      bookingWindowHours:
        booking.bookingWindowDays *
        24,

      minimumAdvanceHours:
        booking.minAdvanceMinutes /
        60,

      estimatedDailySlotStarts:
        calculateEstimatedDailySlotStarts(
          booking.slotIntervalMinutes
        ),
    },
  };
}