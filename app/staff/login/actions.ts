"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  createRequestId,
  logServerError,
  logServerEvent,
} from "@/lib/monitoring/server";
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
  const requestId =
    createRequestId(
      requestHeaders
    );

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
      requestId,
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
      requestId,
    }),
  ]);

  const blockedLimit =
    !addressLimit.allowed
      ? addressLimit
      : !accountLimit.allowed
        ? accountLimit
        : null;

  if (blockedLimit) {
    const blockedScope =
      !addressLimit.allowed
        ? "staff-login-address"
        : "staff-login-account";

    if (
      blockedLimit.unavailable
    ) {
      logServerEvent(
        "error",
        "auth.staff.rate_limit.unavailable",
        {
          requestId,
          scope:
            blockedScope,
        }
      );

      return {
        error:
          "Prijava trenutno nije dostupna. Pokušaj ponovo malo kasnije.",
      };
    }

    logServerEvent(
      "warn",
      "auth.staff.rate_limit.blocked",
      {
        requestId,
        scope:
          blockedScope,
      }
    );

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

  if (
    error ||
    !data.user
  ) {
    logServerEvent(
      "warn",
      "auth.staff.credentials.rejected",
      {
        requestId,
      }
    );

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

  if (membershipError) {
    logServerError(
      "auth.staff.membership_query.failed",
      membershipError,
      {
        requestId,
        userId:
          data.user.id,
      }
    );

    await supabase.auth.signOut();

    return {
      error:
        "Ovaj nalog nema aktivan staff pristup.",
    };
  }

  if (!membership) {
    logServerEvent(
      "warn",
      "auth.staff.membership.denied",
      {
        requestId,
        userId:
          data.user.id,
      }
    );

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
