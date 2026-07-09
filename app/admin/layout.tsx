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
        "Salon administracija",

      template:
        `%s | ${SITE_NAME}`,
    },

    description:
      "Privatni panel za upravljanje salonom.",

    robots:
      PRIVATE_PAGE_ROBOTS,
  };

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return children;
}
