import "server-only";

import {
  PRODUCT_PACKAGES,
} from "@/lib/product-packages/registry";
import {
  resolveProductPackageAccess,
  type ProductPackageAssignmentRow,
} from "@/lib/product-packages/resolver";
import {
  type TenantOperationalInput,
} from "@/lib/platform-admin/operational-readiness";
import {
  resolveBusinessPublicationStatus,
} from "@/lib/publishing/status";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

type OperationsBusinessRow =
  ProductPackageAssignmentRow & {
    id: string;
    slug: string;
    name: string;
    publication_status:
      | string
      | null;
    is_active: boolean;
    template_key:
      | string
      | null;
    phone:
      | string
      | null;
    email:
      | string
      | null;
    created_at: string;
    updated_at: string;
  };

type MembershipRow = {
  business_id: string;
};

type BookingRow = {
  business_id: string;
};

export type PlatformOperationsTenant =
  TenantOperationalInput;

export type PlatformOperationsOverview = {
  tenants:
    PlatformOperationsTenant[];
  upcomingBookingsTotal: number;
  errors:
    string[];
};

function hasValue(
  value:
    | string
    | null
    | undefined
): boolean {
  return Boolean(
    value?.trim()
  );
}

function getPackageLabel(
  row:
    Pick<
      OperationsBusinessRow,
      | "package_key"
      | "package_contract_version"
    >
): {
  label: string;
  mode:
    PlatformOperationsTenant[
      "packageMode"
    ];
  requiresAttention: boolean;
} {
  const access =
    resolveProductPackageAccess(
      row
    );

  if (
    access.packageKey
  ) {
    return {
      label:
        PRODUCT_PACKAGES[
          access.packageKey
        ].name,
      mode:
        access.mode,
      requiresAttention:
        access.requiresAttention,
    };
  }

  return {
    label:
      access.mode ===
      "legacy_full_access"
        ? "Legacy full access"
        : "Nepoznat paket",
    mode:
      access.mode,
    requiresAttention:
      access.requiresAttention,
  };
}

export async function loadPlatformOperationsOverview():
  Promise<PlatformOperationsOverview> {
  const supabase =
    createAdminClient();

  const now =
    new Date();

  const sevenDaysFromNow =
    new Date(
      now.getTime() +
      7 *
        24 *
        60 *
        60 *
        1000
    );

  const [
    businessesResult,
    membershipsResult,
    bookingsResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "businesses"
        )
        .select(
          `
            id,
            slug,
            name,
            publication_status,
            is_active,
            template_key,
            phone,
            email,
            created_at,
            updated_at,
            package_key,
            package_contract_version,
            package_assigned_at,
            package_assigned_by_user_id
          `
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        ),

      supabase
        .from(
          "business_members"
        )
        .select(
          "business_id"
        )
        .eq(
          "role",
          "owner"
        )
        .eq(
          "is_active",
          true
        ),

      supabase
        .from(
          "bookings"
        )
        .select(
          "business_id"
        )
        .gte(
          "starts_at",
          now.toISOString()
        )
        .lt(
          "starts_at",
          sevenDaysFromNow.toISOString()
        )
        .in(
          "status",
          [
            "pending",
            "confirmed",
          ]
        ),
    ]);

  const errors:
    string[] = [];

  if (
    businessesResult.error
  ) {
    console.error(
      "Platform operations business query failed:",
      businessesResult.error
    );

    errors.push(
      "Saloni nisu mogli potpuno da se učitaju."
    );
  }

  if (
    membershipsResult.error
  ) {
    console.error(
      "Platform operations owner query failed:",
      membershipsResult.error
    );

    errors.push(
      "Owner status trenutno nije kompletan."
    );
  }

  if (
    bookingsResult.error
  ) {
    console.error(
      "Platform operations booking query failed:",
      bookingsResult.error
    );

    errors.push(
      "Upcoming booking brojač trenutno nije dostupan."
    );
  }

  const businessRows =
    (
      businessesResult.data ??
      []
    ) as unknown as
      OperationsBusinessRow[];

  const membershipRows =
    (
      membershipsResult.data ??
      []
    ) as unknown as
      MembershipRow[];

  const bookingRows =
    (
      bookingsResult.data ??
      []
    ) as unknown as
      BookingRow[];

  const ownerBusinessIds =
    new Set(
      membershipRows.map(
        (
          row
        ) =>
          row.business_id
      )
    );

  const bookingCountByBusiness =
    new Map<
      string,
      number
    >();

  for (
    const booking of
    bookingRows
  ) {
    bookingCountByBusiness.set(
      booking.business_id,
      (
        bookingCountByBusiness.get(
          booking.business_id
        ) ??
        0
      ) +
        1
    );
  }

  const tenants:
    PlatformOperationsTenant[] =
    businessRows.map(
      (
        row
      ) => {
        const packageState =
          getPackageLabel(
            row
          );

        return {
          id:
            row.id,
          slug:
            row.slug,
          name:
            row.name,
          publicationStatus:
            resolveBusinessPublicationStatus(
              row.publication_status,
              row.is_active
            ),
          hasActiveOwner:
            ownerBusinessIds.has(
              row.id
            ),
          hasContact:
            hasValue(
              row.phone
            ) ||
            hasValue(
              row.email
            ),
          hasTemplate:
            hasValue(
              row.template_key
            ),
          packageLabel:
            packageState.label,
          packageMode:
            packageState.mode,
          packageRequiresAttention:
            packageState
              .requiresAttention,
          upcomingBookings:
            bookingCountByBusiness.get(
              row.id
            ) ??
            0,
          createdAt:
            row.created_at,
          updatedAt:
            row.updated_at,
        };
      }
    );

  return {
    tenants,
    upcomingBookingsTotal:
      bookingRows.length,
    errors,
  };
}
