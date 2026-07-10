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
    match:
      (
        pathname: string
      ) =>
        pathname ===
        "/platform-admin",
  },
  {
    href:
      "/platform-admin/businesses",
    label:
      "Saloni",
    icon:
      Building2,
    match:
      (
        pathname: string
      ) =>
        (
          pathname ===
            "/platform-admin/businesses" ||
          pathname.startsWith(
            "/platform-admin/businesses/"
          )
        ) &&
        !pathname.startsWith(
          "/platform-admin/businesses/new"
        ),
  },
  {
    href:
      "/platform-admin/businesses/new",
    label:
      "Novi salon",
    icon:
      PlusCircle,
    match:
      (
        pathname: string
      ) =>
        pathname ===
          "/platform-admin/businesses/new" ||
        pathname.startsWith(
          "/platform-admin/businesses/new/"
        ),
  },
  {
    href:
      "/platform-admin/business-presets",
    label:
      "Business preseti",
    icon:
      Boxes,
    match:
      (
        pathname: string
      ) =>
        pathname ===
          "/platform-admin/business-presets" ||
        pathname.startsWith(
          "/platform-admin/business-presets/"
        ),
  },
] as const;

export default function PlatformAdminNavigation() {
  const pathname =
    usePathname();

  return (
    <nav
      aria-label="Platform admin navigacija"
      className="
        mt-8
        space-y-2
      "
    >
      {
        navigationItems.map(
          (
            item
          ) => {
            const Icon =
              item.icon;

            const isActive =
              item.match(
                pathname
              );

            return (
              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                aria-current={
                  isActive
                    ? "page"
                    : undefined
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
                  size={
                    18
                  }
                />

                {
                  item.label
                }
              </Link>
            );
          }
        )
      }
    </nav>
  );
}
