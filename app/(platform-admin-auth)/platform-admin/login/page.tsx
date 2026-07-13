import type {
  Metadata,
} from "next";
import { redirect } from "next/navigation";
import {
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  getPlatformAdminAccess,
} from "@/lib/auth/platform-admin";
import {
  getSafePlatformAdminNextPath,
} from "@/lib/auth/platform-admin-policy";

import PlatformAdminLoginForm from "./LoginForm";

export const dynamic =
  "force-dynamic";

export const metadata:
  Metadata = {
    title:
      "Platform Admin prijava",
    description:
      "Prijava u interni operativni panel platforme.",
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };

type PlatformAdminLoginPageProps = {
  searchParams: Promise<{
    next?:
      | string
      | string[];
    authError?:
      | string
      | string[];
  }>;
};

export default async function PlatformAdminLoginPage({
  searchParams,
}: PlatformAdminLoginPageProps) {
  const params =
    await searchParams;

  const next =
    getSafePlatformAdminNextPath(
      Array.isArray(
        params.next
      )
        ? params.next[0]
        : params.next
    );

  const access =
    await getPlatformAdminAccess();

  if (
    access.status ===
      "authorized"
  ) {
    redirect(next);
  }

  if (
    access.status ===
      "forbidden"
  ) {
    redirect(
      "/platform-admin/forbidden"
    );
  }

  const callbackFailed =
    (Array.isArray(
      params.authError
    )
      ? params.authError[0]
      : params.authError) ===
    "callback";

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10 sm:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-center lg:gap-16">
          <section className="max-w-xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-950">
                <ShieldCheck
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Salon Platforma
                </p>

                <p className="text-lg font-semibold">
                  Platform Admin
                </p>
              </div>
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
              Interni operativni pristup
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Odvojena kontrolna granica za celu platformu.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-zinc-400">
              Ovaj pristup nije povezan sa owner ili manager članstvom pojedinačnog salona. Dozvoljen je samo ovlašćenim članovima platformskog tima.
            </p>
          </section>

          <section className="w-full rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mb-7 flex items-start gap-4">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-amber-300/10 text-amber-300">
                <LockKeyhole
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Prijava
                </h2>

                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  Koristi platformski nalog. Salon admin pristup se proverava odvojeno.
                </p>
              </div>
            </div>

            {callbackFailed && (
              <div
                role="alert"
                className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
              >
                Link za prijavu nije moguće potvrditi. Pokušaj ponovo.
              </div>
            )}

            <PlatformAdminLoginForm
              next={next}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
