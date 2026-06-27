"use client";

import { useState } from "react";
import type {
  Locale,
  ServiceCategoryIcon,
} from "@/lib/types";
import {
  serviceCategories,
  services,
} from "@/lib/mockData";
import {
  t,
  translations,
} from "@/lib/translations";
import ServiceCard from "../shared/ServiceCard";
import SectionHeader from "../shared/SectionHeader";
import EmptyState from "../shared/EmptyState";
import {
  Hand,
  Heart,
  Palette,
  Scissors,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type ServicesSectionProps = {
  locale: Locale;
  onBookService: (serviceId: string) => void;
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

export default function ServicesSection({
  locale,
  onBookService,
}: ServicesSectionProps) {
  const visibleCategories =
    serviceCategories.filter(
      (category) =>
        category.isActive &&
        services.some(
          (service) =>
            service.isActive &&
            service.categoryId === category.id
        )
    );

  const firstVisibleCategoryId =
    visibleCategories[0]?.id ?? null;

  const [
    activeCategoryId,
    setActiveCategoryId,
  ] = useState<string | null>(
    firstVisibleCategoryId
  );

  const activeServices = activeCategoryId
    ? services.filter(
        (service) =>
          service.isActive &&
          service.categoryId ===
            activeCategoryId
      )
    : [];

  if (visibleCategories.length === 0) {
    return (
      <section
        id="services"
        className="mx-auto max-w-7xl px-8 py-24"
      >
        <EmptyState
          title={translations.common.noServices}
          description={
            translations.common
              .noServicesDescription
          }
          icon={Scissors}
          locale={locale}
        />
      </section>
    );
  }

  return (
    <section
      id="services"
      className="mx-auto max-w-7xl px-8 py-24"
    >
      <SectionHeader
        title={
          translations.sections.servicesTitle
        }
        subtitle={
          translations.sections.servicesSub
        }
        locale={locale}
      />

      <div className="mb-12 flex flex-wrap justify-center gap-3">
        {visibleCategories.map((category) => {
          const Icon = iconMap[category.icon];
          const isActive =
            activeCategoryId === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                setActiveCategoryId(category.id)
              }
              aria-pressed={isActive}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none ${
                isActive
                  ? "bg-[var(--brand-primary)] text-[var(--brand-surface)] shadow-lg"
                  : "border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] hover:border-[var(--brand-primary)] hover:shadow-md"
              }`}
            >
              <Icon
                className="h-4 w-4"
                aria-hidden="true"
              />

              <span>
                {t(category.name, locale)}
              </span>
            </button>
          );
        })}
      </div>

      {activeServices.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              locale={locale}
              mode="display"
              onBook={onBookService}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={translations.common.noServices}
          description={
            translations.common
              .noServicesDescription
          }
          icon={Scissors}
          locale={locale}
        />
      )}
    </section>
  );
}