"use client";

import {
  useCatalogData,
} from "@/lib/catalogContext";
import type {
  Locale,
} from "@/lib/types";

import BarberEditorialReviewsSection from "./BarberEditorialReviewsSection";
import NailsAtelierReviewsSection from "./NailsAtelierReviewsSection";
import SharedReviewsSection from "./SharedReviewsSection";

export type CatalogReviewsVariant =
  | "default"
  | "barber-editorial"
  | "nails-atelier";

type CatalogReviewsSectionProps = {
  locale: Locale;
  previewMode: boolean;
  id?: string;
  className?: string;
  contentClassName?: string;
  cardClassName?: string;
  variant?: CatalogReviewsVariant;
  title?: string;
  subtitle?: string;
};

export default function CatalogReviewsSection({
  locale,
  previewMode,
  id = "reviews",
  className = "",
  contentClassName = "",
  cardClassName = "",
  variant = "default",
  title,
  subtitle,
}: CatalogReviewsSectionProps) {
  const {
    business,
    reviews,
    reviewSummary,
    reviewConfig,
  } = useCatalogData();

  if (
    variant ===
      "barber-editorial"
  ) {
    return (
      <BarberEditorialReviewsSection
        reviews={
          reviews
        }
        reviewSummary={
          reviewSummary
        }
        reviewConfig={
          reviewConfig
        }
        locale={
          locale
        }
        businessSlug={
          business.slug
        }
        previewMode={
          previewMode
        }
        id={
          id
        }
        className={
          className
        }
        contentClassName={
          contentClassName
        }
      />
    );
  }

  if (
    variant ===
      "nails-atelier"
  ) {
    return (
      <NailsAtelierReviewsSection
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
        title={title}
        subtitle={
          subtitle
        }
        className={
          className
        }
        contentClassName={
          contentClassName
        }
      />
    );
  }

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
      title={title}
      subtitle={
        subtitle
      }
    />
  );
}
