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
      "Saloni",
  };

type SectionLayoutProps = {
  children: ReactNode;
};

export default async function SectionLayout({
  children,
}: SectionLayoutProps) {
  await requirePlatformAdminPermission(
    "tenant.read"
  );

  return children;
}
