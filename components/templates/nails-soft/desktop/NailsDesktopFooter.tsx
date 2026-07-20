"use client";

import {
  ArrowUp,
} from "lucide-react";

import {
  t,
} from "@/lib/translations";

import type {
  CatalogBusiness,
  Locale,
} from "@/lib/types";

import {
  nailsLabels,
} from "../nails-utils";

const FOOTER_SHADES = [
  "#c2326d",
  "#ee9db6",
  "#762b4a",
] as const;

type NailsDesktopFooterProps = {
  business: CatalogBusiness;
  locale: Locale;
};

export default function NailsDesktopFooter({
  business,
  locale,
}: NailsDesktopFooterProps) {
  return (
    <footer className="border-t border-[var(--brand-border)] bg-[var(--brand-surface)]">
      <div className="mx-auto flex max-w-[1320px] items-center gap-8 px-8 py-6 xl:px-10">
        <a
          href="#nails-top"
          className="min-w-0 truncate font-display text-xl font-semibold italic"
        >
          {business.name}
        </a>

        <p className="ml-auto text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-muted)]">
          {t(
            nailsLabels.heroKicker,
            locale
          )}
        </p>

        <div className="flex items-end gap-1.5" aria-hidden="true">
          {FOOTER_SHADES.map(
            (
              shade,
              index
            ) => (
              <span
                key={shade}
                className="rounded-[999px_999px_45%_45%]"
                style={{
                  width:
                    `${16 + index * 2}px`,
                  height:
                    `${34 + index * 7}px`,
                  backgroundColor:
                    shade,
                }}
              />
            )
          )}
        </div>

        <p className="text-xs text-[var(--brand-muted)]">
          © {new Date().getFullYear()}
        </p>

        <a
          href="#nails-top"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--brand-border)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] motion-reduce:transition-none"
          aria-label={business.name}
        >
          <ArrowUp
            className="h-4 w-4"
            aria-hidden="true"
          />
        </a>
      </div>
    </footer>
  );
}
