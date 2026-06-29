"use client";

import { Scissors } from "lucide-react";

import { useCatalogData } from "@/lib/catalogContext";
import {
  t,
  translations,
} from "@/lib/translations";
import type { Locale } from "@/lib/types";

type FooterProps = {
  locale: Locale;
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

export default function Footer({
  locale,
}: FooterProps) {
  const {
    business,
  } = useCatalogData();

  const currentYear =
    new Date().getFullYear();

  return (
    <footer className="bg-[var(--brand-text)] px-8 py-12 text-[var(--brand-surface)]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-primary)]">
              <Scissors
                className="h-5 w-5 text-[var(--brand-surface)]"
                aria-hidden="true"
              />
            </div>

            <div>
              <div className="font-display text-lg font-semibold">
                {business.name}
              </div>

              <div className="text-xs text-[var(--brand-surface)] opacity-50">
                © {currentYear} ·{" "}
                {t(
                  business.city,
                  locale
                )}
              </div>
            </div>
          </div>

          <nav
            aria-label={t(
              translations.common
                .footerNavigation,
              locale
            )}
          >
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {navItems.map(
                (item) => (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      className="rounded px-2 py-1 text-sm text-[var(--brand-surface)] opacity-70 transition-colors hover:text-[var(--brand-primary)] hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-text)] motion-reduce:transition-none"
                    >
                      {t(
                        translations.nav[
                          item.key
                        ],
                        locale
                      )}
                    </a>
                  </li>
                )
              )}
            </ul>
          </nav>

          <div className="text-center text-sm text-[var(--brand-surface)] opacity-50 md:text-right">
            {t(
              translations.common
                .allRightsReserved,
              locale
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}