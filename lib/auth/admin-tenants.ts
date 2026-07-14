export type AdminTenantRole =
  | "owner"
  | "manager";

export type AdminTenantOption = {
  membershipId: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  role: AdminTenantRole;
};

export type AdminTenantSelection = {
  selected: AdminTenantOption | null;
  requiresSelection: boolean;
};

export function resolveAdminTenantSelection(
  tenants: AdminTenantOption[],
  preferredBusinessId: string | null
): AdminTenantSelection {
  if (tenants.length === 0) {
    return {
      selected: null,
      requiresSelection: false,
    };
  }

  const preferred = preferredBusinessId
    ? tenants.find(
        (tenant) =>
          tenant.businessId ===
          preferredBusinessId
      ) ?? null
    : null;

  if (preferred) {
    return {
      selected: preferred,
      requiresSelection: false,
    };
  }

  if (tenants.length === 1) {
    return {
      selected: tenants[0],
      requiresSelection: false,
    };
  }

  return {
    selected: null,
    requiresSelection: true,
  };
}
