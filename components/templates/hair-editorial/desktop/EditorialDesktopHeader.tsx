"use client";

import {
  ArrowUpRight,
  Scissors,
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

type EditorialDesktopHeaderProps = {
  business: CatalogBusiness;
  locale: Locale;
  onLocaleChange: (
    locale: Locale
  ) => void;
  onBook: () => void;
};

export default function EditorialDesktopHeader({
  business,
  locale,
  onLocaleChange,
  onBook,
}: EditorialDesktopHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--brand-border)] bg-[color-mix(in_srgb,var(--brand-background)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-8 xl:px-12">
        <a
          href="#editorial-top"
          className="group flex min-w-0 items-center gap-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)]">
            <Scissors
              className="h-4 w-4 text-[var(--brand-primary)]"
              aria-hidden="true"
            />
          </span>

          <span className="truncate font-display text-lg font-semibold tracking-[0.04em]">
            {business.name}
          </span>
        </a>

        <nav
          className="flex items-center gap-7 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-muted)]"
          aria-label={t(
            translations.common
              .mainNavigation,
            locale
          )}
        >
          <a
            href="#editorial-services"
            className="transition-colors hover:text-[var(--brand-text)]"
          >
            {t(
              translations.nav.services,
              locale
            )}
          </a>

          <a
            href="#editorial-team"
            className="transition-colors hover:text-[var(--brand-text)]"
          >
            {t(
              translations.nav.team,
              locale
            )}
          </a>

          <a
            href="#editorial-gallery"
            className="transition-colors hover:text-[var(--brand-text)]"
          >
            {t(
              translations.nav.gallery,
              locale
            )}
          </a>

          <a
            href="#editorial-reviews"
            className="transition-colors hover:text-[var(--brand-text)]"
          >
            {t(
              translations.nav.reviews,
              locale
            )}
          </a>

          <a
            href="#editorial-contact"
            className="transition-colors hover:text-[var(--brand-text)]"
          >
            {t(
              translations.nav.contact,
              locale
            )}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher
            currentLocale={locale}
            onLocaleChange={
              onLocaleChange
            }
          />

          <button
            type="button"
            onClick={onBook}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-sm font-semibold text-[var(--brand-background)] transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transform-none motion-reduce:transition-none"
          >
            {t(
              translations.hero.bookNow,
              locale
            )}

            <ArrowUpRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
