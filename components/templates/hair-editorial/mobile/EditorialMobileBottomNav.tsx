"use client";

import {
  CalendarPlus,
  Home,
  MapPin,
  Scissors,
  Users,
} from "lucide-react";

import {
  t,
  translations,
} from "@/lib/translations";

import type {
  Locale,
} from "@/lib/types";

type EditorialMobileBottomNavProps = {
  locale: Locale;
  onBook: () => void;
};

export default function EditorialMobileBottomNav({
  locale,
  onBook,
}: EditorialMobileBottomNavProps) {
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 items-end rounded-[1.6rem] border border-[var(--brand-border)] bg-[color-mix(in_srgb,var(--brand-surface)_92%,transparent)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-2xl backdrop-blur-xl"
      aria-label={t(
        translations.common
          .mobileNavigation,
        locale
      )}
    >
      <a
        href="#editorial-mobile-home"
        className="flex min-h-12 flex-col items-center justify-center gap-1 text-[9px] font-medium text-[var(--brand-muted)]"
      >
        <Home
          className="h-4 w-4"
          aria-hidden="true"
        />

        {t(
          translations.nav.home,
          locale
        )}
      </a>

      <a
        href="#editorial-mobile-services"
        className="flex min-h-12 flex-col items-center justify-center gap-1 text-[9px] font-medium text-[var(--brand-muted)]"
      >
        <Scissors
          className="h-4 w-4"
          aria-hidden="true"
        />

        {t(
          translations.nav.services,
          locale
        )}
      </a>

      <button
        type="button"
        onClick={onBook}
        className="-mt-7 flex h-16 w-16 items-center justify-center justify-self-center rounded-full bg-[var(--brand-primary)] text-[var(--brand-background)] shadow-xl ring-4 ring-[var(--brand-background)] focus:outline-none focus:ring-[6px] focus:ring-[var(--brand-background)]"
        aria-label={t(
          translations.hero.bookNow,
          locale
        )}
      >
        <CalendarPlus
          className="h-6 w-6"
          aria-hidden="true"
        />
      </button>

      <a
        href="#editorial-mobile-team"
        className="flex min-h-12 flex-col items-center justify-center gap-1 text-[9px] font-medium text-[var(--brand-muted)]"
      >
        <Users
          className="h-4 w-4"
          aria-hidden="true"
        />

        {t(
          translations.nav.team,
          locale
        )}
      </a>

      <a
        href="#editorial-mobile-contact"
        className="flex min-h-12 flex-col items-center justify-center gap-1 text-[9px] font-medium text-[var(--brand-muted)]"
      >
        <MapPin
          className="h-4 w-4"
          aria-hidden="true"
        />

        {t(
          translations.nav.contact,
          locale
        )}
      </a>
    </nav>
  );
}
