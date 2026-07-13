import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  requirePlatformAdminPermission,
} from "@/lib/auth/platform-admin";

export const metadata:
  Metadata = {
    title:
      "Owner pristup",
  };

type SectionLayoutProps = {
  children: ReactNode;
};

export default async function SectionLayout({
  children,
}: SectionLayoutProps) {
  await requirePlatformAdminPermission(
    "tenant.owner_access.read"
  );

  return children;
}
