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
      "Brending",
  };

type SectionLayoutProps = {
  children: ReactNode;
};

export default async function SectionLayout({
  children,
}: SectionLayoutProps) {
  await requirePlatformAdminPermission(
    "tenant.branding.write"
  );

  return children;
}
