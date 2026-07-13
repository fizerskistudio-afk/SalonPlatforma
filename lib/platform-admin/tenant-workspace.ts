import type {
  PlatformAdminPermission,
} from "@/lib/auth/platform-admin-policy";

export type TenantWorkspaceSectionId =
  | "overview"
  | "branding"
  | "theme"
  | "access"
  | "operations";

export type TenantWorkspaceItem = {
  id: string;
  label: string;
  href: string | null;
  permission: PlatformAdminPermission | null;
  planned?: boolean;
};

export type TenantWorkspaceSection = {
  id: TenantWorkspaceSectionId;
  label: string;
  href: string;
  items: TenantWorkspaceItem[];
};

const SECTION_PATHS: Record<
  Exclude<TenantWorkspaceSectionId, "overview">,
  readonly string[]
> = {
  branding: [
    "edit",
    "branding",
  ],
  theme: [
    "theme",
  ],
  access: [
    "access",
  ],
  operations: [
    "catalog",
    "employees",
    "settings",
    "time-off",
    "bookings",
    "reviews",
  ],
};

function canAccess(
  permissions: readonly PlatformAdminPermission[],
  permission: PlatformAdminPermission | null
): boolean {
  return (
    permission === null ||
    permissions.includes(
      permission
    )
  );
}

export function buildTenantWorkspaceSections(
  businessSlug: string,
  permissions: readonly PlatformAdminPermission[]
): TenantWorkspaceSection[] {
  const basePath =
    `/platform-admin/businesses/${businessSlug}`;

  const candidates: TenantWorkspaceSection[] = [
    {
      id: "overview",
      label: "Pregled",
      href: basePath,
      items: [],
    },
    {
      id: "branding",
      label: "Branding",
      href: `${basePath}/edit`,
      items: [
        {
          id: "profile",
          label: "Osnovni podaci",
          href: `${basePath}/edit`,
          permission: "tenant.profile.write",
        },
        {
          id: "media",
          label: "Logo i mediji",
          href: `${basePath}/branding`,
          permission: "tenant.branding.write",
        },
      ],
    },
    {
      id: "theme",
      label: "Tema",
      href: `${basePath}/theme`,
      items: [
        {
          id: "theme",
          label: "Izbor i preview teme",
          href: `${basePath}/theme`,
          permission: "tenant.theme.write",
        },
      ],
    },
    {
      id: "access",
      label: "Pristup",
      href: `${basePath}/access`,
      items: [
        {
          id: "owner-access",
          label: "Owner nalog i credentials",
          href: `${basePath}/access`,
          permission: "tenant.owner_access.read",
        },
      ],
    },
    {
      id: "operations",
      label: "Operacije",
      href: `${basePath}/catalog`,
      items: [
        {
          id: "catalog",
          label: "Katalog",
          href: `${basePath}/catalog`,
          permission: "tenant.catalog.write",
        },
        {
          id: "team",
          label: "Tim",
          href: `${basePath}/employees`,
          permission: "tenant.team.write",
        },
        {
          id: "booking-settings",
          label: "Radno vreme i booking",
          href: `${basePath}/settings`,
          permission: "tenant.settings.write",
        },
        {
          id: "time-off",
          label: "Blokade",
          href: `${basePath}/time-off`,
          permission: "tenant.schedule.write",
        },
        {
          id: "bookings",
          label: "Rezervacije",
          href: `${basePath}/bookings`,
          permission: "tenant.bookings.read",
        },
        {
          id: "reviews",
          label: "Reviews",
          href: null,
          permission: null,
          planned: true,
        },
      ],
    },
  ];

  return candidates
    .map(
      (section) => ({
        ...section,
        items:
          section.items.filter(
            (item) =>
              item.planned ||
              canAccess(
                permissions,
                item.permission
              )
          ),
      })
    )
    .filter(
      (section) =>
        section.id === "overview" ||
        section.items.some(
          (item) =>
            !item.planned
        )
    )
    .map(
      (section) => ({
        ...section,
        href:
          section.items.find(
            (item) =>
              item.href !== null &&
              !item.planned
          )?.href ??
          section.href,
      })
    );
}

export function getTenantWorkspaceSection(
  pathname: string,
  businessSlug: string
): TenantWorkspaceSectionId {
  const basePath =
    `/platform-admin/businesses/${businessSlug}`;

  if (
    pathname === basePath ||
    pathname === `${basePath}/`
  ) {
    return "overview";
  }

  const relativePath =
    pathname
      .slice(
        basePath.length
      )
      .replace(
        /^\/+|\/+$/g,
        ""
      );
  const firstSegment =
    relativePath.split("/")[0];

  for (
    const [
      section,
      paths,
    ] of Object.entries(
      SECTION_PATHS
    ) as [
      Exclude<TenantWorkspaceSectionId, "overview">,
      readonly string[],
    ][]
  ) {
    if (
      paths.includes(
        firstSegment
      )
    ) {
      return section;
    }
  }

  return "overview";
}

export function isTenantWorkspaceItemActive(
  pathname: string,
  href: string
): boolean {
  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`
    )
  );
}
