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
      "Tema sajta",
  };

type SectionLayoutProps = {
  children: ReactNode;
};

export default async function SectionLayout({
  children,
}: SectionLayoutProps) {
  await requirePlatformAdminPermission(
    "tenant.theme.write"
  );

  return children;
}
