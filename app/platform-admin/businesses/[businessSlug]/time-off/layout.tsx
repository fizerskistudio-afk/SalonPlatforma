import type {
  ReactNode,
} from "react";

import {
  requirePlatformAdminPermission,
} from "@/lib/auth/platform-admin";

export default async function BusinessTimeOffLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePlatformAdminPermission(
    "tenant.schedule.write"
  );

  return children;
}
