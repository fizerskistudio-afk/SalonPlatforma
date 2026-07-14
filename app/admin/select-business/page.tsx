import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Building2,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { signOutAction } from "@/app/admin/(protected)/actions";
import { requireAdmin } from "@/lib/auth/admin";

import BusinessSelector from "./BusinessSelector";

export const metadata: Metadata = {
  title: "Izaberi salon",
  description:
    "Izbor aktivnog salona za administraciju.",
};

export const dynamic = "force-dynamic";

export default async function SelectBusinessPage() {
  const admin = await requireAdmin({
    allowTenantSelection: true,
  });

  if (admin.tenants.length <= 1) {
    redirect("/admin");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-5 py-10 text-white sm:px-8">
      <div
        className="absolute inset-0 bg-gradient-to-br from-amber-300/10 via-transparent to-blue-300/5"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
              <Building2
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <form action={signOutAction}>
              <button
                type="submit"
                className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-zinc-400 transition hover:bg-white/[0.06] hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <LogOut
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Odjavi se
              </button>
            </form>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <ShieldCheck size={17} />
              Proveren administratorski pristup
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Izaberi salon
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
              Tvoj nalog ima pristup većem broju salona. Izbor određuje aktivni workspace, a pristup se ponovo proverava na serveru pri svakom zahtevu.
            </p>
          </div>

          <div className="mt-7">
            <BusinessSelector
              tenants={admin.tenants}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
