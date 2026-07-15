import "server-only";

import {
  resolveProductPackageAccess,
  type ProductPackageAccess,
  type ProductPackageAssignmentRow,
} from "@/lib/product-packages/server";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

type BusinessPackageRow =
  ProductPackageAssignmentRow & {
    id: string;
    slug: string;
    updated_at: string;
  };

export type BusinessPackageContext = {
  businessId: string;
  businessSlug: string;
  updatedAt: string;
  packageAssignedAt:
    string | null;
  packageAssignedByUserId:
    string | null;
  access:
    ProductPackageAccess;
};

export class BusinessPackageLoadError extends Error {
  constructor(
    message: string
  ) {
    super(message);
    this.name =
      "BusinessPackageLoadError";
  }
}

export async function loadBusinessPackageContext(
  businessSlug: string
): Promise<BusinessPackageContext | null> {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from("businesses")
    .select(
      `
        id,
        slug,
        updated_at,
        package_key,
        package_contract_version,
        package_assigned_at,
        package_assigned_by_user_id
      `
    )
    .eq(
      "slug",
      businessSlug
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Business package query failed:",
      error
    );

    throw new BusinessPackageLoadError(
      "Paket salona trenutno nije moguće učitati."
    );
  }

  if (!data) {
    return null;
  }

  const row =
    data as unknown as
      BusinessPackageRow;

  return {
    businessId:
      row.id,
    businessSlug:
      row.slug,
    updatedAt:
      row.updated_at,
    packageAssignedAt:
      row.package_assigned_at,
    packageAssignedByUserId:
      row.package_assigned_by_user_id,
    access:
      resolveProductPackageAccess(
        row
      ),
  };
}
