import Link from "next/link";

import {
  ArrowLeft,
  CircleOff,
} from "lucide-react";

export default function PublicSalonNotFound() {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-zinc-950
        px-6
        text-zinc-100
      "
    >
      <section
        className="
          w-full
          max-w-lg
          rounded-3xl
          border
          border-white/10
          bg-white/[0.03]
          p-7
          text-center
          shadow-2xl
          md:p-10
        "
      >
        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            border
            border-red-400/20
            bg-red-400/10
            text-red-300
          "
        >
          <CircleOff
            size={26}
          />
        </div>

        <h1
          className="
            mt-6
            text-3xl
            font-semibold
            tracking-tight
          "
        >
          Salon nije pronađen
        </h1>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-zinc-400
          "
        >
          Javni profil ne postoji, nije
          aktivan ili adresa nije ispravna.
        </p>

        <Link
          href="/"
          className="
            mt-7
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-white
            px-5
            py-3
            text-sm
            font-semibold
            text-zinc-950
            transition
            hover:bg-zinc-200
          "
        >
          <ArrowLeft
            size={17}
          />

          Nazad na početnu
        </Link>
      </section>
    </main>
  );
}