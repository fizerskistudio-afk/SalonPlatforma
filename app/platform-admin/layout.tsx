import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import Link from "next/link";

import {
  ExternalLink,
  LogOut,
  Scissors,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import PlatformAdminNavigation from "@/components/platform-admin/PlatformAdminNavigation";
import PlatformAdminAccessProvider from "@/components/platform-admin/PlatformAdminAccessProvider";
import {
  signOutPlatformAdminAction,
} from "@/app/platform-admin/actions";

import {
  requirePlatformAdmin,
} from "@/lib/auth/platform-admin";
import {
  getPlatformAdminPermissions,
  PLATFORM_ADMIN_ROLE_LABELS,
} from "@/lib/auth/platform-admin-policy";

export const metadata:
  Metadata = {
    title:
      "Platform Admin",
    description:
      "Interni panel za upravljanje booking platformom.",
  };

type PlatformAdminLayoutProps = {
  children: ReactNode;
};

export default async function PlatformAdminLayout({
  children,
}: PlatformAdminLayoutProps) {
  const platformAdmin =
    await requirePlatformAdmin();

  const permissions =
    getPlatformAdminPermissions(
      platformAdmin.role
    );

  return (
    <PlatformAdminAccessProvider
      access={{
        role:
          platformAdmin.role,
        permissions,
      }}
    >
      <div
      className="
        min-h-screen
        bg-zinc-950
        text-zinc-100
      "
    >
      <aside
        className="
          border-b
          border-white/10
          bg-zinc-950
          lg:fixed
          lg:inset-y-0
          lg:left-0
          lg:w-72
          lg:border-b-0
          lg:border-r
        "
      >
        <div
          className="
            flex
            h-full
            flex-col
            px-5
            py-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-white
                text-zinc-950
              "
            >
              <ShieldCheck
                size={23}
              />
            </div>

            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-zinc-500
                "
              >
                Salon Platforma
              </p>

              <h1
                className="
                  text-lg
                  font-semibold
                "
              >
                Platform Admin
              </h1>
            </div>
          </div>

          <PlatformAdminNavigation />

          <Link
            href="/admin"
            className="
              mt-2
              flex
              items-center
              justify-between
              rounded-xl
              px-4
              py-3
              text-sm
              font-medium
              text-zinc-400
              transition
              hover:bg-white/5
              hover:text-white
            "
          >
            <span
              className="
                flex
                items-center
                gap-3
              "
            >
              <Scissors
                size={18}
              />

              Salon admin
            </span>

            <ExternalLink
              size={15}
            />
          </Link>

          <div
            className="
              mt-6
              rounded-2xl
              border
              border-white/10
              bg-white/[0.03]
              p-4
              lg:mt-auto
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-emerald-400
              "
            >
              <Settings2
                size={15}
              />

              {
                PLATFORM_ADMIN_ROLE_LABELS[
                  platformAdmin.role
                ]
              }
            </div>

            <p
              className="
                mt-2
                break-all
                text-sm
                text-zinc-300
              "
            >
              {platformAdmin.email}
            </p>

            <form
              action={
                signOutPlatformAdminAction
              }
              className="mt-4"
            >
              <button
                type="submit"
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                <LogOut
                  size={16}
                  aria-hidden="true"
                />

                Odjavi se
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div
        className="
          lg:pl-72
        "
      >
        <header
          className="
            flex
            min-h-20
            items-center
            justify-between
            border-b
            border-white/10
            px-5
            md:px-8
          "
        >
          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
                text-zinc-500
              "
            >
              Interni sistem
            </p>

            <p
              className="
                mt-1
                text-sm
                text-zinc-300
              "
            >
              Upravljanje platformom,
              tenantima i presetima
            </p>
          </div>

          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="
              hidden
              items-center
              gap-2
              rounded-xl
              border
              border-white/10
              px-4
              py-2
              text-sm
              text-zinc-300
              transition
              hover:border-white/20
              hover:text-white
              md:flex
            "
          >
            Otvori sajt

            <ExternalLink
              size={15}
            />
          </Link>
        </header>

        <main
          className="
            px-5
            py-8
            md:px-8
            md:py-10
          "
        >
          {children}
        </main>
      </div>
      </div>
    </PlatformAdminAccessProvider>
  );
}
