import type { Metadata } from "next";

import {
  buildTenantPublicUrl,
} from "@/lib/tenancy/hostname";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title:
    "Beauty business platform — demo",
  description:
    "Demo ulaz za multi-tenant platformu za beauty i wellness biznise.",
};

const demoBusinesses = [
  {
    name: "Lumière Studio",
    slug: "lumiere-studio",
    type: "Hair & beauty salon",
    description:
      "Luxury demo sa online rezervacijama, timom, uslugama i galerijom.",
  },
  {
    name: "Mika Berberin",
    slug: "mika-berberin",
    type: "Barbershop",
    description:
      "Barber demo tenant sa sopstvenim katalogom, zaposlenim i booking tokom.",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-12 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
            Platform demo
          </p>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
            Jedna platforma. Poseban sajt i poslovni prostor za svaki beauty biznis.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            Ova stranica je privremeni funkcionalni demo hub. Finalni identitet i dizajn radićemo kroz odobren Qwen koncept nakon potvrde routing osnove.
          </p>
        </header>

        <section className="mt-12 grid gap-5 md:grid-cols-2">
          {demoBusinesses.map(
            (business) => (
              <article
                key={business.slug}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {business.type}
                </p>

                <h2 className="mt-3 text-2xl font-semibold">
                  {business.name}
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {business.description}
                </p>

                <a
                  href={buildTenantPublicUrl(
                    business.slug
                  )}
                  className="mt-7 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                >
                  Otvori demo sajt
                </a>
              </article>
            )
          )}
        </section>

        <section className="mt-10 rounded-3xl border border-dashed border-white/15 p-6 text-sm leading-6 text-zinc-400">
          <strong className="text-zinc-200">
            Trenutna faza:
          </strong>{" "}
          potvrđujemo tenant poddomene i odvajamo glavni domen platforme od javnih sajtova salona. Owner pristup za Miku dolazi u sledećem, zasebnom bezbednosnom paketu.
        </section>
      </div>
    </main>
  );
}
