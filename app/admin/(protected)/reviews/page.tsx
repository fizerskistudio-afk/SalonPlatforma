import type {
  Metadata,
} from "next";

import ProductFeatureUpgradeNotice from "@/components/admin/ProductFeatureUpgradeNotice";
import AdminReviewsManager from "@/components/admin/reviews/AdminReviewsManager";
import {
  getAdminReviewManagement,
} from "@/lib/admin/reviews";
import {
  loadAdminProductFeatureContext,
} from "@/lib/product-packages/admin-gates-server";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export const metadata:
  Metadata = {
  title:
    "Recenzije",
};

export default async function AdminReviewsPage() {
  const featureContext =
    await loadAdminProductFeatureContext(
      "admin.reviews"
    );

  if (
    !featureContext
      .decision
      .entitled
  ) {
    return (
      <ProductFeatureUpgradeNotice
        featureKey="admin.reviews"
        currentPackageKey={
          featureContext
            .productAccess
            .access
            .packageKey
        }
      />
    );
  }

  const data =
    await getAdminReviewManagement();

  return (
    <AdminReviewsManager
      data={data}
    />
  );
}
