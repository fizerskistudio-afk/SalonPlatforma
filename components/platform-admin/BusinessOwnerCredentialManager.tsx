"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Check,
  Copy,
  KeyRound,
  Mail,
  UserPlus,
} from "lucide-react";

import type {
  BusinessOwnerAccessItem,
} from "@/lib/platform-admin/business-access";

type IssuedCredentials = {
  email: string;
  temporaryPassword: string;
  loginPath: string;
  memberId: string;
};

type CredentialApiResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
  credentials?: IssuedCredentials;
};

type BusinessOwnerCredentialManagerProps = {
  businessSlug: string;
  businessName: string;
  owners:
    BusinessOwnerAccessItem[];
};

async function readApiResponse(
  response: Response
): Promise<CredentialApiResponse> {
  try {
    return await response.json() as
      CredentialApiResponse;
  } catch {
    return {};
  }
}

export default function BusinessOwnerCredentialManager({
  businessSlug,
  businessName,
  owners,
}: BusinessOwnerCredentialManagerProps) {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    selectedMemberId,
    setSelectedMemberId,
  ] =
    useState("");

  const [
    isCreating,
    setIsCreating,
  ] =
    useState(false);

  const [
    isResetting,
    setIsResetting,
  ] =
    useState(false);

  const [
    copiedValue,
    setCopiedValue,
  ] =
    useState<
      string | null
    >(null);

  const [
    issuedCredentials,
    setIssuedCredentials,
  ] =
    useState<
      IssuedCredentials | null
    >(null);

  const [
    feedback,
    setFeedback,
  ] =
    useState<{
      type:
        | "success"
        | "error";
      message: string;
    } | null>(null);

  const resetCandidates =
    useMemo(
      () =>
        owners.filter(
          (owner) =>
            owner.isActive
        ),
      [owners]
    );

  const copyText =
    async (
      label: string,
      value: string
    ) => {
      try {
        await navigator
          .clipboard
          .writeText(
            value
          );

        setCopiedValue(
          label
        );

        window.setTimeout(
          () => {
            setCopiedValue(
              (current) =>
                current === label
                  ? null
                  : current
            );
          },
          1800
        );
      } catch {
        setFeedback({
          type:
            "error",
          message:
            "Vrednost nije mogla automatski da se kopira.",
        });
      }
    };

  const getLoginUrl = (
    credentials:
      IssuedCredentials
  ) =>
    new URL(
      credentials.loginPath,
      window.location.origin
    ).toString();

  const createOwner =
    async (
      event:
        React.FormEvent<
          HTMLFormElement
        >
    ) => {
      event.preventDefault();

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      if (!normalizedEmail) {
        setFeedback({
          type:
            "error",
          message:
            "Unesi owner email adresu.",
        });

        return;
      }

      setIsCreating(
        true
      );
      setFeedback(
        null
      );
      setIssuedCredentials(
        null
      );

      try {
        const response =
          await fetch(
            "/api/platform-admin/businesses/credentials",
            {
              method:
                "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              cache:
                "no-store",
              body:
                JSON.stringify({
                  action:
                    "create_owner",
                  businessSlug,
                  email:
                    normalizedEmail,
                }),
            }
          );

        const payload =
          await readApiResponse(
            response
          );

        if (!response.ok) {
          throw new Error(
            payload.message ??
              "Owner credential nalog nije kreiran."
          );
        }

        setEmail(
          ""
        );

        setIssuedCredentials(
          payload.credentials ??
            null
        );

        setFeedback({
          type:
            "success",
          message:
            payload.message ??
            "Owner pristup je kreiran.",
        });

        router.refresh();
      } catch (error) {
        setFeedback({
          type:
            "error",
          message:
            error instanceof
              Error
              ? error.message
              : "Owner credential nalog nije kreiran.",
        });
      } finally {
        setIsCreating(
          false
        );
      }
    };

  const resetOwnerPassword =
    async () => {
      const owner =
        resetCandidates.find(
          (candidate) =>
            candidate.id ===
            selectedMemberId
        );

      if (!owner) {
        setFeedback({
          type:
            "error",
          message:
            "Izaberi aktivnog ownera.",
        });

        return;
      }

      const ownerLabel =
        owner.email ??
        owner.userId;

      const confirmed =
        window.confirm(
          `Generisati novu privremenu lozinku za ${ownerLabel}? Prethodna lozinka odmah prestaje da važi.`
        );

      if (!confirmed) {
        return;
      }

      setIsResetting(
        true
      );
      setFeedback(
        null
      );
      setIssuedCredentials(
        null
      );

      try {
        const response =
          await fetch(
            "/api/platform-admin/businesses/credentials",
            {
              method:
                "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              cache:
                "no-store",
              body:
                JSON.stringify({
                  action:
                    "reset_owner_password",
                  businessSlug,
                  memberId:
                    owner.id,
                }),
            }
          );

        const payload =
          await readApiResponse(
            response
          );

        if (!response.ok) {
          throw new Error(
            payload.message ??
              "Privremena lozinka nije generisana."
          );
        }

        if (!payload.credentials) {
          throw new Error(
            "Server nije vratio privremene kredencijale."
          );
        }

        setIssuedCredentials(
          payload.credentials
        );

        setFeedback({
          type:
            "success",
          message:
            payload.message ??
            "Privremena lozinka je generisana.",
        });

        router.refresh();
      } catch (error) {
        setFeedback({
          type:
            "error",
          message:
            error instanceof
              Error
              ? error.message
              : "Privremena lozinka nije generisana.",
        });
      } finally {
        setIsResetting(
          false
        );
      }
    };

  return (
    <section className="space-y-5 rounded-3xl border border-amber-300/20 bg-amber-300/[0.04] p-5 md:p-7">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
          <KeyRound
            size={18}
          />
          Direktni credential pristup
        </div>

        <h2 className="mt-3 text-2xl font-semibold">
          Kreiraj owner nalog bez email aktivacije
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Novi korisnik dobija potvrđen nalog, privremenu lozinku i obaveznu promenu lozinke pri prvoj prijavi. Ako email već postoji, sistem samo povezuje postojeći nalog sa salonom {businessName} i ne menja njegovu lozinku.
        </p>
      </div>

      {feedback ? (
        <div
          role="status"
          className={[
            "rounded-2xl",
            "border",
            "px-4",
            "py-3",
            "text-sm",
            feedback.type ===
              "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
              : "border-rose-400/20 bg-rose-400/10 text-rose-200",
          ].join(
            " "
          )}
        >
          {feedback.message}
        </div>
      ) : null}

      {issuedCredentials ? (
        <div className="rounded-2xl border border-emerald-300/25 bg-emerald-300/[0.07] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-emerald-200">
                Privremeni kredencijali — prikazuju se samo sada
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-100/70">
                Kopiraj ih pre zatvaranja ovog panela. Lozinka se ne čuva u bazi aplikacije i neće ponovo biti prikazana.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setIssuedCredentials(
                  null
                )
              }
              className="text-sm font-semibold text-emerald-200 underline underline-offset-4"
            >
              Zatvori
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            <CredentialRow
              label="Email"
              value={
                issuedCredentials.email
              }
              copied={
                copiedValue ===
                "email"
              }
              onCopy={() =>
                copyText(
                  "email",
                  issuedCredentials.email
                )
              }
            />

            <CredentialRow
              label="Privremena lozinka"
              value={
                issuedCredentials.temporaryPassword
              }
              copied={
                copiedValue ===
                "password"
              }
              onCopy={() =>
                copyText(
                  "password",
                  issuedCredentials.temporaryPassword
                )
              }
            />

            <CredentialRow
              label="Admin login"
              value={
                getLoginUrl(
                  issuedCredentials
                )
              }
              copied={
                copiedValue ===
                "login"
              }
              onCopy={() =>
                copyText(
                  "login",
                  getLoginUrl(
                    issuedCredentials
                  )
                )
              }
            />
          </div>

          <button
            type="button"
            onClick={() =>
              copyText(
                "all",
                [
                  `Salon: ${businessName}`,
                  `Email: ${issuedCredentials.email}`,
                  `Privremena lozinka: ${issuedCredentials.temporaryPassword}`,
                  `Login: ${getLoginUrl(issuedCredentials)}`,
                ].join(
                  "\n"
                )
              )
            }
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-100"
          >
            {copiedValue ===
            "all" ? (
              <Check
                size={17}
              />
            ) : (
              <Copy
                size={17}
              />
            )}

            {copiedValue ===
            "all"
              ? "Kopirano"
              : "Kopiraj sve"}
          </button>
        </div>
      ) : null}

      <form
        onSubmit={
          createOwner
        }
        className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-zinc-300">
            Novi owner email
          </span>

          <div className="relative">
            <Mail
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
            />

            <input
              type="email"
              value={email}
              onChange={
                (event) =>
                  setEmail(
                    event.target.value
                  )
              }
              autoComplete="email"
              placeholder="owner@salon.com"
              disabled={
                isCreating ||
                isResetting
              }
              className="min-h-12 w-full rounded-xl border border-white/10 bg-zinc-950/70 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={
            isCreating ||
            isResetting
          }
          className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserPlus
            size={18}
          />

          {isCreating
            ? "Kreiranje..."
            : "Kreiraj kredencijale"}
        </button>
      </form>

      <div className="border-t border-white/10 pt-5">
        <div className="max-w-3xl">
          <h3 className="font-semibold text-zinc-200">
            Eksplicitni reset postojeće owner lozinke
          </h3>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Reset se izvršava samo za tačno izabrani membership ovog salona. Nijedan postojeći owner, uključujući Miku, neće biti resetovan automatski.
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">
              Aktivni owner
            </span>

            <select
              value={
                selectedMemberId
              }
              onChange={
                (event) =>
                  setSelectedMemberId(
                    event.target.value
                  )
              }
              disabled={
                isCreating ||
                isResetting ||
                resetCandidates.length ===
                  0
              }
              className="min-h-12 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                Izaberi owner nalog
              </option>

              {resetCandidates.map(
                (owner) => (
                  <option
                    key={
                      owner.id
                    }
                    value={
                      owner.id
                    }
                  >
                    {owner.email ??
                      owner.userId}
                  </option>
                )
              )}
            </select>
          </label>

          <button
            type="button"
            onClick={
              resetOwnerPassword
            }
            disabled={
              isCreating ||
              isResetting ||
              !selectedMemberId
            }
            className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-rose-300/20 bg-rose-300/10 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-300/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KeyRound
              size={18}
            />

            {isResetting
              ? "Generisanje..."
              : "Generiši novu privremenu lozinku"}
          </button>
        </div>
      </div>
    </section>
  );
}

function CredentialRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="grid gap-2 rounded-xl border border-white/10 bg-zinc-950/60 p-3 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </span>

      <code className="break-all text-sm text-zinc-100">
        {value}
      </code>

      <button
        type="button"
        onClick={onCopy}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
      >
        {copied ? (
          <Check
            size={15}
            className="text-emerald-300"
          />
        ) : (
          <Copy
            size={15}
          />
        )}

        {copied
          ? "Kopirano"
          : "Kopiraj"}
      </button>
    </div>
  );
}
