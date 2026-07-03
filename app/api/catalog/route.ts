import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { DEFAULT_BUSINESS_SLUG } from "@/lib/business/defaults";
import {
  isLocaleCode,
  normalizeLocaleList,
} from "@/lib/i18n/locales";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ContentLocale,
  LocalizedText,
  UiLocale,
} from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type ServiceCategoryIcon =
  | "scissors"
  | "palette"
  | "sparkles"
  | "heart"
  | "hand";

type ServicePriceType =
  | "fixed"
  | "from"
  | "range";

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
  instagram_handle: string | null;
  instagram_url: string | null;
  hero_image_url: string | null;
  logo_url: string | null;
  default_locale: string;
  supported_locales:
    | string[]
    | null;
  currency: string;
  timezone: string;

  brand_primary: string;
  brand_secondary: string;
  brand_background: string;
  brand_surface: string;
  brand_text: string;
  brand_muted: string;
  brand_border: string;
};

type BookingSettingsRow = {
  slot_interval_minutes: number;
  booking_window_days: number;
  min_advance_minutes: number;
  allow_any_employee: boolean;
  require_email: boolean;
  require_phone: boolean;
  allow_notes: boolean;
  auto_confirm: boolean;
};

type ServiceCategoryRow = {
  id: string;
  slug: string;
  name: unknown;
  description: unknown;
  icon_key: string | null;
  sort_order: number;
  is_active: boolean;
};

type ServiceRow = {
  id: string;
  category_id: string;
  slug: string;
  name: unknown;
  description: unknown;
  duration_minutes: number;
  price_type: string;
  price_from: number | string;
  price_to: number | string | null;
  sort_order: number;
  is_active: boolean;
};

type EmployeeRow = {
  id: string;
  slug: string;
  name: string;
  title: unknown;
  bio: unknown;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

type EmployeeServiceRow = {
  employee_id: string;
  service_id: string;
  custom_duration_minutes:
    | number
    | null;
  custom_price_from:
    | number
    | string
    | null;
  is_active: boolean;
};

type WorkingHoursRow = {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

type GalleryItemRow = {
  id: string;
  image_url: string;
  category: string;
  alt: unknown;
  sort_order: number;
  is_active: boolean;
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function toLocalizedText(
  value: unknown
): LocalizedText {
  const localizedText:
    LocalizedText = {
      mk: "",
      sq: "",
      en: "",
    };

  if (!isRecord(value)) {
    return localizedText;
  }

  for (
    const [
      locale,
      translatedValue,
    ] of Object.entries(value)
  ) {
    if (
      isLocaleCode(locale) &&
      typeof translatedValue ===
        "string"
    ) {
      localizedText[locale] =
        translatedValue;
    }
  }

  return localizedText;
}

function toContentLocale(
  value: string
): ContentLocale {
  return isLocaleCode(value)
    ? value
    : "en";
}

function isUiLocale(
  value: ContentLocale
): value is UiLocale {
  return (
    value === "mk" ||
    value === "sq" ||
    value === "en"
  );
}

function toUiLocales(
  contentLocales:
    readonly ContentLocale[]
): UiLocale[] {
  const uiLocales =
    contentLocales.filter(
      isUiLocale
    );

  return uiLocales.length > 0
    ? uiLocales
    : ["en"];
}

function toDefaultUiLocale(
  defaultContentLocale:
    ContentLocale,
  supportedUiLocales:
    readonly UiLocale[]
): UiLocale {
  if (
    isUiLocale(
      defaultContentLocale
    ) &&
    supportedUiLocales.includes(
      defaultContentLocale
    )
  ) {
    return defaultContentLocale;
  }

  return (
    supportedUiLocales[0] ??
    "en"
  );
}

function toCategoryIcon(
  value: string | null
): ServiceCategoryIcon {
  switch (value) {
    case "palette":
    case "sparkles":
    case "heart":
    case "hand":
    case "scissors":
      return value;

    default:
      return "scissors";
  }
}

function toPriceType(
  value: string
): ServicePriceType {
  switch (value) {
    case "from":
    case "range":
    case "fixed":
      return value;

    default:
      return "fixed";
  }
}

function toNumber(
  value: number | string
): number {
  const parsedValue =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
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

export async function GET(
  request: NextRequest
) {
  try {
    const businessSlug =
      request.nextUrl.searchParams.get(
        "businessSlug"
      ) ?? DEFAULT_BUSINESS_SLUG;

    if (
      !SLUG_PATTERN.test(
        businessSlug
      )
    ) {
      return errorResponse(
        400,
        "Invalid business slug.",
        "INVALID_BUSINESS_SLUG"
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
          default_locale,
          supported_locales,
          currency,
          timezone,
          brand_primary,
          brand_secondary,
          brand_background,
          brand_surface,
          brand_text,
          brand_muted,
          brand_border
        `
      )
      .eq("slug", businessSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (businessError) {
      console.error(
        "Failed to load catalog business:",
        businessError
      );

      return errorResponse(
        500,
        "Failed to load business.",
        "BUSINESS_QUERY_FAILED"
      );
    }

    if (!businessData) {
      return errorResponse(
        404,
        "Active business was not found.",
        "BUSINESS_NOT_FOUND"
      );
    }

    const business =
      businessData as unknown as BusinessRow;

    const defaultContentLocale =
      toContentLocale(
        business.default_locale
      );

    const supportedContentLocales =
      normalizeLocaleList(
        business.supported_locales ??
          [],
        defaultContentLocale
      );

    if (
      !supportedContentLocales.includes(
        defaultContentLocale
      )
    ) {
      supportedContentLocales.unshift(
        defaultContentLocale
      );
    }

    const supportedUiLocales =
      toUiLocales(
        supportedContentLocales
      );

    const defaultUiLocale =
      toDefaultUiLocale(
        defaultContentLocale,
        supportedUiLocales
      );

    const [
      settingsResult,
      categoriesResult,
      servicesResult,
      employeesResult,
      employeeServicesResult,
      workingHoursResult,
      galleryResult,
    ] = await Promise.all([
      supabase
        .from("booking_settings")
        .select(
          "slot_interval_minutes, booking_window_days, min_advance_minutes, allow_any_employee, require_email, require_phone, allow_notes, auto_confirm"
        )
        .eq(
          "business_id",
          business.id
        )
        .maybeSingle(),

      supabase
        .from("service_categories")
        .select(
          "id, slug, name, description, icon_key, sort_order, is_active"
        )
        .eq(
          "business_id",
          business.id
        )
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true,
        }),

      supabase
        .from("services")
        .select(
          "id, category_id, slug, name, description, duration_minutes, price_type, price_from, price_to, sort_order, is_active"
        )
        .eq(
          "business_id",
          business.id
        )
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true,
        }),

      supabase
        .from("employees")
        .select(
          "id, slug, name, title, bio, image_url, sort_order, is_active"
        )
        .eq(
          "business_id",
          business.id
        )
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true,
        }),

      supabase
        .from("employee_services")
        .select(
          "employee_id, service_id, custom_duration_minutes, custom_price_from, is_active"
        )
        .eq(
          "business_id",
          business.id
        )
        .eq("is_active", true),

      supabase
        .from("working_hours")
        .select(
          "day_of_week, open_time, close_time, is_closed"
        )
        .eq(
          "business_id",
          business.id
        )
        .is("employee_id", null)
        .order("day_of_week", {
          ascending: true,
        }),

      supabase
        .from("gallery_items")
        .select(
          "id, image_url, category, alt, sort_order, is_active"
        )
        .eq(
          "business_id",
          business.id
        )
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: true,
        }),
    ]);

    const queryErrors = [
      settingsResult.error,
      categoriesResult.error,
      servicesResult.error,
      employeesResult.error,
      employeeServicesResult.error,
      workingHoursResult.error,
      galleryResult.error,
    ].filter(Boolean);

    if (queryErrors.length > 0) {
      console.error(
        "Failed to load catalog:",
        queryErrors
      );

      return errorResponse(
        500,
        "Failed to load catalog.",
        "CATALOG_QUERY_FAILED"
      );
    }

    if (!settingsResult.data) {
      return errorResponse(
        500,
        "Booking settings were not found.",
        "BOOKING_SETTINGS_NOT_FOUND"
      );
    }

    const settings =
      settingsResult.data as unknown as BookingSettingsRow;

    const categoryRows =
      (categoriesResult.data ??
        []) as unknown as ServiceCategoryRow[];

    const serviceRows =
      (servicesResult.data ??
        []) as unknown as ServiceRow[];

    const employeeRows =
      (employeesResult.data ??
        []) as unknown as EmployeeRow[];

    const employeeServiceRows =
      (employeeServicesResult.data ??
        []) as unknown as EmployeeServiceRow[];

    const workingHourRows =
      (workingHoursResult.data ??
        []) as unknown as WorkingHoursRow[];

    const galleryRows =
      (galleryResult.data ??
        []) as unknown as GalleryItemRow[];

    const serviceIdsByEmployee =
      new Map<string, string[]>();

    for (
      const relation of
      employeeServiceRows
    ) {
      const currentServiceIds =
        serviceIdsByEmployee.get(
          relation.employee_id
        ) ?? [];

      currentServiceIds.push(
        relation.service_id
      );

      serviceIdsByEmployee.set(
        relation.employee_id,
        currentServiceIds
      );
    }

    const categories =
      categoryRows.map(
        (category) => ({
          id: category.id,
          slug: category.slug,

          icon: toCategoryIcon(
            category.icon_key
          ),

          name: toLocalizedText(
            category.name
          ),

          description:
            toLocalizedText(
              category.description
            ),

          sortOrder:
            category.sort_order,

          isActive:
            category.is_active,
        })
      );

    const services =
      serviceRows.map(
        (service) => {
          const priceTo =
            service.price_to === null
              ? undefined
              : toNumber(
                  service.price_to
                );

          return {
            id: service.id,

            categoryId:
              service.category_id,

            slug: service.slug,

            name: toLocalizedText(
              service.name
            ),

            description:
              toLocalizedText(
                service.description
              ),

            durationMinutes:
              service.duration_minutes,

            priceType:
              toPriceType(
                service.price_type
              ),

            priceFrom:
              toNumber(
                service.price_from
              ),

            ...(priceTo === undefined
              ? {}
              : {
                  priceTo,
                }),

            sortOrder:
              service.sort_order,

            isActive:
              service.is_active,
          };
        }
      );

    const employees =
      employeeRows.map(
        (employee) => ({
          id: employee.id,
          slug: employee.slug,
          name: employee.name,

          role: toLocalizedText(
            employee.title
          ),

          bio: toLocalizedText(
            employee.bio
          ),

          image:
            employee.image_url ?? "",

          serviceIds:
            serviceIdsByEmployee.get(
              employee.id
            ) ?? [],

          sortOrder:
            employee.sort_order,

          isActive:
            employee.is_active,
        })
      );

    const workingHours =
      workingHourRows.map(
        (hours) => ({
          dayOfWeek:
            hours.day_of_week,

          openTime:
            hours.open_time,

          closeTime:
            hours.close_time,

          isClosed:
            hours.is_closed,
        })
      );

    const gallery =
      galleryRows.map(
        (item) => ({
          id: item.id,
          url: item.image_url,
          category: item.category,
          alt: toLocalizedText(
            item.alt
          ),
        })
      );

    const catalog = {
      business: {
        id: business.id,
        slug: business.slug,
        name: business.name,

        tagline:
          toLocalizedText(
            business.tagline
          ),

        description:
          toLocalizedText(
            business.description
          ),

        phone:
          business.phone ?? "",

        email:
          business.email ?? "",

        address:
          toLocalizedText(
            business.address
          ),

        city:
          toLocalizedText(
            business.city
          ),

        country:
          toLocalizedText(
            business.country
          ),

        instagramHandle:
          business.instagram_handle ??
          "",

        instagramUrl:
          business.instagram_url ?? "",

        heroImageUrl:
          business.hero_image_url ??
          "",

        logoUrl:
          business.logo_url ?? "",

        defaultLocale:
          defaultUiLocale,

        supportedLocales:
          supportedUiLocales,

        defaultContentLocale,

        supportedContentLocales,

        currency:
          business.currency.trim(),

        timezone:
          business.timezone,

        workingHours,

        theme: {
          primary:
            business.brand_primary,

          secondary:
            business.brand_secondary,

          background:
            business.brand_background,

          surface:
            business.brand_surface,

          text:
            business.brand_text,

          muted:
            business.brand_muted,

          border:
            business.brand_border,
        },
      },

      booking: {
        slotIntervalMinutes:
          settings.slot_interval_minutes,

        bookingWindowDays:
          settings.booking_window_days,

        minimumAdvanceMinutes:
          settings.min_advance_minutes,

        allowAnyEmployee:
          settings.allow_any_employee,

        requireEmail:
          settings.require_email,

        requirePhone:
          settings.require_phone,

        allowNotes:
          settings.allow_notes,

        autoConfirm:
          settings.auto_confirm,
      },

      categories,
      services,
      employees,
      gallery,
    };

    return NextResponse.json(
      {
        ok: true,
        source: "supabase",
        catalog,

        counts: {
          categories:
            categories.length,

          services:
            services.length,

          employees:
            employees.length,

          employeeServices:
            employeeServiceRows.length,

          workingHours:
            workingHours.length,

          galleryItems:
            gallery.length,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "Unexpected catalog error:",
      error
    );

    return errorResponse(
      500,
      "Unexpected catalog error.",
      "UNKNOWN_CATALOG_ERROR"
    );
  }
}
