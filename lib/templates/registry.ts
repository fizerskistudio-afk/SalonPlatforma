export const TEMPLATE_KEYS = [
  "hair-luxury",
  "hair-editorial",
  "barber-heritage",
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
        "monolith",
      mobile:
        "monolith",
      acceptance:
        "pending",
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
      1,

    architecture: {
      contractVersion:
        1,
      desktop:
        "monolith",
      mobile:
        "monolith",
      acceptance:
        "pending",
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
      "contact",
    ],

    supportsBooking:
      true,
    supportsGallery:
      true,
    supportsReviews:
      false,

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
};

export const PLANNED_TEMPLATE_PACKS:
  readonly PlannedTemplatePack[] = [
  {
    key:
      "nails-soft",
    name:
      "Nails Soft",
    businessType:
      "nails",
    description:
      "Svetao, vizuelan nail studio pack sa fokusom na portfolio i kategorije tretmana.",
  },
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
