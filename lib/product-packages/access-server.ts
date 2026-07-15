import "server-only";

import {
  cache,
} from "react";

import {
  resolveBusinessProductAccess,
  type BusinessProductAccessRow,
  type BusinessProductAccessSnapshot,
} from "./business-access";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

export class ProductPackageAccessLoadError extends Error {
  constructor(
    message: string
  ) {
    super(message);
    this.name =
      "ProductPackageAccessLoadError";
  }
}

const BUSINESS_PACKAGE_SELECT = `
  id,
  slug,
  package_key,
  package_contract_version,
  package_assigned_at,
  package_assigned_by_user_id
`;

function resolveRow(
  value: unknown
): BusinessProductAccessSnapshot {
  return resolveBusinessProductAccess(
    value as
      BusinessProductAccessRow
  );
}

export const loadProductPackageAccessForBusinessId =
  cache(
    async (
      businessId: string
    ): Promise<BusinessProductAccessSnapshot | null> => {
      const supabase =
        createAdminClient();

      const {
        data,
        error,
      } = await supabase
        .from(
          "businesses"
        )
        .select(
          BUSINESS_PACKAGE_SELECT
        )
        .eq(
          "id",
          businessId
        )
        .maybeSingle();

      if (error) {
        console.error(
          "Product package access query by business id failed:",
          error
        );

        throw new ProductPackageAccessLoadError(
          "Paket salona trenutno nije moguće učitati."
        );
      }

      return data
        ? resolveRow(
            data
          )
        : null;
    }
  );

export const loadProductPackageAccessForBusinessSlug =
  cache(
    async (
      businessSlug: string
    ): Promise<BusinessProductAccessSnapshot | null> => {
      const supabase =
        createAdminClient();

      const {
        data,
        error,
      } = await supabase
        .from(
          "businesses"
        )
        .select(
          BUSINESS_PACKAGE_SELECT
        )
        .eq(
          "slug",
          businessSlug
        )
        .maybeSingle();

      if (error) {
        console.error(
          "Product package access query by business slug failed:",
          error
        );

        throw new ProductPackageAccessLoadError(
          "Paket salona trenutno nije moguće učitati."
        );
      }

      return data
        ? resolveRow(
            data
          )
        : null;
    }
  );
