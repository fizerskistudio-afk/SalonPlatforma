import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  Scissors,
  ShieldCheck,
} from "lucide-react";

import StaffLoginForm from "./StaffLoginForm";
import { getStaffContext } from "@/lib/auth/staff";

export const metadata: Metadata = {
  title: "Staff prijava",
  description:
    "Prijava zaposlenog u sopstveni raspored.",
};

export default async function StaffLoginPage() {
  const existingStaff =
    await getStaffContext();

  if (existingStaff) {
    redirect("/staff");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-5 py-10 text-white">
      <div
        className="absolute inset-0 bg-gradient-to-br from-amber-300/10 via-transparent to-violet-300/5"
        aria-hidden="true"
      />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-xl lg:grid-cols-[1fr_0.9fr]">
        <section className="hidden flex-col justify-between border-r border-white/[0.07] p-10 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
              <Scissors className="h-5 w-5" />
            </div>

            <div>
              <div className="font-semibold">
                Salon Platform
              </div>

              <div className="text-xs text-zinc-600">
                Staff workspace
              </div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-200">
              <ShieldCheck className="h-4 w-4" />
              Ograničen pristup
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight">
              Tvoj raspored.
              <br />
              Tvoji termini.
            </h1>

            <p className="mt-4 max-w-md text-sm leading-7 text-zinc-500">
              Pristup je ograničen na rezervacije i raspored zaposlenog povezanog sa ovim nalogom.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <CalendarClock className="h-4 w-4" />
            Bez pristupa osetljivim podešavanjima salona
          </div>
        </section>

        <section className="p-6 sm:p-9">
          <div className="mb-8 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
              <Scissors className="h-5 w-5" />
            </div>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight">
            Staff prijava
          </h2>

          <p className="mt-3 text-sm leading-7 text-zinc-500">
            Prijavi se emailom i lozinkom povezanim sa tvojim staff članstvom.
          </p>

          <div className="mt-8">
            <StaffLoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
