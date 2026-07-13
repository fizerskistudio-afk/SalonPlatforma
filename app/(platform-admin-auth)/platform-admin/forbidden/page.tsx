import type {
  Metadata,
} from "next";
import { redirect } from "next/navigation";
import {
  LogOut,
  ShieldAlert,
} from "lucide-react";

import {
  signOutPlatformAdminAction,
} from "@/app/platform-admin/actions";
import {
  getPlatformAdminAccess,
} from "@/lib/auth/platform-admin";

export const dynamic =
  "force-dynamic";

export const metadata:
  Metadata = {
    title:
      "Platform Admin pristup odbijen",
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };

export default async function PlatformAdminForbiddenPage() {
  const access =
    await getPlatformAdminAccess();

  if (
    access.status ===
      "unauthenticated"
  ) {
    redirect(
      "/platform-admin/login"
    );
  }

  if (
    access.status ===
      "authorized"
  ) {
    redirect(
      "/platform-admin"
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 py-10 text-white">
      <section className="w-full max-w-lg rounded-[2rem] border border-red-400/20 bg-white/[0.04] p-7 shadow-2xl sm:p-9">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-400/10 text-red-300">
          <ShieldAlert
            className="h-6 w-6"
            aria-hidden="true"
          />
        </div>

        <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-red-300">
          Pristup odbijen
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Ovaj nalog nema platform-admin dozvolu.
        </h1>

        <p className="mt-4 leading-7 text-zinc-400">
          Tenant owner, manager ili staff pristup ne daje automatski pristup internom platformskom panelu.
        </p>

        <form
          action={
            signOutPlatformAdminAction
          }
          className="mt-8"
        >
          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            <LogOut
              className="h-4 w-4"
              aria-hidden="true"
            />

            Odjavi ovaj nalog
          </button>
        </form>
      </section>
    </main>
  );
}
