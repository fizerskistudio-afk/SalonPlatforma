import type { ReactNode } from "react";

import StaffShell from "@/components/staff/StaffShell";
import { requireStaff } from "@/lib/auth/staff";

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
