"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Scissors } from "lucide-react";

import { useCatalogData } from "@/lib/catalogContext";
import {
  t,
  translations,
} from "@/lib/translations";
import type { Locale } from "@/lib/types";

import EmptyState from "../shared/EmptyState";
import SectionHeader from "../shared/SectionHeader";
import ServiceCard from "../shared/ServiceCard";

type ServiceStepProps = {
  locale: Locale;
  selectedServiceId: string | null;
  onSelectService: (
    serviceId: string
  ) => void;
  initialCategoryId?: string;
};

export default function ServiceStep({
  locale,
  selectedServiceId,
  onSelectService,
  initialCategoryId,
}: ServiceStepProps) {
  const {
    categories,
    services,
  } = useCatalogData();

  const activeCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.isActive
      ),
    [categories]
  );

  const activeCategoryIds =
    useMemo(
      () =>
        new Set(
          activeCategories.map(
            (category) =>
              category.id
          )
        ),
      [activeCategories]
    );

  const firstActiveCategoryId =
    activeCategories[0]?.id ?? null;

  const selectedServiceCategoryId =
    useMemo(() => {
      if (!selectedServiceId) {
        return null;
      }

      const selectedService =
        services.find(
          (service) =>
            service.id ===
              selectedServiceId &&
            service.isActive &&
            activeCategoryIds.has(
              service.categoryId
            )
        );

      return (
        selectedService?.categoryId ??
        null
      );
    }, [
      activeCategoryIds,
      selectedServiceId,
      services,
    ]);

  const validInitialCategoryId =
    initialCategoryId &&
    activeCategoryIds.has(
      initialCategoryId
    )
      ? initialCategoryId
      : null;

  const preferredCategoryId =
    selectedServiceCategoryId ??
    validInitialCategoryId ??
    firstActiveCategoryId;

  const [
    activeCategoryId,
    setActiveCategoryId,
  ] = useState<string | null>(
    preferredCategoryId
  );

  useEffect(() => {
    const nextCategoryId =
      selectedServiceCategoryId ??
      validInitialCategoryId;

    if (nextCategoryId) {
      setActiveCategoryId(
        nextCategoryId
      );

      return;
    }

    setActiveCategoryId(
      (currentCategoryId) => {
        if (
          currentCategoryId &&
          activeCategoryIds.has(
            currentCategoryId
          )
        ) {
          return currentCategoryId;
        }

        return firstActiveCategoryId;
      }
    );
  }, [
    activeCategoryIds,
    firstActiveCategoryId,
    selectedServiceCategoryId,
    validInitialCategoryId,
  ]);

  const activeServices =
    useMemo(() => {
      if (!activeCategoryId) {
        return [];
      }

      return services.filter(
        (service) =>
          service.isActive &&
          service.categoryId ===
            activeCategoryId
      );
    }, [
      activeCategoryId,
      services,
    ]);

  if (
    activeCategories.length === 0
  ) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={
          translations.booking
            .selectService
        }
        subtitle={
          translations.sections
            .servicesSub
        }
        locale={locale}
        align="left"
      />

      <div className="flex gap-2 overflow-x-auto pb-2">
        {activeCategories.map(
          (category) => {
            const isActive =
              activeCategoryId ===
              category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setActiveCategoryId(
                    category.id
                  )
                }
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none ${
                  isActive
                    ? "bg-[var(--brand-primary)] text-[var(--brand-surface)]"
                    : "border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] hover:border-[var(--brand-primary)]"
                }`}
                aria-pressed={
                  isActive
                }
              >
                {t(
                  category.name,
                  locale
                )}
              </button>
            );
          }
        )}
      </div>

      {activeServices.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {activeServices.map(
            (service) => (
              <ServiceCard
                key={service.id}
                service={service}
                locale={locale}
                mode="selectable"
                isSelected={
                  selectedServiceId ===
                  service.id
                }
                onSelect={
                  onSelectService
                }
              />
            )
          )}
        </div>
      ) : (
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
      )}
    </div>
  );
}