import {
  resolveProductPackageAccess,
  type ProductPackageAccess,
  type ProductPackageAssignmentRow,
} from "./resolver";

export type BusinessProductAccessRow =
  ProductPackageAssignmentRow & {
    id: string;
    slug: string;
  };

export type BusinessProductAccessSnapshot = {
  businessId: string;
  businessSlug: string;
  access:
    ProductPackageAccess;
};

export function resolveBusinessProductAccess(
  row:
    BusinessProductAccessRow
): BusinessProductAccessSnapshot {
  return {
    businessId:
      row.id,
    businessSlug:
      row.slug,
    access:
      resolveProductPackageAccess(
        row
      ),
  };
}
