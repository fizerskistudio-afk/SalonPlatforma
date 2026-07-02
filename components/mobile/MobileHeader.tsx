"use client";

import {
  Calendar,
  Monitor,
  Scissors,
} from "lucide-react";

import { useCatalogData } from "@/lib/catalogContext";
import {
  t,
  translations,
} from "@/lib/translations";
import type { Locale } from "@/lib/types";

import LanguageSwitcher from "../shared/LanguageSwitcher";

type MobileHeaderProps = {
  locale: Locale;

  onLocaleChange: (
    locale: Locale
  ) => void;

  onBook: () => void;
  onSwitchToDesktop: () => void;
};

export default function MobileHeader({
  locale,
  onLocaleChange,
  onBook,
  onSwitchToDesktop,
}: MobileHeaderProps) {
  const {
    business,
  } = useCatalogData();

  const hasLogo =
    business.logoUrl.trim().length > 0;

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 border-b border-[var(--brand-text)]/10 bg-[var(--brand-background)]/65 backdrop-blur-md"
      style={{
        paddingTop:
          "env(safe-area-inset-top)",
      }}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex min-w-0 flex-shrink items-center gap-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary)]/70">
            {hasLogo ? (
              <img
                src={business.logoUrl}
                alt={`${business.name} logo`}
                className="h-full w-full object-contain p-1"
                loading="eager"
                decoding="async"
              />
            ) : (
              <Scissors
                className="h-3.5 w-3.5 text-[var(--brand-background)]"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="font-display truncate text-sm font-semibold leading-tight text-[var(--brand-text)]">
              {business.name}
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5">
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
            aria-label={t(
              translations.hero
                .bookNow,
              locale
            )}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-primary)] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transition-none"
          >
            <Calendar
              className="h-3.5 w-3.5 text-[var(--brand-background)]"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={
              onSwitchToDesktop
            }
            aria-label={t(
              translations.common
                .openFullWebsite,
              locale
            )}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-text)]/10 transition-colors hover:bg-[var(--brand-text)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transition-none"
          >
            <Monitor
              className="h-3.5 w-3.5 text-[var(--brand-text)]"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </header>
  );
}