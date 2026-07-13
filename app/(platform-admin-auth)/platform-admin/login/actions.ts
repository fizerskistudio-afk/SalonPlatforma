"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  getPlatformAdminRoleForEmail,
  getSafePlatformAdminNextPath,
} from "@/lib/auth/platform-admin-policy";
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
import {
  createClient,
} from "@/lib/supabase/server";

export type PlatformAdminLoginActionState = {
  error: string | null;
};

export async function platformAdminLoginAction(
  _previousState: PlatformAdminLoginActionState,
  formData: FormData
): Promise<PlatformAdminLoginActionState> {
  const email = String(
    formData.get("email") ?? ""
  )
    .trim()
    .toLowerCase();

  const password = String(
    formData.get("password") ?? ""
  );

  const next =
    getSafePlatformAdminNextPath(
      formData.get("next")
    );

  if (
    !email ||
    !password
  ) {
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
        "platform-admin-login-address",
      parts: [
        clientAddress,
      ],
      limit: 30,
      windowSeconds:
        15 * 60,
      failureMode:
        "closed",
      requestId,
    }),
    consumeRateLimit({
      scope:
        "platform-admin-login-account",
      parts: [
        clientAddress,
        email,
      ],
      limit: 8,
      windowSeconds:
        15 * 60,
      failureMode:
        "closed",
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
        ? "platform-admin-login-address"
        : "platform-admin-login-account";

    if (
      blockedLimit.unavailable
    ) {
      logServerEvent(
        "error",
        "auth.platform_admin.rate_limit.unavailable",
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
      "auth.platform_admin.rate_limit.blocked",
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
      "auth.platform_admin.credentials.rejected",
      {
        requestId,
      }
    );

    return {
      error:
        "Email ili lozinka nisu ispravni.",
    };
  }

  const role =
    getPlatformAdminRoleForEmail(
      data.user.email,
      process.env
        .PLATFORM_ADMIN_EMAILS
    );

  if (!role) {
    logServerEvent(
      "warn",
      "auth.platform_admin.access.denied",
      {
        requestId,
        userId:
          data.user.id,
      }
    );

    const {
      error: signOutError,
    } =
      await supabase.auth.signOut({
        scope: "local",
      });

    if (signOutError) {
      logServerError(
        "auth.platform_admin.denied_session_cleanup.failed",
        signOutError,
        {
          requestId,
          userId:
            data.user.id,
        }
      );
    }

    return {
      error:
        "Ovaj nalog nema platform-admin pristup.",
    };
  }

  logServerEvent(
    "info",
    "auth.platform_admin.login.succeeded",
    {
      requestId,
      userId:
        data.user.id,
      role,
    }
  );

  redirect(next);
}
