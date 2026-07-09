"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BadgeCheck,
  Check,
  Copy,
  KeyRound,
  Link2,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Unlink,
  UserPlus,
} from "lucide-react";

import type {
  BusinessMemberEmployeeOption,
  BusinessMemberItem,
} from "@/lib/admin/member-types";

import type {
  DirectMemberRole,
} from "@/lib/admin/member-credentials/types";

type StaffAccessManagerProps = {
  members: BusinessMemberItem[];
  employees: BusinessMemberEmployeeOption[];
  canManage: boolean;
};

type ApiResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
  delivery?: string;
  credentials?: {
    email: string;
    temporaryPassword: string;
    loginPath: string;
    memberId: string;
    role: DirectMemberRole;
  };
};

type VisibleCredentials =
  NonNullable<
    ApiResponse["credentials"]
  >;

const selectClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition hover:border-white/20 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20 disabled:cursor-not-allowed disabled:opacity-60";

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20 disabled:cursor-not-allowed disabled:opacity-60";

export default function StaffAccessManager({
  members,
  employees,
  canManage,
}: StaffAccessManagerProps) {
  const router = useRouter();

  const directMembers =
    members.filter(
      (member) =>
        member.role === "manager" ||
        member.role === "staff"
    );

  const staffMembers =
    members.filter(
      (member) =>
        member.role === "staff"
    );

  const [
    credentialEmail,
    setCredentialEmail,
  ] = useState("");

  const [
    credentialRole,
    setCredentialRole,
  ] = useState<DirectMemberRole>(
    "manager"
  );

  const [
    credentialEmployeeId,
    setCredentialEmployeeId,
  ] = useState("");

  const [
    credentialPending,
    setCredentialPending,
  ] = useState(false);

  const [
    resettingMemberId,
    setResettingMemberId,
  ] = useState<string | null>(null);

  const [
    visibleCredentials,
    setVisibleCredentials,
  ] = useState<VisibleCredentials | null>(null);

  const [
    copiedKey,
    setCopiedKey,
  ] = useState<string | null>(null);

  const [
    credentialMessage,
    setCredentialMessage,
  ] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [
    pendingMemberId,
    setPendingMemberId,
  ] = useState<string | null>(null);

  const [
    linkMessage,
    setLinkMessage,
  ] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function readResponse(
    response: Response
  ): Promise<ApiResponse> {
    try {
      return await response.json() as ApiResponse;
    } catch {
      return {};
    }
  }

  async function createCredentials(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!canManage) {
      return;
    }

    if (
      credentialRole === "staff" &&
      !credentialEmployeeId
    ) {
      setCredentialMessage({
        type: "error",
        text:
          "Izaberi zaposlenog za staff nalog.",
      });
      return;
    }

    setCredentialPending(true);
    setCredentialMessage(null);
    setVisibleCredentials(null);

    try {
      const response = await fetch(
        "/api/admin/member-credentials",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            action:
              "create_member",
            email:
              credentialEmail,
            role:
              credentialRole,
            employeeId:
              credentialRole === "staff"
                ? credentialEmployeeId
                : null,
          }),
        }
      );

      const payload =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        !payload.ok
      ) {
        throw new Error(
          payload.message ??
            "Kredencijali nisu kreirani."
        );
      }

      setCredentialEmail("");
      setCredentialEmployeeId("");
      setVisibleCredentials(
        payload.credentials ??
          null
      );
      setCredentialMessage({
        type: "success",
        text:
          payload.message ??
          "Član je povezan.",
      });
      router.refresh();
    } catch (error) {
      setCredentialMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Kredencijali nisu kreirani.",
      });
    } finally {
      setCredentialPending(false);
    }
  }

  async function resetCredentials(
    member: BusinessMemberItem
  ) {
    if (!canManage) {
      return;
    }

    const confirmed =
      window.confirm(
        `Generisati novu privremenu lozinku za ${member.email ?? "ovaj nalog"}? Postojeća lozinka odmah prestaje da važi.`
      );

    if (!confirmed) {
      return;
    }

    setResettingMemberId(
      member.id
    );
    setCredentialMessage(null);
    setVisibleCredentials(null);

    try {
      const response = await fetch(
        "/api/admin/member-credentials",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            action:
              "reset_member_password",
            memberId:
              member.id,
          }),
        }
      );

      const payload =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        !payload.ok ||
        !payload.credentials
      ) {
        throw new Error(
          payload.message ??
            "Privremena lozinka nije generisana."
        );
      }

      setVisibleCredentials(
        payload.credentials
      );
      setCredentialMessage({
        type: "success",
        text:
          payload.message ??
          "Privremena lozinka je generisana.",
      });
    } catch (error) {
      setCredentialMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Privremena lozinka nije generisana.",
      });
    } finally {
      setResettingMemberId(
        null
      );
    }
  }

  async function copyValue(
    value: string,
    key: string
  ) {
    try {
      await navigator.clipboard.writeText(
        value
      );
      setCopiedKey(key);
      window.setTimeout(
        () =>
          setCopiedKey(null),
        1600
      );
    } catch {
      setCredentialMessage({
        type: "error",
        text:
          "Vrednost nije mogla automatski da se kopira.",
      });
    }
  }

  async function updateLink(
    member: BusinessMemberItem,
    employeeId: string | null
  ) {
    if (!canManage) {
      return;
    }

    setPendingMemberId(member.id);
    setLinkMessage(null);

    try {
      const response = await fetch(
        "/api/admin/staff-links",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            memberId: member.id,
            employeeId,
            expectedUpdatedAt:
              member.updatedAt,
          }),
        }
      );

      const payload =
        await readResponse(
          response
        );

      if (!response.ok || !payload.ok) {
        setLinkMessage({
          type: "error",
          text:
            payload.message ??
            "Veza nije sačuvana.",
        });
        return;
      }

      setLinkMessage({
        type: "success",
        text:
          payload.message ??
          "Staff pristup je povezan.",
      });
      router.refresh();
    } catch (error) {
      console.error(
        "Unable to update staff employee link:",
        error
      );

      setLinkMessage({
        type: "error",
        text:
          "Došlo je do greške pri povezivanju sa serverom.",
      });
    } finally {
      setPendingMemberId(null);
    }
  }

  const loginUrl =
    visibleCredentials &&
    typeof window !== "undefined"
      ? new URL(
          visibleCredentials.loginPath,
          window.location.origin
        ).toString()
      : visibleCredentials
        ?.loginPath ??
        "";

  return (
    <section className="space-y-6 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-amber-300/15 bg-gradient-to-br from-amber-300/[0.08] to-white/[0.02] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200">
            <KeyRound
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              Direktni manager i staff kredencijali
            </h3>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-500">
              Kreiraj nalog bez email aktivacije. Privremena lozinka se prikazuje samo jednom, a korisnik je mora promeniti pri prvoj prijavi.
            </p>
          </div>
        </div>

        {credentialMessage ? (
          <StatusMessage
            type={
              credentialMessage.type
            }
            text={
              credentialMessage.text
            }
          />
        ) : null}

        {visibleCredentials ? (
          <div className="mt-5 rounded-2xl border border-amber-300/25 bg-zinc-950/70 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
              <ShieldCheck className="h-4 w-4" />
              Jednokratni prikaz kredencijala
            </div>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Kopiraj podatke sada. Posle zatvaranja ili nove akcije privremenu lozinku više ne možemo prikazati.
            </p>

            <div className="mt-4 grid gap-3">
              <CredentialRow
                label="Email"
                value={
                  visibleCredentials.email
                }
                copied={
                  copiedKey === "email"
                }
                onCopy={() =>
                  void copyValue(
                    visibleCredentials.email,
                    "email"
                  )
                }
              />

              <CredentialRow
                label="Privremena lozinka"
                value={
                  visibleCredentials.temporaryPassword
                }
                copied={
                  copiedKey === "password"
                }
                onCopy={() =>
                  void copyValue(
                    visibleCredentials.temporaryPassword,
                    "password"
                  )
                }
              />

              <CredentialRow
                label="Login URL"
                value={loginUrl}
                copied={
                  copiedKey === "login"
                }
                onCopy={() =>
                  void copyValue(
                    loginUrl,
                    "login"
                  )
                }
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() =>
                  void copyValue(
                    [
                      "Pristup Salon Platformi",
                      `Uloga: ${
                        visibleCredentials.role === "manager"
                          ? "Menadžer"
                          : "Zaposleni"
                      }`,
                      `Email: ${visibleCredentials.email}`,
                      `Privremena lozinka: ${visibleCredentials.temporaryPassword}`,
                      `Login: ${loginUrl}`,
                      "",
                      "Pri prvoj prijavi potrebno je postaviti novu lozinku.",
                    ].join("\n"),
                    "all"
                  )
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                {copiedKey === "all" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedKey === "all"
                  ? "Sve kopirano"
                  : "Kopiraj sve"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setVisibleCredentials(
                    null
                  )
                }
                className="text-xs font-semibold text-zinc-500 transition hover:text-zinc-200"
              >
                Sakrij kredencijale
              </button>
            </div>
          </div>
        ) : null}

        {canManage ? (
          <form
            onSubmit={
              createCredentials
            }
            className="mt-6 grid gap-4 xl:grid-cols-[1fr_200px_260px_auto] xl:items-end"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">
                Email adresa
              </span>
              <input
                type="email"
                value={credentialEmail}
                onChange={(event) =>
                  setCredentialEmail(
                    event.target.value
                  )
                }
                required
                maxLength={254}
                disabled={credentialPending}
                placeholder="korisnik@salon.rs"
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">
                Uloga
              </span>
              <select
                value={credentialRole}
                onChange={(event) => {
                  const role =
                    event.target.value as DirectMemberRole;
                  setCredentialRole(role);
                  if (role === "manager") {
                    setCredentialEmployeeId("");
                  }
                }}
                disabled={credentialPending}
                className={selectClassName}
              >
                <option value="manager">
                  Menadžer
                </option>
                <option value="staff">
                  Zaposleni
                </option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">
                Staff veza
              </span>
              <select
                value={credentialEmployeeId}
                onChange={(event) =>
                  setCredentialEmployeeId(
                    event.target.value
                  )
                }
                required={
                  credentialRole === "staff"
                }
                disabled={
                  credentialPending ||
                  credentialRole !== "staff"
                }
                className={selectClassName}
              >
                <option value="">
                  {credentialRole === "staff"
                    ? "— Izaberi zaposlenog —"
                    : "Nije potrebno za managera"}
                </option>
                {employees.map(
                  (employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                      disabled={!employee.isActive}
                    >
                      {employee.name}
                      {employee.isActive
                        ? ""
                        : " (neaktivan)"}
                    </option>
                  )
                )}
              </select>
            </label>

            <button
              type="submit"
              disabled={credentialPending}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {credentialPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Kreiraj kredencijale
            </button>
          </form>
        ) : (
          <div className="mt-5 rounded-2xl border border-sky-300/15 bg-sky-300/[0.07] px-4 py-3 text-sm text-sky-200">
            Menadžer vidi naloge, ali samo vlasnik može kreirati ili resetovati kredencijale.
          </div>
        )}

        {directMembers.length > 0 ? (
          <div className="mt-6 grid gap-3">
            {directMembers.map(
              (member) => {
                const resetting =
                  resettingMemberId ===
                  member.id;

                const resetBlocked =
                  !member.isActive ||
                  (
                    member.role === "staff" &&
                    !member.employeeId
                  );

                return (
                  <article
                    key={member.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-black/15 p-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-zinc-100">
                        {member.email ??
                          "Email nije dostupan"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {member.role === "manager"
                          ? "Manager · /admin"
                          : member.employeeName
                            ? `Staff · ${member.employeeName} · /staff`
                            : "Staff · nije povezan sa zaposlenim"}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        !canManage ||
                        resetting ||
                        resetBlocked
                      }
                      onClick={() =>
                        void resetCredentials(
                          member
                        )
                      }
                      title={
                        member.role === "staff" &&
                        !member.employeeId
                          ? "Prvo poveži staff nalog sa zaposlenim."
                          : undefined
                      }
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {resetting ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Resetuj lozinku
                    </button>
                  </article>
                );
              }
            )}
          </div>
        ) : null}

        <p className="mt-4 text-xs leading-5 text-zinc-600">
          Postojeći Supabase korisnik se samo povezuje sa salonom i njegova lozinka se ne menja. Reset je blokiran za nalog koji je aktivan i u drugom salonu.
        </p>
      </div>

      <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-300/10 text-violet-200">
            <Link2
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              Staff pristup
            </h3>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-500">
              Svaki staff nalog mora biti povezan sa tačno jednim zaposlenim. Tek tada korisnik vidi sopstveni raspored, rezervacije i zahteve za odsustvo.
            </p>
          </div>
        </div>

        {linkMessage ? (
          <StatusMessage
            type={
              linkMessage.type
            }
            text={
              linkMessage.text
            }
          />
        ) : null}

        {staffMembers.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-zinc-600">
            Još nema članova sa staff ulogom.
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {staffMembers.map((member) => {
              const pending =
                pendingMemberId === member.id;

              return (
                <article
                  key={member.id}
                  className="grid gap-4 rounded-2xl border border-white/[0.07] bg-black/15 p-4 lg:grid-cols-[1fr_320px_auto] lg:items-end"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-zinc-100">
                      {member.email ??
                        "Email nije dostupan"}
                    </div>

                    <div className="mt-1 text-xs text-zinc-600">
                      {member.employeeName
                        ? `Povezan sa: ${member.employeeName}`
                        : "Nije povezan sa zaposlenim"}
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Zaposleni
                    </span>

                    <select
                      value={member.employeeId ?? ""}
                      disabled={!canManage || pending}
                      onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        void updateLink(
                          member,
                          event.target.value || null
                        )
                      }
                      className={selectClassName}
                    >
                      <option value="">
                        — Nije povezano —
                      </option>

                      {employees.map((employee) => (
                        <option
                          key={employee.id}
                          value={employee.id}
                          disabled={!employee.isActive}
                        >
                          {employee.name}
                          {employee.isActive
                            ? ""
                            : " (neaktivan)"}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    disabled={
                      !canManage ||
                      pending ||
                      !member.employeeId
                    }
                    onClick={() =>
                      void updateLink(
                        member,
                        null
                      )
                    }
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {pending ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Unlink className="h-4 w-4" />
                    )}

                    Odveži
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {!canManage && (
          <div className="mt-5 rounded-2xl border border-sky-300/15 bg-sky-300/[0.07] px-4 py-3 text-sm text-sky-200">
            Menadžer može da vidi staff veze, ali samo vlasnik može da ih menja.
          </div>
        )}
      </div>
    </section>
  );
}

function StatusMessage({
  type,
  text,
}: {
  type: "success" | "error";
  text: string;
}) {
  return (
    <div
      role="status"
      className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
        type === "success"
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
          : "border-red-400/20 bg-red-400/10 text-red-200"
      }`}
    >
      {type === "success" ? (
        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{text}</span>
    </div>
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
    <div className="grid gap-2 rounded-xl border border-white/[0.07] bg-black/20 p-3 sm:grid-cols-[130px_1fr_auto] sm:items-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
        {label}
      </span>
      <code className="break-all text-sm text-zinc-200">
        {value}
      </code>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-semibold text-zinc-400 transition hover:text-white"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-300" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied
          ? "Kopirano"
          : "Kopiraj"}
      </button>
    </div>
  );
}
