import type {
  Metadata,
} from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldX,
} from "lucide-react";

export const metadata:
  Metadata = {
    title:
      "Nedovoljna ovlašćenja",
  };

export default function PlatformAdminDeniedPage() {
  return (
    <section className="mx-auto max-w-2xl rounded-[2rem] border border-amber-300/20 bg-white/[0.03] p-7 sm:p-9">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200">
        <ShieldX
          className="h-6 w-6"
          aria-hidden="true"
        />
      </div>

      <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
        Pristup ograničen
      </p>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Tvoja platformska rola nema dozvolu za ovu oblast.
      </h1>

      <p className="mt-4 max-w-xl leading-7 text-zinc-400">
        Pristup platform-admin panelu je aktivan, ali ova akcija zahteva dodatnu capability dozvolu.
      </p>

      <Link
        href="/platform-admin"
        className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
      >
        <ArrowLeft
          className="h-4 w-4"
          aria-hidden="true"
        />

        Nazad na pregled
      </Link>
    </section>
  );
}
