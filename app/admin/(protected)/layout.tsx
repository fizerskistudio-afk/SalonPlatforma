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

  const reviewAttentionCount =
    await getAdminReviewAttentionCount(
      admin.business.id
    );

  return (
    <AdminShell
      reviewAttentionCount={
        reviewAttentionCount
      }
      admin={{
        email: admin.email,
        role: admin.role,

        business: {
          name:
            admin.business.name,
          slug:
            admin.business.slug,
        },
      }}
    >
      {children}
    </AdminShell>
  );
}
