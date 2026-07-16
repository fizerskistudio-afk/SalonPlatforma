"use client";

import CatalogReviewsSection from "@/components/reviews/CatalogReviewsSection";

import type {
  Locale,
} from "@/lib/types";

type EditorialMobileReviewsSectionProps = {
  locale: Locale;
  previewMode: boolean;
};

export default function EditorialMobileReviewsSection({
  locale,
  previewMode,
}: EditorialMobileReviewsSectionProps) {
  return (
    <CatalogReviewsSection
      locale={locale}
      previewMode={
        previewMode
      }
      id="editorial-mobile-reviews"
      className="border-b border-[var(--brand-border)] pb-32"
    />
  );
}
