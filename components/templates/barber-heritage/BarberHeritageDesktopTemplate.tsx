"use client";
import { useCatalogData } from "@/lib/catalogContext";
import type { PublicTemplateProps } from "../template-props";
import { getLocationLine } from "./barber-utils";
import BarberDesktopHeader from "./desktop/BarberDesktopHeader";
import BarberDesktopHeroSection from "./desktop/BarberDesktopHeroSection";
import BarberDesktopServicesSection from "./desktop/BarberDesktopServicesSection";
import BarberDesktopTeamSection from "./desktop/BarberDesktopTeamSection";
import BarberDesktopGallerySection from "./desktop/BarberDesktopGallerySection";
import BarberDesktopReviewsSection from "./desktop/BarberDesktopReviewsSection";
import BarberDesktopContactSection from "./desktop/BarberDesktopContactSection";
import BarberDesktopFooter from "./desktop/BarberDesktopFooter";

export default function BarberHeritageDesktopTemplate({ locale, previewMode, onLocaleChange, onBook, onBookService, onBookEmployee }: PublicTemplateProps) {
  const { business, categories, services, employees, gallery } = useCatalogData();
  const locationLine = getLocationLine(business.address, business.city, business.country, locale);
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--brand-background)] text-[var(--brand-text)]">
      <BarberDesktopHeader business={business} locale={locale} onLocaleChange={onLocaleChange} onBook={onBook} />
      <main>
        <BarberDesktopHeroSection business={business} locale={locale} locationLine={locationLine} onBook={onBook} />
        <BarberDesktopServicesSection categories={categories} currency={business.currency} locale={locale} services={services.slice(0, 8)} onBookService={onBookService} />
        <BarberDesktopTeamSection employees={employees.slice(0, 4)} locale={locale} onBookEmployee={onBookEmployee} />
        <BarberDesktopGallerySection businessName={business.name} gallery={gallery.slice(0, 6)} locale={locale} />
        <BarberDesktopReviewsSection locale={locale} previewMode={previewMode} />
        <BarberDesktopContactSection business={business} locale={locale} locationLine={locationLine} onBook={onBook} />
      </main>
      <BarberDesktopFooter business={business} locale={locale} />
    </div>
  );
}
