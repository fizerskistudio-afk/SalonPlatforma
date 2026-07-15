import {
  PRODUCT_PACKAGE_KEYS,
  PRODUCT_PACKAGES,
  packageHasEntitlement,
  type ProductEntitlement,
  type ProductPackageDefinition,
} from "./registry";
import {
  resolveProductFeatureDecision,
  type ProductFeatureDecision,
  type ProductPackageAccess,
} from "./resolver";

export const PRODUCT_FEATURE_SURFACES = [
  "public",
  "tenant_admin",
  "staff",
  "platform_admin",
] as const;

export type ProductFeatureSurface =
  (typeof PRODUCT_FEATURE_SURFACES)[number];

export const PRODUCT_INTEGRATION_REQUIREMENTS = [
  "google_business_calendar",
  "google_employee_calendar",
  "google_business_profile",
] as const;

export type ProductIntegrationRequirement =
  (typeof PRODUCT_INTEGRATION_REQUIREMENTS)[number];

export type ProductFeatureRoute = {
  path: string;
  match:
    | "exact"
    | "prefix";
};

export type ProductFeatureDefinition = {
  key: string;
  surface:
    ProductFeatureSurface;
  entitlement:
    ProductEntitlement;
  route:
    ProductFeatureRoute | null;
  integration:
    ProductIntegrationRequirement | null;
  label: string;
  description: string;
};

export const PRODUCT_FEATURE_GATES = {
  "public.booking_page": {
    key:
      "public.booking_page",
    surface:
      "public",
    entitlement:
      "booking.public_page",
    route:
      null,
    integration:
      null,
    label:
      "Javna booking stranica",
    description:
      "Klijent bira uslugu, zaposlenog i dostupan termin.",
  },
  "public.full_site": {
    key:
      "public.full_site",
    surface:
      "public",
    entitlement:
      "site.full_profile",
    route:
      null,
    integration:
      null,
    label:
      "Kompletan javni sajt",
    description:
      "Višesekcijski javni tenant profil iznad booking mikrostranice.",
  },
  "public.gallery": {
    key:
      "public.gallery",
    surface:
      "public",
    entitlement:
      "site.gallery",
    route:
      null,
    integration:
      null,
    label:
      "Javna galerija",
    description:
      "Galerijska sekcija na javnom tenant sajtu.",
  },
  "public.reviews_widget": {
    key:
      "public.reviews_widget",
    surface:
      "public",
    entitlement:
      "reviews.public_widget",
    route:
      null,
    integration:
      "google_business_profile",
    label:
      "Javni reviews widget",
    description:
      "Google rating i dozvoljeni review sadržaj na javnom sajtu.",
  },
  "admin.dashboard": {
    key:
      "admin.dashboard",
    surface:
      "tenant_admin",
    entitlement:
      "analytics.basic",
    route: {
      path:
        "/admin",
      match:
        "exact",
    },
    integration:
      null,
    label:
      "Admin dashboard",
    description:
      "Osnovni booking i operativni pregled dostupan od Booking Page paketa.",
  },
  "admin.bookings": {
    key:
      "admin.bookings",
    surface:
      "tenant_admin",
    entitlement:
      "booking.management",
    route: {
      path:
        "/admin/bookings",
      match:
        "prefix",
    },
    integration:
      null,
    label:
      "Rezervacije",
    description:
      "Pregled i upravljanje rezervacijama, statusima i terminima.",
  },
  "admin.customers": {
    key:
      "admin.customers",
    surface:
      "tenant_admin",
    entitlement:
      "booking.management",
    route: {
      path:
        "/admin/customers",
      match:
        "prefix",
    },
    integration:
      null,
    label:
      "Klijenti",
    description:
      "Kontakti i booking istorija klijenata.",
  },
  "admin.services": {
    key:
      "admin.services",
    surface:
      "tenant_admin",
    entitlement:
      "booking.management",
    route: {
      path:
        "/admin/services",
      match:
        "prefix",
    },
    integration:
      null,
    label:
      "Usluge",
    description:
      "Kategorije, usluge, trajanja i cene potrebne za booking.",
  },
  "admin.team": {
    key:
      "admin.team",
    surface:
      "tenant_admin",
    entitlement:
      "booking.management",
    route: {
      path:
        "/admin/team",
      match:
        "prefix",
    },
    integration:
      null,
    label:
      "Tim",
    description:
      "Zaposleni i njihove booking usluge.",
  },
  "admin.gallery": {
    key:
      "admin.gallery",
    surface:
      "tenant_admin",
    entitlement:
      "site.gallery",
    route: {
      path:
        "/admin/gallery",
      match:
        "prefix",
    },
    integration:
      null,
    label:
      "Galerija",
    description:
      "Upravljanje fotografijama javnog tenant sajta.",
  },
  "admin.schedule": {
    key:
      "admin.schedule",
    surface:
      "tenant_admin",
    entitlement:
      "booking.management",
    route: {
      path:
        "/admin/schedule",
      match:
        "prefix",
    },
    integration:
      null,
    label:
      "Raspored",
    description:
      "Radno vreme, pauze i odsustva potrebni za booking dostupnost.",
  },
  "admin.members": {
    key:
      "admin.members",
    surface:
      "tenant_admin",
    entitlement:
      "booking.management",
    route: {
      path:
        "/admin/members",
      match:
        "prefix",
    },
    integration:
      null,
    label:
      "Članovi",
    description:
      "Tenant korisnici, pristup i operativne uloge.",
  },
  "admin.reviews": {
    key:
      "admin.reviews",
    surface:
      "tenant_admin",
    entitlement:
      "reviews.management",
    route: {
      path:
        "/admin/reviews",
      match:
        "prefix",
    },
    integration:
      "google_business_profile",
    label:
      "Reviews inbox",
    description:
      "Pregled recenzija i ručna objava odgovora.",
  },
  "admin.notifications": {
    key:
      "admin.notifications",
    surface:
      "tenant_admin",
    entitlement:
      "booking.email_notifications",
    route: {
      path:
        "/admin/notifications",
      match:
        "prefix",
    },
    integration:
      null,
    label:
      "Booking notifikacije",
    description:
      "Email pravila, delivery stanje i osnovna booking obaveštenja.",
  },
  "admin.settings": {
    key:
      "admin.settings",
    surface:
      "tenant_admin",
    entitlement:
      "booking.management",
    route: {
      path:
        "/admin/settings",
      match:
        "prefix",
    },
    integration:
      null,
    label:
      "Osnovna podešavanja",
    description:
      "Kontakt, booking pravila i osnovna tenant konfiguracija.",
  },
  "admin.site_profile": {
    key:
      "admin.site_profile",
    surface:
      "tenant_admin",
    entitlement:
      "site.full_profile",
    route:
      null,
    integration:
      null,
    label:
      "Sadržaj kompletnog sajta",
    description:
      "Višesekcijski profil, opis, tim i kontakt sadržaj javnog sajta.",
  },
  "admin.branding": {
    key:
      "admin.branding",
    surface:
      "tenant_admin",
    entitlement:
      "site.branding",
    route:
      null,
    integration:
      null,
    label:
      "Branding",
    description:
      "Logo, hero, boje i napredni vizuelni identitet.",
  },
  "admin.seo": {
    key:
      "admin.seo",
    surface:
      "tenant_admin",
    entitlement:
      "site.seo",
    route:
      null,
    integration:
      null,
    label:
      "SEO podešavanja",
    description:
      "Metadata i kontrole za vidljivost javne stranice.",
  },
  "admin.custom_domain": {
    key:
      "admin.custom_domain",
    surface:
      "tenant_admin",
    entitlement:
      "site.custom_domain",
    route:
      null,
    integration:
      null,
    label:
      "Custom domen",
    description:
      "Povezivanje sopstvenog domena sa javnim tenant profilom.",
  },
  "admin.theme_library": {
    key:
      "admin.theme_library",
    surface:
      "tenant_admin",
    entitlement:
      "site.theme_library",
    route:
      null,
    integration:
      null,
    label:
      "Theme biblioteka",
    description:
      "Izbor dostupnih theme packova bez tenant code forka.",
  },
  "admin.business_calendar": {
    key:
      "admin.business_calendar",
    surface:
      "tenant_admin",
    entitlement:
      "calendar.business_sync",
    route:
      null,
    integration:
      "google_business_calendar",
    label:
      "Salon Google Calendar",
    description:
      "Sinhronizacija rezervacija sa glavnim kalendarom salona.",
  },
  "admin.advanced_analytics": {
    key:
      "admin.advanced_analytics",
    surface:
      "tenant_admin",
    entitlement:
      "analytics.advanced",
    route:
      null,
    integration:
      null,
    label:
      "Napredna analitika",
    description:
      "Pokazatelji po zaposlenom, usluzi, periodu i izvoru.",
  },
  "staff.portal": {
    key:
      "staff.portal",
    surface:
      "staff",
    entitlement:
      "staff.portal",
    route: {
      path:
        "/staff",
      match:
        "exact",
    },
    integration:
      null,
    label:
      "Staff panel",
    description:
      "Zaštićeni operativni panel zaposlenog.",
  },
  "staff.reservations": {
    key:
      "staff.reservations",
    surface:
      "staff",
    entitlement:
      "staff.reservations",
    route:
      null,
    integration:
      null,
    label:
      "Staff rezervacije",
    description:
      "Rezervacije povezane sa employee profilom prijavljenog zaposlenog.",
  },
  "staff.notes": {
    key:
      "staff.notes",
    surface:
      "staff",
    entitlement:
      "staff.notes",
    route:
      null,
    integration:
      null,
    label:
      "Staff napomene",
    description:
      "Dozvoljene operativne napomene vezane za sopstvene rezervacije.",
  },
  "staff.time_off": {
    key:
      "staff.time_off",
    surface:
      "staff",
    entitlement:
      "staff.time_off",
    route:
      null,
    integration:
      null,
    label:
      "Staff odsustva",
    description:
      "Pauze, odsustva i slobodni dani zaposlenog.",
  },
  "staff.schedule": {
    key:
      "staff.schedule",
    surface:
      "staff",
    entitlement:
      "staff.schedule",
    route:
      null,
    integration:
      null,
    label:
      "Staff raspored",
    description:
      "Salonski ili individualni raspored zaposlenog.",
  },
  "staff.calendar_connection": {
    key:
      "staff.calendar_connection",
    surface:
      "staff",
    entitlement:
      "staff.calendar_connection",
    route: {
      path:
        "/staff/calendar",
      match:
        "prefix",
    },
    integration:
      "google_employee_calendar",
    label:
      "Lični Google Calendar",
    description:
      "OAuth povezivanje ličnog kalendara zaposlenog.",
  },
  "staff.employee_calendar_sync": {
    key:
      "staff.employee_calendar_sync",
    surface:
      "staff",
    entitlement:
      "calendar.employee_sync",
    route:
      null,
    integration:
      "google_employee_calendar",
    label:
      "Employee Calendar Sync",
    description:
      "Booking događaji se upisuju u kalendar odgovarajućeg zaposlenog.",
  },
  "staff.two_way_busy_sync": {
    key:
      "staff.two_way_busy_sync",
    surface:
      "staff",
    entitlement:
      "calendar.two_way_busy_sync",
    route:
      null,
    integration:
      "google_employee_calendar",
    label:
      "Two-way busy sync",
    description:
      "Spoljne kalendarske obaveze utiču na booking dostupnost.",
  },
  "platform.ai_translation": {
    key:
      "platform.ai_translation",
    surface:
      "platform_admin",
    entitlement:
      "ai.content_translation",
    route:
      null,
    integration:
      null,
    label:
      "AI Translate Assist",
    description:
      "Draft prevodi za content intake i mockup tenant proizvodnju.",
  },
  "platform.ai_review_drafts": {
    key:
      "platform.ai_review_drafts",
    surface:
      "platform_admin",
    entitlement:
      "ai.review_reply_drafts",
    route:
      null,
    integration:
      "google_business_profile",
    label:
      "AI Review Reply Assist",
    description:
      "Draft odgovori na recenzije bez automatskog objavljivanja.",
  },
} as const satisfies Record<
  string,
  ProductFeatureDefinition
>;

export type ProductFeatureKey =
  keyof typeof PRODUCT_FEATURE_GATES;

export type ProductFeatureGateDecision =
  ProductFeatureDecision & {
    featureKey:
      ProductFeatureKey;
    surface:
      ProductFeatureSurface;
    integration:
      ProductIntegrationRequirement | null;
    minimumPackage:
      ProductPackageDefinition | null;
  };

function normalizeProductRoutePath(
  value: string
): string {
  const rawPath =
    (
      value
        .split(
          /[?#]/,
          1
        )
        .at(
          0
        ) ??
      ""
    ).trim();

  if (
    rawPath.length === 0 ||
    !rawPath.startsWith("/")
  ) {
    return "/";
  }

  if (
    rawPath.length > 1 &&
    rawPath.endsWith("/")
  ) {
    return rawPath.replace(
      /\/+$/,
      ""
    );
  }

  return rawPath;
}

export function getProductFeatureDefinition(
  featureKey:
    ProductFeatureKey
): ProductFeatureDefinition {
  return PRODUCT_FEATURE_GATES[
    featureKey
  ];
}

export function getMinimumProductPackageForEntitlement(
  entitlement:
    ProductEntitlement
): ProductPackageDefinition | null {
  for (
    const packageKey of
    PRODUCT_PACKAGE_KEYS
  ) {
    if (
      packageHasEntitlement(
        packageKey,
        entitlement
      )
    ) {
      return PRODUCT_PACKAGES[
        packageKey
      ];
    }
  }

  return null;
}

export function getProductFeatureUpgradeCandidates(
  featureKey:
    ProductFeatureKey
): readonly ProductPackageDefinition[] {
  const entitlement =
    getProductFeatureDefinition(
      featureKey
    ).entitlement;

  return PRODUCT_PACKAGE_KEYS
    .filter(
      (packageKey) =>
        packageHasEntitlement(
          packageKey,
          entitlement
        )
    )
    .map(
      (packageKey) =>
        PRODUCT_PACKAGES[
          packageKey
        ]
    );
}

export function resolveProductFeatureForPath(
  pathname: string
): ProductFeatureDefinition | null {
  const normalizedPath =
    normalizeProductRoutePath(
      pathname
    );

  const routeDefinitions =
    (
      Object.values(
        PRODUCT_FEATURE_GATES
      ) as
        ProductFeatureDefinition[]
    )
      .flatMap(
        (definition) =>
          definition.route
            ? [
                {
                  ...definition,
                  route:
                    definition.route,
                },
              ]
            : []
      )
      .sort(
        (left, right) =>
          right.route.path.length -
          left.route.path.length
      );

  return (
    routeDefinitions.find(
      (definition) => {
        if (
          definition.route
            .match ===
          "exact"
        ) {
          return (
            normalizedPath ===
            definition.route
              .path
          );
        }

        return (
          normalizedPath ===
            definition.route
              .path ||
          normalizedPath.startsWith(
            `${definition.route.path}/`
          )
        );
      }
    ) ??
    null
  );
}

export function resolveProductFeatureGate(
  input: {
    access:
      ProductPackageAccess;
    featureKey:
      ProductFeatureKey;
    permissionGranted?:
      boolean;
    integrationConnected?:
      boolean;
  }
): ProductFeatureGateDecision {
  const definition =
    getProductFeatureDefinition(
      input.featureKey
    );

  const decision =
    resolveProductFeatureDecision({
      access:
        input.access,
      entitlement:
        definition.entitlement,
      permissionGranted:
        input.permissionGranted ??
        true,
      integrationRequired:
        definition.integration !==
        null,
      integrationConnected:
        input.integrationConnected,
    });

  return {
    ...decision,
    featureKey:
      input.featureKey,
    surface:
      definition.surface,
    integration:
      definition.integration,
    minimumPackage:
      getMinimumProductPackageForEntitlement(
        definition.entitlement
      ),
  };
}
