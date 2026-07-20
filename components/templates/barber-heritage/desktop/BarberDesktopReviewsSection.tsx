"use client";

import CatalogReviewsSection from "@/components/reviews/CatalogReviewsSection";
import type {
  Locale,
} from "@/lib/types";

type BarberDesktopReviewsSectionProps = {
  locale:
    Locale;
  previewMode:
    boolean;
};

export default function BarberDesktopReviewsSection({
  locale,
  previewMode,
}: BarberDesktopReviewsSectionProps) {
  return (
    <CatalogReviewsSection
      locale={
        locale
      }
      previewMode={
        previewMode
      }
      id="reviews"
      variant="barber-editorial"
      className="border-b border-[var(--brand-border)]"
      contentClassName="max-w-[1500px]"
    />
  );
}
