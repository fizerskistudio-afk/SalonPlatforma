"use client";

import {
  useCatalogData,
} from "@/lib/catalogContext";

import type {
  PublicTemplateProps,
} from "../template-props";
import EditorialDesktopContactSection from "./desktop/EditorialDesktopContactSection";
import EditorialDesktopFooter from "./desktop/EditorialDesktopFooter";
import EditorialDesktopGallerySection from "./desktop/EditorialDesktopGallerySection";
import EditorialDesktopHeader from "./desktop/EditorialDesktopHeader";
import EditorialDesktopHeroSection from "./desktop/EditorialDesktopHeroSection";
import EditorialDesktopReviewsSection from "./desktop/EditorialDesktopReviewsSection";
import EditorialDesktopServicesSection from "./desktop/EditorialDesktopServicesSection";
import EditorialDesktopTeamSection from "./desktop/EditorialDesktopTeamSection";
import {
  getLocationLine,
} from "./editorial-utils";

export default function HairEditorialDesktopTemplate({
  locale,
  previewMode,
  onLocaleChange,
  onBook,
  onBookService,
  onBookEmployee,
}: PublicTemplateProps) {
  const {
    business,
    categories,
    services,
    employees,
    gallery,
  } = useCatalogData();

  const locationLine =
    getLocationLine(
      business.address,
      business.city,
      business.country,
      locale
    );

  return (
    <div className="min-h-screen bg-[var(--brand-background)] text-[var(--brand-text)]">
      <EditorialDesktopHeader
        business={business}
        locale={locale}
        onLocaleChange={
          onLocaleChange
        }
        onBook={onBook}
      />

      <main>
        <EditorialDesktopHeroSection
          business={business}
          locale={locale}
          locationLine={
            locationLine
          }
          onBook={onBook}
        />

        <EditorialDesktopServicesSection
          categories={
            categories
          }
          currency={
            business.currency
          }
          locale={locale}
          services={
            services.slice(
              0,
              8
            )
          }
          onBookService={
            onBookService
          }
        />

        <EditorialDesktopTeamSection
          employees={
            employees.slice(
              0,
              6
            )
          }
          locale={locale}
          onBookEmployee={
            onBookEmployee
          }
        />

        <EditorialDesktopGallerySection
          gallery={
            gallery.slice(
              0,
              6
            )
          }
          locale={locale}
        />

        <EditorialDesktopReviewsSection
          locale={locale}
          previewMode={
            previewMode
          }
        />

        <EditorialDesktopContactSection
          business={business}
          locale={locale}
          locationLine={
            locationLine
          }
          onBook={onBook}
        />
      </main>

      <EditorialDesktopFooter
        business={business}
        locale={locale}
      />
    </div>
  );
}
