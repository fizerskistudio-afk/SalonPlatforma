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
  upcomingBookings: number;
  createdAt: string;
};

export type TenantAttentionItem = {
  id: string;
  slug: string;
  name: string;
  publicationStatus:
    BusinessPublicationStatus;
  reasons: string[];
  upcomingBookings: number;
};

export function getTenantAttentionReasons(
  tenant:
    TenantOperationalInput
): string[] {
  const reasons:
    string[] = [];

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
    "suspended"
  ) {
    reasons.push(
      "Tenant je suspendovan"
    );
  }

  if (
    tenant.publicationStatus !==
      "archived" &&
    !tenant.hasActiveOwner
  ) {
    reasons.push(
      "Nema aktivnog owner-a"
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
        if (
          first.publicationStatus ===
            "draft" &&
          second.publicationStatus !==
            "draft"
        ) {
          return -1;
        }

        if (
          second.publicationStatus ===
            "draft" &&
          first.publicationStatus !==
            "draft"
        ) {
          return 1;
        }

        return first.name.localeCompare(
          second.name
        );
      }
    );
}
