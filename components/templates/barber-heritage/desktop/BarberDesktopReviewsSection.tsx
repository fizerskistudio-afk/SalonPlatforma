"use client";
import CatalogReviewsSection from "@/components/reviews/CatalogReviewsSection";
import type { Locale } from "@/lib/types";
type Props = { locale: Locale; previewMode: boolean };
export default function BarberDesktopReviewsSection({ locale, previewMode }: Props) {
  return <CatalogReviewsSection locale={locale} previewMode={previewMode} id="reviews" className="border-b border-[var(--brand-border)]" contentClassName="max-w-[1500px]" />;
}
