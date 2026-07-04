import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Scissors,
  ShieldCheck,
} from "lucide-react";

import AcceptInviteForm from "@/components/admin/AcceptInviteForm";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Aktivacija naloga",
  description:
    "Aktivacija korisničkog naloga salona.",
};

type AcceptInvitePageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

type MembershipRow = {
  role:
    | "owner"
    | "manager"
    | "staff";
  business_id: string;
};

type BusinessRow = {
  name: string;
};

export default async function AcceptInvitePage({
  searchParams,
}: AcceptInvitePageProps) {
  const { status } =
    await searchParams;

  const supabase =
    await createClient();

  const { data: userData } =
    await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/admin/login");
  }

  const { data: membershipData } =
    await supabase
      .from("business_members")
      .select("role, business_id")
      .eq(
        "user_id",
        userData.user.id
      )
      .eq("is_active", true)
      .order("created_at", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

  const membership =
    membershipData
      ? (membershipData as unknown as MembershipRow)
      : null;

  if (!membership) {
    redirect("/admin/login");
  }

  const adminClient =
    createAdminClient();

  const { data: businessData } =
    await adminClient
      .from("businesses")
      .select("name")
      .eq(
        "id",
        membership.business_id
      )
      .maybeSingle();

  const business = businessData
    ? (businessData as unknown as BusinessRow)
    : null;

  const staffReady =
    status === "staff-ready";

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
              Staff članstvo je spremno. Poseban staff dashboard biće dodat u narednoj fazi; owner/manager admin panel nije dostupan ovoj ulozi.
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
                Završavaš aktivaciju naloga za pristup salon platformi.
              </p>
            </div>

            <AcceptInviteForm />
          </>
        )}
      </div>
    </main>
  );
}
