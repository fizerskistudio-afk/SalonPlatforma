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

type NailsMobileReviewsSectionProps = {
  locale: Locale;
  previewMode: boolean;
};

export default function NailsMobileReviewsSection({
  locale,
  previewMode,
}: NailsMobileReviewsSectionProps) {
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
      id="nails-mobile-reviews"
      className="border-b border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-9"
    />
  );
}
