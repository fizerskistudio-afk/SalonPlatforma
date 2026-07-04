export const BUSINESS_MEDIA_BUCKET =
  "business-media";

export const BUSINESS_MEDIA_TARGETS = [
  "business-logo",
  "business-hero",
  "employee-image",
] as const;

export type BusinessMediaTarget =
  (typeof BUSINESS_MEDIA_TARGETS)[number];

export const BUSINESS_MEDIA_ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif";

export const BUSINESS_MEDIA_ALLOWED_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ]);

export const BUSINESS_MEDIA_MAX_BYTES: Record<
  BusinessMediaTarget,
  number
> = {
  "business-logo":
    2 * 1024 * 1024,
  "business-hero":
    5 * 1024 * 1024,
  "employee-image":
    3 * 1024 * 1024,
};

export type BusinessBrandingBusiness = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  heroImageUrl: string;
  updatedAt: string;
  isActive: boolean;
};

export type BusinessBrandingEmployee = {
  id: string;
  slug: string;
  name: string;
  title: string;
  imageUrl: string;
  updatedAt: string;
  isActive: boolean;
};

export type BusinessBrandingData = {
  business:
    BusinessBrandingBusiness;
  employees:
    BusinessBrandingEmployee[];
};

export type BusinessMediaMutationResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
  result?: {
    target?:
      BusinessMediaTarget;
    employeeSlug?:
      string | null;
    url?:
      string | null;
    updatedAt?: string;
    cleanupWarning?:
      boolean;
  };
};

export function isBusinessMediaTarget(
  value: unknown
): value is BusinessMediaTarget {
  return (
    typeof value ===
      "string" &&
    BUSINESS_MEDIA_TARGETS.includes(
      value as
        BusinessMediaTarget
    )
  );
}

export function formatMaxFileSize(
  target: BusinessMediaTarget
): string {
  const megabytes =
    BUSINESS_MEDIA_MAX_BYTES[
      target
    ] /
    (1024 * 1024);

  return `${megabytes} MB`;
}
