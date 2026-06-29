import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LocalizedText } from "@/lib/types";

export const TEAM_SERVICE_PRICE_TYPES = [
  "fixed",
  "from",
  "range",
] as const;

export type TeamServicePriceType =
  (typeof TEAM_SERVICE_PRICE_TYPES)[number];

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
};

type EmployeeRow = {
  id: string;
  business_id: string;
  slug: string;
  name: string;
  title: LocalizedText;
  bio: LocalizedText;
  image_url: string | null;
  email: string | null;
  phone: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type EmployeeServiceRow = {
  business_id: string;
  employee_id: string;
  service_id: string;
  custom_duration_minutes: number | null;
  custom_price_from: number | string | null;
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
  duration_minutes: number;
  price_type: TeamServicePriceType;
  price_from: number | string;
  price_to: number | string | null;
  sort_order: number;
  is_active: boolean;
};

type ServiceCategoryRow = {
  id: string;
  business_id: string;
  slug: string;
  name: LocalizedText;
  sort_order: number;
  is_active: boolean;
};

export type AdminTeamCatalogService = {
  id: string;
  categoryId: string;

  slug: string;
  name: LocalizedText;

  categorySlug: string;
  categoryName: LocalizedText;

  durationMinutes: number;

  priceType: TeamServicePriceType;
  priceFrom: number;
  priceTo: number | null;

  sortOrder: number;
  categorySortOrder: number;

  isActive: boolean;
  categoryIsActive: boolean;
};

export type AdminEmployeeService = {
  employeeId: string;
  serviceId: string;

  service: AdminTeamCatalogService;

  customDurationMinutes: number | null;
  customPriceFrom: number | null;

  effectiveDurationMinutes: number;
  effectivePriceFrom: number;

  isActive: boolean;
  isPubliclyAvailable: boolean;

  createdAt: string;
  updatedAt: string;
};

export type AdminEmployee = {
  id: string;
  slug: string;
  name: string;

  title: LocalizedText;
  bio: LocalizedText;

  imageUrl: string | null;
  email: string | null;
  phone: string | null;

  sortOrder: number;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  services: AdminEmployeeService[];

  metrics: {
    totalServices: number;
    activeAssignments: number;
    inactiveAssignments: number;
    publiclyAvailableServices: number;
    customDurationOverrides: number;
    customPriceOverrides: number;
  };
};

export type AdminTeamResult = {
  business: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
  };

  employees: AdminEmployee[];

  catalogServices: AdminTeamCatalogService[];

  metrics: {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;

    totalAssignments: number;
    activeAssignments: number;
    inactiveAssignments: number;

    publiclyAvailableAssignments: number;
    customDurationOverrides: number;
    customPriceOverrides: number;
  };
};

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

export async function getAdminTeam(): Promise<AdminTeamResult> {
  const admin = await requireAdmin();

  const adminClient = createAdminClient();

  const [
    businessResult,
    employeesResult,
    assignmentsResult,
    servicesResult,
    categoriesResult,
  ] = await Promise.all([
    adminClient
      .from("businesses")
      .select("id, name, slug, timezone")
      .eq("id", admin.business.id)
      .single(),

    adminClient
      .from("employees")
      .select(
        [
          "id",
          "business_id",
          "slug",
          "name",
          "title",
          "bio",
          "image_url",
          "email",
          "phone",
          "sort_order",
          "is_active",
          "created_at",
          "updated_at",
        ].join(", ")
      )
      .eq("business_id", admin.business.id)
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      }),

    adminClient
      .from("employee_services")
      .select(
        [
          "business_id",
          "employee_id",
          "service_id",
          "custom_duration_minutes",
          "custom_price_from",
          "is_active",
          "created_at",
          "updated_at",
        ].join(", ")
      )
      .eq("business_id", admin.business.id)
      .order("created_at", {
        ascending: true,
      }),

    adminClient
      .from("services")
      .select(
        [
          "id",
          "business_id",
          "category_id",
          "slug",
          "name",
          "duration_minutes",
          "price_type",
          "price_from",
          "price_to",
          "sort_order",
          "is_active",
        ].join(", ")
      )
      .eq("business_id", admin.business.id)
      .order("sort_order", {
        ascending: true,
      }),

    adminClient
      .from("service_categories")
      .select(
        [
          "id",
          "business_id",
          "slug",
          "name",
          "sort_order",
          "is_active",
        ].join(", ")
      )
      .eq("business_id", admin.business.id)
      .order("sort_order", {
        ascending: true,
      }),
  ]);

  if (
    businessResult.error ||
    !businessResult.data
  ) {
    throw new Error(
      `Unable to load team business: ${
        businessResult.error?.message ??
        "Business was not found."
      }`
    );
  }

  if (employeesResult.error) {
    throw new Error(
      `Unable to load employees: ${employeesResult.error.message}`
    );
  }

  if (assignmentsResult.error) {
    throw new Error(
      `Unable to load employee services: ${assignmentsResult.error.message}`
    );
  }

  if (servicesResult.error) {
    throw new Error(
      `Unable to load team services: ${servicesResult.error.message}`
    );
  }

  if (categoriesResult.error) {
    throw new Error(
      `Unable to load team service categories: ${categoriesResult.error.message}`
    );
  }

  const business =
    businessResult.data as unknown as BusinessRow;

  const employeeRows =
    (employeesResult.data ??
      []) as unknown as EmployeeRow[];

  const assignmentRows =
    (assignmentsResult.data ??
      []) as unknown as EmployeeServiceRow[];

  const serviceRows =
    (servicesResult.data ??
      []) as unknown as ServiceRow[];

  const categoryRows =
    (categoriesResult.data ??
      []) as unknown as ServiceCategoryRow[];

  const categoriesById = new Map(
    categoryRows.map((category) => [
      category.id,
      category,
    ])
  );

  const catalogServices =
    serviceRows
      .map(
        (
          service
        ): AdminTeamCatalogService | null => {
          const category =
            categoriesById.get(
              service.category_id
            );

          if (!category) {
            return null;
          }

          return {
            id: service.id,
            categoryId: service.category_id,

            slug: service.slug,
            name: service.name,

            categorySlug: category.slug,
            categoryName: category.name,

            durationMinutes:
              service.duration_minutes,

            priceType: service.price_type,

            priceFrom:
              parseNumericValue(
                service.price_from
              ) ?? 0,

            priceTo:
              parseNumericValue(
                service.price_to
              ),

            sortOrder: service.sort_order,

            categorySortOrder:
              category.sort_order,

            isActive: service.is_active,

            categoryIsActive:
              category.is_active,
          };
        }
      )
      .filter(
        (
          service
        ): service is AdminTeamCatalogService =>
          service !== null
      )
      .sort((first, second) => {
        if (
          first.categorySortOrder !==
          second.categorySortOrder
        ) {
          return (
            first.categorySortOrder -
            second.categorySortOrder
          );
        }

        if (
          first.sortOrder !==
          second.sortOrder
        ) {
          return (
            first.sortOrder -
            second.sortOrder
          );
        }

        return first.slug.localeCompare(
          second.slug
        );
      });

  const servicesById = new Map(
    catalogServices.map((service) => [
      service.id,
      service,
    ])
  );

  const assignmentsByEmployeeId =
    new Map<string, AdminEmployeeService[]>();

  assignmentRows.forEach((assignment) => {
    const service = servicesById.get(
      assignment.service_id
    );

    if (!service) {
      return;
    }

    const customDurationMinutes =
      assignment.custom_duration_minutes;

    const customPriceFrom =
      parseNumericValue(
        assignment.custom_price_from
      );

    const employeeService: AdminEmployeeService =
      {
        employeeId:
          assignment.employee_id,

        serviceId:
          assignment.service_id,

        service,

        customDurationMinutes,

        customPriceFrom,

        effectiveDurationMinutes:
          customDurationMinutes ??
          service.durationMinutes,

        effectivePriceFrom:
          customPriceFrom ??
          service.priceFrom,

        isActive:
          assignment.is_active,

        isPubliclyAvailable:
          assignment.is_active &&
          service.isActive &&
          service.categoryIsActive,

        createdAt:
          assignment.created_at,

        updatedAt:
          assignment.updated_at,
      };

    const currentAssignments =
      assignmentsByEmployeeId.get(
        assignment.employee_id
      ) ?? [];

    currentAssignments.push(
      employeeService
    );

    assignmentsByEmployeeId.set(
      assignment.employee_id,
      currentAssignments
    );
  });

  const employees = employeeRows.map(
    (employee): AdminEmployee => {
      const services = (
        assignmentsByEmployeeId.get(
          employee.id
        ) ?? []
      ).sort((first, second) => {
        if (
          first.service.categorySortOrder !==
          second.service.categorySortOrder
        ) {
          return (
            first.service.categorySortOrder -
            second.service.categorySortOrder
          );
        }

        if (
          first.service.sortOrder !==
          second.service.sortOrder
        ) {
          return (
            first.service.sortOrder -
            second.service.sortOrder
          );
        }

        return first.service.slug.localeCompare(
          second.service.slug
        );
      });

      const activeAssignments =
        services.filter(
          (service) => service.isActive
        ).length;

      const publiclyAvailableServices =
        services.filter(
          (service) =>
            employee.is_active &&
            service.isPubliclyAvailable
        ).length;

      const customDurationOverrides =
        services.filter(
          (service) =>
            service.customDurationMinutes !==
            null
        ).length;

      const customPriceOverrides =
        services.filter(
          (service) =>
            service.customPriceFrom !== null
        ).length;

      return {
        id: employee.id,
        slug: employee.slug,
        name: employee.name,

        title: employee.title,
        bio: employee.bio,

        imageUrl: employee.image_url,
        email: employee.email,
        phone: employee.phone,

        sortOrder: employee.sort_order,
        isActive: employee.is_active,

        createdAt: employee.created_at,
        updatedAt: employee.updated_at,

        services,

        metrics: {
          totalServices: services.length,

          activeAssignments,

          inactiveAssignments:
            services.length -
            activeAssignments,

          publiclyAvailableServices,

          customDurationOverrides,

          customPriceOverrides,
        },
      };
    }
  );

  const allAssignments = employees.flatMap(
    (employee) => employee.services
  );

  const activeEmployees =
    employees.filter(
      (employee) => employee.isActive
    ).length;

  const activeAssignments =
    allAssignments.filter(
      (assignment) => assignment.isActive
    ).length;

  const publiclyAvailableAssignments =
    employees.reduce(
      (total, employee) =>
        total +
        employee.metrics
          .publiclyAvailableServices,
      0
    );

  const customDurationOverrides =
    allAssignments.filter(
      (assignment) =>
        assignment.customDurationMinutes !==
        null
    ).length;

  const customPriceOverrides =
    allAssignments.filter(
      (assignment) =>
        assignment.customPriceFrom !== null
    ).length;

  return {
    business: {
      id: business.id,
      name: business.name,
      slug: business.slug,
      timezone: business.timezone,
    },

    employees,

    catalogServices,

    metrics: {
      totalEmployees: employees.length,

      activeEmployees,

      inactiveEmployees:
        employees.length -
        activeEmployees,

      totalAssignments:
        allAssignments.length,

      activeAssignments,

      inactiveAssignments:
        allAssignments.length -
        activeAssignments,

      publiclyAvailableAssignments,

      customDurationOverrides,

      customPriceOverrides,
    },
  };
}