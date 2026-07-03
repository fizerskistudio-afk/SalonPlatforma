import type {
  TemplateKey,
  TemplateSection,
} from "@/lib/templates/registry";

import type {
  ServiceCategoryIcon,
  ServicePriceType,
} from "@/lib/types";

import {
  BUSINESS_PRESET_LOCALES,
  getBusinessPreset,
  getPresetText,
  type BusinessPresetCurrency,
  type BusinessPresetKey,
  type BusinessPresetLocale,
  type BusinessPresetTerms,
  type PresetText,
} from "./registry";

export type MaterializeBusinessPresetInput = {
  presetKey: BusinessPresetKey;
  locale: BusinessPresetLocale;
  currency: BusinessPresetCurrency;

  /**
   * Jezici koji će biti aktivni za novog klijenta.
   *
   * Ako nisu prosleđeni, aktivan je samo glavni
   * jezik iz polja locale.
   */
  supportedLocales?:
    readonly BusinessPresetLocale[];
};

export type MaterializedPresetTerms = {
  businessSingular: string;
  professionalSingular: string;
  professionalPlural: string;
  serviceSingular: string;
  servicePlural: string;
  bookingCta: string;
};

export type MaterializedBookingSettings = {
  slotIntervalMinutes: number;
  bookingWindowDays: number;
  minimumAdvanceMinutes: number;
  allowAnyEmployee: boolean;
  requireEmail: boolean;
  requirePhone: boolean;
  allowNotes: boolean;
  autoConfirm: boolean;
};

export type MaterializedPresetCategory = {
  clientKey: string;
  slug: string;
  icon: ServiceCategoryIcon;
  name: PresetText;
  description: PresetText;
  displayName: string;
  displayDescription: string;
  sortOrder: number;
  isActive: true;
};

export type MaterializedPresetService = {
  clientKey: string;
  categoryClientKey: string;
  categorySlug: string;
  slug: string;
  name: PresetText;
  description: PresetText | null;
  displayName: string;
  displayDescription: string | null;
  durationMinutes: number;
  priceType: ServicePriceType;
  priceFrom: number;
  priceTo: number | null;
  currency: BusinessPresetCurrency;
  sortOrder: number;
  isActive: true;
};

export type MaterializedBusinessPreset = {
  presetKey: BusinessPresetKey;
  presetName: string;
  presetDescription: string;

  locale: BusinessPresetLocale;

  supportedLocales:
    readonly BusinessPresetLocale[];

  currency: BusinessPresetCurrency;

  templateKey: TemplateKey;

  templateConfig: {
    businessPresetKey:
      BusinessPresetKey;

    sections:
      readonly TemplateSection[];
  };

  terms: MaterializedPresetTerms;

  bookingSettings:
    MaterializedBookingSettings;

  categories:
    readonly MaterializedPresetCategory[];

  services:
    readonly MaterializedPresetService[];

  counts: {
    categories: number;
    services: number;
  };
};

function isBusinessPresetLocale(
  value: unknown
): value is BusinessPresetLocale {
  return (
    typeof value === "string" &&
    BUSINESS_PRESET_LOCALES.includes(
      value as BusinessPresetLocale
    )
  );
}

function normalizeSupportedLocales(
  defaultLocale: BusinessPresetLocale,
  values:
    readonly BusinessPresetLocale[] |
    undefined
): readonly BusinessPresetLocale[] {
  const sourceValues =
    values && values.length > 0
      ? values
      : [defaultLocale];

  const normalizedLocales =
    Array.from(
      new Set(
        sourceValues.filter(
          isBusinessPresetLocale
        )
      )
    );

  if (
    !normalizedLocales.includes(
      defaultLocale
    )
  ) {
    normalizedLocales.unshift(
      defaultLocale
    );
  }

  return Object.freeze(
    normalizedLocales
  );
}

function materializeTerms(
  terms: BusinessPresetTerms,
  locale: BusinessPresetLocale
): MaterializedPresetTerms {
  return {
    businessSingular:
      getPresetText(
        terms.businessSingular,
        locale
      ),

    professionalSingular:
      getPresetText(
        terms.professionalSingular,
        locale
      ),

    professionalPlural:
      getPresetText(
        terms.professionalPlural,
        locale
      ),

    serviceSingular:
      getPresetText(
        terms.serviceSingular,
        locale
      ),

    servicePlural:
      getPresetText(
        terms.servicePlural,
        locale
      ),

    bookingCta:
      getPresetText(
        terms.bookingCta,
        locale
      ),
  };
}

function createCategoryClientKey(
  categorySlug: string
): string {
  return `category:${categorySlug}`;
}

function createServiceClientKey(
  categorySlug: string,
  serviceSlug: string
): string {
  return [
    "service",
    categorySlug,
    serviceSlug,
  ].join(":");
}

export function materializeBusinessPreset({
  presetKey,
  locale,
  currency,
  supportedLocales,
}: MaterializeBusinessPresetInput): MaterializedBusinessPreset {
  const preset =
    getBusinessPreset(
      presetKey
    );

  const normalizedSupportedLocales =
    normalizeSupportedLocales(
      locale,
      supportedLocales
    );

  const categories:
    MaterializedPresetCategory[] =
      [];

  const services:
    MaterializedPresetService[] =
      [];

  preset.categories.forEach(
    (
      category,
      categoryIndex
    ) => {
      const categoryClientKey =
        createCategoryClientKey(
          category.slug
        );

      categories.push({
        clientKey:
          categoryClientKey,

        slug:
          category.slug,

        icon:
          category.icon,

        name:
          category.name,

        description:
          category.description,

        displayName:
          getPresetText(
            category.name,
            locale
          ),

        displayDescription:
          getPresetText(
            category.description,
            locale
          ),

        sortOrder:
          categoryIndex + 1,

        isActive:
          true,
      });

      category.services.forEach(
        (
          service,
          serviceIndex
        ) => {
          const selectedPrice =
            service.prices[
              currency
            ];

          if (!selectedPrice) {
            throw new Error(
              [
                "Preset service does not have",
                `a ${currency} price:`,
                `${preset.key}/${service.slug}`,
              ].join(" ")
            );
          }

          services.push({
            clientKey:
              createServiceClientKey(
                category.slug,
                service.slug
              ),

            categoryClientKey,

            categorySlug:
              category.slug,

            slug:
              service.slug,

            name:
              service.name,

            description:
              service.description ??
              null,

            displayName:
              getPresetText(
                service.name,
                locale
              ),

            displayDescription:
              service.description
                ? getPresetText(
                    service.description,
                    locale
                  )
                : null,

            durationMinutes:
              service.durationMinutes,

            priceType:
              selectedPrice.priceType,

            priceFrom:
              selectedPrice.priceFrom,

            priceTo:
              selectedPrice.priceTo ??
              null,

            currency,

            sortOrder:
              serviceIndex + 1,

            isActive:
              true,
          });
        }
      );
    }
  );

  return {
    presetKey:
      preset.key,

    presetName:
      getPresetText(
        preset.name,
        locale
      ),

    presetDescription:
      getPresetText(
        preset.description,
        locale
      ),

    locale,

    supportedLocales:
      normalizedSupportedLocales,

    currency,

    templateKey:
      preset.recommendedTemplateKey,

    templateConfig: {
      businessPresetKey:
        preset.key,

      sections: [
        ...preset.recommendedSections,
      ],
    },

    terms:
      materializeTerms(
        preset.terms,
        locale
      ),

    bookingSettings: {
      ...preset.bookingDefaults,
    },

    categories:
      Object.freeze(
        categories
      ),

    services:
      Object.freeze(
        services
      ),

    counts: {
      categories:
        categories.length,

      services:
        services.length,
    },
  };
}