import type {
  ReactNode,
} from "react";

import {
  requirePlatformAdminPermission,
} from "@/lib/auth/platform-admin";

export default async function StaffSetupLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePlatformAdminPermission(
    "tenant.team.write"
  );

  return children;
}
