"use client";

import type { Locale, ServiceCategoryIcon } from "@/lib/types";
import { serviceCategories, services } from "@/lib/mockData";
import { t, translations } from "@/lib/translations";
import ServiceCard from "../shared/ServiceCard";
import SectionHeader from "../shared/SectionHeader";
import EmptyState from "../shared/EmptyState";
import { Scissors, Palette, Sparkles, Heart, Hand, type LucideIcon } from "lucide-react";

type MobileServicesProps = {
  locale: Locale;
  onBookService: (serviceId: string) => void;
};

const iconMap: Record<ServiceCategoryIcon, LucideIcon> = {
  scissors: Scissors,
  palette: Palette,
  sparkles: Sparkles,
  heart: Heart,
  hand: Hand,
};

/**
 * Mobilni ekran za usluge.
 * Prikazuje sve aktivne kategorije sa njihovim aktivnim uslugama.
 * Kompaktan dizajn prilagođen mobilnim uređajima.
 */
export default function MobileServices({ locale, onBookService }: MobileServicesProps) {
  // Filtriraj samo aktivne kategorije koje imaju aktivne usluge
  const visibleCategories = serviceCategories.filter((category) =>
    category.isActive &&
    services.some((service) => service.isActive && service.categoryId === category.id)
  );

  // Ako nema aktivnih usluga
  if (visibleCategories.length === 0) {
    return (
      <div
        className="min-h-screen bg-[var(--brand-background)]"
        style={{
          paddingTop: "calc(4.5rem + env(safe-area-inset-top))",
          paddingBottom: "calc(6rem + env(safe-area-inset-bottom))",
        }}
      >
        <EmptyState
          title={translations.common.noServices}
          description={translations.common.noServicesDescription}
          icon={Scissors}
          locale={locale}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[var(--brand-background)] px-4"
      style={{
        paddingTop: "calc(4.5rem + env(safe-area-inset-top))",
        paddingBottom: "calc(6rem + env(safe-area-inset-bottom))",
      }}
    >
      {/* Header */}
      <div className="pt-6 pb-4">
        <SectionHeader
          title={translations.sections.servicesTitle}
          subtitle={translations.sections.servicesSub}
          locale={locale}
          align="left"
        />
      </div>

      {/* Categories and services */}
      <div className="space-y-8">
        {visibleCategories.map((category) => {
          const Icon = iconMap[category.icon];
          const categoryServices = services.filter(
            (service) => service.isActive && service.categoryId === category.id
          );

          return (
            <div key={category.id}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--brand-surface)] border border-[var(--brand-border)] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[var(--brand-primary)]" aria-hidden="true" />
                </div>
                <h2 className="font-display text-lg font-semibold text-[var(--brand-text)]">
                  {t(category.name, locale)}
                </h2>
              </div>

              {/* Services list */}
              <div className="space-y-2">
                {categoryServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    locale={locale}
                    mode="display"
                    onBook={onBookService}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}