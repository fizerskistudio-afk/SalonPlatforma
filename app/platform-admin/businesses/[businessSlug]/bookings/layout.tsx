import type {
  ReactNode,
} from "react";

import {
  requirePlatformAdminPermission,
} from "@/lib/auth/platform-admin";

export default async function BusinessBookingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePlatformAdminPermission(
    "tenant.bookings.read"
  );

  return children;
}
