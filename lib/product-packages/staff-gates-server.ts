import "server-only";

import {
  requireStaff,
  type StaffContext,
} from "@/lib/auth/staff";
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

type RequiredStaffContext =
  StaffContext & {
    employee:
      NonNullable<
        StaffContext["employee"]
      >;
  };

export type StaffProductFeatureContext = {
  staff:
    RequiredStaffContext;
  productAccess:
    BusinessProductAccessSnapshot;
  decision:
    ProductFeatureGateDecision;
};

export const PRODUCT_PACKAGE_REQUIRED_CODE =
  "PRODUCT_PACKAGE_REQUIRED" as const;

export type StaffProductFeatureBusinessContext = {
  productAccess:
    BusinessProductAccessSnapshot;
  decision:
    ProductFeatureGateDecision;
};

export type StaffProductFeatureServerAccess =
  | {
      allowed: true;
      context:
        StaffProductFeatureBusinessContext;
    }
  | {
      allowed: false;
      context:
        StaffProductFeatureBusinessContext;
      code:
        typeof PRODUCT_PACKAGE_REQUIRED_CODE;
      message: string;
    };

function assertStaffFeature(
  featureKey:
    ProductFeatureKey
) {
  const definition =
    getProductFeatureDefinition(
      featureKey
    );

  if (
    definition.surface !==
    "staff"
  ) {
    throw new Error(
      `Feature ${featureKey} nije staff feature.`
    );
  }

  return definition;
}

export async function loadStaffProductFeatureServerAccessForBusinessId(
  businessId: string,
  featureKey:
    ProductFeatureKey
): Promise<StaffProductFeatureServerAccess> {
  assertStaffFeature(
    featureKey
  );

  const productAccess =
    await loadProductPackageAccessForBusinessId(
      businessId
    );

  if (!productAccess) {
    throw new Error(
      "Paket aktivnog salona nije moguće pronaći."
    );
  }

  const decision =
    resolveProductFeatureGate({
      access:
        productAccess.access,
      featureKey,
      permissionGranted:
        true,
      integrationConnected:
        true,
    });

  const context = {
    productAccess,
    decision,
  };

  if (
    decision
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
        "staff",
      featureKey,
      currentPackageKey:
        productAccess
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

export async function loadStaffProductFeatureContext(
  featureKey:
    ProductFeatureKey
): Promise<StaffProductFeatureContext> {
  const staff =
    await requireStaff();

  const featureAccess =
    await loadStaffProductFeatureServerAccessForBusinessId(
      staff.business.id,
      featureKey
    );

  return {
    staff,
    productAccess:
      featureAccess
        .context
        .productAccess,
    decision:
      featureAccess
        .context
        .decision,
  };
}
