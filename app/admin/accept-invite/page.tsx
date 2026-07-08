import type {
  Metadata,
} from "next";

import {
  redirect,
} from "next/navigation";

import {
  CheckCircle2,
  Scissors,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import AcceptInviteForm from "@/components/admin/AcceptInviteForm";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  createClient,
} from "@/lib/supabase/server";

export const metadata:
  Metadata = {
    title:
      "Aktivacija naloga",

    description:
      "Aktivacija korisničkog naloga salona.",
  };

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AcceptInvitePageProps = {
  searchParams:
    Promise<{
      status?:
        string;

      businessSlug?:
        string;

      inviteEmail?:
        string;
    }>;
};

type MembershipRow = {
  role:
    | "owner"
    | "manager"
    | "staff";

  business_id:
    string;
};

type BusinessRow = {
  id:
    string;

  name:
    string;

  slug:
    string;
};

function normalizeEmail(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
}

export default async function AcceptInvitePage({
  searchParams,
}: AcceptInvitePageProps) {
  const {
    status,
    businessSlug:
      rawBusinessSlug,
    inviteEmail:
      rawInviteEmail,
  } =
    await searchParams;

  const businessSlug =
    rawBusinessSlug
      ?.trim()
      .toLowerCase() ??
    "";

  const inviteEmail =
    normalizeEmail(
      rawInviteEmail ??
      ""
    );

  const hasStrictInviteContext =
    Boolean(
      businessSlug ||
      inviteEmail
    );

  if (
    hasStrictInviteContext &&
    (
      !BUSINESS_SLUG_PATTERN.test(
        businessSlug
      ) ||
      !EMAIL_PATTERN.test(
        inviteEmail
      )
    )
  ) {
    redirect(
      "/admin/login?authError=invalid-invite"
    );
  }

  const supabase =
    await createClient();

  const {
    data:
      userData,
  } =
    await supabase
      .auth
      .getUser();

  if (
    !userData.user
  ) {
    redirect(
      "/admin/login?authError=invite-session"
    );
  }

  const currentEmail =
    normalizeEmail(
      userData
        .user
        .email ??
      ""
    );

  if (
    hasStrictInviteContext &&
    currentEmail !==
      inviteEmail
  ) {
    await supabase
      .auth
      .signOut({
        scope:
          "local",
      });

    redirect(
      "/admin/login?authError=invite-account-mismatch"
    );
  }

  const adminClient =
    createAdminClient();

  let targetBusiness:
    BusinessRow | null =
      null;

  if (
    hasStrictInviteContext
  ) {
    const {
      data:
        businessData,
      error:
        businessError,
    } =
      await adminClient
        .from(
          "businesses"
        )
        .select(
          "id, name, slug"
        )
        .eq(
          "slug",
          businessSlug
        )
        .maybeSingle();

    if (
      businessError ||
      !businessData
    ) {
      redirect(
        "/admin/login?authError=invalid-invite"
      );
    }

    targetBusiness =
      businessData as unknown as
        BusinessRow;
  }

  let membershipQuery =
    supabase
      .from(
        "business_members"
      )
      .select(
        "role, business_id"
      )
      .eq(
        "user_id",
        userData.user.id
      )
      .eq(
        "is_active",
        true
      );

  if (
    targetBusiness
  ) {
    membershipQuery =
      membershipQuery.eq(
        "business_id",
        targetBusiness.id
      );
  }

  const {
    data:
      membershipData,
  } =
    await membershipQuery
      .order(
        "created_at",
        {
          ascending:
            true,
        }
      )
      .limit(
        1
      )
      .maybeSingle();

  const membership =
    membershipData
      ? membershipData as unknown as
          MembershipRow
      : null;

  if (
    !membership
  ) {
    if (
      hasStrictInviteContext
    ) {
      await supabase
        .auth
        .signOut({
          scope:
            "local",
        });
    }

    redirect(
      hasStrictInviteContext
        ? "/admin/login?authError=invite-membership-mismatch"
        : "/admin/login"
    );
  }

  let business =
    targetBusiness;

  if (
    !business
  ) {
    const {
      data:
        businessData,
    } =
      await adminClient
        .from(
          "businesses"
        )
        .select(
          "id, name, slug"
        )
        .eq(
          "id",
          membership.business_id
        )
        .maybeSingle();

    business =
      businessData
        ? businessData as unknown as
            BusinessRow
        : null;
  }

  const staffReady =
    status ===
    "staff-ready";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-5 py-10 text-white">
      <div
        className="absolute inset-0 bg-gradient-to-br from-amber-300/10 via-transparent to-violet-300/5"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
            <Scissors className="h-5 w-5" />
          </div>

          <div>
            <div className="font-semibold">
              {business?.name ??
                "Salon Platform"}
            </div>

            <div className="text-xs text-zinc-500">
              Aktivacija članstva
            </div>
          </div>
        </div>

        {staffReady ? (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-2xl font-semibold">
              Nalog je aktiviran
            </h1>

            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Staff članstvo je spremno.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-200">
                <ShieldCheck className="h-4 w-4" />

                {membership.role ===
                "owner"
                  ? "Vlasnik"
                  : membership.role ===
                      "manager"
                    ? "Menadžer"
                    : "Zaposleni"}
              </div>

              <h1 className="text-3xl font-semibold tracking-tight">
                Postavi lozinku
              </h1>

              <p className="mt-3 text-sm leading-7 text-zinc-500">
                Lozinka će biti sačuvana samo za prikazani nalog i članstvo ovog salona.
              </p>

              <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                      Nalog koji aktiviraš
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-zinc-200">
                      {userData.user.email ??
                        userData.user.id}
                    </p>

                    <p className="mt-2 text-xs text-zinc-600">
                      Salon:{" "}
                      {business?.name ??
                        "Nepoznat"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <AcceptInviteForm
              businessSlug={
                hasStrictInviteContext
                  ? businessSlug
                  : ""
              }
              inviteEmail={
                hasStrictInviteContext
                  ? inviteEmail
                  : ""
              }
            />
          </>
        )}
      </div>
    </main>
  );
}
