import type { ReactNode } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ExternalLink,
  LockKeyhole,
  LogOut,
  Scissors,
  UserRound,
} from "lucide-react";

import { staffSignOutAction } from "@/app/staff/(protected)/actions";
import type { StaffContext } from "@/lib/auth/staff";
import {
  resolveProductFeatureGate,
} from "@/lib/product-packages/gates";
import type {
  ProductPackageAccess,
} from "@/lib/product-packages/resolver";
import {
  buildBusinessPublicLinks,
} from "@/lib/platform-admin/business-public-links";

type StaffShellProps = {
  children: ReactNode;
  productAccess:
    ProductPackageAccess;
  staff: StaffContext & {
    employee: NonNullable<
      StaffContext["employee"]
    >;
  };
};

export default function StaffShell({
  children,
  productAccess,
  staff,
}: StaffShellProps) {
  const publicLinks =
    buildBusinessPublicLinks(
      staff.business.slug
    );

  const calendarDecision =
    resolveProductFeatureGate({
      access:
        productAccess,
      featureKey:
        "staff.calendar_connection",
      permissionGranted:
        true,
      integrationConnected:
        true,
    });

  const calendarLocked =
    calendarDecision.blockedBy ===
      "package";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-zinc-950/85 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/staff"
            className="flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
              <Scissors className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="truncate font-semibold">
                {staff.business.name}
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                Staff dashboard
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/staff/calendar"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-400/15 bg-blue-400/[0.06] px-3 text-xs font-medium text-blue-200 transition hover:border-blue-400/25 hover:bg-blue-400/10"
            >
              {calendarLocked ? (
                <LockKeyhole className="h-4 w-4" />
              ) : (
                <CalendarDays className="h-4 w-4" />
              )}

              <span className="hidden sm:inline">
                Moj kalendar
              </span>

              {calendarLocked ? (
                <span className="hidden rounded-full border border-blue-300/20 bg-blue-300/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-blue-100 lg:inline">
                  Paket · Operations Pro
                </span>
              ) : null}
            </Link>

            <a
              href={
                publicLinks.publicUrl
              }
              target="_blank"
              rel="noreferrer"
              className="hidden min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.08] hover:text-white sm:inline-flex"
            >
              Javni sajt
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <div className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 md:flex">
              <UserRound className="h-4 w-4 text-amber-300" />

              <div>
                <div className="text-xs font-semibold text-zinc-200">
                  {staff.employee.name}
                </div>

                <div className="max-w-40 truncate text-[10px] text-zinc-600">
                  {staff.email ??
                    "Staff nalog"}
                </div>
              </div>
            </div>

            <form action={staffSignOutAction}>
              <button
                type="submit"
                title="Odjavi se"
                aria-label="Odjavi se"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-500 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
