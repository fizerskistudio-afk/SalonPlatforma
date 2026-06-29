"use client";

import {
  Hand,
  Heart,
  Palette,
  Scissors,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { useCatalogData } from "@/lib/catalogContext";
import {
  t,
  translations,
} from "@/lib/translations";
import type {
  Locale,
  ServiceCategoryIcon,
} from "@/lib/types";

import EmptyState from "../shared/EmptyState";
import SectionHeader from "../shared/SectionHeader";
import ServiceCard from "../shared/ServiceCard";

type MobileServicesProps = {
  locale: Locale;

  onBookService: (
    serviceId: string
  ) => void;
};

const iconMap: Record<
  ServiceCategoryIcon,
  LucideIcon
> = {
  scissors: Scissors,
  palette: Palette,
  sparkles: Sparkles,
  heart: Heart,
  hand: Hand,
};

export default function MobileServices({
  locale,
  onBookService,
}: MobileServicesProps) {
  const {
    categories,
    services,
  } = useCatalogData();

  const visibleCategories =
    categories.filter(
      (category) =>
        category.isActive &&
        services.some(
          (service) =>
            service.isActive &&
            service.categoryId ===
              category.id
        )
    );

  if (
    visibleCategories.length === 0
  ) {
    return (
      <div
        className="min-h-screen bg-[var(--brand-background)]"
        style={{
          paddingTop:
            "calc(4.5rem + env(safe-area-inset-top))",

          paddingBottom:
            "calc(6rem + env(safe-area-inset-bottom))",
        }}
      >
        <EmptyState
          title={
            translations.common
              .noServices
          }
          description={
            translations.common
              .noServicesDescription
          }
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
        paddingTop:
          "calc(4.5rem + env(safe-area-inset-top))",

        paddingBottom:
          "calc(6rem + env(safe-area-inset-bottom))",
      }}
    >
      <div className="pb-4 pt-6">
        <SectionHeader
          title={
            translations.sections
              .servicesTitle
          }
          subtitle={
            translations.sections
              .servicesSub
          }
          locale={locale}
          align="left"
        />
      </div>

      <div className="space-y-8">
        {visibleCategories.map(
          (category) => {
            const Icon =
              iconMap[
                category.icon
              ];

            const categoryServices =
              services.filter(
                (service) =>
                  service.isActive &&
                  service.categoryId ===
                    category.id
              );

            return (
              <div
                key={category.id}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]">
                    <Icon
                      className="h-4 w-4 text-[var(--brand-primary)]"
                      aria-hidden="true"
                    />
                  </div>

                  <h2 className="font-display text-lg font-semibold text-[var(--brand-text)]">
                    {t(
                      category.name,
                      locale
                    )}
                  </h2>
                </div>

                <div className="space-y-2">
                  {categoryServices.map(
                    (service) => (
                      <ServiceCard
                        key={
                          service.id
                        }
                        service={
                          service
                        }
                        locale={
                          locale
                        }
                        mode="display"
                        onBook={
                          onBookService
                        }
                      />
                    )
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}