"use client";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  Boxes,
  Building2,
  LayoutDashboard,
  PlusCircle,
} from "lucide-react";

const navigationItems = [
  {
    href:
      "/platform-admin",
    label:
      "Pregled platforme",
    icon:
      LayoutDashboard,
    includeChildren:
      false,
  },
  {
    href:
      "/platform-admin/businesses",
    label:
      "Saloni",
    icon:
      Building2,
    includeChildren:
      false,
  },
  {
    href:
      "/platform-admin/businesses/new",
    label:
      "Novi salon",
    icon:
      PlusCircle,
    includeChildren:
      true,
  },
  {
    href:
      "/platform-admin/business-presets",
    label:
      "Business preseti",
    icon:
      Boxes,
    includeChildren:
      true,
  },
] as const;

export default function PlatformAdminNavigation() {
  const pathname =
    usePathname();

  return (
    <nav
      className="
        mt-8
        space-y-2
      "
    >
      {navigationItems.map(
        (item) => {
          const Icon =
            item.icon;

          const isActive =
            pathname ===
              item.href ||
            (
              item.includeChildren &&
              pathname.startsWith(
                `${item.href}/`
              )
            );

          return (
            <Link
              key={
                item.href
              }
              href={
                item.href
              }
              className={[
                "flex",
                "items-center",
                "gap-3",
                "rounded-xl",
                "px-4",
                "py-3",
                "text-sm",
                "font-semibold",
                "transition",
                isActive
                  ? "bg-white text-zinc-950"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              <Icon
                size={18}
              />

              {item.label}
            </Link>
          );
        }
      )}
    </nav>
  );
}