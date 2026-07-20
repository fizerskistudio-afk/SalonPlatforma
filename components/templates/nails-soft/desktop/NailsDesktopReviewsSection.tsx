"use client";

import CatalogReviewsSection from "@/components/reviews/CatalogReviewsSection";

import {
  t,
  translations,
} from "@/lib/translations";

import type {
  Locale,
} from "@/lib/types";

import {
  nailsLabels,
} from "../nails-utils";

type NailsDesktopReviewsSectionProps = {
  locale: Locale;
  previewMode: boolean;
};

export default function NailsDesktopReviewsSection({
  locale,
  previewMode,
}: NailsDesktopReviewsSectionProps) {
  return (
    <CatalogReviewsSection
      locale={locale}
      previewMode={
        previewMode
      }
      variant="nails-atelier"
      title={t(
        nailsLabels.loveNotes,
        locale
      )}
      subtitle={t(
        translations.nav
          .reviews,
        locale
      )}
      id="nails-reviews"
      className="border-b border-[var(--brand-border)] bg-[var(--brand-background)]"
      contentClassName="max-w-[1320px]"
    />
  );
}
