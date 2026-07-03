import type {
  TemplateKey,
  TemplateSection,
} from "@/lib/templates/registry";

import type {
  ServiceCategoryIcon,
  ServicePriceType,
} from "@/lib/types";

export const BUSINESS_PRESET_KEYS = [
  "hair-salon",
  "barbershop",
] as const;

export type BusinessPresetKey =
  (typeof BUSINESS_PRESET_KEYS)[number];

export const BUSINESS_PRESET_LOCALES = [
  "sr-Latn",
  "en",
  "de",
] as const;

export type BusinessPresetLocale =
  (typeof BUSINESS_PRESET_LOCALES)[number];

export const BUSINESS_PRESET_CURRENCIES = [
  "RSD",
  "EUR",
  "CHF",
] as const;

export type BusinessPresetCurrency =
  (typeof BUSINESS_PRESET_CURRENCIES)[number];

export type PresetText = Readonly<
  Record<
    BusinessPresetLocale,
    string
  >
>;

export type PresetPrice = {
  priceType: ServicePriceType;
  priceFrom: number;
  priceTo?: number;
};

export type PresetPriceMap = Readonly<
  Partial<
    Record<
      BusinessPresetCurrency,
      PresetPrice
    >
  >
>;

export type BusinessPresetService = {
  slug: string;
  name: PresetText;
  description?: PresetText;
  durationMinutes: number;
  prices: PresetPriceMap;
};

export type BusinessPresetCategory = {
  slug: string;
  icon: ServiceCategoryIcon;
  name: PresetText;
  description: PresetText;
  services:
    readonly BusinessPresetService[];
};

export type BusinessPresetTerms = {
  businessSingular: PresetText;
  professionalSingular: PresetText;
  professionalPlural: PresetText;
  serviceSingular: PresetText;
  servicePlural: PresetText;
  bookingCta: PresetText;
};

export type BusinessPresetBookingDefaults = {
  slotIntervalMinutes: number;
  bookingWindowDays: number;
  minimumAdvanceMinutes: number;
  allowAnyEmployee: boolean;
  requireEmail: boolean;
  requirePhone: boolean;
  allowNotes: boolean;
  autoConfirm: boolean;
};

export type BusinessPreset = {
  key: BusinessPresetKey;
  name: PresetText;
  description: PresetText;

  recommendedTemplateKey:
    TemplateKey;

  recommendedSections:
    readonly TemplateSection[];

  terms: BusinessPresetTerms;

  bookingDefaults:
    BusinessPresetBookingDefaults;

  categories:
    readonly BusinessPresetCategory[];
};

export function presetText(
  srLatn: string,
  en: string,
  de: string
): PresetText {
  return Object.freeze({
    "sr-Latn": srLatn,
    en,
    de,
  });
}

export function defineBusinessPreset(
  preset: BusinessPreset
): BusinessPreset {
  return preset;
}