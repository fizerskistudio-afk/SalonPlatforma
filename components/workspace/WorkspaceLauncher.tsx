import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Boxes,
  Building2,
  ExternalLink,
  Grid2X2,
  Landmark,
  LockKeyhole,
  Scissors,
  Settings2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import type {
  WorkspaceContext,
} from "@/lib/workspace/context";
import type {
  WorkspaceAppIconKey,
  WorkspaceAppVisibilityDecision,
  WorkspaceAppVisibilityReason,
  WorkspaceMemberRole,
} from "@/lib/workspace-apps/types";

type WorkspaceLauncherProps = {
  workspace:
    WorkspaceContext;
};

const roleLabels:
  Record<
    WorkspaceMemberRole,
    string
  > = {
    owner: "Vlasnik",
    manager: "Menadžer",
    staff: "Član tima",
  };

const appIconMap:
  Record<
    WorkspaceAppIconKey,
    LucideIcon
  > = {
    studio:
      Scissors,
    content:
      BookOpenText,
    finance:
      Landmark,
    operations:
      Settings2,
    store:
      Boxes,
  };

const lockedReasonCopy:
  Partial<
    Record<
      WorkspaceAppVisibilityReason,
      string
    >
  > = {
    package:
      "Ova aplikacija nije uključena u aktivni paket salona.",
    dependency:
      "Pre ove aplikacije mora biti dostupna njena osnovna zavisnost.",
    managed_beta:
      "Aplikacija je u kontrolisanoj beta fazi i još nije aktivirana za ovaj salon.",
    coming_soon:
      "Pripremamo prvi novi Workspace modul. Biće dostupan kada stvarni tok bude spreman.",
    research:
      "Modul je još u fazi istraživanja i nije predstavljen kao gotova funkcija.",
  };

function getStatusLabel(
  decision:
    WorkspaceAppVisibilityDecision
): string {
  if (
    decision.state ===
    "available"
  ) {
    return "LIVE";
  }

  switch (
    decision.reason
  ) {
    case "coming_soon":
      return "USKORO";
    case "managed_beta":
      return "BETA";
    case "package":
      return "PAKET";
    default:
      return "ZAKLJUČANO";
  }
}

function getLockedCopy(
  decision:
    WorkspaceAppVisibilityDecision
): string {
  return (
    lockedReasonCopy[
      decision.reason
    ] ??
    "Ova aplikacija trenutno nije dostupna za aktivni Workspace kontekst."
  );
}

function WorkspaceAppCard({
  decision,
}: {
  decision:
    WorkspaceAppVisibilityDecision;
}) {
  const Icon =
    appIconMap[
      decision.app.iconKey
    ];

  const route =
    decision.state ===
    "available"
      ? decision.route
      : null;

  const available =
    route !== null;

  return (
    <article
      className={`group relative flex min-h-80 flex-col overflow-hidden rounded-[2rem] border p-6 transition sm:p-7 ${
        available
          ? "border-amber-300/25 bg-gradient-to-br from-amber-300/[0.11] via-white/[0.045] to-white/[0.02] shadow-2xl shadow-amber-300/[0.04] hover:-translate-y-1 hover:border-amber-300/40"
          : "border-white/[0.08] bg-white/[0.035]"
      }`}
    >
      <div
        className={`absolute -right-14 -top-14 h-40 w-40 rounded-full blur-3xl ${
          available
            ? "bg-amber-300/15"
            : "bg-violet-300/[0.07]"
        }`}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            available
              ? "bg-amber-300 text-zinc-950 shadow-lg shadow-amber-300/10"
              : "border border-white/10 bg-white/[0.04] text-zinc-500"
          }`}
        >
          <Icon
            className="h-6 w-6"
            aria-hidden="true"
          />
        </div>

        <span
          className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] ${
            available
              ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
              : "border-white/10 bg-white/[0.04] text-zinc-500"
          }`}
        >
          {getStatusLabel(
            decision
          )}
        </span>
      </div>

      <div className="relative mt-8 flex-1">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Ordum aplikacija
        </div>

        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {decision.app.name}
        </h2>

        <p className="mt-4 text-sm leading-7 text-zinc-400">
          {decision.app.description}
        </p>

        {!available ? (
          <p className="mt-4 text-xs leading-6 text-zinc-600">
            {getLockedCopy(
              decision
            )}
          </p>
        ) : null}
      </div>

      <div className="relative mt-8">
        {route ? (
          <Link
            href={
              route
            }
            className="inline-flex min-h-12 w-full items-center justify-between rounded-2xl bg-amber-300 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            <span>
              Otvori{" "}
              {
                decision.app
                  .shortName
              }
            </span>

            <ArrowRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        ) : (
          <div
            className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 text-sm font-medium text-zinc-600"
            aria-disabled="true"
          >
            <span>
              Trenutno nedostupno
            </span>

            <LockKeyhole
              className="h-4 w-4"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </article>
  );
}

export default function WorkspaceLauncher({
  workspace,
}: WorkspaceLauncherProps) {
  const workspaceHref =
    `/workspace?context=${workspace.identityKind}`;

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div
        className="absolute inset-0 bg-gradient-to-br from-amber-300/[0.07] via-transparent to-violet-300/[0.06]"
        aria-hidden="true"
      />

      <div
        className="absolute -left-48 top-24 h-96 w-96 rounded-full bg-amber-300/[0.08] blur-3xl"
        aria-hidden="true"
      />

      <div
        className="absolute -right-48 bottom-0 h-96 w-96 rounded-full bg-violet-300/[0.07] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 backdrop-blur-xl sm:px-5">
          <Link
            href={
              workspaceHref
            }
            className="flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
              <Grid2X2
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <div className="truncate font-semibold">
                Ordum Workspace
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                Business application hub
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {workspace.tenantCount >
            1 ? (
              <Link
                href="/admin/select-business"
                className="hidden min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.08] hover:text-white sm:inline-flex"
              >
                <Building2
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Promeni salon
              </Link>
            ) : null}

            <a
              href={
                workspace.business
                  .publicUrl
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300 sm:w-auto sm:gap-2 sm:px-3"
              aria-label="Otvori javni sajt salona"
            >
              <span className="hidden text-xs font-medium sm:inline">
                Javni sajt
              </span>

              <ExternalLink
                className="h-4 w-4"
                aria-hidden="true"
              />
            </a>
          </div>
        </header>

        <section className="pb-10 pt-14 sm:pt-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
              <Sparkles
                className="h-4 w-4"
                aria-hidden="true"
              />
              {
                workspace.business
                  .name
              }
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Jedan prostor za
              <span className="text-amber-300">
                {" "}
                poslovne aplikacije
              </span>
              .
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
              Otvori samo module koji su stvarno
              dostupni tvojoj ulozi i aktivnom
              paketu. Postojeći Studio ostaje
              nepromenjen — Workspace je siguran
              ulaz, ne novi paralelni sistem.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-zinc-400">
                {
                  roleLabels[
                    workspace.role
                  ]
                }
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-zinc-500">
                {
                  workspace.displayName
                }
              </span>

              {workspace.email ? (
                <span className="max-w-full truncate rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-zinc-600">
                  {
                    workspace.email
                  }
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <section
          className="grid gap-5 pb-16 md:grid-cols-2 xl:grid-cols-3"
          aria-label="Workspace aplikacije"
        >
          {workspace.apps.map(
            (decision) => (
              <WorkspaceAppCard
                key={
                  decision.app.key
                }
                decision={
                  decision
                }
              />
            )
          )}
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/[0.07] py-6 text-xs leading-6 text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Ordum Workspace prikazuje samo
            dozvoljene i pošteno označene
            aplikacije.
          </span>

          <span>
            Aktivni salon:{" "}
            {
              workspace.business
                .slug
            }
          </span>
        </footer>
      </div>
    </main>
  );
}
