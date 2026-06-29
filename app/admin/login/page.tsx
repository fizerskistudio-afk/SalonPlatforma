import type {
  Metadata,
} from "next";
import { redirect } from "next/navigation";
import {
  CalendarCheck2,
  Scissors,
  ShieldCheck,
  Users,
} from "lucide-react";

import { getAdminContext } from "@/lib/auth/admin";

import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin prijava",
  description:
    "Prijava u salon administraciju.",
};

const features = [
  {
    icon: CalendarCheck2,
    title: "Rezervacije",
    description:
      "Pregledaj i upravljaj svim terminima na jednom mestu.",
  },
  {
    icon: Users,
    title: "Klijenti i tim",
    description:
      "Prati klijente, zaposlene i njihove usluge.",
  },
  {
    icon: ShieldCheck,
    title: "Bezbedan pristup",
    description:
      "Administracija je dostupna samo ovlašćenim članovima.",
  },
];

export default async function AdminLoginPage() {
  const existingAdmin =
    await getAdminContext();

  if (existingAdmin) {
    redirect("/admin");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div
        className="absolute inset-0 bg-gradient-to-br from-amber-300/10 via-transparent to-rose-300/5"
        aria-hidden="true"
      />

      <div
        className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden flex-col justify-between px-12 py-14 lg:flex xl:px-20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
              <Scissors
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div>
              <div className="text-lg font-semibold">
                Salon Platform
              </div>

              <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                Business dashboard
              </div>
            </div>
          </div>

          <div className="max-w-xl">
            <div className="mb-5 inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Premium salon management
            </div>

            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">
              Tvoj salon.
              <br />

              <span className="text-amber-300">
                Potpuna kontrola.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400">
              Upravljaj rezervacijama,
              klijentima, uslugama i
              zaposlenima iz jednog
              preglednog sistema.
            </p>

            <div className="mt-10 grid gap-4">
              {features.map(
                (feature) => {
                  const Icon =
                    feature.icon;

                  return (
                    <div
                      key={
                        feature.title
                      }
                      className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-amber-300">
                        <Icon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </div>

                      <div>
                        <div className="font-medium text-zinc-100">
                          {
                            feature.title
                          }
                        </div>

                        <div className="mt-1 text-sm leading-relaxed text-zinc-500">
                          {
                            feature.description
                          }
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="text-sm text-zinc-600">
            © {new Date().getFullYear()}{" "}
            Salon Platform
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:border-l lg:border-white/[0.07]">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
                <Scissors
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <div className="font-semibold">
                  Salon Platform
                </div>

                <div className="text-xs text-zinc-500">
                  Business dashboard
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="mb-8">
                <div className="mb-3 text-sm font-medium text-amber-300">
                  Dobrodošli nazad
                </div>

                <h2 className="text-3xl font-semibold tracking-tight">
                  Prijava u administraciju
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                  Unesi administratorski
                  email i lozinku povezanu
                  sa salon nalogom.
                </p>
              </div>

              <LoginForm />
            </div>

            <p className="mt-6 text-center text-xs leading-relaxed text-zinc-600">
              Pristup je dozvoljen samo
              vlasnicima i menadžerima
              aktivnog salona.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}