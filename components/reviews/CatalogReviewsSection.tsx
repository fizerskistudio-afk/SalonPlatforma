"use client";

import {
  useCatalogData,
} from "@/lib/catalogContext";
import type {
  Locale,
} from "@/lib/types";

import SharedReviewsSection from "./SharedReviewsSection";

type CatalogReviewsSectionProps = {
  locale: Locale;
  previewMode: boolean;
  id?: string;
  className?: string;
  contentClassName?: string;
  cardClassName?: string;
};

export default function CatalogReviewsSection({
  locale,
  previewMode,
  id = "reviews",
  className = "",
  contentClassName = "",
  cardClassName = "",
}: CatalogReviewsSectionProps) {
  const {
    business,
    reviews,
    reviewSummary,
    reviewConfig,
  } = useCatalogData();

  return (
    <SharedReviewsSection
      reviews={reviews}
      summary={reviewSummary}
      config={reviewConfig}
      locale={locale}
      businessSlug={
        business.slug
      }
      previewMode={
        previewMode
      }
      id={id}
      className={
        className
      }
      contentClassName={
        contentClassName
      }
      cardClassName={
        cardClassName
      }
    />
  );
}
