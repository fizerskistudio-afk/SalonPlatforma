export const TEMPLATE_KEYS = [
  "hair-luxury",
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

export type TemplateManifest = {
  key: TemplateKey;
  name: string;
  description: string;
  niche: string;
  version: number;
  viewports: readonly TemplateViewport[];
  sections: readonly TemplateSection[];
  supportsBooking: boolean;
  supportsGallery: boolean;
  supportsReviews: boolean;
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
    key: "hair-luxury",
    name: "Hair Luxury",
    description:
      "Premium hair and beauty presentation with separate desktop landing and mobile app experience.",
    niche:
      "Hair salon / beauty studio",
    version: 1,

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

    supportsBooking: true,
    supportsGallery: true,
    supportsReviews: true,
  },
};

export function isTemplateKey(
  value: unknown
): value is TemplateKey {
  return (
    typeof value === "string" &&
    TEMPLATE_KEYS.includes(
      value as TemplateKey
    )
  );
}

export function resolveTemplateKey(
  value: unknown
): TemplateKey {
  return isTemplateKey(value)
    ? value
    : DEFAULT_TEMPLATE_KEY;
}

export function normalizeTemplateConfig(
  value: unknown
): TemplateConfig {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return EMPTY_TEMPLATE_CONFIG;
  }

  return {
    ...value,
  } as TemplateConfig;
}

export function getTemplateManifest(
  templateKey: TemplateKey
): TemplateManifest {
  return TEMPLATE_REGISTRY[
    templateKey
  ];
}
