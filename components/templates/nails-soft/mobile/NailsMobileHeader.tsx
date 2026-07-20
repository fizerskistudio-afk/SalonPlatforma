"use client";

import {
  Palette,
} from "lucide-react";

import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import {
  t,
  translations,
} from "@/lib/translations";

import type {
  CatalogBusiness,
  Locale,
} from "@/lib/types";

import {
  nailsLabels,
} from "../nails-utils";

type NailsMobileHeaderProps = {
  business: CatalogBusiness;
  locale: Locale;
  onHome: () => void;
  onLocaleChange: (
    locale: Locale
  ) => void;
};

export default function NailsMobileHeader({
  business,
  locale,
  onHome,
  onLocaleChange,
}: NailsMobileHeaderProps) {
  return (
    <header className="z-40 shrink-0 px-3 pt-3">
      <div className="flex min-h-12 items-center justify-between gap-3 rounded-full border border-white/60 bg-[color-mix(in_srgb,var(--brand-surface)_86%,transparent)] px-2 pl-3 shadow-[0_12px_35px_rgba(55,28,42,0.10)] backdrop-blur-2xl">
        <button
          type="button"
          onClick={onHome}
          className="flex min-w-0 items-center gap-2.5"
          aria-label={t(
            translations.nav.home,
            locale
          )}
        >
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-text)] text-[var(--brand-background)]">
            <Palette
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />

            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[var(--brand-primary)]" />
          </span>

          <span className="min-w-0">
            <span className="block truncate font-display text-base font-semibold italic tracking-[-0.02em]">
              {business.name}
            </span>

            <span className="block truncate text-[7px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
              {t(
                nailsLabels.currentEdit,
                locale
              )}
            </span>
          </span>
        </button>

        <LanguageSwitcher
          currentLocale={locale}
          onLocaleChange={
            onLocaleChange
          }
        />
      </div>
    </header>
  );
}
