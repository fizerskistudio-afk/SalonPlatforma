"use client";

import {
  useRef,
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
  Power,
  PowerOff,
  Send,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import type {
  BusinessOwnerAccessItem,
} from "@/lib/platform-admin/business-access";
import {
  canResendOwnerActivation,
} from "@/lib/platform-admin/owner-access-state";

type BusinessOwnerAccessManagerProps = {
  businessSlug: string;
  businessName: string;
  owners:
    BusinessOwnerAccessItem[];
  activeOwnerCount: number;
  adminLoginPath: string;
};

type ApiResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
};

function formatDateTime(
  value: string | null
): string {
  if (!value) {
    return "Nije zabeleženo";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Nije zabeleženo";
  }

  return new Intl.DateTimeFormat(
    "sr-Latn-RS",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  ).format(
    date
  );
}

function getAccountStatus(
  owner: BusinessOwnerAccessItem
): {
  label: string;
  className: string;
} {
  switch (owner.state) {
    case "disabled":
      return {
        label: "Deaktiviran",
        className:
          "border-zinc-700 bg-zinc-900 text-zinc-400",
      };

    case "invited":
      return {
        label: "Pozvan · čeka potvrdu",
        className:
          "border-amber-400/20 bg-amber-400/10 text-amber-200",
      };

    case "password_pending":
      return {
        label: "Čeka postavljanje lozinke",
        className:
          "border-sky-400/20 bg-sky-400/10 text-sky-200",
      };

    case "recovery_required":
      return {
        label: "Potreban recovery",
        className:
          "border-rose-400/20 bg-rose-400/10 text-rose-200",
      };

    case "active":
      return {
        label: "Aktivan",
        className:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      };
  }
}

function getAccountGuidance(
  owner: BusinessOwnerAccessItem
): string {
  switch (owner.state) {
    case "disabled":
      return "Membership je isključen i tenant admin nije dostupan ovom nalogu.";
    case "invited":
      return "Owner mora da potvrdi email poziv pre prve prijave.";
    case "password_pending":
      return owner.mustChangePassword
        ? "Privremeni credentials važe, ali owner još mora da postavi privatnu lozinku."
        : "Email je potvrđen; owner još treba da završi postavljanje lozinke i prvu prijavu.";
    case "recovery_required":
      return "Membership postoji, ali Auth nalog nije moguće potvrditi. Ne objavljuj tenant dok se pristup ne oporavi.";
    case "active":
      return "Auth nalog i aktivni owner membership su spremni za tenant admin.";
  }
}

async function readApiResponse(
  response: Response
): Promise<ApiResponse> {
  try {
    return await response.json() as
      ApiResponse;
  } catch {
    return {};
  }
}

export default function BusinessOwnerAccessManager({
  businessSlug,
  businessName,
  owners,
  activeOwnerCount,
  adminLoginPath,
}: BusinessOwnerAccessManagerProps) {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const [
    activeMemberId,
    setActiveMemberId,
  ] =
    useState<
      string | null
    >(null);

  const [
    resendingMemberId,
    setResendingMemberId,
  ] =
    useState<
      string | null
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
    } | null>(
      null
    );

  const [
    copied,
    setCopied,
  ] =
    useState(false);

  const copyTimerRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  const submitOwnerInvite =
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

      if (
        !normalizedEmail
      ) {
        setFeedback({
          type:
            "error",

          message:
            "Unesi owner email adresu.",
        });

        return;
      }

      setIsSubmitting(
        true
      );

      setFeedback(
        null
      );

      try {
        const response =
          await fetch(
            "/api/platform-admin/businesses/access",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
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

        if (
          !response.ok
        ) {
          throw new Error(
            payload.message ??
              "Owner pristup nije kreiran."
          );
        }

        setEmail(
          ""
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
              : "Owner pristup nije kreiran.",
        });
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  const updateOwnerStatus =
    async (
      owner:
        BusinessOwnerAccessItem
    ) => {
      setActiveMemberId(
        owner.id
      );

      setFeedback(
        null
      );

      try {
        const response =
          await fetch(
            "/api/platform-admin/businesses/access",
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  businessSlug,

                  memberId:
                    owner.id,

                  isActive:
                    !owner.isActive,

                  expectedUpdatedAt:
                    owner.updatedAt,
                }),
            }
          );

        const payload =
          await readApiResponse(
            response
          );

        if (
          !response.ok
        ) {
          throw new Error(
            payload.message ??
              "Owner pristup nije promenjen."
          );
        }

        setFeedback({
          type:
            "success",

          message:
            payload.message ??
            "Owner pristup je promenjen.",
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
              : "Owner pristup nije promenjen.",
        });
      } finally {
        setActiveMemberId(
          null
        );
      }
    };

  const resendOwnerActivation =
    async (
      owner:
        BusinessOwnerAccessItem
    ) => {
      setResendingMemberId(
        owner.id
      );

      setFeedback(
        null
      );

      try {
        const response =
          await fetch(
            "/api/platform-admin/businesses/access",
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
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

        if (
          !response.ok
        ) {
          throw new Error(
            payload.message ??
              "Aktivacioni email nije ponovo poslat."
          );
        }

        setFeedback({
          type:
            "success",

          message:
            payload.message ??
            "Aktivacioni email je ponovo poslat.",
        });
      } catch (error) {
        setFeedback({
          type:
            "error",

          message:
            error instanceof
              Error
              ? error.message
              : "Aktivacioni email nije ponovo poslat.",
        });
      } finally {
        setResendingMemberId(
          null
        );
      }
    };

  const copyAdminLoginLink =
    async () => {
      const loginUrl =
        new URL(
          adminLoginPath,
          window.location.origin
        ).toString();

      try {
        await navigator
          .clipboard
          .writeText(
            loginUrl
          );

        setCopied(
          true
        );

        if (
          copyTimerRef.current
        ) {
          clearTimeout(
            copyTimerRef.current
          );
        }

        copyTimerRef.current =
          setTimeout(
            () => {
              setCopied(
                false
              );
            },
            1800
          );
      } catch {
        setFeedback({
          type:
            "error",

          message:
            "Login link nije mogao automatski da se kopira.",
        });
      }
    };

  return (
    <div className="space-y-6">
      {feedback ? (
        <div
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
          role="status"
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <UserPlus
                size={18}
              />
              Dodaj owner pristup
            </div>

            <h2 className="mt-3 text-2xl font-semibold">
              Poveži vlasnika sa salonom {businessName}
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Ako email još nema Supabase nalog, sistem šalje invite i unapred kreira owner membership. Ako nalog već postoji, samo ga povezuje sa ovim tenantom.
            </p>
          </div>

          <button
            type="button"
            onClick={
              copyAdminLoginLink
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            {copied ? (
              <Check
                size={17}
                className="text-emerald-300"
              />
            ) : (
              <Copy
                size={17}
              />
            )}

            {copied
              ? "Kopirano"
              : "Kopiraj admin login"}
          </button>
        </div>

        <form
          onSubmit={
            submitOwnerInvite
          }
          className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">
              Owner email
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
                  (
                    event
                  ) =>
                    setEmail(
                      event
                        .target
                        .value
                    )
                }
                autoComplete="email"
                placeholder="mika@example.com"
                disabled={
                  isSubmitting
                }
                className="min-h-12 w-full rounded-xl border border-white/10 bg-zinc-950/70 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KeyRound
              size={18}
            />

            {isSubmitting
              ? "Kreiranje..."
              : "Kreiraj owner pristup"}
          </button>
        </form>

        <p className="mt-3 text-xs leading-5 text-zinc-600">
          Invite aktivacija je vezana za konkretan email i tenant. Postojeći korisnik koristi svoju postojeću lozinku.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={19}
                className="text-emerald-300"
              />

              <h2 className="text-xl font-semibold">
                Owner nalozi
              </h2>
            </div>

            <p className="mt-2 text-sm text-zinc-500">
              Aktivni owneri mogu da otvore tenant admin i upravljaju samo salonima za koje imaju membership.
            </p>
          </div>

          <span className="w-fit rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-400">
            Aktivni: {activeOwnerCount}
          </span>
        </div>

        {owners.length ===
        0 ? (
          <div className="p-6">
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
              <p className="font-semibold text-amber-200">
                Salon još nema ownera
              </p>

              <p className="mt-2 text-sm leading-6 text-amber-100/70">
                Dodaj prvog vlasnika kroz formu iznad. Bez aktivnog owner membership-a niko ne može da upravlja ovim tenantom kroz salon admin.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {owners.map(
              (owner) => {
                const status =
                  getAccountStatus(
                    owner
                  );

                const statusWorking =
                  activeMemberId ===
                  owner.id;

                const resendWorking =
                  resendingMemberId ===
                  owner.id;

                const canResendActivation =
                  canResendOwnerActivation({
                    state:
                      owner.state,
                    hasEmail:
                      Boolean(
                        owner.email
                      ),
                    mustChangePassword:
                      owner.mustChangePassword,
                  });

                return (
                  <article
                    key={
                      owner.id
                    }
                    className="flex flex-col gap-5 p-5 md:p-6 xl:flex-row xl:items-center xl:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="break-all font-semibold text-zinc-200">
                          {owner.email ??
                            owner.userId}
                        </p>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-xs text-zinc-500 sm:grid-cols-2 lg:grid-cols-4">
                        <InfoItem
                          label="Pozvan"
                          value={
                            formatDateTime(
                              owner.invitedAt ??
                                owner.createdAt
                            )
                          }
                        />

                        <InfoItem
                          label="Email potvrđen"
                          value={
                            formatDateTime(
                              owner.emailConfirmedAt
                            )
                          }
                        />

                        <InfoItem
                          label="Poslednja prijava"
                          value={
                            formatDateTime(
                              owner.lastSignInAt
                            )
                          }
                        />

                        <InfoItem
                          label="Membership ažuriran"
                          value={
                            formatDateTime(
                              owner.updatedAt
                            )
                          }
                        />
                      </div>

                      <p className="mt-3 max-w-3xl text-xs leading-5 text-zinc-500">
                        {getAccountGuidance(
                          owner
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      {canResendActivation ? (
                        <button
                          type="button"
                          disabled={
                            resendWorking ||
                            statusWorking
                          }
                          onClick={
                            () =>
                              resendOwnerActivation(
                                owner
                              )
                          }
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-sky-400/20 bg-sky-400/10 px-4 py-2.5 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/15 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Send
                            size={17}
                          />

                          {resendWorking
                            ? "Slanje..."
                            : owner.emailConfirmedAt
                              ? "Pošalji link za lozinku"
                              : "Pošalji poziv ponovo"}
                        </button>
                      ) : null}

                      <button
                        type="button"
                        disabled={
                          statusWorking ||
                          resendWorking
                        }
                        onClick={
                          () =>
                            updateOwnerStatus(
                              owner
                            )
                        }
                        className={[
                          "inline-flex",
                          "min-h-11",
                          "items-center",
                          "justify-center",
                          "gap-2",
                          "rounded-xl",
                          "border",
                          "px-4",
                          "py-2.5",
                          "text-sm",
                          "font-semibold",
                          "transition",
                          "focus:outline-none",
                          "focus:ring-2",
                          "focus:ring-offset-2",
                          "focus:ring-offset-zinc-950",
                          "disabled:cursor-not-allowed",
                          "disabled:opacity-60",
                          owner.isActive
                            ? "border-rose-400/20 bg-rose-400/10 text-rose-200 hover:bg-rose-400/15 focus:ring-rose-300"
                            : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15 focus:ring-emerald-300",
                        ].join(
                          " "
                        )}
                      >
                        {owner.isActive ? (
                          <PowerOff
                            size={17}
                          />
                        ) : (
                          <Power
                            size={17}
                          />
                        )}

                        {statusWorking
                          ? "Čuvanje..."
                          : owner.isActive
                            ? "Deaktiviraj"
                            : "Aktiviraj"}
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/50 px-3 py-2.5">
      <p className="uppercase tracking-wider text-zinc-700">
        {label}
      </p>

      <p className="mt-1 leading-5 text-zinc-400">
        {value}
      </p>
    </div>
  );
}
