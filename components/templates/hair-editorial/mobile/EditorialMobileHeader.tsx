"use client";

import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import {
  t,
} from "@/lib/translations";

import type {
  CatalogBusiness,
  Locale,
} from "@/lib/types";

import {
  editorialLabels,
} from "../editorial-utils";

type EditorialMobileHeaderProps = {
  business: CatalogBusiness;
  locale: Locale;
  onLocaleChange: (
    locale: Locale
  ) => void;
};

export default function EditorialMobileHeader({
  business,
  locale,
  onLocaleChange,
}: EditorialMobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--brand-border)] bg-[color-mix(in_srgb,var(--brand-background)_90%,transparent)] backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4">
        <a
          href="#editorial-mobile-home"
          className="min-w-0"
        >
          <p className="truncate font-display text-lg font-semibold tracking-[0.02em]">
            {business.name}
          </p>

          <p className="truncate text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
            {t(
              editorialLabels.eyebrow,
              locale
            )}
          </p>
        </a>

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
