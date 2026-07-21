export const GROWTH_DISCOVERY_CONTRACT_VERSION =
  1 as const;

export const DISCOVERY_SORT_MODES = [
  "earliest_available",
] as const;

export type DiscoverySortMode =
  (typeof DISCOVERY_SORT_MODES)[number];

export const DISCOVERY_BOOKING_QUERY_KEYS = {
  openBooking: "book",
  serviceId: "serviceId",
  employeeId: "employeeId",
  startsAt: "startsAt",
  attributionId: "ordum_ref",
} as const;

export type CanonicalLocationDefinition = {
  key: string;
  countryCode: string;
  citySlug: string;
  displayName: string;
  aliases: readonly string[];
  active: boolean;
};

export type CanonicalServiceDefinition = {
  key: string;
  vertical: string;
  slug: string;
  displayName: string;
  aliases: readonly string[];
  active: boolean;
};

export type TenantDiscoveryProfile = {
  businessId: string;
  businessSlug: string;
  canonicalLocationKey: string;
  active: boolean;
  published: boolean;
  discoveryOptIn: boolean;
};

export type TenantServiceDiscoveryMapping = {
  businessId: string;
  businessSlug: string;
  tenantServiceId: string;
  canonicalServiceKey: string;
  active: boolean;
  discoverable: boolean;
};

export type DiscoverySearchRequest = {
  canonicalLocationKey: string;
  canonicalServiceKey: string;
  date: string;
  sort: DiscoverySortMode;
  limit: number;
};

export type DiscoveryCandidate = {
  businessId: string;
  businessSlug: string;
  tenantServiceId: string;
  employeeId: string;
  employeeName: string;
  startsAt: string;
  endsAt: string;
  priceFrom: number;
  currency: string;
  tenantPublicUrl: string;
};

export type DiscoveryRedirectIntent = {
  attributionId: string;
  businessSlug: string;
  tenantServiceId: string;
  employeeId: string;
  startsAt: string;
};

export function isTenantServiceDiscoverable({
  profile,
  mapping,
}: {
  profile: TenantDiscoveryProfile;
  mapping: TenantServiceDiscoveryMapping;
}): boolean {
  return (
    profile.businessId ===
      mapping.businessId &&
    profile.businessSlug ===
      mapping.businessSlug &&
    profile.active &&
    profile.published &&
    profile.discoveryOptIn &&
    mapping.active &&
    mapping.discoverable
  );
}

export function compareDiscoveryCandidatesByEarliest(
  left: DiscoveryCandidate,
  right: DiscoveryCandidate
): number {
  const startsAtDifference =
    Date.parse(left.startsAt) -
    Date.parse(right.startsAt);

  if (startsAtDifference !== 0) {
    return startsAtDifference;
  }

  const businessDifference =
    left.businessSlug.localeCompare(
      right.businessSlug
    );

  if (businessDifference !== 0) {
    return businessDifference;
  }

  return left.employeeName.localeCompare(
    right.employeeName
  );
}

export function buildTenantBookingPreselectionQuery(
  intent: DiscoveryRedirectIntent
): string {
  const params =
    new URLSearchParams({
      [DISCOVERY_BOOKING_QUERY_KEYS.openBooking]:
        "1",
      [DISCOVERY_BOOKING_QUERY_KEYS.serviceId]:
        intent.tenantServiceId,
      [DISCOVERY_BOOKING_QUERY_KEYS.employeeId]:
        intent.employeeId,
      [DISCOVERY_BOOKING_QUERY_KEYS.startsAt]:
        intent.startsAt,
      [DISCOVERY_BOOKING_QUERY_KEYS.attributionId]:
        intent.attributionId,
    });

  return params.toString();
}
