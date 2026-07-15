import type {
  ProductPackageAccessMode,
} from "@/lib/product-packages/resolver";
import type {
  BusinessPublicationStatus,
} from "@/lib/publishing/status";

export type TenantOperationalInput = {
  id: string;
  slug: string;
  name: string;
  publicationStatus:
    BusinessPublicationStatus;
  hasActiveOwner: boolean;
  hasContact: boolean;
  hasTemplate: boolean;
  packageLabel: string;
  packageMode:
    ProductPackageAccessMode;
  packageRequiresAttention:
    boolean;
  upcomingBookings: number;
  createdAt: string;
  updatedAt: string;
};

export type TenantAttentionSeverity =
  | "critical"
  | "warning"
  | "info";

export type TenantAttentionItem = {
  id: string;
  slug: string;
  name: string;
  publicationStatus:
    BusinessPublicationStatus;
  reasons: string[];
  severity:
    TenantAttentionSeverity;
  packageLabel: string;
  upcomingBookings: number;
};

const ATTENTION_SEVERITY_RANK:
  Record<
    TenantAttentionSeverity,
    number
  > = {
  critical: 0,
  warning: 1,
  info: 2,
};

export function getTenantAttentionReasons(
  tenant:
    TenantOperationalInput
): string[] {
  const reasons:
    string[] = [];

  if (
    tenant.publicationStatus ===
    "archived"
  ) {
    return reasons;
  }

  if (
    tenant.publicationStatus ===
    "suspended"
  ) {
    reasons.push(
      "Tenant je suspendovan"
    );
  }

  if (
    !tenant.hasActiveOwner
  ) {
    reasons.push(
      "Nema aktivnog owner-a"
    );
  }

  if (
    tenant
      .packageRequiresAttention
  ) {
    reasons.push(
      "Package assignment zahteva proveru"
    );
  }

  if (
    tenant.publicationStatus ===
    "draft"
  ) {
    reasons.push(
      "Čeka objavu"
    );
  }

  if (
    tenant.publicationStatus ===
      "published" &&
    !tenant.hasContact
  ) {
    reasons.push(
      "Nedostaju kontakt podaci"
    );
  }

  if (
    tenant.publicationStatus ===
      "published" &&
    !tenant.hasTemplate
  ) {
    reasons.push(
      "Template koristi fallback"
    );
  }

  return reasons;
}

export function getTenantAttentionSeverity(
  tenant:
    TenantOperationalInput
): TenantAttentionSeverity {
  if (
    tenant.publicationStatus ===
      "suspended" ||
    (
      tenant.publicationStatus !==
        "archived" &&
      !tenant.hasActiveOwner
    )
  ) {
    return "critical";
  }

  if (
    tenant
      .packageRequiresAttention ||
    (
      tenant.publicationStatus ===
        "published" &&
      (
        !tenant.hasContact ||
        !tenant.hasTemplate
      )
    )
  ) {
    return "warning";
  }

  return "info";
}

export function buildTenantAttentionQueue(
  tenants:
    readonly TenantOperationalInput[]
): TenantAttentionItem[] {
  return tenants
    .map(
      (
        tenant
      ) => ({
        id:
          tenant.id,
        slug:
          tenant.slug,
        name:
          tenant.name,
        publicationStatus:
          tenant.publicationStatus,
        reasons:
          getTenantAttentionReasons(
            tenant
          ),
        severity:
          getTenantAttentionSeverity(
            tenant
          ),
        packageLabel:
          tenant.packageLabel,
        upcomingBookings:
          tenant.upcomingBookings,
      })
    )
    .filter(
      (
        tenant
      ) =>
        tenant.reasons.length >
        0
    )
    .sort(
      (
        first,
        second
      ) => {
        const severityDifference =
          ATTENTION_SEVERITY_RANK[
            first.severity
          ] -
          ATTENTION_SEVERITY_RANK[
            second.severity
          ];

        if (
          severityDifference !==
          0
        ) {
          return severityDifference;
        }

        const bookingDifference =
          second
            .upcomingBookings -
          first
            .upcomingBookings;

        if (
          bookingDifference !==
          0
        ) {
          return bookingDifference;
        }

        return first.name.localeCompare(
          second.name
        );
      }
    );
}
