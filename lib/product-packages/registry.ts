export const PRODUCT_PACKAGE_CONTRACT_VERSION =
  1 as const;

export const PRODUCT_ANNUAL_BILLING_MONTHS =
  10 as const;

export const PRODUCT_ENTITLEMENTS = [
  "booking.public_page",
  "booking.management",
  "booking.email_notifications",
  "site.full_profile",
  "site.branding",
  "site.gallery",
  "site.seo",
  "site.custom_domain",
  "site.theme_library",
  "staff.portal",
  "staff.reservations",
  "staff.notes",
  "staff.time_off",
  "staff.schedule",
  "staff.calendar_connection",
  "calendar.business_sync",
  "calendar.employee_sync",
  "calendar.two_way_busy_sync",
  "reviews.public_widget",
  "reviews.management",
  "reviews.notifications",
  "ai.content_translation",
  "ai.review_reply_drafts",
  "analytics.basic",
  "analytics.advanced",
  "locations.multiple",
  "support.priority",
  "migration.assisted",
] as const;

export type ProductEntitlement =
  (typeof PRODUCT_ENTITLEMENTS)[number];

export type ProductEntitlementCategory =
  | "booking"
  | "site"
  | "staff"
  | "calendar"
  | "reviews"
  | "ai"
  | "analytics"
  | "locations"
  | "support"
  | "migration";

export type ProductEntitlementDefinition = {
  key: ProductEntitlement;
  category: ProductEntitlementCategory;
  label: string;
  description: string;
};

export const PRODUCT_ENTITLEMENT_DEFINITIONS = {
  "booking.public_page": {
    key: "booking.public_page",
    category: "booking",
    label: "Booking stranica",
    description:
      "Javna stranica kroz koju klijent bira uslugu, zaposlenog i termin.",
  },
  "booking.management": {
    key: "booking.management",
    category: "booking",
    label: "Upravljanje rezervacijama",
    description:
      "Tenant admin upravlja rezervacijama, statusima, napomenama i terminima.",
  },
  "booking.email_notifications": {
    key: "booking.email_notifications",
    category: "booking",
    label: "Email obaveštenja",
    description:
      "Osnovne email potvrde i operativna obaveštenja vezana za rezervacije.",
  },
  "site.full_profile": {
    key: "site.full_profile",
    category: "site",
    label: "Kompletan javni sajt",
    description:
      "Višesekcijski javni profil sa identitetom, uslugama, timom i kontaktom.",
  },
  "site.branding": {
    key: "site.branding",
    category: "site",
    label: "Napredni branding",
    description:
      "Logo, hero slika, vizuelni identitet i tenant-specifični sadržaj.",
  },
  "site.gallery": {
    key: "site.gallery",
    category: "site",
    label: "Galerija",
    description:
      "Javna galerija fotografija salona, radova ili tretmana.",
  },
  "site.seo": {
    key: "site.seo",
    category: "site",
    label: "SEO podešavanja",
    description:
      "Metadata i osnovne kontrole za vidljivost javne stranice u pretrazi.",
  },
  "site.custom_domain": {
    key: "site.custom_domain",
    category: "site",
    label: "Custom domen",
    description:
      "Povezivanje sopstvenog domena salona sa javnim tenant profilom.",
  },
  "site.theme_library": {
    key: "site.theme_library",
    category: "site",
    label: "Theme biblioteka",
    description:
      "Izbor završenih vertikalnih theme packova bez tenant-specifičnog code forka.",
  },
  "staff.portal": {
    key: "staff.portal",
    category: "staff",
    label: "Staff panel",
    description:
      "Zaštićeni panel za zaposlenog povezanog sa tenant membershipom.",
  },
  "staff.reservations": {
    key: "staff.reservations",
    category: "staff",
    label: "Sopstvene rezervacije",
    description:
      "Zaposleni vidi rezervacije koje pripadaju njegovom employee profilu.",
  },
  "staff.notes": {
    key: "staff.notes",
    category: "staff",
    label: "Operativne napomene",
    description:
      "Zaposleni vidi dozvoljene napomene vezane za sopstvene rezervacije.",
  },
  "staff.time_off": {
    key: "staff.time_off",
    category: "staff",
    label: "Odsustva i slobodni dani",
    description:
      "Zaposleni unosi i prati sopstvena odsustva, pauze i slobodne dane.",
  },
  "staff.schedule": {
    key: "staff.schedule",
    category: "staff",
    label: "Sopstveni raspored",
    description:
      "Zaposleni vidi salonski ili individualni radni raspored.",
  },
  "staff.calendar_connection": {
    key: "staff.calendar_connection",
    category: "staff",
    label: "Lični Google Calendar",
    description:
      "Zaposleni povezuje svoj Google Calendar kroz eksplicitni OAuth tok.",
  },
  "calendar.business_sync": {
    key: "calendar.business_sync",
    category: "calendar",
    label: "Salon Calendar Sync",
    description:
      "Booking događaji se sinhronizuju sa glavnim Google Calendarom salona.",
  },
  "calendar.employee_sync": {
    key: "calendar.employee_sync",
    category: "calendar",
    label: "Employee Calendar Sync",
    description:
      "Booking događaji se sinhronizuju sa kalendarom odgovarajućeg zaposlenog.",
  },
  "calendar.two_way_busy_sync": {
    key: "calendar.two_way_busy_sync",
    category: "calendar",
    label: "Two-way busy sync",
    description:
      "Spoljne Google Calendar obaveze utiču na dostupnost termina na platformi.",
  },
  "reviews.public_widget": {
    key: "reviews.public_widget",
    category: "reviews",
    label: "Javne Google recenzije",
    description:
      "Google Business Profile ocena i dozvoljeni review sadržaj prikazuju se na sajtu.",
  },
  "reviews.management": {
    key: "reviews.management",
    category: "reviews",
    label: "Reviews inbox",
    description:
      "Tenant admin pregleda recenzije i ručno objavljuje odgovore.",
  },
  "reviews.notifications": {
    key: "reviews.notifications",
    category: "reviews",
    label: "Review obaveštenja",
    description:
      "Obaveštenja za nove ili promenjene recenzije i odgovore koji traže pažnju.",
  },
  "ai.content_translation": {
    key: "ai.content_translation",
    category: "ai",
    label: "AI Translate Assist",
    description:
      "AI generiše nacrt prevoda koji korisnik pregleda i ručno potvrđuje.",
  },
  "ai.review_reply_drafts": {
    key: "ai.review_reply_drafts",
    category: "ai",
    label: "AI Review Reply Assist",
    description:
      "AI predlaže odgovor na recenziju bez automatskog objavljivanja.",
  },
  "analytics.basic": {
    key: "analytics.basic",
    category: "analytics",
    label: "Osnovna analitika",
    description:
      "Osnovni booking, status i operativni pokazatelji za tenant.",
  },
  "analytics.advanced": {
    key: "analytics.advanced",
    category: "analytics",
    label: "Napredna analitika",
    description:
      "Napredni pokazatelji po zaposlenom, usluzi, periodu i izvoru.",
  },
  "locations.multiple": {
    key: "locations.multiple",
    category: "locations",
    label: "Više lokacija",
    description:
      "Centralno upravljanje većim brojem tenant lokacija pod jednim klijentom.",
  },
  "support.priority": {
    key: "support.priority",
    category: "support",
    label: "Prioritetna podrška",
    description:
      "Viši nivo podrške, integration recovery i prioritetno rešavanje incidenta.",
  },
  "migration.assisted": {
    key: "migration.assisted",
    category: "migration",
    label: "Vođena migracija",
    description:
      "Pomoć pri prelasku sa postojećeg booking ili sadržajnog sistema.",
  },
} as const satisfies Record<
  ProductEntitlement,
  ProductEntitlementDefinition
>;

export const PRODUCT_PACKAGE_KEYS = [
  "booking_page",
  "digital_studio",
  "operations_pro",
  "reputation_pro",
  "signature",
] as const;

export type ProductPackageKey =
  (typeof PRODUCT_PACKAGE_KEYS)[number];

export type ProductPackageLimits = {
  bookableStaff: number | null;
  aiTranslationRequestsPerMonth:
    number | null;
  aiReviewDraftsPerMonth:
    number | null;
};

export type ProductPackageDefinition = {
  key: ProductPackageKey;
  name: string;
  shortDescription: string;
  monthlyPriceRsd: number | null;
  setupPriceRsd: number | null;
  customQuote: boolean;
  limits: ProductPackageLimits;
  entitlements:
    readonly ProductEntitlement[];
};

function mergeEntitlements(
  ...groups:
    readonly (
      readonly ProductEntitlement[]
    )[]
): readonly ProductEntitlement[] {
  return Array.from(
    new Set(
      groups.flat()
    )
  );
}

const BOOKING_PAGE_ENTITLEMENTS = [
  "booking.public_page",
  "booking.management",
  "booking.email_notifications",
  "staff.portal",
  "staff.reservations",
  "staff.notes",
  "staff.time_off",
  "staff.schedule",
  "analytics.basic",
] as const satisfies
  readonly ProductEntitlement[];

const DIGITAL_STUDIO_ENTITLEMENTS =
  mergeEntitlements(
    BOOKING_PAGE_ENTITLEMENTS,
    [
      "site.full_profile",
      "site.branding",
      "site.gallery",
      "site.seo",
      "site.custom_domain",
      "site.theme_library",
      "calendar.business_sync",
      "ai.content_translation",
    ]
  );

const OPERATIONS_PRO_ENTITLEMENTS =
  mergeEntitlements(
    DIGITAL_STUDIO_ENTITLEMENTS,
    [
      "staff.calendar_connection",
      "calendar.employee_sync",
      "calendar.two_way_busy_sync",
      "analytics.advanced",
      "support.priority",
      "migration.assisted",
    ]
  );

const REPUTATION_PRO_ENTITLEMENTS =
  mergeEntitlements(
    OPERATIONS_PRO_ENTITLEMENTS,
    [
      "reviews.public_widget",
      "reviews.management",
      "reviews.notifications",
      "ai.review_reply_drafts",
    ]
  );

const SIGNATURE_ENTITLEMENTS =
  mergeEntitlements(
    REPUTATION_PRO_ENTITLEMENTS,
    [
      "locations.multiple",
    ]
  );

export const PRODUCT_PACKAGES = {
  booking_page: {
    key: "booking_page",
    name: "Booking Page",
    shortDescription:
      "Booking mikrostranica, tenant admin i staff panel za mali tim.",
    monthlyPriceRsd: 3490,
    setupPriceRsd: 9900,
    customQuote: false,
    limits: {
      bookableStaff: 2,
      aiTranslationRequestsPerMonth:
        0,
      aiReviewDraftsPerMonth:
        0,
    },
    entitlements:
      BOOKING_PAGE_ENTITLEMENTS,
  },
  digital_studio: {
    key: "digital_studio",
    name: "Digital Studio",
    shortDescription:
      "Kompletan digitalni footprint, theme packovi i salon Calendar Sync.",
    monthlyPriceRsd: 6990,
    setupPriceRsd: 24900,
    customQuote: false,
    limits: {
      bookableStaff: 5,
      aiTranslationRequestsPerMonth:
        25,
      aiReviewDraftsPerMonth:
        0,
    },
    entitlements:
      DIGITAL_STUDIO_ENTITLEMENTS,
  },
  operations_pro: {
    key: "operations_pro",
    name: "Operations Pro",
    shortDescription:
      "Napredni staff rad, employee kalendari i two-way availability.",
    monthlyPriceRsd: 10990,
    setupPriceRsd: 39900,
    customQuote: false,
    limits: {
      bookableStaff: 10,
      aiTranslationRequestsPerMonth:
        100,
      aiReviewDraftsPerMonth:
        0,
    },
    entitlements:
      OPERATIONS_PRO_ENTITLEMENTS,
  },
  reputation_pro: {
    key: "reputation_pro",
    name: "Reputation Pro",
    shortDescription:
      "Google reviews prikaz, reviews inbox, obaveštenja i AI reply draftovi.",
    monthlyPriceRsd: 14990,
    setupPriceRsd: 59900,
    customQuote: false,
    limits: {
      bookableStaff: 15,
      aiTranslationRequestsPerMonth:
        250,
      aiReviewDraftsPerMonth:
        250,
    },
    entitlements:
      REPUTATION_PRO_ENTITLEMENTS,
  },
  signature: {
    key: "signature",
    name: "Signature",
    shortDescription:
      "Custom multi-location paket za lance, klinike i veće wellness sisteme.",
    monthlyPriceRsd: null,
    setupPriceRsd: null,
    customQuote: true,
    limits: {
      bookableStaff: null,
      aiTranslationRequestsPerMonth:
        null,
      aiReviewDraftsPerMonth:
        null,
    },
    entitlements:
      SIGNATURE_ENTITLEMENTS,
  },
} as const satisfies Record<
  ProductPackageKey,
  ProductPackageDefinition
>;

const PRODUCT_ENTITLEMENT_SET =
  new Set<string>(
    PRODUCT_ENTITLEMENTS
  );

const PRODUCT_PACKAGE_KEY_SET =
  new Set<string>(
    PRODUCT_PACKAGE_KEYS
  );

export function isProductEntitlement(
  value: unknown
): value is ProductEntitlement {
  return (
    typeof value === "string" &&
    PRODUCT_ENTITLEMENT_SET.has(
      value
    )
  );
}

export function isProductPackageKey(
  value: unknown
): value is ProductPackageKey {
  return (
    typeof value === "string" &&
    PRODUCT_PACKAGE_KEY_SET.has(
      value
    )
  );
}

export function getProductPackage(
  key: ProductPackageKey
): ProductPackageDefinition {
  return PRODUCT_PACKAGES[
    key
  ];
}

export function getPackageEntitlements(
  key: ProductPackageKey
): readonly ProductEntitlement[] {
  return getProductPackage(
    key
  ).entitlements;
}

export function packageHasEntitlement(
  key: ProductPackageKey,
  entitlement:
    ProductEntitlement
): boolean {
  return getPackageEntitlements(
    key
  ).includes(
    entitlement
  );
}

export function getPackageUpgradeCandidates(
  key: ProductPackageKey
): readonly ProductPackageDefinition[] {
  const currentIndex =
    PRODUCT_PACKAGE_KEYS.indexOf(
      key
    );

  return PRODUCT_PACKAGE_KEYS
    .slice(
      currentIndex + 1
    )
    .map(
      getProductPackage
    );
}
