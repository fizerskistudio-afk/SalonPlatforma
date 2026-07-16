"use client";

import {
  useCatalogData,
} from "@/lib/catalogContext";

import type {
  PublicTemplateProps,
} from "../template-props";
import {
  getLocationLine,
} from "./editorial-utils";
import EditorialMobileBottomNav from "./mobile/EditorialMobileBottomNav";
import EditorialMobileContactSection from "./mobile/EditorialMobileContactSection";
import EditorialMobileGallerySection from "./mobile/EditorialMobileGallerySection";
import EditorialMobileHeader from "./mobile/EditorialMobileHeader";
import EditorialMobileHeroSection from "./mobile/EditorialMobileHeroSection";
import EditorialMobileReviewsSection from "./mobile/EditorialMobileReviewsSection";
import EditorialMobileServicesSection from "./mobile/EditorialMobileServicesSection";
import EditorialMobileTeamSection from "./mobile/EditorialMobileTeamSection";

export default function HairEditorialMobileTemplate({
  locale,
  previewMode,
  onLocaleChange,
  onBook,
  onBookService,
  onBookEmployee,
  onSwitchToDesktop,
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
    <div className="min-h-[100dvh] bg-[var(--brand-background)] pb-28 text-[var(--brand-text)]">
      <EditorialMobileHeader
        business={business}
        locale={locale}
        onLocaleChange={
          onLocaleChange
        }
      />

      <main>
        <EditorialMobileHeroSection
          business={business}
          locale={locale}
          onBook={onBook}
        />

        <EditorialMobileServicesSection
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
              6
            )
          }
          onBookService={
            onBookService
          }
        />

        <EditorialMobileTeamSection
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

        <EditorialMobileGallerySection
          gallery={
            gallery.slice(
              0,
              8
            )
          }
          locale={locale}
        />

        <EditorialMobileReviewsSection
          locale={locale}
          previewMode={
            previewMode
          }
        />

        <EditorialMobileContactSection
          business={business}
          locale={locale}
          locationLine={
            locationLine
          }
          onBook={onBook}
          onSwitchToDesktop={
            onSwitchToDesktop
          }
        />
      </main>

      <EditorialMobileBottomNav
        locale={locale}
        onBook={onBook}
      />
    </div>
  );
}
