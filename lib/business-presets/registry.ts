import {
  getTemplateManifest,
} from "@/lib/templates/registry";

import {
  BARBERSHOP_PRESET,
} from "./barbershop";

import {
  HAIR_SALON_PRESET,
} from "./hair-salon";

import {
  BUSINESS_PRESET_KEYS,
  type BusinessPreset,
  type BusinessPresetCurrency,
  type BusinessPresetKey,
  type BusinessPresetLocale,
  type BusinessPresetService,
  type PresetPrice,
  type PresetText,
} from "./types";

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const presetRegistry:
  Record<
    BusinessPresetKey,
    BusinessPreset
  > = {
    "hair-salon":
      HAIR_SALON_PRESET,

    barbershop:
      BARBERSHOP_PRESET,
  };

function assertValidPreset(
  preset: BusinessPreset
): void {
  if (
    !SLUG_PATTERN.test(
      preset.key
    )
  ) {
    throw new Error(
      "Invalid business preset key: " +
        preset.key
    );
  }

  const template =
    getTemplateManifest(
      preset.recommendedTemplateKey
    );

  for (
    const section of
    preset.recommendedSections
  ) {
    if (
      !template.sections.includes(
        section
      )
    ) {
      throw new Error(
        "Template " +
          template.key +
          " does not support section " +
          section +
          " required by preset " +
          preset.key
      );
    }
  }

  const categorySlugs =
    new Set<string>();

  const serviceSlugs =
    new Set<string>();

  for (
    const category of
    preset.categories
  ) {
    if (
      !SLUG_PATTERN.test(
        category.slug
      )
    ) {
      throw new Error(
        "Invalid category slug: " +
          category.slug
      );
    }

    if (
      categorySlugs.has(
        category.slug
      )
    ) {
      throw new Error(
        "Duplicate category slug: " +
          category.slug
      );
    }

    categorySlugs.add(
      category.slug
    );

    if (
      category.services.length === 0
    ) {
      throw new Error(
        "Preset category has no services: " +
          category.slug
      );
    }

    for (
      const service of
      category.services
    ) {
      if (
        !SLUG_PATTERN.test(
          service.slug
        )
      ) {
        throw new Error(
          "Invalid service slug: " +
            service.slug
        );
      }

      if (
        serviceSlugs.has(
          service.slug
        )
      ) {
        throw new Error(
          "Duplicate service slug: " +
            service.slug
        );
      }

      serviceSlugs.add(
        service.slug
      );

      if (
        !Number.isInteger(
          service.durationMinutes
        ) ||
        service.durationMinutes <= 0
      ) {
        throw new Error(
          "Invalid service duration: " +
            service.slug
        );
      }

      for (
        const price of
        Object.values(
          service.prices
        )
      ) {
        if (
          price.priceFrom < 0
        ) {
          throw new Error(
            "Invalid service price: " +
              service.slug
          );
        }

        if (
          price.priceType ===
            "range" &&
          (
            typeof price.priceTo !==
              "number" ||
            price.priceTo <
              price.priceFrom
          )
        ) {
          throw new Error(
            "Invalid service price range: " +
              service.slug
          );
        }
      }
    }
  }
}

for (
  const preset of
  Object.values(
    presetRegistry
  )
) {
  assertValidPreset(
    preset
  );
}

export const BUSINESS_PRESET_REGISTRY =
  Object.freeze(
    presetRegistry
  );

export {
  BUSINESS_PRESET_CURRENCIES,
  BUSINESS_PRESET_KEYS,
  BUSINESS_PRESET_LOCALES,
  defineBusinessPreset,
  presetText,
} from "./types";

export type {
  BusinessPreset,
  BusinessPresetBookingDefaults,
  BusinessPresetCategory,
  BusinessPresetCurrency,
  BusinessPresetKey,
  BusinessPresetLocale,
  BusinessPresetService,
  BusinessPresetTerms,
  PresetPrice,
  PresetPriceMap,
  PresetText,
} from "./types";

export function isBusinessPresetKey(
  value: unknown
): value is BusinessPresetKey {
  return (
    typeof value === "string" &&
    BUSINESS_PRESET_KEYS.includes(
      value as BusinessPresetKey
    )
  );
}

export function getBusinessPreset(
  presetKey: BusinessPresetKey
): BusinessPreset {
  return BUSINESS_PRESET_REGISTRY[
    presetKey
  ];
}

export function getPresetText(
  text: PresetText,
  locale: BusinessPresetLocale
): string {
  return text[locale];
}

export function resolvePresetPrice(
  service: BusinessPresetService,
  currency: BusinessPresetCurrency
): PresetPrice | null {
  return (
    service.prices[currency] ??
    service.prices.EUR ??
    service.prices.RSD ??
    service.prices.CHF ??
    null
  );
}

export function getBusinessPresetOptions(
  locale: BusinessPresetLocale
) {
  return BUSINESS_PRESET_KEYS.map(
    (presetKey) => {
      const preset =
        getBusinessPreset(
          presetKey
        );

      return {
        value: preset.key,

        label:
          getPresetText(
            preset.name,
            locale
          ),

        description:
          getPresetText(
            preset.description,
            locale
          ),

        recommendedTemplateKey:
          preset.recommendedTemplateKey,
      };
    }
  );
}