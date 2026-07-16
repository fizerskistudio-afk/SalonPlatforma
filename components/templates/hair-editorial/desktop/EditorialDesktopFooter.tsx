"use client";

import {
  t,
  translations,
} from "@/lib/translations";

import type {
  CatalogBusiness,
  Locale,
} from "@/lib/types";

type EditorialDesktopFooterProps = {
  business: CatalogBusiness;
  locale: Locale;
};

export default function EditorialDesktopFooter({
  business,
  locale,
}: EditorialDesktopFooterProps) {
  const currentYear =
    new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--brand-border)]">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-8 px-8 py-8 text-xs text-[var(--brand-muted)] xl:px-12">
        <p>
          © {currentYear}{" "}
          {business.name}.{" "}
          {t(
            translations.common
              .allRightsReserved,
            locale
          )}.
        </p>

        <p className="uppercase tracking-[0.16em]">
          Hair Editorial / 01
        </p>
      </div>
    </footer>
  );
}
