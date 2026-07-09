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

  return (
    <StaffShell staff={staff}>
      {children}
    </StaffShell>
  );
}
