import type {
  Metadata,
} from "next";

export const SITE_NAME =
  "Ordum Studios";

export const SITE_SHORT_NAME =
  "Ordum";

export const SITE_DESCRIPTION =
  "Profesionalni sajt, online zakazivanje i operativni alati za beauty i wellness studije.";

export const DEFAULT_SITE_URL =
  "https://ordumstudios.com";

export const PRIVATE_PAGE_ROBOTS:
  Metadata["robots"] = {
    index: false,
    follow: false,

    googleBot: {
      index: false,
      follow: false,
    },
  };

export function getSiteUrl(): URL {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    try {
      return new URL(configuredUrl);
    } catch {
      // Koristi bezbedni produkcioni fallback.
    }
  }

  return new URL(
    DEFAULT_SITE_URL
  );
}

export function toAbsoluteSiteUrl(
  value: string
): string {
  try {
    return new URL(
      value
    ).toString();
  } catch {
    return new URL(
      value,
      getSiteUrl()
    ).toString();
  }
}
