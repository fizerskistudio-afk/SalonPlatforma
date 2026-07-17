
"use client";

import {
  CalendarPlus,
  Home,
  Scissors,
  Store,
  Users,
} from "lucide-react";

import {
  t,
  translations,
} from "@/lib/translations";

import type {
  Locale,
} from "@/lib/types";

import {
  barberLabels,
} from "../barber-utils";

export type BarberMobileTab =
  | "home"
  | "services"
  | "team"
  | "profile";

type BarberMobileBottomNavProps = {
  activeTab:
    BarberMobileTab;
  locale: Locale;
  onBook: () => void;
  onTabChange: (
    tab: BarberMobileTab
  ) => void;
};

type TabButtonProps = {
  active: boolean;
  icon:
    React.ReactNode;
  label: string;
  onClick: () => void;
};

function TabButton({
  active,
  icon,
  label,
  onClick,
}: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={
        active
          ? "page"
          : undefined
      }
      className={`relative flex min-h-12 flex-col items-center justify-center gap-1 text-[9px] font-medium transition duration-200 ${
        active
          ? "text-[var(--brand-primary)]"
          : "text-[var(--brand-muted)]"
      }`}
    >
      {icon}

      {label}

      <span
        className={`absolute bottom-0 h-1 w-1 rounded-full bg-[var(--brand-primary)] transition ${
          active
            ? "scale-100 opacity-100"
            : "scale-0 opacity-0"
        }`}
      />
    </button>
  );
}

export default function BarberMobileBottomNav({
  activeTab,
  locale,
  onBook,
  onTabChange,
}: BarberMobileBottomNavProps) {
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 items-end rounded-[1.45rem] border border-[var(--brand-border)] bg-[color-mix(in_srgb,var(--brand-surface)_94%,transparent)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-2xl backdrop-blur-xl"
      aria-label={t(
        translations.common
          .mobileNavigation,
        locale
      )}
    >
      <TabButton
        active={
          activeTab ===
          "home"
        }
        icon={
          <Home
            className="h-4 w-4"
            aria-hidden="true"
          />
        }
        label={t(
          translations.nav.home,
          locale
        )}
        onClick={() =>
          onTabChange(
            "home"
          )
        }
      />

      <TabButton
        active={
          activeTab ===
          "services"
        }
        icon={
          <Scissors
            className="h-4 w-4"
            aria-hidden="true"
          />
        }
        label={t(
          barberLabels.navServices,
          locale
        )}
        onClick={() =>
          onTabChange(
            "services"
          )
        }
      />

      <button
        type="button"
        onClick={onBook}
        className="-mt-7 flex h-16 w-16 items-center justify-center justify-self-center rounded-full bg-[var(--brand-primary)] text-[var(--brand-background)] shadow-xl ring-4 ring-[var(--brand-background)] transition duration-200 active:scale-95 focus:outline-none focus:ring-[6px] focus:ring-[var(--brand-background)] motion-reduce:transform-none motion-reduce:transition-none"
        aria-label={t(
          barberLabels.bookAppointment,
          locale
        )}
      >
        <CalendarPlus
          className="h-6 w-6"
          aria-hidden="true"
        />
      </button>

      <TabButton
        active={
          activeTab ===
          "team"
        }
        icon={
          <Users
            className="h-4 w-4"
            aria-hidden="true"
          />
        }
        label={t(
          barberLabels.navBarbers,
          locale
        )}
        onClick={() =>
          onTabChange(
            "team"
          )
        }
      />

      <TabButton
        active={
          activeTab ===
          "profile"
        }
        icon={
          <Store
            className="h-4 w-4"
            aria-hidden="true"
          />
        }
        label={t(
          barberLabels.navProfile,
          locale
        )}
        onClick={() =>
          onTabChange(
            "profile"
          )
        }
      />
    </nav>
  );
}
