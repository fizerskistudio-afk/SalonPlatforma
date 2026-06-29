import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Database,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";

const systemCards = [
  {
    title: "Admin pristup",
    value: "Aktivan",
    description:
      "Supabase Auth i poslovno članstvo su povezani.",
    icon: ShieldCheck,
    iconClass:
      "bg-emerald-400/10 text-emerald-300",
  },
  {
    title: "Katalog salona",
    value: "Povezan",
    description:
      "Usluge, zaposleni i podešavanja dolaze iz baze.",
    icon: Database,
    iconClass:
      "bg-blue-400/10 text-blue-300",
  },
  {
    title: "Booking sistem",
    value: "Online",
    description:
      "Dostupnost i kreiranje rezervacija funkcionišu.",
    icon: CalendarDays,
    iconClass:
      "bg-purple-400/10 text-purple-300",
  },
  {
    title: "Email sistem",
    value: "Sledeći korak",
    description:
      "Resend potvrde dodajemo nakon admin funkcija.",
    icon: Mail,
    iconClass:
      "bg-amber-300/10 text-amber-300",
  },
];

export default async function AdminDashboardPage() {
  const admin =
    await requireAdmin();

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.07] via-white/[0.035] to-amber-300/[0.04] p-6 shadow-2xl sm:p-8 lg:p-10">
        <div
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-purple-400/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
            <Sparkles
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />

            Admin Panel v1
          </div>

          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Dobrodošao u{" "}
            <span className="text-amber-300">
              {admin.business.name}
            </span>
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Bezbedan admin temelj je
            završen. Sledeće povezujemo
            pravi pregled rezervacija,
            statistike, klijente i
            upravljanje katalogom.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-300">
              <CheckCircle2
                className="h-4 w-4"
                aria-hidden="true"
              />

              Zaštićena sesija
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.09] hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              Pogledaj javni sajt

              <ArrowUpRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
              Status platforme
            </div>

            <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              Sistemske komponente
            </h3>
          </div>

          <LayoutDashboard
            className="h-5 w-5 text-zinc-700"
            aria-hidden="true"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {systemCards.map(
            (card) => {
              const Icon =
                card.icon;

              return (
                <article
                  key={card.title}
                  className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]"
                >
                  <div
                    className={`mb-6 flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconClass}`}
                  >
                    <Icon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="text-sm text-zinc-500">
                    {card.title}
                  </div>

                  <div className="mt-1 text-xl font-semibold text-white">
                    {card.value}
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                    {
                      card.description
                    }
                  </p>
                </article>
              );
            }
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 sm:p-7">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                Sledeća etapa
              </div>

              <h3 className="mt-1 text-xl font-semibold">
                Rezervacije uživo
              </h3>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-300">
              <CalendarDays
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
          </div>

          <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
            Sledeće pravimo stvarne
            dashboard statistike, današnji
            raspored i kompletan ekran za
            upravljanje rezervacijama.
          </p>

          <div className="mt-6 space-y-3">
            {[
              "Današnje i predstojeće rezervacije",
              "Filter po statusu i zaposlenom",
              "Detalji klijenta, usluge i napomene",
              "Promena statusa rezervacije",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-black/10 px-4 py-3"
              >
                <CheckCircle2
                  className="h-4 w-4 flex-shrink-0 text-amber-300"
                  aria-hidden="true"
                />

                <span className="text-sm text-zinc-400">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-amber-300/15 bg-gradient-to-br from-amber-300/10 to-orange-300/[0.03] p-6 sm:p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
            <Sparkles
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <h3 className="mt-6 text-xl font-semibold">
            Premium admin
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Admin više nije privremena
            tehnička stranica. Sada ima
            strukturu pravog proizvoda
            spremnog za dalje module.
          </p>

          <div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/15 p-4">
            <div className="text-xs uppercase tracking-wider text-zinc-600">
              Prijavljena uloga
            </div>

            <div className="mt-1 font-semibold text-amber-200">
              {admin.role ===
              "owner"
                ? "Vlasnik salona"
                : "Menadžer salona"}
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}