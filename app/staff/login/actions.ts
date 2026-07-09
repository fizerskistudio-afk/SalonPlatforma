"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  consumeRateLimit,
  formatRetryAfter,
  getClientAddress,
} from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

export type StaffLoginActionState = {
  error: string | null;
};

export async function staffLoginAction(
  _previousState: StaffLoginActionState,
  formData: FormData
): Promise<StaffLoginActionState> {
  const email = String(
    formData.get("email") ?? ""
  )
    .trim()
    .toLowerCase();

  const password = String(
    formData.get("password") ?? ""
  );

  if (!email || !password) {
    return {
      error:
        "Unesi email adresu i lozinku.",
    };
  }

  const requestHeaders =
    await headers();

  const clientAddress =
    getClientAddress(
      requestHeaders
    );

  const [
    addressLimit,
    accountLimit,
  ] = await Promise.all([
    consumeRateLimit({
      scope:
        "staff-login-address",
      parts: [
        clientAddress,
      ],
      limit: 30,
      windowSeconds: 15 * 60,
      failureMode: "closed",
    }),

    consumeRateLimit({
      scope:
        "staff-login-account",
      parts: [
        clientAddress,
        email,
      ],
      limit: 8,
      windowSeconds: 15 * 60,
      failureMode: "closed",
    }),
  ]);

  const blockedLimit =
    !addressLimit.allowed
      ? addressLimit
      : !accountLimit.allowed
        ? accountLimit
        : null;

  if (blockedLimit) {
    if (
      blockedLimit.unavailable
    ) {
      return {
        error:
          "Prijava trenutno nije dostupna. Pokušaj ponovo malo kasnije.",
      };
    }

    return {
      error:
        `Previše pokušaja prijave. Pokušaj ponovo za ${formatRetryAfter(
          blockedLimit.retryAfterSeconds
        )}.`,
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error || !data.user) {
    return {
      error:
        "Email ili lozinka nisu ispravni.",
    };
  }

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("business_members")
    .select(
      "id, employee_id, is_active"
    )
    .eq("user_id", data.user.id)
    .eq("role", "staff")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (
    membershipError ||
    !membership
  ) {
    await supabase.auth.signOut();

    return {
      error:
        "Ovaj nalog nema aktivan staff pristup.",
    };
  }

  if (
    data.user.app_metadata
      ?.must_change_password ===
    true
  ) {
    redirect(
      "/staff/change-password"
    );
  }

  redirect("/staff");
}
