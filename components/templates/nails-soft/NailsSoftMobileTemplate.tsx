"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useCatalogData,
} from "@/lib/catalogContext";

import type {
  PublicTemplateProps,
} from "../template-props";
import NailsMobileBottomNav, {
  type NailsMobileView,
} from "./mobile/NailsMobileBottomNav";
import NailsMobileContactSection from "./mobile/NailsMobileContactSection";
import NailsMobileGallerySection from "./mobile/NailsMobileGallerySection";
import NailsMobileHeader from "./mobile/NailsMobileHeader";
import NailsMobileHeroSection from "./mobile/NailsMobileHeroSection";
import NailsMobileReviewsSection from "./mobile/NailsMobileReviewsSection";
import NailsMobileServicesSection from "./mobile/NailsMobileServicesSection";
import NailsMobileTeamSection from "./mobile/NailsMobileTeamSection";
import {
  getNailsLocationLine,
} from "./nails-utils";

export default function NailsSoftMobileTemplate({
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
  const [
    activeView,
    setActiveView,
  ] =
    useState<NailsMobileView>(
      "home"
    );
  const contentRef =
    useRef<HTMLElement>(
      null
    );

  useEffect(
    () => {
      contentRef.current?.scrollTo({
        top: 0,
      });
    },
    [activeView]
  );

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
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--brand-background)] text-[var(--brand-text)]">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <NailsMobileHeader
          business={business}
          locale={locale}
          onLocaleChange={
            onLocaleChange
          }
          onHome={() =>
            setActiveView(
              "home"
            )
          }
        />

        <main
          ref={contentRef}
          className={`min-h-0 flex-1 pb-[calc(5.75rem+env(safe-area-inset-bottom))] ${activeView === "home" ? "overflow-hidden" : "overflow-y-auto overscroll-y-contain"}`}
        >
        {activeView ===
          "home" && (
          <NailsMobileHeroSection
            business={business}
            gallery={gallery.slice(
              0,
              2
            )}
            locale={locale}
            onBook={onBook}
            onViewPortfolio={() =>
              setActiveView(
                "portfolio"
              )
            }
          />
        )}

        {activeView ===
          "portfolio" && (
          <>
            <NailsMobileGallerySection
              gallery={gallery.slice(
                0,
                8
              )}
              locale={locale}
            />
            <NailsMobileTeamSection
              employees={employees.slice(
                0,
                6
              )}
              locale={locale}
              onBookEmployee={onBookEmployee}
            />
          </>
        )}

        {activeView ===
          "services" && (
          <NailsMobileServicesSection
            categories={categories}
            currency={business.currency}
            locale={locale}
            services={services.slice(
              0,
              10
            )}
            onBookService={onBookService}
          />
        )}

        {activeView ===
          "contact" && (
          <>
            <NailsMobileContactSection
              business={business}
              locale={locale}
              locationLine={locationLine}
              onBook={onBook}
              onSwitchToDesktop={onSwitchToDesktop}
            />
            <NailsMobileReviewsSection
              locale={locale}
              previewMode={previewMode}
            />
          </>
        )}
        </main>

        <NailsMobileBottomNav
          activeView={activeView}
          locale={locale}
          onBook={onBook}
          onNavigate={setActiveView}
        />
      </div>
    </div>
  );
}
