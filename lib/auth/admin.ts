import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getPreferredAdminBusinessId } from "@/lib/auth/admin-active-business";
import {
  resolveAdminTenantSelection,
  type AdminTenantOption,
  type AdminTenantRole,
} from "@/lib/auth/admin-tenants";
import { createClient } from "@/lib/supabase/server";
import { measureAdminServerStep } from "@/lib/performance/admin-server-timing";
import {
  resolveBusinessProductAccess,
  type BusinessProductAccessRow,
  type BusinessProductAccessSnapshot,
} from "@/lib/product-packages/business-access";

export type AdminRole = AdminTenantRole;

type MembershipRow = {
  id: string;
  business_id: string;
  role:
    | "owner"
    | "manager"
    | "staff";
  is_active: boolean;
};

type BusinessRow =
  BusinessProductAccessRow & {
    name: string;
    is_active: boolean;
  };

type MembershipBusinessRow =
  MembershipRow & {
    businesses:
      | BusinessRow
      | BusinessRow[]
      | null;
  };

export type AdminContext = {
  userId: string;
  email: string | null;
  membershipId: string;
  role: AdminRole;
  mustChangePassword: boolean;
  tenants: AdminTenantOption[];
  requiresTenantSelection: boolean;
  productAccess?:
    BusinessProductAccessSnapshot;

  business: {
    id: string;
    name: string;
    slug: string;
  };
};

type RequireAdminOptions = {
  allowPasswordChange?: boolean;
  allowTenantSelection?: boolean;
};

function isJsonRecord(
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

function getMustChangePassword(
  claims: unknown
): boolean {
  if (
    !isJsonRecord(
      claims
    )
  ) {
    return false;
  }

  const appMetadata =
    claims.app_metadata;

  return (
    isJsonRecord(
      appMetadata
    ) &&
    appMetadata.must_change_password ===
      true
  );
}

/**
 * Vraća kontekst trenutno prijavljenog
 * vlasnika ili menadžera.
 *
 * Ako sesija ili članstvo nisu validni,
 * vraća null.
 */
export const getAdminContext = cache(
  async (): Promise<AdminContext | null> => {
    const supabase =
      await measureAdminServerStep(
        "admin.context.createClient",
        () =>
          createClient()
      );

    const {
      data: claimsData,
      error: claimsError,
    } =
      await measureAdminServerStep(
        "admin.context.claims",
        () =>
          supabase.auth.getClaims()
      );

    /*
     * Eksplicitno proveravamo claimsData
     * pre korišćenja, kako TypeScript ne bi
     * smatrao da može biti null.
     */
    if (
      claimsError ||
      !claimsData ||
      !claimsData.claims
    ) {
      return null;
    }

    const claims =
      claimsData.claims;

    const userId =
      claims.sub;

    if (
      typeof userId !== "string" ||
      userId.length === 0
    ) {
      return null;
    }

    const {
      data: tenantData,
      error: tenantError,
    } =
      await measureAdminServerStep(
        "admin.context.tenantRead",
        async () =>
          await supabase
            .from("business_members")
            .select(
              `
                id,
                business_id,
                role,
                is_active,
                businesses!inner (
                  id,
                  name,
                  slug,
                  is_active,
                  package_key,
                  package_contract_version,
                  package_assigned_at,
                  package_assigned_by_user_id
                )
              `
            )
            .eq("user_id", userId)
            .eq("is_active", true)
            .in("role", [
              "owner",
              "manager",
            ])
            .eq(
              "businesses.is_active",
              true
            )
            .order("created_at", {
              ascending: true,
            })
      );

    if (
      tenantError ||
      !tenantData ||
      tenantData.length === 0
    ) {
      return null;
    }

    const tenantRows =
      tenantData as unknown as
        MembershipBusinessRow[];

    const memberships:
      MembershipRow[] = [];
    const businessById =
      new Map<
        string,
        BusinessRow
      >();

    for (
      const row of tenantRows
    ) {
      const business =
        Array.isArray(
          row.businesses
        )
          ? row.businesses[0] ??
            null
          : row.businesses;

      if (
        !business ||
        !business.is_active
      ) {
        continue;
      }

      memberships.push({
        id: row.id,
        business_id:
          row.business_id,
        role: row.role,
        is_active:
          row.is_active,
      });

      businessById.set(
        business.id,
        business
      );
    }

    if (
      memberships.length === 0 ||
      businessById.size === 0
    ) {
      return null;
    }

    const tenants = memberships.flatMap(
      (membership): AdminTenantOption[] => {
        const business =
          businessById.get(
            membership.business_id
          );

        if (
          !business ||
          (membership.role !== "owner" &&
            membership.role !== "manager")
        ) {
          return [];
        }

        return [
          {
            membershipId: membership.id,
            businessId: business.id,
            businessName: business.name,
            businessSlug: business.slug,
            role: membership.role,
          },
        ];
      }
    );

    const preferredBusinessId =
      await measureAdminServerStep(
        "admin.context.preferredBusiness",
        () =>
          getPreferredAdminBusinessId()
      );

    const selection =
      resolveAdminTenantSelection(
        tenants,
        preferredBusinessId
      );

    if (
      !selection.selected &&
      !selection.requiresSelection
    ) {
      return null;
    }

    const selected =
      selection.selected ?? tenants[0];

    const selectedBusiness =
      businessById.get(
        selected.businessId
      );

    if (
      !selectedBusiness
    ) {
      return null;
    }

    const emailClaim =
      claims.email;

    return {
      userId,

      email:
        typeof emailClaim ===
        "string"
          ? emailClaim
          : null,

      membershipId:
        selected.membershipId,

      role:
        selected.role,

      mustChangePassword:
        getMustChangePassword(
          claims
        ),

      tenants,
      requiresTenantSelection:
        selection.requiresSelection,

      productAccess:
        resolveBusinessProductAccess(
          selectedBusiness
        ),

      business: {
        id: selected.businessId,
        name: selected.businessName,
        slug: selected.businessSlug,
      },
    };
  }
);

/**
 * Koristi se u zaštićenim admin rutama.
 * Neprijavljeni korisnik se šalje na login.
 * Nalog sa privremenom lozinkom se šalje na
 * obaveznu promenu lozinke, osim kada je ta
 * ruta eksplicitno dozvoljena.
 */
export async function requireAdmin(
  options:
    RequireAdminOptions =
      {}
): Promise<AdminContext> {
  const context =
    await getAdminContext();

  if (!context) {
    redirect("/admin/login");
  }

  if (
    context.mustChangePassword &&
    !options.allowPasswordChange
  ) {
    redirect(
      "/admin/change-password"
    );
  }

  if (
    context.requiresTenantSelection &&
    !options.allowTenantSelection
  ) {
    redirect(
      "/admin/select-business"
    );
  }

  return context;
}
