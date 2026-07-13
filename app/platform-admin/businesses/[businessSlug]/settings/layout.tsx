import type {
  ReactNode,
} from "react";

import {
  requirePlatformAdminPermission,
} from "@/lib/auth/platform-admin";

export default async function BusinessSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePlatformAdminPermission(
    "tenant.settings.write"
  );

  return children;
}
