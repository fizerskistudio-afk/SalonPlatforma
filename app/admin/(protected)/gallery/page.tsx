import ProductFeatureUpgradeNotice from "@/components/admin/ProductFeatureUpgradeNotice";
import GalleryManagementActions from "@/components/admin/gallery/GalleryManagementActions";
import { getAdminGallery } from "@/lib/admin/gallery";
import {
  loadAdminProductFeatureContext,
} from "@/lib/product-packages/admin-gates-server";

export const dynamic =
  "force-dynamic";

export default async function AdminGalleryPage() {
  const featureContext =
    await loadAdminProductFeatureContext(
      "admin.gallery"
    );

  if (
    !featureContext
      .decision
      .entitled
  ) {
    return (
      <ProductFeatureUpgradeNotice
        featureKey="admin.gallery"
        currentPackageKey={
          featureContext
            .productAccess
            .access
            .packageKey
        }
      />
    );
  }

  const result =
    await getAdminGallery();

  return (
    <GalleryManagementActions
      data={result}
    />
  );
}
