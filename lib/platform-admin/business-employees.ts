import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type EmployeeBusinessRow = {
  id: string;
  slug: string;
  name: string;
  default_locale: string;
  currency: string;
  is_active: boolean;
};

export type EmployeeCategoryRow = {
  id: string;
  slug: string;
  name: unknown;
  sort_order: number;
  is_active: boolean;
};

export type EmployeeServiceRow = {
  id: string;
  category_id: string;
  slug: string;
  name: unknown;
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
};

export type EmployeePersonRow = {
  id: string;
  slug: string;
  name: string;
  title: unknown;
  bio: unknown;
  image_url: string | null;
  email: string | null;
  phone: string | null;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
};

export type EmployeeRelationRow = {
  employee_id: string;
  service_id: string;
  is_active: boolean;
};

export type EmployeeManagementData = {
  business:
    EmployeeBusinessRow;
  categories:
    EmployeeCategoryRow[];
  services:
    EmployeeServiceRow[];
  employees:
    EmployeePersonRow[];
  relations:
    EmployeeRelationRow[];
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

function toNumber(
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

export function formatEmployeeServicePrice(
  service:
    EmployeeServiceRow,
  currency: string
): string {
  const priceFrom =
    toNumber(
      service.price_from
    ) ?? 0;

  const priceTo =
    toNumber(
      service.price_to
    );

  const formatter =
    new Intl.NumberFormat(
      "sr-Latn-RS",
      {
        style:
          "currency",
        currency,
        minimumFractionDigits:
          Number.isInteger(
            priceFrom
          )
            ? 0
            : 2,
        maximumFractionDigits:
          2,
      }
    );

  if (
    service.price_type ===
      "range" &&
    priceTo !== null
  ) {
    return `${formatter.format(
      priceFrom
    )} – ${formatter.format(
      priceTo
    )}`;
  }

  if (
    service.price_type ===
    "from"
  ) {
    return `od ${formatter.format(
      priceFrom
    )}`;
  }

  return formatter.format(
    priceFrom
  );
}

export async function loadEmployeeManagementData(
  businessSlug: string
): Promise<
  EmployeeManagementData | null
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

  if (businessError) {
    console.error(
      "Failed to load business for employee management:",
      businessError
    );

    throw new Error(
      "Salon nije moguće učitati iz baze."
    );
  }

  if (!businessData) {
    return null;
  }

  const business =
    businessData as unknown as
      EmployeeBusinessRow;

  const [
    categoriesResult,
    servicesResult,
    employeesResult,
    relationsResult,
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
          sort_order,
          is_active
        `
      )
      .eq(
        "business_id",
        business.id
      )
      .eq(
        "is_active",
        true
      )
      .order(
        "sort_order",
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
          duration_minutes,
          price_type,
          price_from,
          price_to,
          sort_order,
          is_active
        `
      )
      .eq(
        "business_id",
        business.id
      )
      .eq(
        "is_active",
        true
      )
      .order(
        "sort_order",
        {
          ascending:
            true,
        }
      ),

    supabase
      .from(
        "employees"
      )
      .select(
        `
          id,
          slug,
          name,
          title,
          bio,
          image_url,
          email,
          phone,
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
        "name",
        {
          ascending:
            true,
        }
      ),

    supabase
      .from(
        "employee_services"
      )
      .select(
        `
          employee_id,
          service_id,
          is_active
        `
      )
      .eq(
        "business_id",
        business.id
      )
      .eq(
        "is_active",
        true
      ),
  ]);

  const queryErrors = [
    categoriesResult.error,
    servicesResult.error,
    employeesResult.error,
    relationsResult.error,
  ].filter(
    Boolean
  );

  if (
    queryErrors.length > 0
  ) {
    console.error(
      "Failed to load employee management data:",
      queryErrors
    );

    throw new Error(
      "Podaci zaposlenih nisu mogli da se učitaju."
    );
  }

  return {
    business,
    categories:
      (
        categoriesResult.data ??
        []
      ) as unknown as
        EmployeeCategoryRow[],
    services:
      (
        servicesResult.data ??
        []
      ) as unknown as
        EmployeeServiceRow[],
    employees:
      (
        employeesResult.data ??
        []
      ) as unknown as
        EmployeePersonRow[],
    relations:
      (
        relationsResult.data ??
        []
      ) as unknown as
        EmployeeRelationRow[],
  };
}
