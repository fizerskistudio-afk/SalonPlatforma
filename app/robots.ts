import type {
  MetadataRoute,
} from "next";

import {
  getRequestUrlContext,
} from "@/lib/seo/request-origin";

export const dynamic =
  "force-dynamic";

export default async function robots():
  Promise<MetadataRoute.Robots> {
  const {
    origin,
  } =
    await getRequestUrlContext();

  return {
    rules: {
      userAgent: "*",
      allow: "/",

      disallow: [
        "/admin",
        "/admin/",
        "/staff",
        "/staff/",
        "/platform-admin",
        "/platform-admin/",
        "/auth",
        "/auth/",
        "/api",
        "/api/",
      ],
    },

    sitemap:
      new URL(
        "/sitemap.xml",
        origin
      ).toString(),

    host:
      origin,
  };
}
