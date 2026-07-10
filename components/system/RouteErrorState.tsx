"use client";

import Link from "next/link";
import {
  AlertTriangle,
  House,
  RotateCcw,
} from "lucide-react";

type RouteErrorStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  digest?: string;
  retry: () => void;
  homeHref: string;
  homeLabel: string;
  fullScreen?: boolean;
};

export default function RouteErrorState({
  eyebrow = "Privremeni problem",
  title,
  description,
  digest,
  retry,
  homeHref,
  homeLabel,
  fullScreen = false,
}: RouteErrorStateProps) {
  return (
    <section
      role="alert"
      className={
        fullScreen
          ? "flex min-h-screen items-center justify-center bg-zinc-950 px-5 py-12 text-zinc-100"
          : "flex min-h-[60vh] items-center justify-center px-2 py-10 text-zinc-100"
      }
    >
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300">
          <AlertTriangle
            aria-hidden="true"
            size={24}
          />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
          {eyebrow}
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {title}
        </h1>

        <p className="mt-4 max-w-lg text-sm leading-7 text-zinc-400 sm:text-base">
          {description}
        </p>

        {digest ? (
          <p className="mt-5 text-xs text-zinc-500">
            Referenca greške:{" "}
            <code className="break-all rounded bg-black/30 px-1.5 py-1 text-zinc-400">
              {digest}
            </code>
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            <RotateCcw
              aria-hidden="true"
              size={17}
            />
            Pokušaj ponovo
          </button>

          <Link
            href={homeHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            <House
              aria-hidden="true"
              size={17}
            />
            {homeLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
