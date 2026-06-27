"use client";

import type { Locale } from "@/lib/types";
import { businessConfig } from "@/lib/config";
import { t, translations } from "@/lib/translations";

type LanguageSwitcherProps = {
  currentLocale: Locale;
  onLocaleChange: (locale: Locale) => void;
  variant?: "header" | "footer";
};

export default function LanguageSwitcher({
  currentLocale,
  onLocaleChange,
  variant = "header",
}: LanguageSwitcherProps) {
  const { supportedLocales } = businessConfig;

  const localeFullNames: Record<Locale, string> = {
    mk: "Македонски",
    sq: "Shqip",
    en: "English",
  };

  const localeShortNames: Record<Locale, string> = {
    mk: "МК",
    sq: "SQ",
    en: "EN",
  };

  const baseStyles =
    variant === "header"
      ? "inline-flex items-center gap-0.5 rounded-full p-0.5 border border-[var(--brand-border)] bg-[var(--brand-surface)]"
      : "flex items-center gap-1";

  const buttonStyles = (isActive: boolean) =>
    `px-2.5 py-1 text-xs font-semibold uppercase rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 ${
      isActive
        ? "bg-[var(--brand-primary)] text-[var(--brand-surface)]"
        : "text-[var(--brand-muted)] hover:text-[var(--brand-text)]"
    }`;

  return (
    <div
      className={baseStyles}
      role="group"
      aria-label={t(
        translations.common.languageSelector,
        currentLocale
      )}
    >
      {supportedLocales.map((locale) => {
        const isActive = currentLocale === locale;

        const ariaLabel = isActive
          ? `${localeFullNames[locale]} (${t(
              translations.common.selected,
              currentLocale
            )})`
          : `${t(
              translations.common.switchToLanguage,
              currentLocale
            )} ${localeFullNames[locale]}`;

        return (
          <button
            key={locale}
            type="button"
            onClick={() => onLocaleChange(locale)}
            className={buttonStyles(isActive)}
            aria-pressed={isActive}
            aria-label={ariaLabel}
          >
            {localeShortNames[locale]}
          </button>
        );
      })}
    </div>
  );
}