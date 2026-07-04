import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type CatalogBusinessRow = {
  id: string;
  slug: string;
  name: string;
  default_locale: string;
  currency: string;
  is_active: boolean;
};

export type CatalogCategoryRow = {
  id: string;
  slug: string;
  name: unknown;
  description: unknown;
  icon_key: string | null;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
};

export type CatalogServiceRow = {
  id: string;
  category_id: string;
  slug: string;
  name: unknown;
  description: unknown;
  duration_minutes: number;
  price_type: string;
  price_from:
    | number
    | string;
  price_to:
    | number
    | string
    | null;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
};

export type BusinessCatalogData = {
  business: CatalogBusinessRow;
  categories: CatalogCategoryRow[];
  services: CatalogServiceRow[];
};

function isRecord(
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

export function getLocalizedValue(
  value: unknown,
  preferredLocale: string
): string {
  if (
    typeof value ===
    "string"
  ) {
    return value.trim();
  }

  if (
    !isRecord(
      value
    )
  ) {
    return "";
  }

  const preferredValue =
    value[
      preferredLocale
    ];

  if (
    typeof preferredValue ===
      "string" &&
    preferredValue.trim()
      .length > 0
  ) {
    return preferredValue.trim();
  }

  for (
    const fallbackLocale of
    [
      "sr-Latn",
      "en",
      "de",
      "mk",
      "sq",
    ]
  ) {
    const fallbackValue =
      value[
        fallbackLocale
      ];

    if (
      typeof fallbackValue ===
        "string" &&
      fallbackValue.trim()
        .length > 0
    ) {
      return fallbackValue.trim();
    }
  }

  for (
    const candidateValue of
    Object.values(
      value
    )
  ) {
    if (
      typeof candidateValue ===
        "string" &&
      candidateValue.trim()
        .length > 0
    ) {
      return candidateValue.trim();
    }
  }

  return "";
}

export function toCatalogNumber(
  value:
    | number
    | string
    | null
): number | null {
  if (
    value === null
  ) {
    return null;
  }

  const parsedValue =
    typeof value ===
      "number"
      ? value
      : Number(
          value
        );

  return Number.isFinite(
    parsedValue
  )
    ? parsedValue
    : null;
}

export async function loadBusinessCatalogData(
  businessSlug: string
): Promise<
  BusinessCatalogData | null
> {
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
        default_locale,
        currency,
        is_active
      `
    )
    .eq(
      "slug",
      businessSlug
    )
    .maybeSingle();

  if (
    businessError
  ) {
    console.error(
      "Failed to load business for catalog management:",
      businessError
    );

    throw new Error(
      "Salon nije moguće učitati iz baze."
    );
  }

  if (
    !businessData
  ) {
    return null;
  }

  const business =
    businessData as unknown as
      CatalogBusinessRow;

  const [
    categoriesResult,
    servicesResult,
  ] = await Promise.all([
    supabase
      .from(
        "service_categories"
      )
      .select(
        `
          id,
          slug,
          name,
          description,
          icon_key,
          sort_order,
          is_active,
          updated_at
        `
      )
      .eq(
        "business_id",
        business.id
      )
      .order(
        "sort_order",
        {
          ascending:
            true,
        }
      )
      .order(
        "slug",
        {
          ascending:
            true,
        }
      ),

    supabase
      .from(
        "services"
      )
      .select(
        `
          id,
          category_id,
          slug,
          name,
          description,
          duration_minutes,
          price_type,
          price_from,
          price_to,
          sort_order,
          is_active,
          updated_at
        `
      )
      .eq(
        "business_id",
        business.id
      )
      .order(
        "sort_order",
        {
          ascending:
            true,
        }
      )
      .order(
        "slug",
        {
          ascending:
            true,
        }
      ),
  ]);

  const queryErrors = [
    categoriesResult.error,
    servicesResult.error,
  ].filter(
    Boolean
  );

  if (
    queryErrors.length > 0
  ) {
    console.error(
      "Failed to load business catalog:",
      queryErrors
    );

    throw new Error(
      "Katalog salona nije mogao da se učita."
    );
  }

  return {
    business,
    categories:
      (
        categoriesResult.data ??
        []
      ) as unknown as
        CatalogCategoryRow[],
    services:
      (
        servicesResult.data ??
        []
      ) as unknown as
        CatalogServiceRow[],
  };
}
