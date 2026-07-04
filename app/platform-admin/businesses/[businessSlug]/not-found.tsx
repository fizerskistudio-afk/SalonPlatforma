import Link from "next/link";

import {
  ArrowLeft,
  Building2,
} from "lucide-react";

export default function BusinessManagementNotFound() {
  return (
    <div
      className="
        mx-auto
        flex
        min-h-[60vh]
        max-w-2xl
        items-center
        justify-center
      "
    >
      <section
        className="
          w-full
          rounded-3xl
          border
          border-white/10
          bg-white/[0.03]
          p-7
          text-center
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
            border-amber-300/20
            bg-amber-300/10
            text-amber-200
          "
        >
          <Building2
            size={26}
          />
        </div>

        <h2
          className="
            mt-6
            text-2xl
            font-semibold
          "
        >
          Salon nije pronađen
        </h2>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-zinc-500
          "
        >
          Tenant ne postoji ili prosleđeni slug nije ispravan.
        </p>

        <Link
          href="/platform-admin/businesses"
          className="
            mt-6
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-white
            px-4
            py-2.5
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

          Nazad na salone
        </Link>
      </section>
    </div>
  );
}
