import "server-only";

import {
  headers,
} from "next/headers";

import {
  getSiteUrl,
} from "./site";

export type RequestUrlContext = {
  origin: string;
  host: string;
};

function getFirstHeaderValue(
  value: string | null
): string {
  return value
    ?.split(",")[0]
    ?.trim() ?? "";
}

export async function getRequestUrlContext():
  Promise<RequestUrlContext> {
  const requestHeaders =
    await headers();

  const host =
    getFirstHeaderValue(
      requestHeaders.get(
        "x-forwarded-host"
      )
    ) ||
    getFirstHeaderValue(
      requestHeaders.get(
        "host"
      )
    );

  const forwardedProtocol =
    getFirstHeaderValue(
      requestHeaders.get(
        "x-forwarded-proto"
      )
    ).toLowerCase();

  const protocol =
    forwardedProtocol === "http" ||
    forwardedProtocol === "https"
      ? forwardedProtocol
      : host.includes(
            "localhost"
          ) ||
          host.startsWith(
            "127.0.0.1"
          )
        ? "http"
        : "https";

  if (host) {
    try {
      const requestUrl =
        new URL(
          `${protocol}://${host}`
        );

      return {
        origin:
          requestUrl.origin,
        host:
          requestUrl.host,
      };
    } catch {
      // Koristi kanonski platform URL kao fallback.
    }
  }

  const siteUrl =
    getSiteUrl();

  return {
    origin:
      siteUrl.origin,
    host:
      siteUrl.host,
  };
}
