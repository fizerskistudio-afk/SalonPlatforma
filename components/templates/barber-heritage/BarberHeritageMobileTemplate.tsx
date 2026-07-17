
"use client";

import {
  useCatalogData,
} from "@/lib/catalogContext";

import type {
  PublicTemplateProps,
} from "../template-props";
import {
  getLocationLine,
} from "./barber-utils";
import BarberMobileAppShell from "./mobile/BarberMobileAppShell";

export default function BarberHeritageMobileTemplate({
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

  const locationLine =
    getLocationLine(
      business.address,
      business.city,
      business.country,
      locale
    );

  return (
    <BarberMobileAppShell
      business={business}
      categories={
        categories
      }
      employees={
        employees.slice(
          0,
          4
        )
      }
      gallery={
        gallery.slice(
          0,
          6
        )
      }
      locale={locale}
      locationLine={
        locationLine
      }
      previewMode={
        previewMode
      }
      services={
        services.slice(
          0,
          8
        )
      }
      onBook={onBook}
      onBookEmployee={
        onBookEmployee
      }
      onBookService={
        onBookService
      }
      onLocaleChange={
        onLocaleChange
      }
      onSwitchToDesktop={
        onSwitchToDesktop
      }
    />
  );
}
