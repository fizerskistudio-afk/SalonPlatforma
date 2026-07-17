
"use client";

import {
  useState,
} from "react";

import type {
  CatalogBusiness,
  Employee,
  GalleryItem,
  Locale,
  Service,
  ServiceCategory,
} from "@/lib/types";

import BarberMobileBottomNav, {
  type BarberMobileTab,
} from "./BarberMobileBottomNav";
import BarberMobileContactSection from "./BarberMobileContactSection";
import BarberMobileGallerySection from "./BarberMobileGallerySection";
import BarberMobileHeader from "./BarberMobileHeader";
import BarberMobileHeroSection from "./BarberMobileHeroSection";
import BarberMobileReviewsSection from "./BarberMobileReviewsSection";
import BarberMobileServicesSection from "./BarberMobileServicesSection";
import BarberMobileTeamSection from "./BarberMobileTeamSection";

type BarberMobileAppShellProps = {
  business: CatalogBusiness;
  categories:
    ServiceCategory[];
  employees: Employee[];
  gallery: GalleryItem[];
  locale: Locale;
  locationLine: string;
  previewMode: boolean;
  services: Service[];
  onBook: () => void;
  onBookEmployee: (
    employeeId: string
  ) => void;
  onBookService: (
    serviceId: string
  ) => void;
  onLocaleChange: (
    locale: Locale
  ) => void;
  onSwitchToDesktop:
    () => void;
};

export default function BarberMobileAppShell({
  business,
  categories,
  employees,
  gallery,
  locale,
  locationLine,
  previewMode,
  services,
  onBook,
  onBookEmployee,
  onBookService,
  onLocaleChange,
  onSwitchToDesktop,
}: BarberMobileAppShellProps) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<BarberMobileTab>(
      "home"
    );

  const isHome =
    activeTab ===
    "home";

  const screen =
    isHome ? (
      <BarberMobileHeroSection
        business={business}
        locale={locale}
        locationLine={
          locationLine
        }
        onBook={onBook}
      />
    ) : activeTab ===
      "services" ? (
      <BarberMobileServicesSection
        categories={
          categories
        }
        currency={
          business.currency
        }
        locale={locale}
        services={
          services
        }
        onBookService={
          onBookService
        }
      />
    ) : activeTab ===
      "team" ? (
      <BarberMobileTeamSection
        employees={
          employees
        }
        locale={locale}
        onBookEmployee={
          onBookEmployee
        }
      />
    ) : (
      <>
        <BarberMobileGallerySection
          businessName={
            business.name
          }
          gallery={
            gallery
          }
          locale={locale}
        />

        <BarberMobileReviewsSection
          locale={locale}
          previewMode={
            previewMode
          }
        />

        <BarberMobileContactSection
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
      </>
    );

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[var(--brand-background)] text-[var(--brand-text)]">
      <BarberMobileHeader
        business={business}
        locale={locale}
        onLocaleChange={
          onLocaleChange
        }
      />

      <main className="min-h-0 flex-1 overflow-hidden">
        <div
          key={activeTab}
          className={`barber-app-screen h-full ${
            isHome
              ? "overflow-hidden pb-24"
              : "overflow-y-auto overscroll-contain pb-28"
          }`}
        >
          {screen}
        </div>
      </main>

      <BarberMobileBottomNav
        activeTab={
          activeTab
        }
        locale={locale}
        onBook={onBook}
        onTabChange={
          setActiveTab
        }
      />

      <style jsx global>{`
        @keyframes barberAppScreenIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.995);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .barber-app-screen {
          animation: barberAppScreenIn 260ms
            cubic-bezier(0.16, 1, 0.3, 1) both;
          scrollbar-width: none;
        }

        .barber-app-screen::-webkit-scrollbar {
          display: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .barber-app-screen {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
