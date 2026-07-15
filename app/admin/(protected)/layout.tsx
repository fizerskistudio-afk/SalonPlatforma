import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import AdminShell from "@/components/admin/AdminShell";
import {
  getAdminReviewAttentionCount,
} from "@/lib/admin/reviews";
import {
  getAdminContext,
  requireAdmin,
} from "@/lib/auth/admin";
import {
  loadProductPackageAccessForBusinessId,
} from "@/lib/product-packages/access-server";
import {
  resolveProductFeatureGate,
} from "@/lib/product-packages/gates";
import {
  buildBusinessPublicLinks,
} from "@/lib/platform-admin/business-public-links";

export async function generateMetadata():
  Promise<Metadata> {
  const admin =
    await getAdminContext();

  if (!admin) {
    return {
      title:
        "Salon administracija",
    };
  }

  return {
    title: {
      default:
        `Kontrolna tabla | ${admin.business.name}`,

      template:
        `%s | ${admin.business.name}`,
    },
  };
}

type ProtectedAdminLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  const admin =
    await requireAdmin();

  const productAccess =
    await loadProductPackageAccessForBusinessId(
      admin.business.id
    );

  if (!productAccess) {
    throw new Error(
      "Paket aktivnog salona nije moguće učitati."
    );
  }

  const reviewsDecision =
    resolveProductFeatureGate({
      access:
        productAccess.access,
      featureKey:
        "admin.reviews",
      permissionGranted:
        true,
      integrationConnected:
        true,
    });

  const reviewAttentionCount =
    reviewsDecision.allowed
      ? await getAdminReviewAttentionCount(
          admin.business.id
        )
      : 0;

  const publicLinks =
    buildBusinessPublicLinks(
      admin.business.slug
    );

  return (
    <AdminShell
      productAccess={
        productAccess.access
      }
      reviewAttentionCount={
        reviewAttentionCount
      }
      admin={{
        email: admin.email,
        role: admin.role,
        tenantCount:
          admin.tenants.length,

        business: {
          name:
            admin.business.name,
          slug:
            admin.business.slug,
          publicUrl:
            publicLinks.publicUrl,
        },
      }}
    >
      {children}
    </AdminShell>
  );
}
