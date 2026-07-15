import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import StaffShell from "@/components/staff/StaffShell";
import {
  getStaffContext,
  requireStaff,
} from "@/lib/auth/staff";
import {
  loadProductPackageAccessForBusinessId,
} from "@/lib/product-packages/access-server";

export async function generateMetadata():
  Promise<Metadata> {
  const staff =
    await getStaffContext();

  if (!staff) {
    return {
      title:
        "Staff pristup",
    };
  }

  return {
    title: {
      default:
        `Moj raspored | ${staff.business.name}`,

      template:
        `%s | ${staff.business.name}`,
    },
  };
}

type StaffLayoutProps = {
  children: ReactNode;
};

export default async function StaffLayout({
  children,
}: StaffLayoutProps) {
  const staff =
    await requireStaff();

  const productAccess =
    await loadProductPackageAccessForBusinessId(
      staff.business.id
    );

  if (!productAccess) {
    throw new Error(
      "Paket aktivnog salona nije moguće učitati."
    );
  }

  return (
    <StaffShell
      staff={staff}
      productAccess={
        productAccess.access
      }
    >
      {children}
    </StaffShell>
  );
}
