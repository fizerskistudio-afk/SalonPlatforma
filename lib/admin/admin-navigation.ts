import type {
  ProductFeatureKey,
} from "@/lib/product-packages/gates";

export const ADMIN_NAVIGATION_GROUP_KEYS = [
  "overview",
  "appointments",
  "offer_team",
  "digital_presence",
  "operations",
  "finance",
  "analytics",
  "administration",
] as const;

export type AdminNavigationGroupKey =
  (typeof ADMIN_NAVIGATION_GROUP_KEYS)[number];

export const ADMIN_NAVIGATION_ICON_KEYS = [
  "dashboard",
  "bookings",
  "customers",
  "schedule",
  "services",
  "team",
  "gallery",
  "reviews",
  "members",
  "notifications",
  "settings",
] as const;

export type AdminNavigationIconKey =
  (typeof ADMIN_NAVIGATION_ICON_KEYS)[number];

export type AdminNavigationBadgeKey =
  | "reviews"
  | null;

export type AdminNavigationMobileSlot =
  | "today"
  | "calendar"
  | "clients"
  | null;

export type AdminNavigationGroupDefinition = {
  key: AdminNavigationGroupKey;
  label: string;
  description: string;
  order: number;
  defaultCollapsed: boolean;
};

export type AdminNavigationItemDefinition = {
  key: string;
  groupKey: AdminNavigationGroupKey;
  label: string;
  mobileLabel: string;
  description: string;
  href: string;
  featureKey: ProductFeatureKey;
  iconKey: AdminNavigationIconKey;
  order: number;
  badgeKey: AdminNavigationBadgeKey;
  mobileSlot: AdminNavigationMobileSlot;
};

export type AdminNavigationResolvedGroup =
  AdminNavigationGroupDefinition & {
    items: AdminNavigationItemDefinition[];
  };

export type AdminPlannedModuleDefinition = {
  key: string;
  groupKey: AdminNavigationGroupKey;
  label: string;
  description: string;
  rollout:
    | "next"
    | "planned"
    | "later";
};

export const ADMIN_NAVIGATION_GROUPS: readonly AdminNavigationGroupDefinition[] = [
  {
    key: "overview",
    label: "Početna",
    description:
      "Današnji rad i stvari koje traže pažnju.",
    order: 10,
    defaultCollapsed: false,
  },
  {
    key: "appointments",
    label: "Termini i klijenti",
    description:
      "Kalendar, raspored i istorija klijenata.",
    order: 20,
    defaultCollapsed: false,
  },
  {
    key: "offer_team",
    label: "Ponuda i tim",
    description:
      "Usluge, cene, zaposleni i dostupnost.",
    order: 30,
    defaultCollapsed: false,
  },
  {
    key: "digital_presence",
    label: "Digitalno prisustvo",
    description:
      "Sajt, galerija, recenzije i vidljivost.",
    order: 40,
    defaultCollapsed: true,
  },
  {
    key: "operations",
    label: "Operacije",
    description:
      "Lager, nabavke, oprema i održavanje.",
    order: 50,
    defaultCollapsed: true,
  },
  {
    key: "finance",
    label: "Prodaja i finansije",
    description:
      "Promet, fiskalizacija i knjigovodstvo.",
    order: 60,
    defaultCollapsed: true,
  },
  {
    key: "analytics",
    label: "Izveštaji",
    description:
      "Rezultati, profitabilnost i poslovni trendovi.",
    order: 70,
    defaultCollapsed: true,
  },
  {
    key: "administration",
    label: "Administracija",
    description:
      "Pristup, notifikacije i podešavanja salona.",
    order: 80,
    defaultCollapsed: true,
  },
];

export const ADMIN_NAVIGATION_ITEMS: readonly AdminNavigationItemDefinition[] = [
  {
    key: "dashboard",
    groupKey: "overview",
    label: "Danas",
    mobileLabel: "Danas",
    description:
      "Pregled poslovanja i dnevnih prioriteta",
    href: "/admin",
    featureKey:
      "admin.dashboard",
    iconKey: "dashboard",
    order: 10,
    badgeKey: null,
    mobileSlot: "today",
  },
  {
    key: "bookings",
    groupKey: "appointments",
    label: "Rezervacije",
    mobileLabel: "Kalendar",
    description:
      "Termini, statusi i raspored",
    href: "/admin/bookings",
    featureKey:
      "admin.bookings",
    iconKey: "bookings",
    order: 10,
    badgeKey: null,
    mobileSlot: "calendar",
  },
  {
    key: "customers",
    groupKey: "appointments",
    label: "Klijenti",
    mobileLabel: "Klijenti",
    description:
      "Kontakti i istorija dolazaka",
    href: "/admin/customers",
    featureKey:
      "admin.customers",
    iconKey: "customers",
    order: 20,
    badgeKey: null,
    mobileSlot: "clients",
  },
  {
    key: "schedule",
    groupKey: "appointments",
    label: "Radno vreme",
    mobileLabel: "Raspored",
    description:
      "Smene, pauze i odsustva",
    href: "/admin/schedule",
    featureKey:
      "admin.schedule",
    iconKey: "schedule",
    order: 30,
    badgeKey: null,
    mobileSlot: null,
  },
  {
    key: "services",
    groupKey: "offer_team",
    label: "Usluge",
    mobileLabel: "Usluge",
    description:
      "Katalog, trajanja i cene",
    href: "/admin/services",
    featureKey:
      "admin.services",
    iconKey: "services",
    order: 10,
    badgeKey: null,
    mobileSlot: null,
  },
  {
    key: "team",
    groupKey: "offer_team",
    label: "Tim",
    mobileLabel: "Tim",
    description:
      "Zaposleni i njihove usluge",
    href: "/admin/team",
    featureKey:
      "admin.team",
    iconKey: "team",
    order: 20,
    badgeKey: null,
    mobileSlot: null,
  },
  {
    key: "gallery",
    groupKey: "digital_presence",
    label: "Galerija",
    mobileLabel: "Galerija",
    description:
      "Fotografije javnog sajta",
    href: "/admin/gallery",
    featureKey:
      "admin.gallery",
    iconKey: "gallery",
    order: 10,
    badgeKey: null,
    mobileSlot: null,
  },
  {
    key: "reviews",
    groupKey: "digital_presence",
    label: "Recenzije",
    mobileLabel: "Recenzije",
    description:
      "Moderacija i odgovori",
    href: "/admin/reviews",
    featureKey:
      "admin.reviews",
    iconKey: "reviews",
    order: 20,
    badgeKey: "reviews",
    mobileSlot: null,
  },
  {
    key: "members",
    groupKey: "administration",
    label: "Članovi",
    mobileLabel: "Članovi",
    description:
      "Korisnici, pristup i uloge",
    href: "/admin/members",
    featureKey:
      "admin.members",
    iconKey: "members",
    order: 10,
    badgeKey: null,
    mobileSlot: null,
  },
  {
    key: "notifications",
    groupKey: "administration",
    label: "Notifikacije",
    mobileLabel: "Notifikacije",
    description:
      "Email pravila i delivery log",
    href: "/admin/notifications",
    featureKey:
      "admin.notifications",
    iconKey: "notifications",
    order: 20,
    badgeKey: null,
    mobileSlot: null,
  },
  {
    key: "settings",
    groupKey: "administration",
    label: "Podešavanja",
    mobileLabel: "Podešavanja",
    description:
      "Salon, booking i integracije",
    href: "/admin/settings",
    featureKey:
      "admin.settings",
    iconKey: "settings",
    order: 30,
    badgeKey: null,
    mobileSlot: null,
  },
];

export const ADMIN_PLANNED_MODULES: readonly AdminPlannedModuleDefinition[] = [
  {
    key:
      "presence.site",
    groupKey:
      "digital_presence",
    label:
      "Sajt i branding",
    description:
      "Sadržaj, sekcije, tema, SEO i domeni.",
    rollout:
      "next",
  },
  {
    key:
      "presence.google_business_profile",
    groupKey:
      "digital_presence",
    label:
      "Google Business Profile",
    description:
      "Lokacija, podaci, recenzije i presence health.",
    rollout:
      "next",
  },
  {
    key:
      "operations.inventory",
    groupKey:
      "operations",
    label:
      "Lager",
    description:
      "Proizvodi, potrošni materijal i stanje zaliha.",
    rollout:
      "planned",
  },
  {
    key:
      "operations.procurement",
    groupKey:
      "operations",
    label:
      "Trebovanja i nabavke",
    description:
      "Staff zahtevi, odobravanja i prijem robe.",
    rollout:
      "planned",
  },
  {
    key:
      "operations.assets",
    groupKey:
      "operations",
    label:
      "Oprema i servisi",
    description:
      "Mašinice, makaze, uređaji i održavanje.",
    rollout:
      "planned",
  },
  {
    key:
      "finance.sales",
    groupKey:
      "finance",
    label:
      "Prodaja i plaćanja",
    description:
      "Promet, načini plaćanja i završetak usluge.",
    rollout:
      "planned",
  },
  {
    key:
      "finance.fiscalization",
    groupKey:
      "finance",
    label:
      "Fiskalizacija",
    description:
      "Adapteri ka odobrenim fiskalnim sistemima.",
    rollout:
      "later",
  },
  {
    key:
      "finance.accounting",
    groupKey:
      "finance",
    label:
      "Knjigovodstvo i SEF",
    description:
      "Izvoz, fakture i računovodstvene integracije.",
    rollout:
      "later",
  },
  {
    key:
      "analytics.business",
    groupKey:
      "analytics",
    label:
      "Poslovna analitika",
    description:
      "Prihod, profitabilnost, zauzetost i trendovi.",
    rollout:
      "planned",
  },
];

export function isAdminNavigationItemActive(
  pathname: string,
  href: string
): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`
    )
  );
}

export function getAdminNavigationItemForPath(
  pathname: string
): AdminNavigationItemDefinition | null {
  return (
    ADMIN_NAVIGATION_ITEMS.find(
      (item) =>
        isAdminNavigationItemActive(
          pathname,
          item.href
        )
    ) ??
    null
  );
}

export function getAdminNavigationGroupForPath(
  pathname: string
): AdminNavigationGroupDefinition | null {
  const item =
    getAdminNavigationItemForPath(
      pathname
    );

  if (!item) {
    return null;
  }

  return (
    ADMIN_NAVIGATION_GROUPS.find(
      (group) =>
        group.key ===
        item.groupKey
    ) ??
    null
  );
}

export function getAdminNavigationGroups():
  AdminNavigationResolvedGroup[] {
  return [...ADMIN_NAVIGATION_GROUPS]
    .sort(
      (first, second) =>
        first.order -
        second.order
    )
    .map((group) => ({
      ...group,
      items:
        ADMIN_NAVIGATION_ITEMS
          .filter(
            (item) =>
              item.groupKey ===
              group.key
          )
          .sort(
            (first, second) =>
              first.order -
              second.order
          ),
    }))
    .filter(
      (group) =>
        group.items.length >
        0
    );
}

export function getAdminMobilePrimaryItems():
  AdminNavigationItemDefinition[] {
  const slotOrder:
    Record<
      Exclude<
        AdminNavigationMobileSlot,
        null
      >,
      number
    > = {
      today: 10,
      calendar: 20,
      clients: 30,
    };

  return ADMIN_NAVIGATION_ITEMS
    .filter(
      (
        item
      ): item is AdminNavigationItemDefinition & {
        mobileSlot:
          Exclude<
            AdminNavigationMobileSlot,
            null
          >;
      } =>
        item.mobileSlot !==
        null
    )
    .sort(
      (first, second) =>
        slotOrder[
          first.mobileSlot
        ] -
        slotOrder[
          second.mobileSlot
        ]
    );
}
