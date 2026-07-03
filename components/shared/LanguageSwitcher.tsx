"use client";

import { useCatalogData } from "@/lib/catalogContext";
import {
  getLocaleDefinition,
  isLocaleCode,
} from "@/lib/i18n/locales";
import {
  t,
  translations,
} from "@/lib/translations";
import type {
  Locale,
} from "@/lib/types";

type LanguageSwitcherProps = {
  currentLocale: Locale;

  onLocaleChange: (
    locale: Locale
  ) => void;

  variant?: "header" | "footer";
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
    business.supportedContentLocales;

  if (
    supportedLocales.length <= 1
  ) {
    return null;
  }

  const label = t(
    translations.common
      .languageSelector,
    currentLocale
  );

  const useCompactSelect =
    supportedLocales.length > 3;

  const selectedLocale =
    isLocaleCode(currentLocale) &&
    supportedLocales.includes(
      currentLocale
    )
      ? currentLocale
      : supportedLocales[0];

  const handleSelectChange = (
    value: string
  ) => {
    if (
      isLocaleCode(value) &&
      supportedLocales.includes(value)
    ) {
      onLocaleChange(value);
    }
  };

  if (useCompactSelect) {
    return (
      <label
        className={
          variant === "header"
            ? "relative inline-flex items-center"
            : "inline-flex items-center"
        }
      >
        <span className="sr-only">
          {label}
        </span>

        <select
          value={selectedLocale}
          onChange={(event) =>
            handleSelectChange(
              event.target.value
            )
          }
          className="min-h-9 cursor-pointer appearance-none rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] py-1.5 pl-3 pr-8 text-xs font-semibold text-[var(--brand-text)] outline-none transition-colors hover:border-[var(--brand-primary)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/25"
          aria-label={label}
        >
          {supportedLocales.map(
            (locale) => {
              const definition =
                getLocaleDefinition(
                  locale
                );

              return (
                <option
                  key={locale}
                  value={locale}
                >
                  {
                    definition.nativeName
                  }
                </option>
              );
            }
          )}
        </select>

        <span
          className="pointer-events-none absolute right-3 text-[10px] text-[var(--brand-muted)]"
          aria-hidden="true"
        >
          ▼
        </span>
      </label>
    );
  }

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
      aria-label={label}
    >
      {supportedLocales.map(
        (locale) => {
          const localeDefinition =
            getLocaleDefinition(
              locale
            );

          const isActive =
            currentLocale === locale;

          const ariaLabel =
            isActive
              ? `${localeDefinition.nativeName} (${t(
                  translations.common
                    .selected,
                  currentLocale
                )})`
              : `${t(
                  translations.common
                    .switchToLanguage,
                  currentLocale
                )} ${localeDefinition.nativeName}`;

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
                localeDefinition
                  .shortName
              }
            </button>
          );
        }
      )}
    </div>
  );
}
