import type {
  BusinessPublicationStatus,
} from "@/lib/publishing/status";

export type TenantReadinessInput = {
  businessSlug: string;
  contactReady: boolean;
  bookingSettingsReady: boolean;
  categoriesReady: boolean;
  servicesReady: boolean;
  employeesReady: boolean;
  workingHoursReady: boolean;
  ownerReady: boolean;
};

export type TenantReadinessItem = {
  key:
    | "contact"
    | "booking-settings"
    | "categories"
    | "services"
    | "employees"
    | "working-hours"
    | "owner";
  label: string;
  ready: boolean;
  href: string;
};

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

export function buildTenantReadiness(
  input: TenantReadinessInput
): {
  items:
    TenantReadinessItem[];
  completed: number;
  total: number;
  percent: number;
  readyToPublish: boolean;
} {
  const basePath =
    `/platform-admin/businesses/${input.businessSlug}`;

  const items:
    TenantReadinessItem[] = [
      {
        key:
          "contact",
        label:
          "Kontakt podaci",
        ready:
          input.contactReady,
        href:
          `${basePath}/edit`,
      },
      {
        key:
          "booking-settings",
        label:
          "Booking podešavanja",
        ready:
          input.bookingSettingsReady,
        href:
          `${basePath}/settings`,
      },
      {
        key:
          "categories",
        label:
          "Aktivna kategorija",
        ready:
          input.categoriesReady,
        href:
          `${basePath}/catalog`,
      },
      {
        key:
          "services",
        label:
          "Aktivna usluga",
        ready:
          input.servicesReady,
        href:
          `${basePath}/catalog`,
      },
      {
        key:
          "employees",
        label:
          "Aktivan zaposleni",
        ready:
          input.employeesReady,
        href:
          `${basePath}/employees`,
      },
      {
        key:
          "working-hours",
        label:
          "Radno vreme",
        ready:
          input.workingHoursReady,
        href:
          `${basePath}/settings`,
      },
      {
        key:
          "owner",
        label:
          "Aktivan owner pristup",
        ready:
          input.ownerReady,
        href:
          `${basePath}/access`,
      },
    ];

  const completed =
    items.filter(
      (
        item
      ) =>
        item.ready
    ).length;

  const total =
    items.length;

  const percent =
    total > 0
      ? Math.round(
          (
            completed /
            total
          ) *
            100
        )
      : 0;

  return {
    items,
    completed,
    total,
    percent,
    readyToPublish:
      completed ===
      total,
  };
}

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
