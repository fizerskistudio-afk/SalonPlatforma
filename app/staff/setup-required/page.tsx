import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Link2Off,
  LogOut,
  Scissors,
} from "lucide-react";

import { staffSignOutAction } from "@/app/staff/(protected)/actions";
import { getStaffContext } from "@/lib/auth/staff";

export const metadata: Metadata = {
  title: "Staff pristup nije povezan",
};

export default async function StaffSetupRequiredPage() {
  const staff =
    await getStaffContext();

  if (!staff) {
    redirect(
      "/staff/login"
    );
  }

  if (staff.employee) {
    redirect("/staff");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-5 py-10 text-white">
      <div
        className="absolute inset-0 bg-gradient-to-br from-amber-300/10 via-transparent to-violet-300/5"
        aria-hidden="true"
      />

      <section className="relative w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 text-center shadow-2xl backdrop-blur-xl sm:p-9">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
          <Scissors className="h-5 w-5" />
        </div>

        <div className="mx-auto mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-orange-400/10 text-orange-200">
          <Link2Off className="h-7 w-7" />
        </div>

        <h1 className="mt-5 text-2xl font-semibold">
          Nalog još nije povezan
        </h1>

        <p className="mt-3 text-sm leading-7 text-zinc-500">
          Staff članstvo postoji, ali vlasnik salona još nije povezao ovaj nalog sa konkretnim zaposlenim. Nakon povezivanja ovde će se pojaviti tvoj raspored i rezervacije.
        </p>

        <p className="mt-4 rounded-2xl border border-white/[0.07] bg-black/15 px-4 py-3 text-xs leading-6 text-zinc-600">
          Vlasnik treba da otvori Admin → Članovi → Staff pristup i izabere zaposlenog za tvoj email.
        </p>

        <form
          action={staffSignOutAction}
          className="mt-6"
        >
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08]"
          >
            <LogOut className="h-4 w-4" />
            Odjavi se
          </button>
        </form>
      </section>
    </main>
  );
}
