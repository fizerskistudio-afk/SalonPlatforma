import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import type {
  BusinessBrandingData,
} from "./business-branding";

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  logo_url:
    | string
    | null;
  hero_image_url:
    | string
    | null;
  updated_at: string;
  is_active: boolean;
};

type EmployeeRow = {
  id: string;
  slug: string;
  name: string;
  title: unknown;
  image_url:
    | string
    | null;
  updated_at: string;
  is_active: boolean;
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
    !Array.isArray(value)
  );
}

function getLocalizedValue(
  value: unknown,
  preferredLocale: string
): string {
  if (
    typeof value ===
    "string"
  ) {
    return value.trim();
  }

  if (!isRecord(value)) {
    return "";
  }

  const preferredValue =
    value[preferredLocale];

  if (
    typeof preferredValue ===
      "string" &&
    preferredValue.trim()
  ) {
    return preferredValue.trim();
  }

  for (
    const locale of
    [
      "sr-Latn",
      "en",
      "de",
      "mk",
      "sq",
    ]
  ) {
    const candidate =
      value[locale];

    if (
      typeof candidate ===
        "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  for (
    const candidate of
    Object.values(value)
  ) {
    if (
      typeof candidate ===
        "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return "";
}

export async function loadBusinessBrandingData(
  businessSlug: string
): Promise<
  BusinessBrandingData | null
> {
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
        logo_url,
        hero_image_url,
        default_locale,
        updated_at,
        is_active
      `
    )
    .eq(
      "slug",
      businessSlug
    )
    .maybeSingle();

  if (businessError) {
    console.error(
      "Failed to load business branding:",
      businessError
    );

    throw new Error(
      "Branding salona nije moguće učitati."
    );
  }

  if (!businessData) {
    return null;
  }

  const business =
    businessData as
      unknown as
      BusinessRow & {
        default_locale:
          string;
      };

  const {
    data: employeeData,
    error: employeeError,
  } = await supabase
    .from("employees")
    .select(
      `
        id,
        slug,
        name,
        title,
        image_url,
        updated_at,
        is_active
      `
    )
    .eq(
      "business_id",
      business.id
    )
    .order(
      "sort_order",
      {
        ascending: true,
      }
    )
    .order(
      "name",
      {
        ascending: true,
      }
    );

  if (employeeError) {
    console.error(
      "Failed to load branding employees:",
      employeeError
    );

    throw new Error(
      "Fotografije zaposlenih nije moguće učitati."
    );
  }

  const employees =
    (
      employeeData ??
      []
    ) as unknown as
      EmployeeRow[];

  return {
    business: {
      id:
        business.id,
      slug:
        business.slug,
      name:
        business.name,
      logoUrl:
        business.logo_url ??
        "",
      heroImageUrl:
        business.hero_image_url ??
        "",
      updatedAt:
        business.updated_at,
      isActive:
        business.is_active,
    },
    employees:
      employees.map(
        (employee) => ({
          id:
            employee.id,
          slug:
            employee.slug,
          name:
            employee.name,
          title:
            getLocalizedValue(
              employee.title,
              business.default_locale
            ),
          imageUrl:
            employee.image_url ??
            "",
          updatedAt:
            employee.updated_at,
          isActive:
            employee.is_active,
        })
      ),
  };
}
