"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/lib/types";
import MobileHeader from "./MobileHeader";
import BottomNav, { type MobileTab } from "./BottomNav";
import MobileHome from "./MobileHome";
import MobileServices from "./MobileServices";
import MobileTeam from "./MobileTeam";
import MobileContact from "./MobileContact";

type MobileAppShellProps = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onBook: () => void;
  onBookService: (serviceId: string) => void;
  onBookEmployee: (employeeId: string) => void;
  onSwitchToDesktop: () => void;
};

/**
 * Mobilni app shell wrapper.
 * Upravlja tab navigacijom i renderuje odgovarajući sadržaj.
 */
export default function MobileAppShell({
  locale,
  onLocaleChange,
  onBook,
  onBookService,
  onBookEmployee,
  onSwitchToDesktop,
}: MobileAppShellProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>("home");

  // Scroll to top pri promeni taba
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const handleExploreServices = () => {
    setActiveTab("services");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <MobileHome
            locale={locale}
            onBook={onBook}
            onExploreServices={handleExploreServices}
          />
        );
      case "services":
        return (
          <MobileServices
            locale={locale}
            onBookService={onBookService}
          />
        );
      case "team":
        return (
          <MobileTeam
            locale={locale}
            onBookEmployee={onBookEmployee}
          />
        );
      case "contact":
        return <MobileContact locale={locale} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--brand-background)] text-[var(--brand-text)]">
      <MobileHeader
        locale={locale}
        onLocaleChange={onLocaleChange}
        onBook={onBook}
        onSwitchToDesktop={onSwitchToDesktop}
      />

      {renderContent()}

      <BottomNav
        locale={locale}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}