import type {
  ReactNode,
} from "react";

import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";

type ProtectedAdminLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  const admin =
    await requireAdmin();

  return (
    <AdminShell
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