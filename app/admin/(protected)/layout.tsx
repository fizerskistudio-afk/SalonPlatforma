import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import AdminShell from "@/components/admin/AdminShell";
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
import { measureAdminServerStep } from "@/lib/performance/admin-server-timing";

export async function generateMetadata():
  Promise<Metadata> {
  const admin =
    await measureAdminServerStep(
      "admin.metadata.context",
      () =>
        getAdminContext()
    );

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
    await measureAdminServerStep(
      "admin.layout.requireAdmin",
      () =>
        requireAdmin()
    );

  const productAccess =
    await measureAdminServerStep(
      "admin.layout.productAccess",
      () =>
        admin.productAccess
          ? Promise.resolve(
              admin.productAccess
            )
          : loadProductPackageAccessForBusinessId(
              admin.business.id
            )
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

  const publicLinks =
    buildBusinessPublicLinks(
      admin.business.slug
    );

  return (
    <AdminShell
      productAccess={
        productAccess.access
      }
      reviewsEnabled={
        reviewsDecision.allowed
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
