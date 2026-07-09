import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  PRIVATE_PAGE_ROBOTS,
  SITE_NAME,
} from "@/lib/seo/site";

export const metadata:
  Metadata = {
    title: {
      default:
        "Staff pristup",

      template:
        `%s | ${SITE_NAME}`,
    },

    description:
      "Privatni staff panel salona.",

    robots:
      PRIVATE_PAGE_ROBOTS,
  };

type StaffRootLayoutProps = {
  children: ReactNode;
};

export default function StaffRootLayout({
  children,
}: StaffRootLayoutProps) {
  return children;
}
