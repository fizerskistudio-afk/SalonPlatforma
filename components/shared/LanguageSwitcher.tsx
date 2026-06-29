"use client";

import { useCatalogData } from "@/lib/catalogContext";
import {
  t,
  translations,
} from "@/lib/translations";
import type { Locale } from "@/lib/types";

type LanguageSwitcherProps = {
  currentLocale: Locale;

  onLocaleChange: (
    locale: Locale
  ) => void;

  variant?: "header" | "footer";
};

const localeFullNames: Record<
  Locale,
  string
> = {
  mk: "Македонски",
  sq: "Shqip",
  en: "English",
};

const localeShortNames: Record<
  Locale,
  string
> = {
  mk: "МК",
  sq: "SQ",
  en: "EN",
};

export default function LanguageSwitcher({
  currentLocale,
  onLocaleChange,
  variant = "header",
}: LanguageSwitcherProps) {
  const {
    business,
  } = useCatalogData();

  const supportedLocales =
    business.supportedLocales;

  const baseStyles =
    variant === "header"
      ? "inline-flex items-center gap-0.5 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] p-0.5"
      : "flex items-center gap-1";

  const buttonStyles = (
    isActive: boolean
  ) =>
    `rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 ${
      isActive
        ? "bg-[var(--brand-primary)] text-[var(--brand-surface)]"
        : "text-[var(--brand-muted)] hover:text-[var(--brand-text)]"
    }`;

  return (
    <div
      className={baseStyles}
      role="group"
      aria-label={t(
        translations.common
          .languageSelector,
        currentLocale
      )}
    >
      {supportedLocales.map(
        (locale) => {
          const isActive =
            currentLocale === locale;

          const ariaLabel =
            isActive
              ? `${localeFullNames[locale]} (${t(
                  translations.common
                    .selected,
                  currentLocale
                )})`
              : `${t(
                  translations.common
                    .switchToLanguage,
                  currentLocale
                )} ${localeFullNames[locale]}`;

          return (
            <button
              key={locale}
              type="button"
              onClick={() =>
                onLocaleChange(
                  locale
                )
              }
              className={buttonStyles(
                isActive
              )}
              aria-pressed={
                isActive
              }
              aria-label={
                ariaLabel
              }
            >
              {
                localeShortNames[
                  locale
                ]
              }
            </button>
          );
        }
      )}
    </div>
  );
}