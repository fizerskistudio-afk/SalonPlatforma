import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import {
  isLocaleCode,
  normalizeLocaleList,
  type LocaleCode,
} from "@/lib/i18n/locales";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LocalizedText } from "@/lib/types";

export const SERVICE_PRICE_TYPES = [
  "fixed",
  "from",
  "range",
] as const;

export type ServicePriceType =
  (typeof SERVICE_PRICE_TYPES)[number];

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  default_locale: string;
  supported_locales: unknown;
};

type ServiceCategoryRow = {
  id: string;
  business_id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  icon_key: string | null;
  image_url: string | null;
  image_position: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ServiceRow = {
  id: string;
  business_id: string;
  category_id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  duration_minutes: number;
  price_type: ServicePriceType;
  price_from: number | string;
  price_to: number | string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminServiceItem = {
  id: string;
  categoryId: string;
  slug: string;

  name: LocalizedText;
  description: LocalizedText;

  durationMinutes: number;
  priceType: ServicePriceType;
  priceFrom: number;
  priceTo: number | null;

  sortOrder: number;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

export type AdminServiceCategory = {
  id: string;
  slug: string;

  name: LocalizedText;
  description: LocalizedText;

  iconKey: string | null;
  imageUrl: string;
  imagePosition: string;
  sortOrder: number;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  services: AdminServiceItem[];

  metrics: {
    totalServices: number;
    activeServices: number;
    inactiveServices: number;
  };
};

export type AdminServicesResult = {
  business: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
    defaultLocale: LocaleCode;
    supportedLocales: LocaleCode[];
  };

  categories: AdminServiceCategory[];

  uncategorizedServices: AdminServiceItem[];

  metrics: {
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;

    totalServices: number;
    activeServices: number;
    inactiveServices: number;
  };
};

function normalizeContentLocale(
  value: string
): LocaleCode {
  return isLocaleCode(value)
    ? value
    : "en";
}

function normalizeSupportedLocales(
  value: unknown,
  fallback: LocaleCode
): LocaleCode[] {
  const values =
    Array.isArray(value)
      ? value
      : [];

  const locales =
    normalizeLocaleList(
      values,
      fallback
    );

  if (!locales.includes(fallback)) {
    locales.unshift(fallback);
  }

  return locales;
}

function parseNumericValue(
  value: number | string | null
): number | null {
  if (value === null) {
    return null;
  }

  const parsedValue =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;
}

function mapService(
  service: ServiceRow
): AdminServiceItem {
  return {
    id: service.id,
    categoryId: service.category_id,
    slug: service.slug,

    name: service.name,
    description: service.description,

    durationMinutes:
      service.duration_minutes,

    priceType:
      service.price_type,

    priceFrom:
      parseNumericValue(
        service.price_from
      ) ?? 0,

    priceTo:
      parseNumericValue(
        service.price_to
      ),

    sortOrder:
      service.sort_order,

    isActive:
      service.is_active,

    createdAt:
      service.created_at,

    updatedAt:
      service.updated_at,
  };
}

export async function getAdminServices(): Promise<AdminServicesResult> {
  const admin =
    await requireAdmin();

  const adminClient =
    createAdminClient();

  const {
    data: businessData,
    error: businessError,
  } = await adminClient
    .from("businesses")
    .select(
      "id, name, slug, timezone, default_locale, supported_locales"
    )
    .eq(
      "id",
      admin.business.id
    )
    .single();

  if (
    businessError ||
    !businessData
  ) {
    throw new Error(
      `Unable to load services business: ${
        businessError?.message ??
        "Business was not found."
      }`
    );
  }

  const business =
    businessData as unknown as BusinessRow;

  const defaultLocale =
    normalizeContentLocale(
      business.default_locale
    );

  const supportedLocales =
    normalizeSupportedLocales(
      business.supported_locales,
      defaultLocale
    );

  const {
    data: categoryData,
    error: categoryError,
  } = await adminClient
    .from("service_categories")
    .select(
      [
        "id",
        "business_id",
        "slug",
        "name",
        "description",
        "icon_key",
        "image_url",
        "image_position",
        "sort_order",
        "is_active",
        "created_at",
        "updated_at",
      ].join(", ")
    )
    .eq(
      "business_id",
      admin.business.id
    )
    .order(
      "sort_order",
      {
        ascending: true,
      }
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    );

  if (categoryError) {
    throw new Error(
      `Unable to load service categories: ${categoryError.message}`
    );
  }

  const {
    data: serviceData,
    error: serviceError,
  } = await adminClient
    .from("services")
    .select(
      [
        "id",
        "business_id",
        "category_id",
        "slug",
        "name",
        "description",
        "duration_minutes",
        "price_type",
        "price_from",
        "price_to",
        "sort_order",
        "is_active",
        "created_at",
        "updated_at",
      ].join(", ")
    )
    .eq(
      "business_id",
      admin.business.id
    )
    .order(
      "sort_order",
      {
        ascending: true,
      }
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    );

  if (serviceError) {
    throw new Error(
      `Unable to load services: ${serviceError.message}`
    );
  }

  const categoryRows =
    (categoryData ??
      []) as unknown as ServiceCategoryRow[];

  const serviceRows =
    (serviceData ??
      []) as unknown as ServiceRow[];

  const mappedServices =
    serviceRows.map(
      mapService
    );

  const servicesByCategoryId =
    new Map<
      string,
      AdminServiceItem[]
    >();

  mappedServices.forEach(
    (service) => {
      const currentServices =
        servicesByCategoryId.get(
          service.categoryId
        ) ?? [];

      currentServices.push(
        service
      );

      servicesByCategoryId.set(
        service.categoryId,
        currentServices
      );
    }
  );

  const categoryIds =
    new Set(
      categoryRows.map(
        (category) =>
          category.id
      )
    );

  const categories =
    categoryRows.map(
      (
        category
      ): AdminServiceCategory => {
        const services =
          servicesByCategoryId.get(
            category.id
          ) ?? [];

        const activeServices =
          services.filter(
            (service) =>
              service.isActive
          ).length;

        return {
          id: category.id,
          slug: category.slug,

          name: category.name,
          description:
            category.description,

          iconKey:
            category.icon_key,

          imageUrl:
            category.image_url ?? "",

          imagePosition:
            category.image_position ??
            "center center",

          sortOrder:
            category.sort_order,

          isActive:
            category.is_active,

          createdAt:
            category.created_at,

          updatedAt:
            category.updated_at,

          services,

          metrics: {
            totalServices:
              services.length,

            activeServices,

            inactiveServices:
              services.length -
              activeServices,
          },
        };
      }
    );

  const uncategorizedServices =
    mappedServices.filter(
      (service) =>
        !categoryIds.has(
          service.categoryId
        )
    );

  const activeCategories =
    categories.filter(
      (category) =>
        category.isActive
    ).length;

  const activeServices =
    mappedServices.filter(
      (service) =>
        service.isActive
    ).length;

  return {
    business: {
      id: business.id,
      name: business.name,
      slug: business.slug,
      timezone:
        business.timezone,
      defaultLocale,
      supportedLocales,
    },

    categories,

    uncategorizedServices,

    metrics: {
      totalCategories:
        categories.length,

      activeCategories,

      inactiveCategories:
        categories.length -
        activeCategories,

      totalServices:
        mappedServices.length,

      activeServices,

      inactiveServices:
        mappedServices.length -
        activeServices,
    },
  };
}
