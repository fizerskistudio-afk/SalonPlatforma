import type {
  BusinessPublicationStatus,
} from "@/lib/publishing/status";

export const TENANT_READINESS_GROUPS = [
  "technical",
  "content",
  "booking",
  "owner-access",
] as const;

export type TenantReadinessGroup =
  (typeof TENANT_READINESS_GROUPS)[number];

export type TenantReadinessItem = {
  key:
    | "template"
    | "locales"
    | "contact"
    | "category"
    | "service"
    | "booking-settings"
    | "employee"
    | "service-assignment"
    | "working-hours"
    | "owner";
  group: TenantReadinessGroup;
  label: string;
  ready: boolean;
  href: string;
};

export type TenantReadinessInput = {
  businessSlug: string;
  templateReady: boolean;
  localesReady: boolean;
  contactReady: boolean;
  categoriesReady: boolean;
  servicesReady: boolean;
  bookingSettingsReady: boolean;
  employeesReady: boolean;
  serviceAssignmentsReady: boolean;
  workingHoursReady: boolean;
  ownerReady: boolean;
};

export type TenantReadinessSnapshot = {
  items: TenantReadinessItem[];
  blockers: TenantReadinessItem[];
  completed: number;
  total: number;
  percent: number;
  groups: Record<
    TenantReadinessGroup,
    boolean
  >;
  technicalReady: boolean;
  contentReady: boolean;
  bookingReady: boolean;
  ownerAccessReady: boolean;
  previewReady: boolean;
  productionReady: boolean;
  readyToPublish: boolean;
};

const ALLOWED_LIFECYCLE_TARGETS: Record<
  BusinessPublicationStatus,
  readonly BusinessPublicationStatus[]
> = {
  draft: [
    "published",
    "suspended",
    "archived",
  ],
  published: [
    "draft",
    "suspended",
    "archived",
  ],
  suspended: [
    "draft",
    "published",
    "archived",
  ],
  archived: [
    "draft",
  ],
};

export function buildTenantReadiness(
  input: TenantReadinessInput
): TenantReadinessSnapshot {
  const basePath =
    `/platform-admin/businesses/${input.businessSlug}`;

  const items: TenantReadinessItem[] = [
    {
      key: "template",
      group: "technical",
      label: "Izabrana tema",
      ready: input.templateReady,
      href: `${basePath}/theme`,
    },
    {
      key: "locales",
      group: "technical",
      label: "Jezici sadržaja",
      ready: input.localesReady,
      href: `${basePath}/branding`,
    },
    {
      key: "contact",
      group: "content",
      label: "Kontakt podaci",
      ready: input.contactReady,
      href: `${basePath}/edit`,
    },
    {
      key: "category",
      group: "content",
      label: "Aktivna kategorija",
      ready: input.categoriesReady,
      href: `${basePath}/catalog`,
    },
    {
      key: "service",
      group: "content",
      label: "Aktivna usluga u aktivnoj kategoriji",
      ready: input.servicesReady,
      href: `${basePath}/catalog`,
    },
    {
      key: "booking-settings",
      group: "booking",
      label: "Booking podešavanja",
      ready: input.bookingSettingsReady,
      href: `${basePath}/settings`,
    },
    {
      key: "employee",
      group: "booking",
      label: "Aktivan zaposleni",
      ready: input.employeesReady,
      href: `${basePath}/employees`,
    },
    {
      key: "service-assignment",
      group: "booking",
      label: "Usluga dodeljena aktivnom zaposlenom",
      ready: input.serviceAssignmentsReady,
      href: `${basePath}/employees`,
    },
    {
      key: "working-hours",
      group: "booking",
      label: "Radno vreme salona",
      ready: input.workingHoursReady,
      href: `${basePath}/settings`,
    },
    {
      key: "owner",
      group: "owner-access",
      label: "Aktivan owner pristup",
      ready: input.ownerReady,
      href: `${basePath}/access`,
    },
  ];

  const groupReady = (
    group: TenantReadinessGroup
  ) =>
    items
      .filter(
        (item) =>
          item.group === group
      )
      .every(
        (item) =>
          item.ready
      );

  const groups = {
    technical: groupReady("technical"),
    content: groupReady("content"),
    booking: groupReady("booking"),
    "owner-access": groupReady("owner-access"),
  };

  const blockers =
    items.filter(
      (item) =>
        !item.ready
    );

  const completed =
    items.length -
    blockers.length;

  const previewReady =
    groups.technical &&
    groups.content;

  const productionReady =
    previewReady &&
    groups.booking &&
    groups["owner-access"];

  return {
    items,
    blockers,
    completed,
    total: items.length,
    percent: Math.round(
      (
        completed /
        items.length
      ) * 100
    ),
    groups,
    technicalReady: groups.technical,
    contentReady: groups.content,
    bookingReady: groups.booking,
    ownerAccessReady: groups["owner-access"],
    previewReady,
    productionReady,
    readyToPublish: productionReady,
  };
}

export function getAllowedLifecycleTargets(
  currentStatus: BusinessPublicationStatus
): readonly BusinessPublicationStatus[] {
  return ALLOWED_LIFECYCLE_TARGETS[
    currentStatus
  ];
}

export function isLifecycleTransitionAllowed(
  currentStatus: BusinessPublicationStatus,
  nextStatus: BusinessPublicationStatus
): boolean {
  return getAllowedLifecycleTargets(
    currentStatus
  ).includes(
    nextStatus
  );
}
