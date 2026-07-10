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

export type LoginActionState = {
  error: string | null;
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
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
        "admin-login-address",
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
        "admin-login-account",
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
        ? "admin-login-address"
        : "admin-login-account";

    if (
      blockedLimit.unavailable
    ) {
      logServerEvent(
        "error",
        "auth.admin.rate_limit.unavailable",
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
      "auth.admin.rate_limit.blocked",
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
    await supabase.auth.signInWithPassword(
      {
        email,
        password,
      }
    );

  if (
    error ||
    !data.user
  ) {
    logServerEvent(
      "warn",
      "auth.admin.credentials.rejected",
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
      "id, business_id, role, is_active"
    )
    .eq(
      "user_id",
      data.user.id
    )
    .eq("is_active", true)
    .in("role", [
      "owner",
      "manager",
    ])
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    logServerError(
      "auth.admin.membership_query.failed",
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
        "Ovaj nalog nema aktivan administratorski pristup.",
    };
  }

  if (!membership) {
    logServerEvent(
      "warn",
      "auth.admin.membership.denied",
      {
        requestId,
        userId:
          data.user.id,
      }
    );

    await supabase.auth.signOut();

    return {
      error:
        "Ovaj nalog nema aktivan administratorski pristup.",
    };
  }

  if (
    data.user
      .app_metadata
      ?.must_change_password ===
    true
  ) {
    redirect(
      "/admin/change-password"
    );
  }

  redirect("/admin");
}
