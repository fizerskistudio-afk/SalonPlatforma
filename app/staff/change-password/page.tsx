import type {
  Metadata,
} from "next";

import {
  redirect,
} from "next/navigation";

import {
  KeyRound,
  ShieldCheck,
} from "lucide-react";

import {
  requireStaffForPasswordChange,
} from "@/lib/auth/staff";

import ChangePasswordForm from "./ChangePasswordForm";

export const metadata: Metadata = {
  title:
    "Promena privremene lozinke",
  description:
    "Obavezna promena privremene lozinke za staff nalog.",
};

export const dynamic =
  "force-dynamic";

export default async function StaffChangePasswordPage() {
  const staff =
    await requireStaffForPasswordChange();

  if (!staff.mustChangePassword) {
    redirect("/staff");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-5 py-10 text-white sm:px-8">
      <div
        className="absolute inset-0 bg-gradient-to-br from-violet-300/10 via-transparent to-amber-300/5"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-300 text-zinc-950">
            <KeyRound
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-200">
              <ShieldCheck
                size={17}
              />
              Obavezna bezbednosna radnja
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Postavi svoju lozinku
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Prijavljen si privremenim staff kredencijalima za salon{" "}
              <span className="font-semibold text-zinc-200">
                {staff.business.name}
              </span>. Pre ulaska u staff dashboard moraš postaviti novu privatnu lozinku.
            </p>

            {staff.email ? (
              <p className="mt-3 break-all rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3 text-xs text-zinc-500">
                {staff.email}
              </p>
            ) : null}
          </div>

          <div className="mt-7">
            <ChangePasswordForm />
          </div>
        </section>
      </div>
    </main>
  );
}
