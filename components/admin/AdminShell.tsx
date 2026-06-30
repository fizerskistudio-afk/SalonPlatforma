"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Scissors,
  Settings,
  UserRoundCog,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";

import { signOutAction } from "@/app/admin/(protected)/actions";

type AdminRole = "owner" | "manager";

type AdminShellProps = {
  children: ReactNode;

  admin: {
    email: string | null;
    role: AdminRole;

    business: {
      name: string;
      slug: string;
    };
  };
};

type NavigationItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    description: "Pregled poslovanja",
    href: "/admin",
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    label: "Rezervacije",
    description: "Termini i raspored",
    href: "/admin/bookings",
    icon: CalendarDays,
    enabled: true,
  },
  {
    label: "Klijenti",
    description: "Kontakti i istorija",
    href: "/admin/customers",
    icon: UsersRound,
    enabled: true,
  },
  {
    label: "Usluge",
    description: "Katalog i cene",
    href: "/admin/services",
    icon: Scissors,
    enabled: true,
  },
  {
    label: "Tim",
    description: "Zaposleni i njihove usluge",
    href: "/admin/team",
    icon: UserRoundCog,
    enabled: true,
  },
  {
    label: "Raspored",
    description: "Radno vreme i odsustva",
    href: "/admin/schedule",
    icon: CalendarClock,
    enabled: true,
  },
  {
    label: "Podešavanja",
    description: "Salon i booking pravila",
    href: "/admin/settings",
    icon: Settings,
    enabled: true,
  },
];

const roleLabels: Record<
  AdminRole,
  string
> = {
  owner: "Vlasnik",
  manager: "Menadžer",
};

function getInitials(
  value: string
): string {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "SP";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
}

function isNavigationItemActive(
  pathname: string,
  href: string
): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`
    )
  );
}

function SidebarContent({
  pathname,
  businessName,
  businessSlug,
  email,
  role,
  onNavigate,
}: {
  pathname: string;
  businessName: string;
  businessSlug: string;
  email: string | null;
  role: AdminRole;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-20 items-center border-b border-white/[0.07] px-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="group flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950 shadow-lg shadow-amber-300/10 transition-transform group-hover:scale-105">
            <Scissors
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <div className="truncate font-semibold text-white">
              {businessName}
            </div>

            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
              Salon administration
            </div>
          </div>
        </Link>
      </div>

      <nav
        className="flex-1 overflow-y-auto px-3 py-5"
        aria-label="Admin navigacija"
      >
        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Upravljanje
        </div>

        <div className="space-y-1.5">
          {navigationItems.map(
            (item) => {
              const Icon = item.icon;

              const isActive =
                isNavigationItemActive(
                  pathname,
                  item.href
                );

              if (!item.enabled) {
                return (
                  <div
                    key={item.href}
                    className="flex cursor-not-allowed items-center gap-3 rounded-2xl px-3 py-3 opacity-45"
                    aria-disabled="true"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-500">
                      <Icon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-zinc-400">
                          {item.label}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-zinc-600">
                          Uskoro
                        </span>
                      </div>

                      <div className="mt-0.5 truncate text-xs text-zinc-700">
                        {
                          item.description
                        }
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
                  }
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
                    isActive
                      ? "bg-amber-300 text-zinc-950 shadow-lg shadow-amber-300/10"
                      : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition ${
                      isActive
                        ? "bg-zinc-950/10"
                        : "bg-white/[0.04] text-zinc-500 group-hover:text-amber-300"
                    }`}
                  >
                    <Icon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {item.label}
                    </div>

                    <div
                      className={`mt-0.5 truncate text-xs ${
                        isActive
                          ? "text-zinc-950/60"
                          : "text-zinc-600"
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>

                  {isActive && (
                    <ChevronRight
                      className="h-4 w-4 flex-shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            }
          )}
        </div>
      </nav>

      <div className="border-t border-white/[0.07] p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="mb-3 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm text-zinc-400 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          <span>
            Otvori javni sajt
          </span>

          <ExternalLink
            className="h-4 w-4"
            aria-hidden="true"
          />
        </a>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-300 text-sm font-bold text-zinc-950">
              {getInitials(
                businessName
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">
                {roleLabels[role]}
              </div>

              <div className="truncate text-xs text-zinc-600">
                {email ??
                  businessSlug}
              </div>
            </div>

            <form
              action={signOutAction}
            >
              <button
                type="submit"
                title="Odjavi se"
                aria-label="Odjavi se"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-red-400/10 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <LogOut
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({
  children,
  admin,
}: AdminShellProps) {
  const pathname =
    usePathname();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const currentNavigationItem =
    navigationItems.find(
      (item) =>
        isNavigationItemActive(
          pathname,
          item.href
        )
    );

  const pageTitle =
    currentNavigationItem?.label ??
    "Administracija";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/[0.07] bg-zinc-950 lg:block">
        <SidebarContent
          pathname={pathname}
          businessName={
            admin.business.name
          }
          businessSlug={
            admin.business.slug
          }
          email={admin.email}
          role={admin.role}
        />
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            aria-label="Zatvori navigaciju"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          />

          <aside className="absolute inset-y-0 left-0 w-[min(90vw,20rem)] border-r border-white/10 bg-zinc-950 shadow-2xl">
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              aria-label="Zatvori meni"
              className="absolute right-3 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <X
                className="h-5 w-5"
                aria-hidden="true"
              />
            </button>

            <SidebarContent
              pathname={pathname}
              businessName={
                admin.business.name
              }
              businessSlug={
                admin.business.slug
              }
              email={admin.email}
              role={admin.role}
              onNavigate={() =>
                setMobileMenuOpen(
                  false
                )
              }
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-zinc-950/80 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(
                    true
                  )
                }
                aria-label="Otvori admin meni"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300 lg:hidden"
              >
                <Menu
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>

              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  {
                    admin.business
                      .name
                  }
                </div>

                <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                  {pageTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Obaveštenja"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <Bell
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                <span
                  className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-300"
                  aria-hidden="true"
                />
              </button>

              <div className="hidden items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.035] py-1.5 pl-2 pr-3 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-300 text-xs font-bold text-zinc-950">
                  {getInitials(
                    admin.business.name
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    {
                      roleLabels[
                        admin.role
                      ]
                    }
                  </div>

                  <div className="max-w-44 truncate text-[10px] text-zinc-600">
                    {admin.email ??
                      admin.business
                        .slug}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}