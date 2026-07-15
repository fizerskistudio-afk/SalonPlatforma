import {
  getTenantAttentionReasons,
  getTenantAttentionSeverity,
  type TenantAttentionSeverity,
} from "@/lib/platform-admin/operational-readiness";
import type {
  PlatformOperationsTenant,
} from "@/lib/platform-admin/operations-server";
export const PLATFORM_OPERATIONS_VIEWS = [
  "attention",
  "launch",
  "published",
  "all",
] as const;

export type PlatformOperationsView =
  (typeof PLATFORM_OPERATIONS_VIEWS)[number];

export const PLATFORM_OPERATIONS_LIFECYCLE_FILTERS = [
  "all",
  "draft",
  "published",
  "suspended",
  "archived",
] as const;

export type PlatformOperationsLifecycleFilter =
  (typeof PLATFORM_OPERATIONS_LIFECYCLE_FILTERS)[number];

export const PLATFORM_OPERATIONS_SEVERITY_FILTERS = [
  "all",
  "critical",
  "warning",
  "info",
] as const;

export type PlatformOperationsSeverityFilter =
  (typeof PLATFORM_OPERATIONS_SEVERITY_FILTERS)[number];

export const PLATFORM_OPERATIONS_PACKAGE_FILTERS = [
  "all",
  "assigned",
  "legacy",
  "invalid",
] as const;

export type PlatformOperationsPackageFilter =
  (typeof PLATFORM_OPERATIONS_PACKAGE_FILTERS)[number];

export type PlatformOperationsSearchParams =
  Record<
    string,
    | string
    | string[]
    | undefined
  >;

export type PlatformOperationsFilters = {
  view:
    PlatformOperationsView;
  query: string;
  lifecycle:
    PlatformOperationsLifecycleFilter;
  severity:
    PlatformOperationsSeverityFilter;
  packageState:
    PlatformOperationsPackageFilter;
};

export type PlatformOperationsTenantView = {
  tenant:
    PlatformOperationsTenant;
  reasons:
    string[];
  severity:
    TenantAttentionSeverity | null;
};

export type PlatformOperationsViewCounts =
  Record<
    PlatformOperationsView,
    number
  >;

function firstValue(
  value:
    | string
    | string[]
    | undefined
): string {
  if (
    Array.isArray(
      value
    )
  ) {
    return value[0] ??
      "";
  }

  return value ??
    "";
}

function isAllowedValue<
  TValue extends string,
>(
  value: string,
  allowed:
    readonly TValue[]
): value is TValue {
  return (
    allowed as
      readonly string[]
  ).includes(
    value
  );
}

export function parsePlatformOperationsFilters(
  searchParams:
    PlatformOperationsSearchParams
): PlatformOperationsFilters {
  const rawView =
    firstValue(
      searchParams.view
    );

  const rawLifecycle =
    firstValue(
      searchParams.lifecycle
    );

  const rawSeverity =
    firstValue(
      searchParams.severity
    );

  const rawPackage =
    firstValue(
      searchParams.package
    );

  return {
    view:
      isAllowedValue(
        rawView,
        PLATFORM_OPERATIONS_VIEWS
      )
        ? rawView
        : "attention",
    query:
      firstValue(
        searchParams.q
      )
        .trim()
        .slice(
          0,
          120
        ),
    lifecycle:
      isAllowedValue(
        rawLifecycle,
        PLATFORM_OPERATIONS_LIFECYCLE_FILTERS
      )
        ? rawLifecycle
        : "all",
    severity:
      isAllowedValue(
        rawSeverity,
        PLATFORM_OPERATIONS_SEVERITY_FILTERS
      )
        ? rawSeverity
        : "all",
    packageState:
      isAllowedValue(
        rawPackage,
        PLATFORM_OPERATIONS_PACKAGE_FILTERS
      )
        ? rawPackage
        : "all",
  };
}

function matchesView(
  item:
    PlatformOperationsTenantView,
  view:
    PlatformOperationsView
): boolean {
  switch (
    view
  ) {
    case "attention":
      return (
        item.reasons.length >
        0
      );

    case "launch":
      return (
        item.tenant
          .publicationStatus ===
        "draft"
      );

    case "published":
      return (
        item.tenant
          .publicationStatus ===
        "published"
      );

    case "all":
      return true;
  }
}

function matchesLifecycle(
  tenant:
    PlatformOperationsTenant,
  lifecycle:
    PlatformOperationsLifecycleFilter
): boolean {
  return (
    lifecycle ===
      "all" ||
    tenant
      .publicationStatus ===
      lifecycle
  );
}

function matchesSeverity(
  item:
    PlatformOperationsTenantView,
  severity:
    PlatformOperationsSeverityFilter
): boolean {
  return (
    severity ===
      "all" ||
    item.severity ===
      severity
  );
}

function matchesPackageState(
  tenant:
    PlatformOperationsTenant,
  packageState:
    PlatformOperationsPackageFilter
): boolean {
  switch (
    packageState
  ) {
    case "all":
      return true;

    case "assigned":
      return (
        tenant.packageMode ===
        "assigned"
      );

    case "legacy":
      return (
        tenant.packageMode ===
        "legacy_full_access"
      );

    case "invalid":
      return (
        tenant.packageMode ===
        "invalid_assignment"
      );
  }
}

function matchesSearch(
  tenant:
    PlatformOperationsTenant,
  query: string
): boolean {
  if (
    query.length ===
    0
  ) {
    return true;
  }

  const normalizedQuery =
    query.toLowerCase();

  return (
    tenant.name
      .toLowerCase()
      .includes(
        normalizedQuery
      ) ||
    tenant.slug
      .toLowerCase()
      .includes(
        normalizedQuery
      )
  );
}

function toTenantView(
  tenant:
    PlatformOperationsTenant
): PlatformOperationsTenantView {
  const reasons =
    getTenantAttentionReasons(
      tenant
    );

  return {
    tenant,
    reasons,
    severity:
      reasons.length >
      0
        ? getTenantAttentionSeverity(
            tenant
          )
        : null,
  };
}

const SEVERITY_RANK:
  Record<
    TenantAttentionSeverity,
    number
  > = {
  critical: 0,
  warning: 1,
  info: 2,
};

function compareTenantViews(
  first:
    PlatformOperationsTenantView,
  second:
    PlatformOperationsTenantView
): number {
  if (
    first.severity &&
    second.severity
  ) {
    const severityDifference =
      SEVERITY_RANK[
        first.severity
      ] -
      SEVERITY_RANK[
        second.severity
      ];

    if (
      severityDifference !==
      0
    ) {
      return severityDifference;
    }
  } else if (
    first.severity
  ) {
    return -1;
  } else if (
    second.severity
  ) {
    return 1;
  }

  const bookingDifference =
    second.tenant
      .upcomingBookings -
    first.tenant
      .upcomingBookings;

  if (
    bookingDifference !==
    0
  ) {
    return bookingDifference;
  }

  return first.tenant
    .name
    .localeCompare(
      second.tenant.name
    );
}

export function filterPlatformOperationsTenants(
  tenants:
    readonly PlatformOperationsTenant[],
  filters:
    PlatformOperationsFilters
): PlatformOperationsTenantView[] {
  return tenants
    .map(
      toTenantView
    )
    .filter(
      (
        item
      ) =>
        matchesView(
          item,
          filters.view
        ) &&
        matchesSearch(
          item.tenant,
          filters.query
        ) &&
        matchesLifecycle(
          item.tenant,
          filters.lifecycle
        ) &&
        matchesSeverity(
          item,
          filters.severity
        ) &&
        matchesPackageState(
          item.tenant,
          filters.packageState
        )
    )
    .sort(
      compareTenantViews
    );
}

export function countPlatformOperationsViews(
  tenants:
    readonly PlatformOperationsTenant[]
): PlatformOperationsViewCounts {
  const views =
    tenants.map(
      toTenantView
    );

  return {
    attention:
      views.filter(
        (
          item
        ) =>
          matchesView(
            item,
            "attention"
          )
      ).length,
    launch:
      views.filter(
        (
          item
        ) =>
          matchesView(
            item,
            "launch"
          )
      ).length,
    published:
      views.filter(
        (
          item
        ) =>
          matchesView(
            item,
            "published"
          )
      ).length,
    all:
      views.length,
  };
}

export function buildPlatformOperationsHref(
  filters:
    PlatformOperationsFilters,
  changes:
    Partial<
      PlatformOperationsFilters
    > = {}
): string {
  const next = {
    ...filters,
    ...changes,
  };

  const params =
    new URLSearchParams();

  params.set(
    "view",
    next.view
  );

  if (
    next.query
  ) {
    params.set(
      "q",
      next.query
    );
  }

  if (
    next.lifecycle !==
    "all"
  ) {
    params.set(
      "lifecycle",
      next.lifecycle
    );
  }

  if (
    next.severity !==
    "all"
  ) {
    params.set(
      "severity",
      next.severity
    );
  }

  if (
    next.packageState !==
    "all"
  ) {
    params.set(
      "package",
      next.packageState
    );
  }

  return (
    `/platform-admin/operations?${params.toString()}`
  );
}
