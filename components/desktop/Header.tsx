"use client";

import { Scissors } from "lucide-react";

import { useCatalogData } from "@/lib/catalogContext";
import {
  t,
  translations,
} from "@/lib/translations";
import type { Locale } from "@/lib/types";

import LanguageSwitcher from "../shared/LanguageSwitcher";

type HeaderProps = {
  locale: Locale;

  onLocaleChange: (
    locale: Locale
  ) => void;

  onBook: () => void;
};

const navItems: {
  key: keyof typeof translations.nav;
  href: string;
}[] = [
  {
    key: "home",
    href: "#home",
  },
  {
    key: "services",
    href: "#services",
  },
  {
    key: "team",
    href: "#team",
  },
  {
    key: "gallery",
    href: "#gallery",
  },
  {
    key: "contact",
    href: "#contact",
  },
];

export default function Header({
  locale,
  onLocaleChange,
  onBook,
}: HeaderProps) {
  const {
    business,
  } = useCatalogData();

  const hasLogo =
    business.logoUrl.trim().length > 0;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/15 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        <a
          href="#home"
          aria-label={`${business.name} - ${t(
            translations.nav.home,
            locale
          )}`}
          className="group flex min-w-0 items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-black"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-[var(--brand-primary)] transition-transform group-hover:scale-105 motion-reduce:transition-none">
            {hasLogo ? (
              <img
                src={business.logoUrl}
                alt={`${business.name} logo`}
                className="h-full w-full object-contain p-1.5"
                loading="eager"
                decoding="async"
              />
            ) : (
              <Scissors
                className="h-5 w-5 text-black"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="truncate font-serif text-xl font-semibold tracking-tight text-white">
              {business.name}
            </div>

            <div className="-mt-0.5 hidden max-w-56 truncate text-xs text-white/60 sm:block">
              {t(
                business.tagline,
                locale
              )}
            </div>
          </div>
        </a>

        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label={t(
            translations.common
              .mainNavigation,
            locale
          )}
        >
          {navItems.map(
            (item) => (
              <a
                key={item.key}
                href={item.href}
                className="rounded px-2 py-1 text-sm font-medium text-white/75 transition-colors hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-black motion-reduce:transition-none"
              >
                {t(
                  translations.nav[
                    item.key
                  ],
                  locale
                )}
              </a>
            )
          )}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-4">
          <LanguageSwitcher
            currentLocale={locale}
            onLocaleChange={
              onLocaleChange
            }
            variant="header"
          />

          <button
            type="button"
            onClick={onBook}
            className="hidden min-h-11 rounded-full bg-[var(--brand-primary)] px-6 py-2.5 text-sm font-semibold text-black transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-black motion-reduce:transition-none md:inline-flex md:items-center"
          >
            {t(
              translations.nav.book,
              locale
            )}
          </button>
        </div>
      </div>
    </header>
  );
}