import type {
  Metadata,
} from "next";
import Link from "next/link";
import {
  redirect,
} from "next/navigation";
import {
  ArrowRight,
  Grid2X2,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  getAdminContext,
} from "@/lib/auth/admin";
import {
  getStaffContext,
} from "@/lib/auth/staff";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export const metadata:
  Metadata = {
    title:
      "Workspace prijava",
    description:
      "Izbor postojećeg sigurnog pristupa za Ordum Workspace.",
    robots: {
      index: false,
      follow: false,
    },
  };

export default async function WorkspaceLoginPage() {
  const admin =
    await getAdminContext();

  if (admin) {
    redirect(
      "/workspace?context=admin"
    );
  }

  const staff =
    await getStaffContext();

  if (staff) {
    redirect(
      "/workspace?context=staff"
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-5 py-10 text-white">
      <div
        className="absolute inset-0 bg-gradient-to-br from-amber-300/[0.08] via-transparent to-violet-300/[0.07]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-4xl">
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
            <Grid2X2
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <div className="text-lg font-semibold">
              Ordum Workspace
            </div>

            <div className="text-xs uppercase tracking-[0.2em] text-zinc-600">
              Izaberi pristup
            </div>
          </div>
        </div>

        <section className="rounded-[2.25rem] border border-white/10 bg-white/[0.035] p-6 shadow-2xl backdrop-blur-xl sm:p-9">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
              <ShieldCheck
                className="h-4 w-4"
                aria-hidden="true"
              />
              Postojeći sigurni nalozi
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight">
              Kako ulaziš u salon?
            </h1>

            <p className="mt-4 text-sm leading-7 text-zinc-500">
              Workspace ne uvodi novu lozinku.
              Nastavi kroz postojeći owner/manager
              ili staff tok.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <Link
              href="/admin/login"
              className="group flex min-h-56 flex-col rounded-[1.75rem] border border-amber-300/20 bg-amber-300/[0.07] p-6 transition hover:-translate-y-1 hover:border-amber-300/35 hover:bg-amber-300/[0.1] focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
                <UsersRound
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </div>

              <h2 className="mt-6 text-2xl font-semibold">
                Vlasnik ili menadžer
              </h2>

              <p className="mt-3 flex-1 text-sm leading-7 text-zinc-500">
                Upravljanje rezervacijama,
                klijentima, uslugama, timom i
                postavkama aktivnog salona.
              </p>

              <div className="mt-5 flex items-center justify-between text-sm font-semibold text-amber-200">
                Admin prijava
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </div>
            </Link>

            <Link
              href="/staff/login"
              className="group flex min-h-56 flex-col rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.055] focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-zinc-300">
                <UserRound
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </div>

              <h2 className="mt-6 text-2xl font-semibold">
                Član tima
              </h2>

              <p className="mt-3 flex-1 text-sm leading-7 text-zinc-500">
                Ograničeni pristup sopstvenim
                terminima, rasporedu i dozvoljenim
                staff funkcijama.
              </p>

              <div className="mt-5 flex items-center justify-between text-sm font-semibold text-zinc-300">
                Staff prijava
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
