"use client";

import type { Locale } from "@/lib/types";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
import GallerySection from "./GallerySection";
import Header from "./Header";
import Hero from "./Hero";
import ReviewsSection from "./ReviewsSection";
import ServicesSection from "./ServicesSection";
import TeamSection from "./TeamSection";

type DesktopLandingProps = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onBook: () => void;
  onBookService: (serviceId: string) => void;
  onBookEmployee: (employeeId: string) => void;
};

export default function DesktopLanding({
  locale,
  onLocaleChange,
  onBook,
  onBookService,
  onBookEmployee,
}: DesktopLandingProps) {
  return (
    <div className="min-h-screen bg-[var(--brand-background)] text-[var(--brand-text)]">
      <Header
        locale={locale}
        onLocaleChange={onLocaleChange}
        onBook={onBook}
      />

      <main>
        <Hero
          locale={locale}
          onBook={onBook}
        />

        <ServicesSection
          locale={locale}
          onBookService={onBookService}
        />

        <TeamSection
          locale={locale}
          onBookEmployee={onBookEmployee}
        />

        <GallerySection locale={locale} />

        <ReviewsSection locale={locale} />

        <ContactSection locale={locale} />
      </main>

      <Footer locale={locale} />
    </div>
  );
}