"use client";

import {
  Home,
  MapPin,
  Scissors,
  Users,
} from "lucide-react";

import {
  t,
  translations,
} from "@/lib/translations";
import type { Locale } from "@/lib/types";

export type MobileTab =
  | "home"
  | "services"
  | "team"
  | "contact";

type BottomNavProps = {
  locale: Locale;
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
};

type TabItem = {
  key: MobileTab;
  labelKey: keyof typeof translations.nav;
  Icon: typeof Home;
};

const tabs: TabItem[] = [
  {
    key: "home",
    labelKey: "home",
    Icon: Home,
  },
  {
    key: "services",
    labelKey: "services",
    Icon: Scissors,
  },
  {
    key: "team",
    labelKey: "team",
    Icon: Users,
  },
  {
    key: "contact",
    labelKey: "contact",
    Icon: MapPin,
  },
];

export default function BottomNav({
  locale,
  activeTab,
  onTabChange,
}: BottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--brand-text)]/10 bg-[var(--brand-background)]/80 backdrop-blur-md"
      aria-label={t(
        translations.common
          .mobileNavigation,
        locale
      )}
      style={{
        paddingBottom:
          "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const { Icon } = tab;
          const isActive =
            activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() =>
                onTabChange(tab.key)
              }
              aria-current={
                isActive
                  ? "page"
                  : undefined
              }
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none ${
                isActive
                  ? "text-[var(--brand-primary)]"
                  : "text-[var(--brand-text)]/50 hover:text-[var(--brand-text)]/80"
              }`}
            >
              <Icon
                className="h-5 w-5"
                aria-hidden="true"
              />

              <span className="text-[10px] font-medium leading-tight">
                {t(
                  translations.nav[
                    tab.labelKey
                  ],
                  locale
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}