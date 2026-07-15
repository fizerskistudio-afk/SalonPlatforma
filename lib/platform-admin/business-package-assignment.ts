import {
  PRODUCT_PACKAGE_CONTRACT_VERSION,
  isProductPackageKey,
  type ProductPackageKey,
} from "@/lib/product-packages/registry";

export type BusinessPackageAssignmentUpdate = {
  package_key:
    ProductPackageKey;
  package_contract_version:
    typeof PRODUCT_PACKAGE_CONTRACT_VERSION;
  package_assigned_at:
    string;
  package_assigned_by_user_id:
    string;
};

export function buildBusinessPackageAssignmentUpdate(
  input: {
    packageKey:
      unknown;
    actorUserId:
      unknown;
    assignedAt:
      string;
  }
):
  | BusinessPackageAssignmentUpdate
  | null {
  if (
    !isProductPackageKey(
      input.packageKey
    ) ||
    typeof input.actorUserId !==
      "string" ||
    input.actorUserId.trim()
      .length === 0
  ) {
    return null;
  }

  const assignedAt =
    new Date(
      input.assignedAt
    );

  if (
    Number.isNaN(
      assignedAt.getTime()
    )
  ) {
    return null;
  }

  return {
    package_key:
      input.packageKey,
    package_contract_version:
      PRODUCT_PACKAGE_CONTRACT_VERSION,
    package_assigned_at:
      assignedAt.toISOString(),
    package_assigned_by_user_id:
      input.actorUserId.trim(),
  };
}
