import {
  UI_LOCALE_CODES,
} from "@/lib/i18n/locales";

import type {
  LocaleCode,
  UiLocaleCode,
} from "@/lib/i18n/locales";
import type {
  Locale,
} from "@/lib/types";

export type LanguageSwitcherState = {
  supportedLocales:
    readonly UiLocaleCode[];
  selectedLocale:
    UiLocaleCode | null;
  useCompactSelect: boolean;
};

export function getLanguageSwitcherState(
  supportedContentLocales:
    readonly LocaleCode[],
  currentLocale: Locale
): LanguageSwitcherState {
  const contentLocaleSet =
    new Set<LocaleCode>(
      supportedContentLocales
    );

  const supportedLocales =
    UI_LOCALE_CODES.filter(
      (locale) =>
        contentLocaleSet.has(
          locale
        )
    );

  const selectedLocale =
    supportedLocales.find(
      (locale) =>
        locale ===
        currentLocale
    ) ??
    supportedLocales[0] ??
    null;

  return {
    supportedLocales,
    selectedLocale,
    useCompactSelect:
      supportedLocales.length >
      3,
  };
}
