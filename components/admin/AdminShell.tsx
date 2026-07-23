"use client";

import type {
  ReactNode,
} from "react";
import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  usePathname,
} from "next/navigation";
import {
  Bell,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Grid2X2,
  Images,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  MessageSquareText,
  Repeat2,
  Scissors,
  Settings,
  ShieldCheck,
  UserRoundCog,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  signOutAction,
} from "@/app/admin/(protected)/actions";
import {
  ADMIN_NAVIGATION_GROUPS,
  getAdminMobilePrimaryItems,
  getAdminNavigationGroupForPath,
  getAdminNavigationGroups,
  getAdminNavigationItemForPath,
  isAdminNavigationItemActive,
  type AdminNavigationGroupKey,
  type AdminNavigationIconKey,
  type AdminNavigationItemDefinition,
} from "@/lib/admin/admin-navigation";
import {
  resolveProductFeatureGate,
} from "@/lib/product-packages/gates";
import type {
  ProductPackageAccess,
} from "@/lib/product-packages/resolver";

type AdminRole =
  | "owner"
  | "manager";

type AdminShellProps = {
  children: ReactNode;
  productAccess:
    ProductPackageAccess;
  reviewsEnabled: boolean;
  admin: {
    email: string | null;
    role: AdminRole;
    tenantCount: number;
    business: {
      name: string;
      slug: string;
      publicUrl: string;
    };
  };
};

type NavigationStatus = {
  packageLocked: boolean;
  badgeCount: number;
};

const navigationGroups =
  getAdminNavigationGroups();

const mobilePrimaryItems =
  getAdminMobilePrimaryItems();

const navigationIconMap:
  Record<
    AdminNavigationIconKey,
    LucideIcon
  > = {
    dashboard:
      LayoutDashboard,
    bookings:
      CalendarDays,
    customers:
      UsersRound,
    schedule:
      CalendarClock,
    services:
      Scissors,
    team:
      UserRoundCog,
    gallery:
      Images,
    reviews:
      MessageSquareText,
    members:
      ShieldCheck,
    notifications:
      Bell,
    settings:
      Settings,
  };

const roleLabels:
  Record<
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
    words[
      words.length - 1
    ][0]
  }`.toUpperCase();
}

function getNavigationStatus({
  item,
  productAccess,
  reviewAttentionCount,
}: {
  item:
    AdminNavigationItemDefinition;
  productAccess:
    ProductPackageAccess;
  reviewAttentionCount: number;
}): NavigationStatus {
  const gateDecision =
    resolveProductFeatureGate({
      access:
        productAccess,
      featureKey:
        item.featureKey,
      permissionGranted:
        true,
      integrationConnected:
        true,
    });

  const packageLocked =
    gateDecision.blockedBy ===
    "package";

  return {
    packageLocked,
    badgeCount:
      !packageLocked &&
      item.badgeKey ===
        "reviews"
        ? reviewAttentionCount
        : 0,
  };
}

function NavigationBadge({
  count,
  active,
}: {
  count: number;
  active: boolean;
}) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={
        active
          ? "rounded-full bg-zinc-950/10 px-2 py-0.5 text-[10px] font-bold text-zinc-950"
          : "rounded-full bg-amber-300/15 px-2 py-0.5 text-[10px] font-bold text-amber-300"
      }
      aria-label={
        count === 1
          ? "1 stavka traži pažnju"
          : `${count} stavki traži pažnju`
      }
    >
      {count > 99
        ? "99+"
        : count}
    </span>
  );
}

function NavigationItemLink({
  item,
  pathname,
  productAccess,
  reviewAttentionCount,
  onNavigate,
}: {
  item:
    AdminNavigationItemDefinition;
  pathname: string;
  productAccess:
    ProductPackageAccess;
  reviewAttentionCount: number;
  onNavigate?: () => void;
}) {
  const Icon =
    navigationIconMap[
      item.iconKey
    ];

  const isActive =
    isAdminNavigationItemActive(
      pathname,
      item.href
    );

  const {
    packageLocked,
    badgeCount,
  } = getNavigationStatus({
    item,
    productAccess,
    reviewAttentionCount,
  });

  return (
    <Link
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
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">
            {item.label}
          </span>

          {packageLocked ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/15 bg-amber-300/[0.08] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-amber-300">
              <LockKeyhole
                className="h-2.5 w-2.5"
                aria-hidden="true"
              />
              Paket
            </span>
          ) : null}

          <NavigationBadge
            count={badgeCount}
            active={isActive}
          />
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

      {isActive ? (
        <ChevronRight
          className="h-4 w-4 flex-shrink-0"
          aria-hidden="true"
        />
      ) : null}
    </Link>
  );
}

function SidebarContent({
  pathname,
  businessName,
  businessSlug,
  publicUrl,
  email,
  role,
  productAccess,
  reviewAttentionCount,
  tenantCount,
  collapsedGroups,
  activeGroupKey,
  onToggleGroup,
  onNavigate,
}: {
  pathname: string;
  businessName: string;
  businessSlug: string;
  publicUrl: string;
  email: string | null;
  role: AdminRole;
  productAccess:
    ProductPackageAccess;
  reviewAttentionCount: number;
  tenantCount: number;
  collapsedGroups:
    AdminNavigationGroupKey[];
  activeGroupKey:
    AdminNavigationGroupKey | null;
  onToggleGroup:
    (
      groupKey:
        AdminNavigationGroupKey
    ) => void;
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
              Ordum Business OS
            </div>
          </div>
        </Link>
      </div>

      <nav
        className="flex-1 overflow-y-auto px-3 py-4"
        aria-label="Admin navigacija"
      >
        <div className="space-y-3">
          {navigationGroups.map(
            (group) => {
              const forceOpen =
                activeGroupKey ===
                group.key;

              const collapsed =
                !forceOpen &&
                collapsedGroups.includes(
                  group.key
                );

              return (
                <section
                  key={group.key}
                  className="rounded-2xl border border-white/[0.05] bg-white/[0.015] p-1"
                >
                  <button
                    type="button"
                    onClick={() =>
                      onToggleGroup(
                        group.key
                      )
                    }
                    aria-expanded={
                      !collapsed
                    }
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        {group.label}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-zinc-700">
                        {group.description}
                      </div>
                    </div>

                    <ChevronDown
                      className={`h-4 w-4 flex-shrink-0 text-zinc-600 transition-transform ${
                        collapsed
                          ? "-rotate-90"
                          : "rotate-0"
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {!collapsed ? (
                    <div className="mt-1 space-y-1">
                      {group.items.map(
                        (item) => (
                          <NavigationItemLink
                            key={item.key}
                            item={item}
                            pathname={pathname}
                            productAccess={
                              productAccess
                            }
                            reviewAttentionCount={
                              reviewAttentionCount
                            }
                            onNavigate={
                              onNavigate
                            }
                          />
                        )
                      )}
                    </div>
                  ) : null}
                </section>
              );
            }
          )}
        </div>
      </nav>

      <div className="border-t border-white/[0.07] p-3">
        <Link
          href="/workspace?context=admin"
          onClick={onNavigate}
          className="mb-3 flex min-h-11 items-center justify-between rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] px-4 py-3 text-sm font-medium text-amber-200 transition hover:border-amber-300/30 hover:bg-amber-300/[0.1] focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          <span>
            Ordum Workspace
          </span>
          <Grid2X2
            className="h-4 w-4"
            aria-hidden="true"
          />
        </Link>

        {tenantCount > 1 ? (
          <Link
            href="/admin/select-business"
            onClick={onNavigate}
            className="mb-3 flex min-h-11 items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm text-zinc-400 transition hover:border-amber-300/30 hover:bg-amber-300/[0.06] hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <span>
              Promeni salon
            </span>
            <Repeat2
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        ) : null}

        <a
          href={publicUrl}
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

function MobileBottomNavigation({
  pathname,
  productAccess,
  onOpenMore,
}: {
  pathname: string;
  productAccess:
    ProductPackageAccess;
  onOpenMore: () => void;
}) {
  const primaryRouteActive =
    mobilePrimaryItems.some(
      (item) =>
        isAdminNavigationItemActive(
          pathname,
          item.href
        )
    );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-zinc-950/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl lg:hidden"
      aria-label="Brza admin navigacija"
    >
      <div className="grid grid-cols-4 gap-1">
        {mobilePrimaryItems.map(
          (item) => {
            const Icon =
              navigationIconMap[
                item.iconKey
              ];

            const isActive =
              isAdminNavigationItemActive(
                pathname,
                item.href
              );

            const {
              packageLocked,
            } = getNavigationStatus({
              item,
              productAccess,
              reviewAttentionCount:
                0,
            });

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={
                  isActive
                    ? "page"
                    : undefined
                }
                className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[10px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
                  isActive
                    ? "bg-amber-300/12 text-amber-200"
                    : "text-zinc-500 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon
                  className="h-5 w-5"
                  aria-hidden="true"
                />
                <span>
                  {item.mobileLabel}
                </span>

                {packageLocked ? (
                  <LockKeyhole
                    className="absolute right-2 top-2 h-2.5 w-2.5 text-amber-300"
                    aria-label="Dostupno u višem paketu"
                  />
                ) : null}
              </Link>
            );
          }
        )}

        <button
          type="button"
          onClick={onOpenMore}
          aria-label="Otvori sve admin module"
          aria-expanded="false"
          className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[10px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
            primaryRouteActive
              ? "text-zinc-500 hover:bg-white/[0.05] hover:text-white"
              : "bg-amber-300/12 text-amber-200"
          }`}
        >
          <Grid2X2
            className="h-5 w-5"
            aria-hidden="true"
          />
          <span>
            Više
          </span>
        </button>
      </div>
    </nav>
  );
}

export default function AdminShell({
  children,
  admin,
  productAccess,
  reviewsEnabled,
}: AdminShellProps) {
  const pathname =
    usePathname();

  const [
    reviewAttentionCount,
    setReviewAttentionCount,
  ] = useState(0);

  useEffect(
    () => {
      if (
        !reviewsEnabled
      ) {
        return;
      }

      const controller =
        new AbortController();
      let active =
        true;

      async function loadReviewAttention() {
        try {
          const response =
            await fetch(
              "/api/admin/review-attention",
              {
                cache:
                  "no-store",
                signal:
                  controller.signal,
              }
            );

          if (
            !response.ok
          ) {
            return;
          }

          const payload:
            unknown =
              await response.json();

          if (
            !active ||
            typeof payload !==
              "object" ||
            payload === null ||
            !(
              "count" in
              payload
            )
          ) {
            return;
          }

          const count =
            (
              payload as {
                count?: unknown;
              }
            ).count;

          if (
            typeof count ===
              "number" &&
            Number.isFinite(
              count
            )
          ) {
            setReviewAttentionCount(
              Math.max(
                0,
                Math.trunc(
                  count
                )
              )
            );
          }
        } catch (
          error
        ) {
          if (
            error instanceof
              DOMException &&
            error.name ===
              "AbortError"
          ) {
            return;
          }
        }
      }

      void loadReviewAttention();

      return () => {
        active =
          false;
        controller.abort();
      };
    },
    [
      reviewsEnabled,
    ]
  );

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    collapsedGroups,
    setCollapsedGroups,
  ] = useState<
    AdminNavigationGroupKey[]
  >(() =>
    ADMIN_NAVIGATION_GROUPS
      .filter(
        (group) =>
          group.defaultCollapsed
      )
      .map(
        (group) =>
          group.key
      )
  );

  const currentNavigationItem =
    getAdminNavigationItemForPath(
      pathname
    );

  const activeGroupKey =
    getAdminNavigationGroupForPath(
      pathname
    )?.key ??
    null;

  const pageTitle =
    currentNavigationItem?.label ??
    "Administracija";

  function toggleGroup(
    groupKey:
      AdminNavigationGroupKey
  ) {
    setCollapsedGroups(
      (current) =>
        current.includes(
          groupKey
        )
          ? current.filter(
              (item) =>
                item !==
                groupKey
            )
          : [
              ...current,
              groupKey,
            ]
    );
  }

  const sidebarProps = {
    pathname,
    businessName:
      admin.business.name,
    businessSlug:
      admin.business.slug,
    publicUrl:
      admin.business.publicUrl,
    email:
      admin.email,
    role:
      admin.role,
    productAccess,
    reviewAttentionCount,
    tenantCount:
      admin.tenantCount,
    collapsedGroups,
    activeGroupKey,
    onToggleGroup:
      toggleGroup,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/[0.07] bg-zinc-950 lg:block">
        <SidebarContent
          {...sidebarProps}
        />
      </aside>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            aria-label="Zatvori navigaciju"
            onClick={() =>
              setMobileMenuOpen(
                false
              )
            }
          />

          <aside className="absolute inset-y-0 left-0 w-[min(90vw,21rem)] border-r border-white/10 bg-zinc-950 shadow-2xl">
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
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
              {...sidebarProps}
              onNavigate={() =>
                setMobileMenuOpen(
                  false
                )
              }
            />
          </aside>
        </div>
      ) : null}

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
                  {admin.business.name}
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
                    {roleLabels[
                      admin.role
                    ]}
                  </div>
                  <div className="max-w-44 truncate text-[10px] text-zinc-600">
                    {admin.email ??
                      admin.business.slug}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-5rem)] pb-24 lg:pb-0">
          {children}
        </main>
      </div>

      <MobileBottomNavigation
        pathname={pathname}
        productAccess={
          productAccess
        }
        onOpenMore={() =>
          setMobileMenuOpen(
            true
          )
        }
      />
    </div>
  );
}
