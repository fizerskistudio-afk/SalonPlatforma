import Link from "next/link";
import {
  ArrowLeft,
  SearchX,
} from "lucide-react";

type NotFoundStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
};

export default function NotFoundState({
  eyebrow = "404",
  title,
  description,
  href,
  linkLabel,
}: NotFoundStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 py-12 text-zinc-100">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-zinc-300">
          <SearchX
            aria-hidden="true"
            size={24}
          />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
          {eyebrow}
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {title}
        </h1>

        <p className="mt-4 max-w-lg text-sm leading-7 text-zinc-400 sm:text-base">
          {description}
        </p>

        <Link
          href={href}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          <ArrowLeft
            aria-hidden="true"
            size={17}
          />
          {linkLabel}
        </Link>
      </div>
    </main>
  );
}
