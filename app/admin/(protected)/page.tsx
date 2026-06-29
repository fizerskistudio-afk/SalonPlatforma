import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Scissors,
  ShieldCheck,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";

import { signOutAction } from "./actions";

const roleLabels = {
  owner: "Vlasnik",
  manager: "Menadžer",
};

export default async function AdminPage() {
  const admin =
    await requireAdmin();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
              <Scissors
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <div className="truncate font-semibold">
                {admin.business.name}
              </div>

              <div className="truncate text-xs text-zinc-500">
                {
                  roleLabels[
                    admin.role
                  ]
                }
                {admin.email
                  ? ` · ${admin.email}`
                  : ""}
              </div>
            </div>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <LogOut
                className="h-4 w-4"
                aria-hidden="true"
              />

              <span className="hidden sm:inline">
                Odjavi se
              </span>
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            <ShieldCheck
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />

            Zaštićena admin sesija
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Dobrodošao u administraciju
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-500">
            Autentifikacija i povezivanje
            sa salon članstvom uspešno
            rade. Sledeće gradimo kompletan
            dashboard.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-300">
              <LayoutDashboard
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div className="text-sm text-zinc-500">
              Aktivni salon
            </div>

            <div className="mt-1 text-xl font-semibold">
              {admin.business.name}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-300">
              <CalendarDays
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div className="text-sm text-zinc-500">
              Booking sistem
            </div>

            <div className="mt-1 text-xl font-semibold">
              Povezan
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              <ShieldCheck
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div className="text-sm text-zinc-500">
              Pristup
            </div>

            <div className="mt-1 text-xl font-semibold">
              {
                roleLabels[
                  admin.role
                ]
              }
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}