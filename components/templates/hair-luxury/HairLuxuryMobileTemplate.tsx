"use client";

import MobileAppShell from "@/components/mobile/MobileAppShell";

import type {
  PublicTemplateProps,
} from "../template-props";

export default function HairLuxuryMobileTemplate({
  locale,
  onLocaleChange,
  onBook,
  onBookService,
  onBookEmployee,
  onSwitchToDesktop,
}: PublicTemplateProps) {
  return (
    <MobileAppShell
      locale={locale}
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
