export const GROWTH_ATTRIBUTION_CONTRACT_VERSION =
  1 as const;

export const GROWTH_ATTRIBUTION_QUERY_KEY =
  "ordum_ref" as const;

export const GROWTH_ATTRIBUTION_SOURCE =
  "ordum_discovery" as const;

export const GROWTH_ATTRIBUTION_EVENT_TYPES = [
  "discovery.search_submitted",
  "discovery.result_impression",
  "discovery.result_clicked",
  "tenant.booking_opened",
  "tenant.booking_completed",
] as const;

export type GrowthAttributionEventType =
  (typeof GROWTH_ATTRIBUTION_EVENT_TYPES)[number];

export const GROWTH_ATTRIBUTION_ALLOWED_DIMENSIONS = [
  "attributionId",
  "eventType",
  "source",
  "canonicalLocationKey",
  "canonicalServiceKey",
  "businessSlug",
  "tenantServiceId",
  "employeeId",
  "startsAt",
  "occurredAt",
] as const;

export const GROWTH_ATTRIBUTION_FORBIDDEN_FIELDS = [
  "customerName",
  "customerPhone",
  "customerEmail",
  "customerNote",
  "rawIpAddress",
] as const;

export type GrowthAttributionEvent = {
  attributionId: string;
  eventType: GrowthAttributionEventType;
  source:
    typeof GROWTH_ATTRIBUTION_SOURCE;
  canonicalLocationKey: string;
  canonicalServiceKey: string;
  businessSlug: string | null;
  tenantServiceId: string | null;
  employeeId: string | null;
  startsAt: string | null;
  occurredAt: string;
};

const ATTRIBUTION_ID_PATTERN =
  /^[A-Za-z0-9_-]{12,128}$/;

export function isValidGrowthAttributionId(
  value: string
): boolean {
  return ATTRIBUTION_ID_PATTERN.test(
    value
  );
}

export function isGrowthAttributionEventType(
  value: string
): value is GrowthAttributionEventType {
  return (
    GROWTH_ATTRIBUTION_EVENT_TYPES as
      readonly string[]
  ).includes(value);
}
