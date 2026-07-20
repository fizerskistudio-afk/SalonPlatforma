"use client";

import {
  ArrowUpRight,
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

type NailsDesktopHeaderProps = {
  business: CatalogBusiness;
  locale: Locale;
  onLocaleChange: (
    locale: Locale
  ) => void;
  onBook: () => void;
};

export default function NailsDesktopHeader({
  business,
  locale,
  onLocaleChange,
  onBook,
}: NailsDesktopHeaderProps) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-5 pt-5 xl:px-8">
      <div className="pointer-events-auto mx-auto flex h-[62px] max-w-[1320px] items-center gap-5 rounded-full border border-white/55 bg-[color-mix(in_srgb,var(--brand-surface)_84%,transparent)] px-3 pl-5 shadow-[0_14px_42px_rgba(54,31,43,0.10)] backdrop-blur-2xl">
        <a
          href="#nails-top"
          className="group flex min-w-0 items-center gap-3"
        >
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--brand-text)] text-[var(--brand-background)]">
            <Palette
              className="h-4 w-4 transition-transform duration-500 group-hover:rotate-12 motion-reduce:transition-none"
              aria-hidden="true"
            />

            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-[var(--brand-primary)]" />
          </span>

          <span className="truncate font-display text-lg font-semibold italic tracking-[-0.02em]">
            {business.name}
          </span>
        </a>

        <nav
          className="ml-auto hidden items-center gap-5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-muted)] lg:flex xl:gap-7"
          aria-label={t(
            translations.common
              .mainNavigation,
            locale
          )}
        >
          <a
            href="#nails-portfolio"
            className="transition-colors hover:text-[var(--brand-primary)] focus:outline-none focus-visible:text-[var(--brand-primary)] motion-reduce:transition-none"
          >
            {t(
              translations.nav.gallery,
              locale
            )}
          </a>

          <a
            href="#nails-services"
            className="transition-colors hover:text-[var(--brand-primary)] focus:outline-none focus-visible:text-[var(--brand-primary)] motion-reduce:transition-none"
          >
            {t(
              translations.nav.services,
              locale
            )}
          </a>

          <a
            href="#nails-team"
            className="transition-colors hover:text-[var(--brand-primary)] focus:outline-none focus-visible:text-[var(--brand-primary)] motion-reduce:transition-none"
          >
            {t(
              translations.nav.team,
              locale
            )}
          </a>

          <a
            href="#nails-reviews"
            className="transition-colors hover:text-[var(--brand-primary)] focus:outline-none focus-visible:text-[var(--brand-primary)] motion-reduce:transition-none"
          >
            {t(
              translations.nav.reviews,
              locale
            )}
          </a>

          <a
            href="#nails-contact"
            className="transition-colors hover:text-[var(--brand-primary)] focus:outline-none focus-visible:text-[var(--brand-primary)] motion-reduce:transition-none"
          >
            {t(
              translations.nav.contact,
              locale
            )}
          </a>
        </nav>

        <LanguageSwitcher
          currentLocale={locale}
          onLocaleChange={
            onLocaleChange
          }
        />

        <button
          type="button"
          onClick={onBook}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-xs font-semibold text-[var(--brand-background)] shadow-[0_10px_30px_color-mix(in_srgb,var(--brand-primary)_24%,transparent)] transition hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
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
    </header>
  );
}
