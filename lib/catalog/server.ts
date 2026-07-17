import "server-only";

import {
  cache,
} from "react";

import {
  buildCatalogReviewData,
  type CatalogReviewLoadMode,
  type CatalogReviewRow,
  type CatalogReviewSettingsRow,
} from "@/lib/catalog/reviews";
import {
  isLocaleCode,
  normalizeLocaleList,
  UI_LOCALE_CODES,
} from "@/lib/i18n/locales";
import {
  createAdminClient,
} from "@/lib/supabase/admin";
import type {
  CatalogData,
  ContentLocale,
  DayOfWeek,
  LocalizedText,
  ServiceCategoryIcon,
  ServicePriceType,
  UiLocale,
} from "@/lib/types";

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type PublicCatalogErrorCode =
  | "INVALID_BUSINESS_SLUG"
  | "BUSINESS_QUERY_FAILED"
  | "CATALOG_QUERY_FAILED"
  | "BOOKING_SETTINGS_NOT_FOUND";

export class PublicCatalogError extends Error {
  readonly status: number;
  readonly code: PublicCatalogErrorCode;

  constructor(
    status: number,
    code: PublicCatalogErrorCode,
    message: string
  ) {
    super(message);
    this.name = "PublicCatalogError";
    this.status = status;
    this.code = code;
  }
}

export type PublicCatalogCounts = {
  categories: number;
  services: number;
  employees: number;
  employeeServices: number;
  workingHours: number;
  galleryItems: number;
};

export type PublicCatalogResult = {
  catalog: CatalogData;
  counts: PublicCatalogCounts;
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
  instagram_handle: string | null;
  instagram_url: string | null;
  hero_image_url: string | null;
  logo_url: string | null;
  default_locale: string;
  supported_locales: string[] | null;
  currency: string;
  timezone: string;
  brand_primary: string;
  brand_secondary: string;
  brand_background: string;
  brand_surface: string;
  brand_text: string;
  brand_muted: string;
  brand_border: string;
  publication_status: string;
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
  image_url: string | null;
  image_position: string | null;
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
  custom_duration_minutes: number | null;
  custom_price_from: number | string | null;
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
  const localizedText: LocalizedText = {
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
      typeof translatedValue === "string"
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
  return UI_LOCALE_CODES.includes(
    value as UiLocale
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

function toDayOfWeek(
  value: number
): DayOfWeek {
  switch (value) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
      return value;

    default:
      return 0;
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

type PublicCatalogLoadMode =
  CatalogReviewLoadMode;

async function loadPublicCatalogUncached(
  rawBusinessSlug: string,
  mode:
    PublicCatalogLoadMode
): Promise<PublicCatalogResult | null> {
  const businessSlug =
    rawBusinessSlug
      .trim()
      .toLowerCase();

  if (
    !BUSINESS_SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    throw new PublicCatalogError(
      400,
      "INVALID_BUSINESS_SLUG",
      "Invalid business slug."
    );
  }

  const supabase =
    createAdminClient();

  const businessQuery =
    supabase
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
        brand_border,
        publication_status
      `
    )
    .eq(
      "slug",
      businessSlug
    );

  if (
    mode ===
    "public"
  ) {
    businessQuery
      .eq(
        "is_active",
        true
      )
      .eq(
        "publication_status",
        "published"
      );
  }

  const {
    data: businessData,
    error: businessError,
  } =
    await businessQuery
      .maybeSingle();

  if (businessError) {
    console.error(
      "Failed to load catalog business:",
      businessError
    );

    throw new PublicCatalogError(
      500,
      "BUSINESS_QUERY_FAILED",
      "Failed to load business."
    );
  }

  if (!businessData) {
    return null;
  }

  const business =
    businessData as unknown as
      BusinessRow;

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
    reviewSettingsResult,
    categoriesResult,
    servicesResult,
    employeesResult,
    employeeServicesResult,
    workingHoursResult,
    galleryResult,
    reviewsResult,
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
      .from("review_settings")
      .select(
        "reviews_enabled, direct_reviews_enabled, verified_reviews_enabled, testimonials_enabled, google_reviews_enabled, show_rating_summary, allow_demo_content, google_review_url"
      )
      .eq(
        "business_id",
        business.id
      )
      .maybeSingle(),

    supabase
      .from("service_categories")
      .select(
        "id, slug, name, description, icon_key, image_url, image_position, sort_order, is_active"
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

    supabase
      .from("reviews")
      .select(
        "id, source, status, service_id, employee_id, author_name, author_avatar_url, rating, body, language_code, is_verified_visit, external_url, owner_reply, owner_reply_at, provider_published_at, published_at, created_at"
      )
      .eq(
        "business_id",
        business.id
      )
      .eq(
        "status",
        "published"
      )
      .order(
        "published_at",
        {
          ascending: false,
          nullsFirst: false,
        }
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(100),
  ]);

  const queryErrors = [
    settingsResult.error,
    reviewSettingsResult.error,
    categoriesResult.error,
    servicesResult.error,
    employeesResult.error,
    employeeServicesResult.error,
    workingHoursResult.error,
    galleryResult.error,
    reviewsResult.error,
  ].filter(Boolean);

  if (queryErrors.length > 0) {
    console.error(
      "Failed to load public catalog:",
      queryErrors
    );

    throw new PublicCatalogError(
      500,
      "CATALOG_QUERY_FAILED",
      "Failed to load catalog."
    );
  }

  if (!settingsResult.data) {
    throw new PublicCatalogError(
      500,
      "BOOKING_SETTINGS_NOT_FOUND",
      "Booking settings were not found."
    );
  }

  const settings =
    settingsResult.data as unknown as
      BookingSettingsRow;

  const reviewSettings =
    reviewSettingsResult.data
      ? reviewSettingsResult.data as unknown as
          CatalogReviewSettingsRow
      : null;

  const reviewRows =
    (reviewsResult.data ??
      []) as unknown as
      CatalogReviewRow[];

  const reviewCatalog =
    buildCatalogReviewData({
      mode,
      settings:
        reviewSettings,
      rows:
        reviewRows,
    });

  const categoryRows =
    (categoriesResult.data ??
      []) as unknown as
      ServiceCategoryRow[];

  const serviceRows =
    (servicesResult.data ??
      []) as unknown as
      ServiceRow[];

  const employeeRows =
    (employeesResult.data ??
      []) as unknown as
      EmployeeRow[];

  const employeeServiceRows =
    (employeeServicesResult.data ??
      []) as unknown as
      EmployeeServiceRow[];

  const workingHourRows =
    (workingHoursResult.data ??
      []) as unknown as
      WorkingHoursRow[];

  const galleryRows =
    (galleryResult.data ??
      []) as unknown as
      GalleryItemRow[];

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
        imageUrl:
          category.image_url ?? "",
        imagePosition:
          category.image_position ??
          "center center",
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
          toDayOfWeek(
            hours.day_of_week
          ),
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

  const catalog: CatalogData = {
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
        business.hero_image_url ?? "",
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
    reviews:
      reviewCatalog.reviews,
    reviewSummary:
      reviewCatalog.summary,
    reviewConfig:
      reviewCatalog.config,
  };

  return {
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
  };
}

export const loadPublicCatalog =
  cache(
    (
      rawBusinessSlug:
        string
    ) =>
      loadPublicCatalogUncached(
        rawBusinessSlug,
        "public"
      )
  );

export const loadPlatformPreviewCatalog =
  cache(
    (
      rawBusinessSlug:
        string
    ) =>
      loadPublicCatalogUncached(
        rawBusinessSlug,
        "platform-preview"
      )
  );
