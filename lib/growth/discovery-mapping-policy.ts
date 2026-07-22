import {
  getCanonicalService,
  resolveCanonicalService,
  type CanonicalServiceKey,
} from "./canonical-services";

export const DISCOVERY_MAPPING_POLICY_VERSION =
  1 as const;

export const DISCOVERY_MAPPING_STATUSES = [
  "suggested",
  "approved",
  "rejected",
  "disabled",
] as const;

export type DiscoveryMappingStatus =
  (typeof DISCOVERY_MAPPING_STATUSES)[number];

export const DISCOVERY_MAPPING_SOURCES = [
  "exact_alias",
  "manual",
] as const;

export type DiscoveryMappingSource =
  (typeof DISCOVERY_MAPPING_SOURCES)[number];

export type DiscoveryServiceMappingReview = {
  tenantServiceId: string;
  tenantServiceName: string;
  tenantServiceSlug: string;
  canonicalServiceKey:
    CanonicalServiceKey;
  status:
    DiscoveryMappingStatus;
  source:
    DiscoveryMappingSource;
  reviewedBy: string | null;
  reviewedAt: string | null;
};

export type DiscoveryMappingPublicationContext = {
  mapping:
    DiscoveryServiceMappingReview;
  tenantDiscoveryOptIn: boolean;
  tenantActive: boolean;
  tenantPublished: boolean;
  tenantServiceActive: boolean;
};

function findCanonicalServiceCandidate(
  values: readonly string[]
):
  | ReturnType<
      typeof resolveCanonicalService
    >
  | null {
  for (
    const value of
    values
  ) {
    const candidate =
      resolveCanonicalService(
        value
      );

    if (candidate) {
      return candidate;
    }
  }

  return null;
}

export function suggestDiscoveryServiceMapping({
  tenantServiceId,
  tenantServiceName,
  tenantServiceSlug,
}: {
  tenantServiceId: string;
  tenantServiceName: string;
  tenantServiceSlug: string;
}):
  | DiscoveryServiceMappingReview
  | null {
  const candidate =
    findCanonicalServiceCandidate([
      tenantServiceSlug,
      tenantServiceName,
    ]);

  if (!candidate) {
    return null;
  }

  return {
    tenantServiceId,
    tenantServiceName,
    tenantServiceSlug,
    canonicalServiceKey:
      candidate.key,
    status: "suggested",
    source: "exact_alias",
    reviewedBy: null,
    reviewedAt: null,
  };
}

export function createManualDiscoveryServiceMapping({
  tenantServiceId,
  tenantServiceName,
  tenantServiceSlug,
  canonicalServiceKey,
}: {
  tenantServiceId: string;
  tenantServiceName: string;
  tenantServiceSlug: string;
  canonicalServiceKey:
    CanonicalServiceKey;
}): DiscoveryServiceMappingReview {
  const canonicalService =
    getCanonicalService(
      canonicalServiceKey
    );

  if (
    !canonicalService ||
    !canonicalService.active
  ) {
    throw new Error(
      "Canonical service is not active."
    );
  }

  return {
    tenantServiceId,
    tenantServiceName,
    tenantServiceSlug,
    canonicalServiceKey,
    status: "suggested",
    source: "manual",
    reviewedBy: null,
    reviewedAt: null,
  };
}

export function approveDiscoveryServiceMapping({
  mapping,
  reviewedBy,
  reviewedAt,
}: {
  mapping:
    DiscoveryServiceMappingReview;
  reviewedBy: string;
  reviewedAt: string;
}): DiscoveryServiceMappingReview {
  if (
    !reviewedBy.trim() ||
    Number.isNaN(
      Date.parse(
        reviewedAt
      )
    )
  ) {
    throw new Error(
      "A valid reviewer and review timestamp are required."
    );
  }

  return {
    ...mapping,
    status: "approved",
    reviewedBy:
      reviewedBy.trim(),
    reviewedAt:
      new Date(
        reviewedAt
      ).toISOString(),
  };
}

export function canPublishDiscoveryServiceMapping({
  mapping,
  tenantDiscoveryOptIn,
  tenantActive,
  tenantPublished,
  tenantServiceActive,
}: DiscoveryMappingPublicationContext): boolean {
  const canonicalService =
    getCanonicalService(
      mapping.canonicalServiceKey
    );

  return (
    mapping.status ===
      "approved" &&
    mapping.reviewedBy !==
      null &&
    mapping.reviewedAt !==
      null &&
    canonicalService !==
      null &&
    canonicalService.active &&
    tenantDiscoveryOptIn &&
    tenantActive &&
    tenantPublished &&
    tenantServiceActive
  );
}
