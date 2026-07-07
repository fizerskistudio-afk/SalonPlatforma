"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";

import {
  BUSINESS_MEMBER_ROLE_LABELS,
  BUSINESS_MEMBER_ROLES,
  type BusinessMemberItem,
  type BusinessMemberRole,
  type BusinessMembersPageData,
} from "@/lib/admin/member-types";

type AdminMembersViewProps = {
  data: BusinessMembersPageData;
};

type ActionMessage = {
  type: "success" | "error";
  text: string;
};

type ApiResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
};

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20 disabled:cursor-not-allowed disabled:opacity-60";

const roleDescriptions:
  Record<BusinessMemberRole, string> = {
    owner:
      "Potpuna kontrola nad salonom, članovima i podešavanjima.",
    manager:
      "Pristup operativnom admin panelu bez upravljanja članovima.",
    staff:
      "Pristup sopstvenom rasporedu, rezervacijama i zahtevima za odsustvo.",
  };

function formatDateTime(
  value: string | null
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "sr-Latn-RS",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

function getAccountState(
  member: BusinessMemberItem
): {
  label: string;
  className: string;
} {
  if (!member.isActive) {
    return {
      label: "Deaktiviran",
      className:
        "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
    };
  }

  if (member.emailConfirmedAt) {
    return {
      label: "Aktivan",
      className:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    };
  }

  return {
    label: "Pozvan",
    className:
      "border-amber-300/20 bg-amber-300/10 text-amber-200",
  };
}

export default function AdminMembersView({
  data,
}: AdminMembersViewProps) {
  const router = useRouter();

  const [
    inviteEmail,
    setInviteEmail,
  ] = useState("");

  const [
    inviteRole,
    setInviteRole,
  ] =
    useState<BusinessMemberRole>(
      "manager"
    );

  const [
    invitePending,
    setInvitePending,
  ] = useState(false);

  const [
    updatingMemberId,
    setUpdatingMemberId,
  ] =
    useState<string | null>(null);

  const [
    message,
    setMessage,
  ] =
    useState<ActionMessage | null>(
      null
    );

  const canManage =
    data.currentUser.role === "owner";

  const activeCount =
    data.members.filter(
      (member) => member.isActive
    ).length;

  const ownerCount =
    data.members.filter(
      (member) =>
        member.isActive &&
        member.role === "owner"
    ).length;

  const pendingCount =
    data.members.filter(
      (member) =>
        member.isActive &&
        !member.emailConfirmedAt
    ).length;

  async function handleInvite(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!canManage) {
      return;
    }

    setInvitePending(true);
    setMessage(null);

    try {
      const response = await fetch(
        "/api/admin/members",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            email: inviteEmail,
            role: inviteRole,
          }),
        }
      );

      const payload =
        (await response.json()) as
          ApiResponse;

      if (
        !response.ok ||
        !payload.ok
      ) {
        setMessage({
          type: "error",
          text:
            payload.message ??
            "Poziv nije poslat.",
        });
        return;
      }

      setInviteEmail("");
      setInviteRole("manager");
      setMessage({
        type: "success",
        text:
          payload.message ??
          "Član je dodat.",
      });

      router.refresh();
    } catch (error) {
      console.error(
        "Unable to invite business member:",
        error
      );

      setMessage({
        type: "error",
        text:
          "Došlo je do greške pri povezivanju sa serverom.",
      });
    } finally {
      setInvitePending(false);
    }
  }

  async function updateMember(
    member: BusinessMemberItem,
    nextRole: BusinessMemberRole,
    nextIsActive: boolean
  ) {
    if (!canManage) {
      return;
    }

    setUpdatingMemberId(
      member.id
    );
    setMessage(null);

    try {
      const response = await fetch(
        "/api/admin/members",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            memberId: member.id,
            role: nextRole,
            isActive: nextIsActive,
            expectedUpdatedAt:
              member.updatedAt,
          }),
        }
      );

      const payload =
        (await response.json()) as
          ApiResponse;

      if (
        !response.ok ||
        !payload.ok
      ) {
        setMessage({
          type: "error",
          text:
            payload.message ??
            "Članstvo nije promenjeno.",
        });
        return;
      }

      setMessage({
        type: "success",
        text:
          payload.message ??
          "Članstvo je promenjeno.",
      });

      router.refresh();
    } catch (error) {
      console.error(
        "Unable to update business member:",
        error
      );

      setMessage({
        type: "error",
        text:
          "Došlo je do greške pri povezivanju sa serverom.",
      });
    } finally {
      setUpdatingMemberId(null);
    }
  }

  return (
    <div className="space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.055] to-white/[0.02]">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center lg:p-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
              <ShieldCheck
                className="h-4 w-4"
                aria-hidden="true"
              />
              Tenant pristup
            </div>

            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Članovi i uloge
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
              Upravljaj korisnicima povezanim sa salonom{" "}
              <span className="font-semibold text-zinc-200">
                {data.business.name}
              </span>
              . Samo aktivni vlasnik može menjati uloge i pristup.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Metric
              value={data.members.length}
              label="Ukupno"
            />
            <Metric
              value={activeCount}
              label="Aktivni"
              valueClassName="text-emerald-300"
            />
            <Metric
              value={pendingCount}
              label="Pozvani"
              valueClassName="text-amber-200"
            />
          </div>
        </div>
      </section>

      {message && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
              : "border-red-400/20 bg-red-400/10 text-red-200"
          }`}
        >
          {message.type ===
          "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}

          <span>{message.text}</span>
        </div>
      )}

      <section className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200">
            <UserPlus
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              Dodaj člana
            </h3>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Novi korisnik dobija Supabase poziv na email. Postojeći nalog se samo povezuje sa ovim salonom.
            </p>
          </div>
        </div>

        {canManage ? (
          <form
            onSubmit={handleInvite}
            className="mt-6 grid gap-4 lg:grid-cols-[1fr_240px_auto] lg:items-end"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">
                Email adresa
              </span>

              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600"
                  aria-hidden="true"
                />

                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setInviteEmail(
                      event.target.value
                    )
                  }
                  required
                  maxLength={254}
                  disabled={invitePending}
                  placeholder="korisnik@salon.rs"
                  className={`${inputClassName} pl-11`}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">
                Uloga
              </span>

              <select
                value={inviteRole}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setInviteRole(
                    event.target.value as
                      BusinessMemberRole
                  )
                }
                disabled={invitePending}
                className={inputClassName}
              >
                {BUSINESS_MEMBER_ROLES.map(
                  (role) => (
                    <option
                      key={role}
                      value={role}
                    >
                      {
                        BUSINESS_MEMBER_ROLE_LABELS[
                          role
                        ]
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            <button
              type="submit"
              disabled={invitePending}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {invitePending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}

              Pošalji poziv
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-2xl border border-sky-300/15 bg-sky-300/[0.07] px-4 py-3 text-sm leading-6 text-sky-200">
            Kao menadžer možeš da vidiš članove, ali samo vlasnik može da šalje pozive i menja uloge.
          </div>
        )}

        {canManage && (
          <div className="mt-4 rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-3 text-xs leading-6 text-zinc-500">
            Staff nalog koristi poseban /staff dashboard i nema pristup owner/manager admin panelu. Nakon poziva poveži nalog sa zaposlenim u sekciji Staff pristup.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              Članovi salona
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Aktivnih vlasnika: {ownerCount}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs text-zinc-500">
            <UsersRound className="h-4 w-4" />
            {data.members.length}
          </div>
        </div>

        <div className="grid gap-4">
          {data.members.map(
            (member) => {
              const accountState =
                getAccountState(member);

              const isCurrentUser =
                member.userId ===
                data.currentUser.id;

              const isUpdating =
                updatingMemberId ===
                member.id;

              return (
                <article
                  key={member.id}
                  className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6"
                >
                  <div className="grid gap-6 xl:grid-cols-[1fr_260px_170px] xl:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="truncate font-semibold text-zinc-100">
                          {member.email ??
                            "Email nije dostupan"}
                        </h4>

                        {isCurrentUser && (
                          <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-200">
                            Ti
                          </span>
                        )}

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${accountState.className}`}
                        >
                          {accountState.label}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-zinc-500">
                        {
                          roleDescriptions[
                            member.role
                          ]
                        }
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5" />
                          Dodat:{" "}
                          {formatDateTime(
                            member.createdAt
                          )}
                        </span>
                        <span>
                          Poslednja prijava:{" "}
                          {formatDateTime(
                            member.lastSignInAt
                          )}
                        </span>
                      </div>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Uloga
                      </span>

                      <select
                        value={member.role}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                          void updateMember(
                            member,
                            event.target
                              .value as
                              BusinessMemberRole,
                            member.isActive
                          )
                        }
                        disabled={
                          !canManage ||
                          isUpdating
                        }
                        className={inputClassName}
                      >
                        {BUSINESS_MEMBER_ROLES.map(
                          (role) => (
                            <option
                              key={role}
                              value={role}
                            >
                              {
                                BUSINESS_MEMBER_ROLE_LABELS[
                                  role
                                ]
                              }
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        void updateMember(
                          member,
                          member.role,
                          !member.isActive
                        )
                      }
                      disabled={
                        !canManage ||
                        isUpdating
                      }
                      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 ${
                        member.isActive
                          ? "border-red-400/20 bg-red-400/10 text-red-200 hover:bg-red-400/15"
                          : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15"
                      }`}
                    >
                      {isUpdating && (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      )}
                      {member.isActive
                        ? "Deaktiviraj"
                        : "Aktiviraj"}
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({
  value,
  label,
  valueClassName = "",
}: {
  value: number;
  label: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-center">
      <div
        className={`text-xl font-semibold ${valueClassName}`}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </div>
    </div>
  );
}
