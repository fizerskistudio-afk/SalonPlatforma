"use client";
import CatalogReviewsSection from "@/components/reviews/CatalogReviewsSection";
import type { Locale } from "@/lib/types";
type Props = { locale: Locale; previewMode: boolean };
export default function BarberMobileReviewsSection({ locale, previewMode }: Props) {
  return <CatalogReviewsSection locale={locale} previewMode={previewMode} id="barber-mobile-reviews" className="border-b border-[var(--brand-border)] pb-32"/>;
}
