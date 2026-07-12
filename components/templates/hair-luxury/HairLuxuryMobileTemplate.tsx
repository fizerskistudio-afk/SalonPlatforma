"use client";

import MobileAppShell from "@/components/mobile/MobileAppShell";

import type {
  PublicTemplateProps,
} from "../template-props";

export default function HairLuxuryMobileTemplate({
  locale,
  previewMode,
  onLocaleChange,
  onBook,
  onBookService,
  onBookEmployee,
  onSwitchToDesktop,
}: PublicTemplateProps) {
  return (
    <MobileAppShell
      locale={locale}
      previewMode={
        previewMode
      }
      onLocaleChange={
        onLocaleChange
      }
      onBook={onBook}
      onBookService={
        onBookService
      }
      onBookEmployee={
        onBookEmployee
      }
      onSwitchToDesktop={
        onSwitchToDesktop
      }
    />
  );
}
