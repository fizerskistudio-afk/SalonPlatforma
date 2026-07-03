export const SITE_NAME =
  "Lumière Studio";

export const SITE_SHORT_NAME =
  "Lumière";

export const SITE_DESCRIPTION =
  "Frizerske i beauty usluge sa jednostavnim online zakazivanjem termina.";

export const DEFAULT_SITE_URL =
  "https://salon-platforma.vercel.app";

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
