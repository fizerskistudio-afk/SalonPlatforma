"use client";

import {
  useState,
} from "react";

import {
  Check,
  ExternalLink,
  LoaderCircle,
  Palette,
  Sparkles,
} from "lucide-react";

import type {
  BusinessThemeData,
  BusinessThemeMutationResponse,
} from "@/lib/platform-admin/business-theme";

import type {
  TemplateKey,
} from "@/lib/templates/registry";

type BusinessThemeManagerProps = {
  initialData:
    BusinessThemeData;
};

export default function BusinessThemeManager({
  initialData,
}: BusinessThemeManagerProps) {
  const [
    selectedKey,
    setSelectedKey,
  ] =
    useState<TemplateKey>(
      initialData
        .business
        .templateKey
    );

  const [
    currentKey,
    setCurrentKey,
  ] =
    useState<TemplateKey>(
      initialData
        .business
        .templateKey
    );

  const [
    updatedAt,
    setUpdatedAt,
  ] =
    useState(
      initialData
        .business
        .updatedAt
    );

  const [
    pending,
    setPending,
  ] =
    useState(
      false
    );

  const [
    message,
    setMessage,
  ] =
    useState<{
      type:
        | "success"
        | "error";
      text:
        string;
    } | null>(
      null
    );

  const hasChanges =
    selectedKey !==
    currentKey;

  async function saveTheme() {
    if (
      !hasChanges ||
      pending
    ) {
      return;
    }

    setPending(
      true
    );

    setMessage(
      null
    );

    try {
      const response =
        await fetch(
          "/api/platform-admin/businesses/theme",
          {
            method:
              "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                businessSlug:
                  initialData
                    .business
                    .slug,
                templateKey:
                  selectedKey,
                expectedUpdatedAt:
                  updatedAt,
              }),
          }
        );

      const payload =
        await response.json() as
          BusinessThemeMutationResponse;

      if (
        !response.ok ||
        !payload.ok ||
        !payload.business
      ) {
        throw new Error(
          payload.message ||
            "Theme pack nije sačuvan."
        );
      }

      setCurrentKey(
        payload
          .business
          .templateKey
      );

      setUpdatedAt(
        payload
          .business
          .updatedAt
      );

      setMessage({
        type:
          "success",
        text:
          payload.message,
      });
    } catch (error) {
      setMessage({
        type:
          "error",
        text:
          error instanceof
            Error
            ? error.message
            : "Theme pack nije sačuvan.",
      });
    } finally {
      setPending(
        false
      );
    }
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div
          role="status"
          className={`rounded-2xl border px-4 py-3 text-sm ${
            message.type ===
            "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
              : "border-rose-400/20 bg-rose-400/10 text-rose-200"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <Palette
                size={18}
              />
              Public theme pack
            </div>

            <h2 className="mt-3 text-2xl font-semibold">
              {initialData
                .business
                .name}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Theme pack menja javni izgled salona. Usluge, zaposleni, termini i booking API ostaju isti.
            </p>
          </div>

          <a
            href={`/salon/${initialData.business.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            <ExternalLink
              size={17}
            />
            Otvori javni profil
          </a>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          {initialData
            .templates
            .map(
              (
                template
              ) => {
                const selected =
                  selectedKey ===
                  template.key;

                const active =
                  currentKey ===
                  template.key;

                return (
                  <button
                    key={
                      template.key
                    }
                    type="button"
                    onClick={() =>
                      setSelectedKey(
                        template.key
                      )
                    }
                    className={`relative min-h-56 rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
                      selected
                        ? "border-amber-300/50 bg-amber-300/10"
                        : "border-white/10 bg-zinc-950/55 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        {
                          template.businessType
                        }
                      </span>

                      {selected ? (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-zinc-950">
                          <Check
                            size={17}
                          />
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-7 text-xl font-semibold">
                      {
                        template.name
                      }
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-zinc-500">
                      {
                        template.description
                      }
                    </p>

                    <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 text-xs">
                      <span
                        className={
                          template.availability ===
                          "live"
                            ? "text-emerald-300"
                            : "text-sky-300"
                        }
                      >
                        {
                          template.availability
                        }
                      </span>

                      {active ? (
                        <span className="font-semibold text-amber-300">
                          Trenutno aktivan
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              }
            )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-zinc-600">
            Promena se primenjuje odmah na javni tenant profil. Lumière ostaje na svom postojećem template-u dok ga ručno ne promenimo.
          </p>

          <button
            type="button"
            onClick={() =>
              void saveTheme()
            }
            disabled={
              !hasChanges ||
              pending
            }
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {pending ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <Palette
                size={17}
              />
            )}

            {pending
              ? "Čuvanje..."
              : "Primeni theme pack"}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
        <div className="flex items-center gap-2 text-sm font-semibold text-violet-300">
          <Sparkles
            size={18}
          />
          Sledeći packovi
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {initialData
            .plannedTemplates
            .map(
              (
                template
              ) => (
                <article
                  key={
                    template.key
                  }
                  className="rounded-2xl border border-dashed border-white/10 bg-zinc-950/40 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    {
                      template.businessType
                    }
                  </p>

                  <h3 className="mt-3 text-lg font-semibold text-zinc-300">
                    {
                      template.name
                    }
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {
                      template.description
                    }
                  </p>
                </article>
              )
            )}
        </div>
      </section>
    </div>
  );
}
