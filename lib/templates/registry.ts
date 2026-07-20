export const TEMPLATE_KEYS = [
  "hair-luxury",
  "hair-editorial",
  "barber-heritage",
  "nails-soft",
] as const;

export type TemplateKey =
  (typeof TEMPLATE_KEYS)[number];

export type TemplateConfig =
  Readonly<
    Record<string, unknown>
  >;

export type TemplateViewport =
  | "desktop"
  | "mobile";

export type TemplateSection =
  | "hero"
  | "services"
  | "team"
  | "gallery"
  | "reviews"
  | "contact";

export type TemplateBusinessType =
  | "hair"
  | "barber"
  | "nails"
  | "massage";

export type TemplateAvailability =
  | "live"
  | "beta";

export type TemplateDesktopArchitecture =
  | "modular"
  | "monolith";

export type TemplateMobileArchitecture =
  | "app-shell"
  | "modular"
  | "monolith";

export type TemplateArchitectureAcceptance =
  | "reference"
  | "pending"
  | "passed";

export type TemplateArchitecture = {
  contractVersion: 1;
  desktop:
    TemplateDesktopArchitecture;
  mobile:
    TemplateMobileArchitecture;
  acceptance:
    TemplateArchitectureAcceptance;
};

export type TemplatePalette = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
};

export type TemplateManifest = {
  key: TemplateKey;
  name: string;
  description: string;
  niche: string;
  businessType:
    TemplateBusinessType;
  availability:
    TemplateAvailability;
  version: number;
  architecture:
    TemplateArchitecture;
  viewports:
    readonly TemplateViewport[];
  sections:
    readonly TemplateSection[];
  supportsBooking: boolean;
  supportsGallery: boolean;
  supportsReviews: boolean;
  defaultPalette:
    TemplatePalette | null;
};

export type PlannedTemplatePack = {
  key: string;
  name: string;
  businessType:
    TemplateBusinessType;
  description: string;
};

export const DEFAULT_TEMPLATE_KEY:
  TemplateKey =
  "hair-luxury";

export const EMPTY_TEMPLATE_CONFIG:
  TemplateConfig =
  Object.freeze({});

export const TEMPLATE_REGISTRY:
  Record<
    TemplateKey,
    TemplateManifest
  > = {
  "hair-luxury": {
    key:
      "hair-luxury",
    name:
      "Hair Luxury",
    description:
      "Luksuzni hair i beauty dizajn sa odvojenim desktop landing prikazom i mobilnim app iskustvom.",
    niche:
      "Hair salon / beauty studio",
    businessType:
      "hair",
    availability:
      "live",
    version:
      1,

    architecture: {
      contractVersion:
        1,
      desktop:
        "modular",
      mobile:
        "app-shell",
      acceptance:
        "reference",
    },

    viewports: [
      "desktop",
      "mobile",
    ],

    sections: [
      "hero",
      "services",
      "team",
      "gallery",
      "reviews",
      "contact",
    ],

    supportsBooking:
      true,
    supportsGallery:
      true,
    supportsReviews:
      true,
    defaultPalette:
      null,
  },

  "hair-editorial": {
    key:
      "hair-editorial",
    name:
      "Hair Editorial",
    description:
      "Čist editorial dizajn sa velikom fotografijom, tipografskim sekcijama i modernim mobilnim app prikazom.",
    niche:
      "Premium hair / creative studio",
    businessType:
      "hair",
    availability:
      "live",
    version:
      1,

    architecture: {
      contractVersion:
        1,
      desktop:
        "modular",
      mobile:
        "modular",
      acceptance:
        "passed",
    },

    viewports: [
      "desktop",
      "mobile",
    ],

    sections: [
      "hero",
      "services",
      "team",
      "gallery",
      "reviews",
      "contact",
    ],

    supportsBooking:
      true,
    supportsGallery:
      true,
    supportsReviews:
      true,
    defaultPalette:
      null,
  },

  "barber-heritage": {
    key:
      "barber-heritage",
    name:
      "Barber Heritage",
    description:
      "Tamni barbershop theme pack sa jasnim cenama, izborom berberina i direktnim booking pozivima.",
    niche:
      "Barbershop / men's grooming",
    businessType:
      "barber",
    availability:
      "beta",
    version:
      2,

    architecture: {
      contractVersion:
        1,
      desktop:
        "modular",
      mobile:
        "app-shell",
      acceptance:
        "passed",
    },

    viewports: [
      "desktop",
      "mobile",
    ],

    sections: [
      "hero",
      "services",
      "team",
      "gallery",
      "reviews",
      "contact",
    ],

    supportsBooking:
      true,
    supportsGallery:
      true,
    supportsReviews:
      true,

    defaultPalette: {
      primary:
        "#c6a15b",
      secondary:
        "#262019",
      background:
        "#0f0e0c",
      surface:
        "#191612",
      text:
        "#f3ede2",
      muted:
        "#aaa092",
      border:
        "#3a3228",
    },
  },

  "nails-soft": {
    key:
      "nails-soft",
    name:
      "Nails Soft",
    description:
      "Svetao portfolio-first nail studio pack sa tretmanima, nail artistima i direktnim booking tokom.",
    niche:
      "Nail studio / manicure / nail art",
    businessType:
      "nails",
    availability:
      "beta",
    version:
      2,

    architecture: {
      contractVersion:
        1,
      desktop:
        "modular",
      mobile:
        "modular",
      acceptance:
        "passed",
    },

    viewports: [
      "desktop",
      "mobile",
    ],

    sections: [
      "hero",
      "gallery",
      "services",
      "team",
      "reviews",
      "contact",
    ],

    supportsBooking:
      true,
    supportsGallery:
      true,
    supportsReviews:
      true,

    defaultPalette: {
      primary:
        "#8e3f68",
      secondary:
        "#ead8df",
      background:
        "#fbf6f2",
      surface:
        "#fffaf8",
      text:
        "#2c2027",
      muted:
        "#77666f",
      border:
        "#dfccd3",
    },
  },
};

export const PLANNED_TEMPLATE_PACKS:
  readonly PlannedTemplatePack[] = [
  {
    key:
      "massage-earth",
    name:
      "Massage Earth",
    businessType:
      "massage",
    description:
      "Smiren wellness pack sa naglašenim trajanjem tretmana, terapeutima i jednostavnim booking tokom.",
  },
];

export function isTemplateKey(
  value: unknown
): value is TemplateKey {
  return (
    typeof value ===
      "string" &&
    TEMPLATE_KEYS.includes(
      value as
        TemplateKey
    )
  );
}

export function resolveTemplateKey(
  value: unknown
): TemplateKey {
  return isTemplateKey(
    value
  )
    ? value
    : DEFAULT_TEMPLATE_KEY;
}

export function normalizeTemplateConfig(
  value: unknown
): TemplateConfig {
  if (
    typeof value !==
      "object" ||
    value ===
      null ||
    Array.isArray(
      value
    )
  ) {
    return EMPTY_TEMPLATE_CONFIG;
  }

  return {
    ...value,
  } as TemplateConfig;
}

export function getTemplateManifest(
  templateKey:
    TemplateKey
): TemplateManifest {
  return TEMPLATE_REGISTRY[
    templateKey
  ];
}

export function getTemplateManifests():
  TemplateManifest[] {
  return TEMPLATE_KEYS.map(
    (
      templateKey
    ) =>
      TEMPLATE_REGISTRY[
        templateKey
      ]
  );
}
