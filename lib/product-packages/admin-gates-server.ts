import "server-only";

import {
  requireAdmin,
  type AdminContext,
} from "@/lib/auth/admin";
import {
  loadProductPackageAccessForBusinessId,
} from "./access-server";
import {
  getProductFeatureDefinition,
  resolveProductFeatureGate,
  type ProductFeatureGateDecision,
  type ProductFeatureKey,
} from "./gates";
import {
  getProductFeatureUpgradeGuidance,
} from "./upgrade-guidance";
import type {
  BusinessProductAccessSnapshot,
} from "./business-access";

export type AdminProductFeatureContext = {
  admin:
    AdminContext;
  productAccess:
    BusinessProductAccessSnapshot;
  decision:
    ProductFeatureGateDecision;
};

export async function loadAdminProductFeatureContext(
  featureKey:
    ProductFeatureKey
): Promise<AdminProductFeatureContext> {
  const definition =
    getProductFeatureDefinition(
      featureKey
    );

  if (
    definition.surface !==
    "tenant_admin"
  ) {
    throw new Error(
      `Feature ${featureKey} nije tenant-admin feature.`
    );
  }

  const admin =
    await requireAdmin();

  const productAccess =
    admin.productAccess ??
    await loadProductPackageAccessForBusinessId(
      admin.business.id
    );

  if (!productAccess) {
    throw new Error(
      "Paket aktivnog salona nije moguće pronaći."
    );
  }

  return {
    admin,
    productAccess,
    decision:
      resolveProductFeatureGate({
        access:
          productAccess.access,
        featureKey,
        permissionGranted:
          true,
        integrationConnected:
          true,
      }),
  };
}

export const PRODUCT_PACKAGE_REQUIRED_CODE =
  "PRODUCT_PACKAGE_REQUIRED" as const;

export type AdminProductFeatureMutationAccess =
  | {
      allowed: true;
      context:
        AdminProductFeatureContext;
    }
  | {
      allowed: false;
      context:
        AdminProductFeatureContext;
      code:
        typeof PRODUCT_PACKAGE_REQUIRED_CODE;
      message: string;
    };

export async function loadAdminProductFeatureMutationAccess(
  featureKey:
    ProductFeatureKey
): Promise<AdminProductFeatureMutationAccess> {
  const context =
    await loadAdminProductFeatureContext(
      featureKey
    );

  if (
    context
      .decision
      .entitled
  ) {
    return {
      allowed:
        true,
      context,
    };
  }

  const guidance =
    getProductFeatureUpgradeGuidance({
      audience:
        "tenant_admin",
      featureKey,
      currentPackageKey:
        context
          .productAccess
          .access
          .packageKey,
    });

  return {
    allowed:
      false,
    context,
    code:
      PRODUCT_PACKAGE_REQUIRED_CODE,
    message:
      guidance.message,
  };
}
