"use client";

import {
  useCatalogData,
} from "@/lib/catalogContext";

import type {
  PublicTemplateProps,
} from "../template-props";
import NailsDesktopContactSection from "./desktop/NailsDesktopContactSection";
import NailsDesktopFooter from "./desktop/NailsDesktopFooter";
import NailsDesktopGallerySection from "./desktop/NailsDesktopGallerySection";
import NailsDesktopHeader from "./desktop/NailsDesktopHeader";
import NailsDesktopHeroSection from "./desktop/NailsDesktopHeroSection";
import NailsDesktopReviewsSection from "./desktop/NailsDesktopReviewsSection";
import NailsDesktopServicesSection from "./desktop/NailsDesktopServicesSection";
import NailsDesktopTeamSection from "./desktop/NailsDesktopTeamSection";
import {
  getNailsLocationLine,
} from "./nails-utils";

export default function NailsSoftDesktopTemplate({
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
    getNailsLocationLine(
      [
        business.address,
        business.city,
        business.country,
      ],
      locale
    );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--brand-background)] text-[var(--brand-text)]">
      <NailsDesktopHeader
        business={business}
        locale={locale}
        onBook={onBook}
        onLocaleChange={
          onLocaleChange
        }
      />

      <main>
        <NailsDesktopHeroSection
          business={business}
          gallery={
            gallery.slice(
              0,
              3
            )
          }
          locale={locale}
          locationLine={
            locationLine
          }
          onBook={onBook}
        />

        <NailsDesktopGallerySection
          gallery={
            gallery.slice(
              0,
              8
            )
          }
          locale={locale}
        />

        <NailsDesktopServicesSection
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
              10
            )
          }
          onBook={onBook}
          onBookService={
            onBookService
          }
        />

        <NailsDesktopTeamSection
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

        <NailsDesktopReviewsSection
          locale={locale}
          previewMode={
            previewMode
          }
        />

        <NailsDesktopContactSection
          business={business}
          locale={locale}
          locationLine={
            locationLine
          }
          onBook={onBook}
        />
      </main>

      <NailsDesktopFooter
        business={business}
        locale={locale}
      />
    </div>
  );
}
