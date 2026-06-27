"use client";

import type { Locale } from "@/lib/types";
import { businessConfig } from "@/lib/config";
import { t, translations } from "@/lib/translations";
import LanguageSwitcher from "../shared/LanguageSwitcher";
import { Scissors } from "lucide-react";

type HeaderProps = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onBook: () => void;
};

const navItems: { key: keyof typeof translations.nav; href: string }[] = [
  { key: "home", href: "#home" },
  { key: "services", href: "#services" },
  { key: "team", href: "#team" },
  { key: "gallery", href: "#gallery" },
  { key: "contact", href: "#contact" },
];

/**
 * Desktop header sa navigacijom, language switcher-om i book dugmetom.
 * Sticky pozicija sa backdrop blur efektom.
 */
export default function Header({ locale, onLocaleChange, onBook }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--brand-surface)]/80 border-b border-[var(--brand-border)]/50">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#home"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 rounded-lg"
          aria-label={`${businessConfig.name} - ${t(translations.nav.home, locale)}`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center transition-transform motion-reduce:transition-none group-hover:scale-105">
            <Scissors className="w-5 h-5 text-[var(--brand-surface)]" aria-hidden="true" />
          </div>
          <div>
            <div className="font-display text-xl font-semibold tracking-tight text-[var(--brand-text)]">
              {businessConfig.name}
            </div>
            <div className="text-xs text-[var(--brand-muted)] -mt-0.5">
              {t(businessConfig.tagline, locale)}
            </div>
          </div>
        </a>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-8" aria-label={t(translations.common.mainNavigation, locale)}>
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="text-sm font-medium text-[var(--brand-muted)] hover:text-[var(--brand-primary)] transition-colors motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 rounded px-2 py-1"
            >
              {t(translations.nav[item.key], locale)}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher
            currentLocale={locale}
            onLocaleChange={onLocaleChange}
            variant="header"
          />
          <button
            type="button"
            onClick={onBook}
            className="hidden md:inline-flex px-5 py-2.5 bg-[var(--brand-text)] text-[var(--brand-surface)] text-sm font-medium rounded-full hover:bg-[var(--brand-primary)] transition-colors motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2"
          >
            {t(translations.nav.book, locale)}
          </button>
        </div>
      </div>
    </header>
  );
}