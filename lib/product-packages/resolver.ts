import {
  PRODUCT_ENTITLEMENTS,
  PRODUCT_PACKAGE_CONTRACT_VERSION,
  getPackageEntitlements,
  isProductPackageKey,
  type ProductEntitlement,
  type ProductPackageKey,
} from "./registry";

export type ProductPackageAssignmentRow = {
  package_key: string | null;
  package_contract_version:
    number | null;
  package_assigned_at:
    string | null;
  package_assigned_by_user_id:
    string | null;
};

export type ProductPackageAccessMode =
  | "legacy_full_access"
  | "assigned"
  | "invalid_assignment";

export type ProductPackageAccess = {
  mode: ProductPackageAccessMode;
  packageKey:
    ProductPackageKey | null;
  contractVersion:
    number | null;
  entitlements:
    readonly ProductEntitlement[];
  grantsAllEntitlements: boolean;
  requiresAttention: boolean;
  reason:
    | "legacy_unassigned"
    | "assigned"
    | "missing_contract_version"
    | "unsupported_contract_version"
    | "unknown_package_key";
};

export type ProductFeatureBlocker =
  | "package"
  | "permission"
  | "integration";

export type ProductFeatureDecision = {
  entitlement:
    ProductEntitlement;
  entitled: boolean;
  permissionGranted: boolean;
  integrationRequired: boolean;
  integrationConnected: boolean;
  allowed: boolean;
  blockedBy:
    ProductFeatureBlocker | null;
};

const ALL_PRODUCT_ENTITLEMENTS =
  [...PRODUCT_ENTITLEMENTS] as const;

function resolveInvalidAssignment(
  input: {
    packageKey:
      ProductPackageKey | null;
    contractVersion:
      number | null;
    reason:
      | "missing_contract_version"
      | "unsupported_contract_version"
      | "unknown_package_key";
  }
): ProductPackageAccess {
  return {
    mode: "invalid_assignment",
    packageKey:
      input.packageKey,
    contractVersion:
      input.contractVersion,
    entitlements:
      ALL_PRODUCT_ENTITLEMENTS,
    grantsAllEntitlements:
      true,
    requiresAttention:
      true,
    reason:
      input.reason,
  };
}

export function resolveProductPackageAccess(
  assignment:
    Pick<
      ProductPackageAssignmentRow,
      | "package_key"
      | "package_contract_version"
    >
): ProductPackageAccess {
  if (
    assignment.package_key ===
    null
  ) {
    return {
      mode:
        "legacy_full_access",
      packageKey:
        null,
      contractVersion:
        assignment
          .package_contract_version,
      entitlements:
        ALL_PRODUCT_ENTITLEMENTS,
      grantsAllEntitlements:
        true,
      requiresAttention:
        false,
      reason:
        "legacy_unassigned",
    };
  }

  if (
    !isProductPackageKey(
      assignment.package_key
    )
  ) {
    return resolveInvalidAssignment({
      packageKey:
        null,
      contractVersion:
        assignment
          .package_contract_version,
      reason:
        "unknown_package_key",
    });
  }

  if (
    assignment
      .package_contract_version ===
    null
  ) {
    return resolveInvalidAssignment({
      packageKey:
        assignment.package_key,
      contractVersion:
        null,
      reason:
        "missing_contract_version",
    });
  }

  if (
    assignment
      .package_contract_version !==
    PRODUCT_PACKAGE_CONTRACT_VERSION
  ) {
    return resolveInvalidAssignment({
      packageKey:
        assignment.package_key,
      contractVersion:
        assignment
          .package_contract_version,
      reason:
        "unsupported_contract_version",
    });
  }

  return {
    mode:
      "assigned",
    packageKey:
      assignment.package_key,
    contractVersion:
      assignment
        .package_contract_version,
    entitlements:
      getPackageEntitlements(
        assignment.package_key
      ),
    grantsAllEntitlements:
      false,
    requiresAttention:
      false,
    reason:
      "assigned",
  };
}

export function hasProductEntitlement(
  access:
    ProductPackageAccess,
  entitlement:
    ProductEntitlement
): boolean {
  return (
    access.grantsAllEntitlements ||
    access.entitlements.includes(
      entitlement
    )
  );
}

export function resolveProductFeatureDecision(
  input: {
    access:
      ProductPackageAccess;
    entitlement:
      ProductEntitlement;
    permissionGranted:
      boolean;
    integrationRequired?:
      boolean;
    integrationConnected?:
      boolean;
  }
): ProductFeatureDecision {
  const entitled =
    hasProductEntitlement(
      input.access,
      input.entitlement
    );

  const integrationRequired =
    input.integrationRequired ??
    false;

  const integrationConnected =
    integrationRequired
      ? input.integrationConnected ===
        true
      : true;

  let blockedBy:
    ProductFeatureBlocker | null =
      null;

  if (!entitled) {
    blockedBy =
      "package";
  } else if (
    !input.permissionGranted
  ) {
    blockedBy =
      "permission";
  } else if (
    !integrationConnected
  ) {
    blockedBy =
      "integration";
  }

  return {
    entitlement:
      input.entitlement,
    entitled,
    permissionGranted:
      input.permissionGranted,
    integrationRequired,
    integrationConnected,
    allowed:
      blockedBy === null,
    blockedBy,
  };
}
