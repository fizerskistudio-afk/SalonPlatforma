import type {
  ReactNode,
} from "react";

import {
  requirePlatformAdminPermission,
} from "@/lib/auth/platform-admin";

export default async function BusinessProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePlatformAdminPermission(
    "tenant.profile.write"
  );

  return children;
}
