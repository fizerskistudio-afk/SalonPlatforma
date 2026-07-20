"use client";

import {
  CalendarPlus,
  Grid3X3,
  Home,
  MapPin,
  Sparkles,
} from "lucide-react";

import {
  t,
  translations,
} from "@/lib/translations";

import type {
  Locale,
} from "@/lib/types";

type NailsMobileBottomNavProps = {
  activeView:
    NailsMobileView;
  locale: Locale;
  onBook: () => void;
  onNavigate: (
    view: NailsMobileView
  ) => void;
};

export type NailsMobileView =
  | "home"
  | "portfolio"
  | "services"
  | "contact";

export default function NailsMobileBottomNav({
  activeView,
  locale,
  onBook,
  onNavigate,
}: NailsMobileBottomNavProps) {
  const itemClass = (
    view: NailsMobileView
  ) =>
    `flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl text-[8px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] motion-reduce:transition-none ${activeView === view ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]" : "text-[var(--brand-muted)]"}`;

  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 items-end rounded-[2rem_2rem_2rem_0.85rem] border border-white/60 bg-[color-mix(in_srgb,var(--brand-surface)_92%,transparent)] px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_18px_55px_rgba(55,28,42,0.20)] backdrop-blur-2xl"
      aria-label={t(
        translations.common
          .mobileNavigation,
        locale
      )}
    >
      <button
        type="button"
        onClick={() =>
          onNavigate(
            "home"
          )
        }
        className={itemClass(
          "home"
        )}
        aria-current={
          activeView === "home"
            ? "page"
            : undefined
        }
      >
        <Home
          className="h-4 w-4"
          aria-hidden="true"
        />

        {t(
          translations.nav.home,
          locale
        )}
      </button>

      <button
        type="button"
        onClick={() =>
          onNavigate(
            "portfolio"
          )
        }
        className={itemClass(
          "portfolio"
        )}
        aria-current={
          activeView ===
          "portfolio"
            ? "page"
            : undefined
        }
      >
        <Grid3X3
          className="h-4 w-4"
          aria-hidden="true"
        />

        {t(
          translations.nav.gallery,
          locale
        )}
      </button>

      <button
        type="button"
        onClick={onBook}
        className="relative -mt-6 flex h-14 w-14 items-center justify-center justify-self-center rounded-full bg-[var(--brand-primary)] text-[var(--brand-background)] shadow-[0_14px_30px_color-mix(in_srgb,var(--brand-primary)_30%,transparent)] ring-4 ring-[var(--brand-background)] focus:outline-none focus-visible:ring-[6px] focus-visible:ring-[var(--brand-background)]"
        aria-label={t(
          translations.hero.bookNow,
          locale
        )}
      >
        <CalendarPlus
          className="h-6 w-6"
          aria-hidden="true"
        />

        <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-white/75" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() =>
          onNavigate(
            "services"
          )
        }
        className={itemClass(
          "services"
        )}
        aria-current={
          activeView ===
          "services"
            ? "page"
            : undefined
        }
      >
        <Sparkles
          className="h-4 w-4"
          aria-hidden="true"
        />

        {t(
          translations.nav.services,
          locale
        )}
      </button>

      <button
        type="button"
        onClick={() =>
          onNavigate(
            "contact"
          )
        }
        className={itemClass(
          "contact"
        )}
        aria-current={
          activeView ===
          "contact"
            ? "page"
            : undefined
        }
      >
        <MapPin
          className="h-4 w-4"
          aria-hidden="true"
        />

        {t(
          translations.nav.contact,
          locale
        )}
      </button>
    </nav>
  );
}
