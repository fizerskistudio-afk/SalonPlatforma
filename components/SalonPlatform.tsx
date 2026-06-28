"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/lib/types";
import { businessConfig } from "@/lib/config";
import { t, translations } from "@/lib/translations";
import DesktopLanding from "./desktop/DesktopLanding";
import DesktopBookingModal from "./desktop/DesktopBookingModal";
import MobileAppShell from "./mobile/MobileAppShell";
import MobileBookingModal from "./mobile/MobileBookingModal";
import { Smartphone } from "lucide-react";

type ViewPreference = "auto" | "desktop" | "mobile";

const STORAGE_KEY = "salon-platform-view-preference";

/**
 * Glavni UI state container.
 * Upravlja locale, view preference, booking state i responsive prikazom.
 * Izbegava hydration mismatch korišćenjem CSS klasa za initial render.
 */
export default function SalonPlatform() {
  const [locale, setLocale] = useState<Locale>(businessConfig.defaultLocale);
  const [viewPreference, setViewPreference] = useState<ViewPreference>("auto");
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [initialServiceId, setInitialServiceId] = useState<string | null>(null);
  const [initialEmployeeId, setInitialEmployeeId] = useState<string | null>(null);

  // Read from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "desktop" || stored === "mobile") {
        setViewPreference(stored);
      }
    } catch (e) {
      // localStorage nije dostupan
    }
  }, []);

  // Track viewport for modal selection
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    
    const updateViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  // Izračunaj efektivni prikaz
  const effectiveView: ViewPreference =
    viewPreference === "auto"
      ? isMobileViewport
        ? "mobile"
        : "desktop"
      : viewPreference;

  // Handlers
  const openBooking = () => {
    setInitialServiceId(null);
    setInitialEmployeeId(null);
    setIsBookingOpen(true);
  };

  const openBookingWithService = (serviceId: string) => {
    setInitialServiceId(serviceId);
    setInitialEmployeeId(null);
    setIsBookingOpen(true);
  };

  const openBookingWithEmployee = (employeeId: string) => {
    setInitialEmployeeId(employeeId);
    setInitialServiceId(null);
    setIsBookingOpen(true);
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
  };

  const switchToDesktop = () => {
    setViewPreference("desktop");
    try {
      localStorage.setItem(STORAGE_KEY, "desktop");
    } catch (e) {
      // localStorage nije dostupan
    }
  };

  const switchToMobile = () => {
    setViewPreference("mobile");
    try {
      localStorage.setItem(STORAGE_KEY, "mobile");
    } catch (e) {
      // localStorage nije dostupan
    }
  };

  return (
    <>
      {/* Auto mode - oba prikaza sa CSS kontrolom */}
      {viewPreference === "auto" && (
        <>
          <div className="md:hidden">
            <MobileAppShell
              locale={locale}
              onLocaleChange={setLocale}
              onBook={openBooking}
              onBookService={openBookingWithService}
              onBookEmployee={openBookingWithEmployee}
              onSwitchToDesktop={switchToDesktop}
            />
          </div>
          <div className="hidden md:block">
            <DesktopLanding
              locale={locale}
              onLocaleChange={setLocale}
              onBook={openBooking}
              onBookService={openBookingWithService}
              onBookEmployee={openBookingWithEmployee}
            />
          </div>
        </>
      )}

      {/* Mobile preference */}
      {viewPreference === "mobile" && (
        <MobileAppShell
          locale={locale}
          onLocaleChange={setLocale}
          onBook={openBooking}
          onBookService={openBookingWithService}
          onBookEmployee={openBookingWithEmployee}
          onSwitchToDesktop={switchToDesktop}
        />
      )}

      {/* Desktop preference */}
      {viewPreference === "desktop" && (
        <>
          <DesktopLanding
            locale={locale}
            onLocaleChange={setLocale}
            onBook={openBooking}
            onBookService={openBookingWithService}
            onBookEmployee={openBookingWithEmployee}
          />

          {/* Dugme za povratak na mobile view */}
          <button
            type="button"
            onClick={switchToMobile}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[var(--brand-surface)] border border-[var(--brand-border)] flex items-center justify-center text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-[var(--brand-background)] transition-colors motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] md:hidden shadow-lg"
            style={{
              marginBottom: "env(safe-area-inset-bottom)",
            }}
            aria-label={t(translations.common.mobileNavigation, locale)}
          >
            <Smartphone className="w-5 h-5" aria-hidden="true" />
          </button>
        </>
      )}

      {/* Booking modal - samo jedan aktivan */}
      {effectiveView === "mobile" ? (
        <MobileBookingModal
          isOpen={isBookingOpen}
          locale={locale}
          initialServiceId={initialServiceId}
          initialEmployeeId={initialEmployeeId}
          onClose={closeBooking}
        />
      ) : (
        <DesktopBookingModal
          isOpen={isBookingOpen}
          locale={locale}
          initialServiceId={initialServiceId}
          initialEmployeeId={initialEmployeeId}
          onClose={closeBooking}
        />
      )}
    </>
  );
}