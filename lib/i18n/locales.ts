export const LOCALE_CODES = [
  "sr-Latn",
  "sr-Cyrl",
  "mk",
  "sq",
  "en",
  "de",
  "da",
  "fr",
  "it",
  "es",
  "nl",
  "no",
  "sv",
  "pl",
  "pt",
  "ro",
  "hu",
  "hr",
  "sl",
  "bg",
  "el",
  "tr",
  "cs",
  "sk",
  "ar",
  "he",
] as const;

export type LocaleCode =
  (typeof LOCALE_CODES)[number];

export type LocaleDirection =
  | "ltr"
  | "rtl";

export type LocaleDefinition = {
  code: LocaleCode;
  nativeName: string;
  adminName: string;
  shortName: string;
  intlLocale: string;
  direction: LocaleDirection;

  /**
   * true znači da javni sistemski UI trenutno ima
   * kompletan prevod za ovaj jezik.
   *
   * false i dalje dozvoljava sadržaj salona na tom
   * jeziku, dok sistemski UI koristi fallback.
   */
  uiTranslationReady: boolean;
};

export const LOCALE_REGISTRY: Record<
  LocaleCode,
  LocaleDefinition
> = {
  "sr-Latn": {
    code: "sr-Latn",
    nativeName: "Srpski",
    adminName: "Srpski — latinica",
    shortName: "SR",
    intlLocale: "sr-Latn-RS",
    direction: "ltr",
    uiTranslationReady: false,
  },

  "sr-Cyrl": {
    code: "sr-Cyrl",
    nativeName: "Српски",
    adminName: "Srpski — ćirilica",
    shortName: "СР",
    intlLocale: "sr-Cyrl-RS",
    direction: "ltr",
    uiTranslationReady: false,
  },

  mk: {
    code: "mk",
    nativeName: "Македонски",
    adminName: "Makedonski",
    shortName: "МК",
    intlLocale: "mk-MK",
    direction: "ltr",
    uiTranslationReady: true,
  },

  sq: {
    code: "sq",
    nativeName: "Shqip",
    adminName: "Albanski",
    shortName: "SQ",
    intlLocale: "sq-AL",
    direction: "ltr",
    uiTranslationReady: true,
  },

  en: {
    code: "en",
    nativeName: "English",
    adminName: "Engleski",
    shortName: "EN",
    intlLocale: "en-GB",
    direction: "ltr",
    uiTranslationReady: true,
  },

  de: {
    code: "de",
    nativeName: "Deutsch",
    adminName: "Nemački",
    shortName: "DE",
    intlLocale: "de-DE",
    direction: "ltr",
    uiTranslationReady: false,
  },

  da: {
    code: "da",
    nativeName: "Dansk",
    adminName: "Danski",
    shortName: "DA",
    intlLocale: "da-DK",
    direction: "ltr",
    uiTranslationReady: false,
  },

  fr: {
    code: "fr",
    nativeName: "Français",
    adminName: "Francuski",
    shortName: "FR",
    intlLocale: "fr-FR",
    direction: "ltr",
    uiTranslationReady: false,
  },

  it: {
    code: "it",
    nativeName: "Italiano",
    adminName: "Italijanski",
    shortName: "IT",
    intlLocale: "it-IT",
    direction: "ltr",
    uiTranslationReady: false,
  },

  es: {
    code: "es",
    nativeName: "Español",
    adminName: "Španski",
    shortName: "ES",
    intlLocale: "es-ES",
    direction: "ltr",
    uiTranslationReady: false,
  },

  nl: {
    code: "nl",
    nativeName: "Nederlands",
    adminName: "Holandski",
    shortName: "NL",
    intlLocale: "nl-NL",
    direction: "ltr",
    uiTranslationReady: false,
  },

  no: {
    code: "no",
    nativeName: "Norsk",
    adminName: "Norveški",
    shortName: "NO",
    intlLocale: "nb-NO",
    direction: "ltr",
    uiTranslationReady: false,
  },

  sv: {
    code: "sv",
    nativeName: "Svenska",
    adminName: "Švedski",
    shortName: "SV",
    intlLocale: "sv-SE",
    direction: "ltr",
    uiTranslationReady: false,
  },

  pl: {
    code: "pl",
    nativeName: "Polski",
    adminName: "Poljski",
    shortName: "PL",
    intlLocale: "pl-PL",
    direction: "ltr",
    uiTranslationReady: false,
  },

  pt: {
    code: "pt",
    nativeName: "Português",
    adminName: "Portugalski",
    shortName: "PT",
    intlLocale: "pt-PT",
    direction: "ltr",
    uiTranslationReady: false,
  },

  ro: {
    code: "ro",
    nativeName: "Română",
    adminName: "Rumunski",
    shortName: "RO",
    intlLocale: "ro-RO",
    direction: "ltr",
    uiTranslationReady: false,
  },

  hu: {
    code: "hu",
    nativeName: "Magyar",
    adminName: "Mađarski",
    shortName: "HU",
    intlLocale: "hu-HU",
    direction: "ltr",
    uiTranslationReady: false,
  },

  hr: {
    code: "hr",
    nativeName: "Hrvatski",
    adminName: "Hrvatski",
    shortName: "HR",
    intlLocale: "hr-HR",
    direction: "ltr",
    uiTranslationReady: false,
  },

  sl: {
    code: "sl",
    nativeName: "Slovenščina",
    adminName: "Slovenački",
    shortName: "SL",
    intlLocale: "sl-SI",
    direction: "ltr",
    uiTranslationReady: false,
  },

  bg: {
    code: "bg",
    nativeName: "Български",
    adminName: "Bugarski",
    shortName: "БГ",
    intlLocale: "bg-BG",
    direction: "ltr",
    uiTranslationReady: false,
  },

  el: {
    code: "el",
    nativeName: "Ελληνικά",
    adminName: "Grčki",
    shortName: "EL",
    intlLocale: "el-GR",
    direction: "ltr",
    uiTranslationReady: false,
  },

  tr: {
    code: "tr",
    nativeName: "Türkçe",
    adminName: "Turski",
    shortName: "TR",
    intlLocale: "tr-TR",
    direction: "ltr",
    uiTranslationReady: false,
  },

  cs: {
    code: "cs",
    nativeName: "Čeština",
    adminName: "Češki",
    shortName: "CS",
    intlLocale: "cs-CZ",
    direction: "ltr",
    uiTranslationReady: false,
  },

  sk: {
    code: "sk",
    nativeName: "Slovenčina",
    adminName: "Slovački",
    shortName: "SK",
    intlLocale: "sk-SK",
    direction: "ltr",
    uiTranslationReady: false,
  },

  ar: {
    code: "ar",
    nativeName: "العربية",
    adminName: "Arapski",
    shortName: "AR",
    intlLocale: "ar",
    direction: "rtl",
    uiTranslationReady: false,
  },

  he: {
    code: "he",
    nativeName: "עברית",
    adminName: "Hebrejski",
    shortName: "HE",
    intlLocale: "he-IL",
    direction: "rtl",
    uiTranslationReady: false,
  },
};

export const DEFAULT_CONTENT_LOCALE:
  LocaleCode = "en";

export const CURRENT_UI_LOCALES =
  LOCALE_CODES.filter(
    (code) =>
      LOCALE_REGISTRY[code]
        .uiTranslationReady
  );

export function isLocaleCode(
  value: unknown
): value is LocaleCode {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(
      LOCALE_REGISTRY,
      value
    )
  );
}

export function getLocaleDefinition(
  locale: LocaleCode
): LocaleDefinition {
  return LOCALE_REGISTRY[locale];
}

export function getIntlLocale(
  locale: LocaleCode
): string {
  return LOCALE_REGISTRY[locale]
    .intlLocale;
}

export function getLocaleDirection(
  locale: LocaleCode
): LocaleDirection {
  return LOCALE_REGISTRY[locale]
    .direction;
}

export function normalizeLocaleList(
  values: readonly unknown[],
  fallback: LocaleCode = DEFAULT_CONTENT_LOCALE
): LocaleCode[] {
  const uniqueLocales =
    Array.from(
      new Set(
        values.filter(isLocaleCode)
      )
    );

  return uniqueLocales.length > 0
    ? uniqueLocales
    : [fallback];
}
