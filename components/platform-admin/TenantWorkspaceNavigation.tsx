"use client";

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";

import {
  Building2,
  KeyRound,
  LayoutDashboard,
  Palette,
  Settings2,
  Sparkles,
} from "lucide-react";

import BusinessPublicationBadge from "@/components/platform-admin/BusinessPublicationBadge";
import {
  usePlatformAdminAccess,
} from "@/components/platform-admin/PlatformAdminAccessProvider";
import {
  buildTenantWorkspaceSections,
  getTenantWorkspaceSection,
  isTenantWorkspaceItemActive,
  type TenantWorkspaceSectionId,
} from "@/lib/platform-admin/tenant-workspace";
import type {
  BusinessPublicationStatus,
} from "@/lib/publishing/status";

const SECTION_ICONS: Record<
  TenantWorkspaceSectionId,
  typeof LayoutDashboard
> = {
  overview: LayoutDashboard,
  branding: Sparkles,
  theme: Palette,
  access: KeyRound,
  operations: Settings2,
};

export default function TenantWorkspaceNavigation({
  businessName,
  businessSlug,
  publicationStatus,
}: {
  businessName: string;
  businessSlug: string;
  publicationStatus:
    BusinessPublicationStatus;
}) {
  const pathname =
    usePathname();
  const access =
    usePlatformAdminAccess();
  const sections =
    buildTenantWorkspaceSections(
      businessSlug,
      access.permissions
    );
  const activeSectionId =
    getTenantWorkspaceSection(
      pathname,
      businessSlug
    );
  const activeSection =
    sections.find(
      (section) =>
        section.id ===
        activeSectionId
    ) ??
    sections[0];

  return (
    <div className="sticky top-0 z-30 -mx-5 border-b border-white/10 bg-zinc-950/95 px-5 py-4 backdrop-blur md:-mx-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Link
              href="/platform-admin/businesses"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 transition hover:text-zinc-300"
            >
              <Building2
                size={14}
                aria-hidden="true"
              />
              Svi saloni
            </Link>
            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
              <p className="max-w-full truncate text-base font-semibold text-white sm:max-w-md">
                {businessName}
              </p>
              <BusinessPublicationBadge
                status={
                  publicationStatus
                }
              />
            </div>
            <p className="mt-1 truncate text-xs text-zinc-600">
              /{businessSlug}
            </p>
          </div>

          <p className="text-xs text-zinc-600">
            Tenant workspace
          </p>
        </div>

        <nav
          aria-label="Tenant workspace"
          className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5"
        >
          {
            sections.map(
              (section) => {
                const Icon =
                  SECTION_ICONS[
                    section.id
                  ];
                const isActive =
                  section.id ===
                  activeSectionId;

                return (
                  <Link
                    key={section.id}
                    href={section.href}
                    aria-current={
                      isActive
                        ? "page"
                        : undefined
                    }
                    className={[
                      "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950",
                      isActive
                        ? "border-white bg-white text-zinc-950"
                        : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white",
                    ].join(" ")}
                  >
                    <Icon
                      size={16}
                      aria-hidden="true"
                    />
                    {section.label}
                  </Link>
                );
              }
            )
          }
        </nav>

        {
          activeSection &&
          activeSection.items.length > 1 ? (
            <nav
              aria-label={`${activeSection.label} podnavigacija`}
              className="mt-3 flex flex-wrap gap-2"
            >
              {
                activeSection.items.map(
                  (item) => {
                    if (
                      !item.href ||
                      item.planned
                    ) {
                      return (
                        <span
                          key={item.id}
                          aria-disabled="true"
                          className="inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs font-semibold text-zinc-600"
                        >
                          {item.label}
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                            sledeće
                          </span>
                        </span>
                      );
                    }

                    const isActive =
                      isTenantWorkspaceItemActive(
                        pathname,
                        item.href
                      );

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        aria-current={
                          isActive
                            ? "page"
                            : undefined
                        }
                        className={[
                          "inline-flex min-h-10 items-center rounded-lg border px-3 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950",
                          isActive
                            ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
                            : "border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-200",
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                    );
                  }
                )
              }
            </nav>
          ) : null
        }
      </div>
    </div>
  );
}
