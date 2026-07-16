"use client";

import CatalogReviewsSection from "@/components/reviews/CatalogReviewsSection";

import type {
  Locale,
} from "@/lib/types";

type EditorialDesktopReviewsSectionProps = {
  locale: Locale;
  previewMode: boolean;
};

export default function EditorialDesktopReviewsSection({
  locale,
  previewMode,
}: EditorialDesktopReviewsSectionProps) {
  return (
    <CatalogReviewsSection
      locale={locale}
      previewMode={
        previewMode
      }
      id="editorial-reviews"
      className="border-b border-[var(--brand-border)]"
      contentClassName="max-w-[1500px]"
    />
  );
}
