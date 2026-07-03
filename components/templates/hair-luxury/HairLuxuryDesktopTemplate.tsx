"use client";

import DesktopLanding from "@/components/desktop/DesktopLanding";

import type {
  PublicTemplateProps,
} from "../template-props";

export default function HairLuxuryDesktopTemplate({
  locale,
  onLocaleChange,
  onBook,
  onBookService,
  onBookEmployee,
}: PublicTemplateProps) {
  return (
    <DesktopLanding
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
    />
  );
}
