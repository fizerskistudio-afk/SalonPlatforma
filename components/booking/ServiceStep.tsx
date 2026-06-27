"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/types";
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
import { Scissors } from "lucide-react";

type ServiceStepProps = {
  locale: Locale;
  selectedServiceId: string | null;
  onSelectService: (serviceId: string) => void;
  initialCategoryId?: string;
};

const activeCategories = serviceCategories.filter(
  (category) => category.isActive
);

const activeCategoryIds = new Set(
  activeCategories.map((category) => category.id)
);

const firstActiveCategoryId =
  activeCategories[0]?.id ?? null;

export default function ServiceStep({
  locale,
  selectedServiceId,
  onSelectService,
  initialCategoryId,
}: ServiceStepProps) {
  const selectedServiceCategoryId =
    selectedServiceId
      ? services.find(
          (service) =>
            service.id === selectedServiceId &&
            service.isActive &&
            activeCategoryIds.has(service.categoryId)
        )?.categoryId ?? null
      : null;

  const validInitialCategoryId =
    initialCategoryId &&
    activeCategoryIds.has(initialCategoryId)
      ? initialCategoryId
      : null;

  const preferredCategoryId =
    selectedServiceCategoryId ??
    validInitialCategoryId ??
    firstActiveCategoryId;

  const [activeCategoryId, setActiveCategoryId] =
    useState<string | null>(preferredCategoryId);

  useEffect(() => {
    const nextCategoryId =
      selectedServiceCategoryId ??
      validInitialCategoryId;

    if (nextCategoryId) {
      setActiveCategoryId(nextCategoryId);
      return;
    }

    setActiveCategoryId((currentCategoryId) => {
      if (
        currentCategoryId &&
        activeCategoryIds.has(currentCategoryId)
      ) {
        return currentCategoryId;
      }

      return firstActiveCategoryId;
    });
  }, [
    selectedServiceCategoryId,
    validInitialCategoryId,
  ]);

  const activeServices = activeCategoryId
    ? services.filter(
        (service) =>
          service.isActive &&
          service.categoryId === activeCategoryId
      )
    : [];

  if (activeCategories.length === 0) {
    return (
      <EmptyState
        title={translations.common.noServices}
        description={
          translations.common.noServicesDescription
        }
        icon={Scissors}
        locale={locale}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={translations.booking.selectService}
        subtitle={translations.sections.servicesSub}
        locale={locale}
        align="left"
      />

      <div className="flex gap-2 overflow-x-auto pb-2">
        {activeCategories.map((category) => {
          const isActive =
            activeCategoryId === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                setActiveCategoryId(category.id)
              }
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none ${
                isActive
                  ? "bg-[var(--brand-primary)] text-[var(--brand-surface)]"
                  : "border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] hover:border-[var(--brand-primary)]"
              }`}
              aria-pressed={isActive}
            >
              {t(category.name, locale)}
            </button>
          );
        })}
      </div>

      {activeServices.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {activeServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              locale={locale}
              mode="selectable"
              isSelected={
                selectedServiceId === service.id
              }
              onSelect={onSelectService}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={translations.common.noServices}
          description={
            translations.common.noServicesDescription
          }
          icon={Scissors}
          locale={locale}
        />
      )}
    </div>
  );
}