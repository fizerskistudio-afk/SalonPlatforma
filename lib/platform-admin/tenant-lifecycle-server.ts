import {
  buildTenantReadiness,
  type TenantReadinessSnapshot,
} from "@/lib/platform-admin/tenant-lifecycle";
import {
  resolveBusinessPublicationStatus,
  type BusinessPublicationStatus,
} from "@/lib/publishing/status";
import {
  resolveOwnerAccessState,
} from "@/lib/platform-admin/owner-access-state";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

type LifecycleBusinessRow = {
  id: string;
  slug: string;
  name: string;
  phone: string | null;
  email: string | null;
  default_locale: string;
  supported_locales: string[] | null;
  template_key: string | null;
  publication_status: string | null;
  is_active: boolean;
  updated_at: string;
};

type IdRow = {
  id: string;
};

type ServiceRow = IdRow & {
  category_id: string;
};

type AssignmentRow = {
  employee_id: string;
  service_id: string;
};

type WorkingHoursRow = {
  employee_id: string | null;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

type OwnerMembershipRow = {
  id: string;
  user_id: string;
  is_active: boolean;
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

export type TenantLifecycleBusiness = {
  id: string;
  slug: string;
  name: string;
  publicationStatus: BusinessPublicationStatus;
  isActive: boolean;
  updatedAt: string;
};

export type TenantLifecycleContext = {
  business: TenantLifecycleBusiness;
  readiness: TenantReadinessSnapshot;
};

export class TenantLifecycleLoadError extends Error {
  constructor(
    message: string
  ) {
    super(message);
    this.name =
      "TenantLifecycleLoadError";
  }
}

function hasValue(
  value: string | null
): boolean {
  return Boolean(
    value?.trim()
  );
}

function hasLocaleConfiguration(
  business: LifecycleBusinessRow
): boolean {
  const defaultLocale =
    business.default_locale
      ?.trim();

  if (!defaultLocale) {
    return false;
  }

  return Array.isArray(
    business.supported_locales
  ) &&
    business.supported_locales.some(
      (locale) =>
        locale.trim() ===
        defaultLocale
    );
}

export async function loadTenantLifecycleContext(
  businessSlug: string
): Promise<TenantLifecycleContext | null> {
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
        phone,
        email,
        default_locale,
        supported_locales,
        template_key,
        publication_status,
        is_active,
        updated_at
      `
    )
    .eq(
      "slug",
      businessSlug
    )
    .maybeSingle();

  if (businessError) {
    console.error(
      "Tenant lifecycle business query failed:",
      businessError
    );

    throw new TenantLifecycleLoadError(
      "Salon nije moguće učitati za lifecycle proveru."
    );
  }

  if (!businessData) {
    return null;
  }

  const business =
    businessData as unknown as
      LifecycleBusinessRow;

  const [
    bookingSettingsResult,
    categoriesResult,
    servicesResult,
    employeesResult,
    assignmentsResult,
    workingHoursResult,
    ownersResult,
  ] = await Promise.all([
    supabase
      .from("booking_settings")
      .select("business_id")
      .eq(
        "business_id",
        business.id
      )
      .maybeSingle(),
    supabase
      .from("service_categories")
      .select("id")
      .eq(
        "business_id",
        business.id
      )
      .eq(
        "is_active",
        true
      ),
    supabase
      .from("services")
      .select("id, category_id")
      .eq(
        "business_id",
        business.id
      )
      .eq(
        "is_active",
        true
      ),
    supabase
      .from("employees")
      .select("id")
      .eq(
        "business_id",
        business.id
      )
      .eq(
        "is_active",
        true
      ),
    supabase
      .from("employee_services")
      .select("employee_id, service_id")
      .eq(
        "business_id",
        business.id
      )
      .eq(
        "is_active",
        true
      ),
    supabase
      .from("working_hours")
      .select(
        "employee_id, open_time, close_time, is_closed"
      )
      .eq(
        "business_id",
        business.id
      ),
    supabase
      .from("business_members")
      .select(
        "id, user_id, is_active"
      )
      .eq(
        "business_id",
        business.id
      )
      .eq(
        "role",
        "owner"
      )
      .eq(
        "is_active",
        true
      ),
  ]);

  const queryErrors = [
    bookingSettingsResult.error,
    categoriesResult.error,
    servicesResult.error,
    employeesResult.error,
    assignmentsResult.error,
    workingHoursResult.error,
    ownersResult.error,
  ].filter(Boolean);

  if (queryErrors.length > 0) {
    console.error(
      "Tenant lifecycle readiness query failed:",
      queryErrors
    );

    throw new TenantLifecycleLoadError(
      "Readiness tenant-a trenutno nije moguće proveriti."
    );
  }

  const categories =
    (categoriesResult.data ?? []) as unknown as
      IdRow[];
  const services =
    (servicesResult.data ?? []) as unknown as
      ServiceRow[];
  const employees =
    (employeesResult.data ?? []) as unknown as
      IdRow[];
  const assignments =
    (assignmentsResult.data ?? []) as unknown as
      AssignmentRow[];
  const workingHours =
    (workingHoursResult.data ?? []) as unknown as
      WorkingHoursRow[];
  const ownerMemberships =
    (ownersResult.data ?? []) as unknown as
      OwnerMembershipRow[];

  const ownerStates =
    await Promise.all(
      ownerMemberships.map(
        async (membership) => {
          const {
            data,
            error,
          } =
            await supabase
              .auth
              .admin
              .getUserById(
                membership.user_id
              );

          if (error) {
            console.error(
              "Tenant lifecycle owner Auth lookup failed:",
              {
                businessId:
                  business.id,
                membershipId:
                  membership.id,
                error,
              }
            );
          }

          const user =
            data?.user ??
            null;
          const appMetadata =
            isJsonRecord(
              user?.app_metadata
            )
              ? user.app_metadata
              : {};

          return resolveOwnerAccessState({
            membershipActive:
              membership.is_active,
            authUserAvailable:
              Boolean(user),
            invitedAt:
              user?.invited_at ??
              null,
            emailConfirmedAt:
              user?.email_confirmed_at ??
              null,
            lastSignInAt:
              user?.last_sign_in_at ??
              null,
            mustChangePassword:
              appMetadata.must_change_password ===
              true,
          });
        }
      )
    );

  const categoryIds =
    new Set(
      categories.map(
        (category) =>
          category.id
      )
    );
  const eligibleServiceIds =
    new Set(
      services
        .filter(
          (service) =>
            categoryIds.has(
              service.category_id
            )
        )
        .map(
          (service) =>
            service.id
        )
    );
  const employeeIds =
    new Set(
      employees.map(
        (employee) =>
          employee.id
      )
    );

  const readiness =
    buildTenantReadiness({
      businessSlug:
        business.slug,
      templateReady:
        hasValue(
          business.template_key
        ),
      localesReady:
        hasLocaleConfiguration(
          business
        ),
      contactReady:
        hasValue(
          business.phone
        ) ||
        hasValue(
          business.email
        ),
      categoriesReady:
        categoryIds.size > 0,
      servicesReady:
        eligibleServiceIds.size > 0,
      bookingSettingsReady:
        Boolean(
          bookingSettingsResult.data
        ),
      employeesReady:
        employeeIds.size > 0,
      serviceAssignmentsReady:
        assignments.some(
          (assignment) =>
            employeeIds.has(
              assignment.employee_id
            ) &&
            eligibleServiceIds.has(
              assignment.service_id
            )
        ),
      workingHoursReady:
        workingHours.some(
          (row) =>
            row.employee_id === null &&
            !row.is_closed &&
            hasValue(
              row.open_time
            ) &&
            hasValue(
              row.close_time
            )
        ),
      ownerReady:
        ownerStates.includes(
          "active"
        ),
    });

  return {
    business: {
      id: business.id,
      slug: business.slug,
      name: business.name,
      publicationStatus:
        resolveBusinessPublicationStatus(
          business.publication_status,
          business.is_active
        ),
      isActive:
        business.is_active,
      updatedAt:
        business.updated_at,
    },
    readiness,
  };
}
