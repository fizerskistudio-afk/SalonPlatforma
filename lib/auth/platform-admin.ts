import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  getPlatformAdminRoleForEmail,
  hasPlatformAdminPermission,
  type PlatformAdminPermission,
  type PlatformAdminRole,
} from "@/lib/auth/platform-admin-policy";

export type {
  PlatformAdminRole,
} from "@/lib/auth/platform-admin-policy";

export type PlatformAdminContext = {
  userId: string;
  email: string;
  role: PlatformAdminRole;
};

type PlatformAdminAccess =
  | {
      status: "authorized";
      context:
        PlatformAdminContext;
    }
  | {
      status:
        | "unauthenticated"
        | "forbidden";
      reason?:
        | "membership"
        | "permission";
    };

export const getPlatformAdminAccess =
  cache(
    async (
      requiredPermission?:
        PlatformAdminPermission
    ): Promise<PlatformAdminAccess> => {
      const supabase =
        await createClient();

      const {
        data: claimsData,
        error: claimsError,
      } =
        await supabase.auth
          .getClaims();

      if (
        claimsError ||
        !claimsData ||
        !claimsData.claims
      ) {
        return {
          status:
            "unauthenticated",
        };
      }

      const claims =
        claimsData.claims;

      const userId =
        claims.sub;

      const emailClaim =
        claims.email;

      if (
        typeof userId !==
          "string" ||
        userId.length === 0 ||
        typeof emailClaim !==
          "string"
      ) {
        return {
          status:
            "unauthenticated",
        };
      }

      const email =
        emailClaim
          .trim()
          .toLowerCase();

      const role =
        getPlatformAdminRoleForEmail(
          email,
          process.env
            .PLATFORM_ADMIN_EMAILS
        );

      if (
        !role
      ) {
        return {
          status:
            "forbidden",
          reason:
            "membership",
        };
      }

      if (
        requiredPermission &&
        !hasPlatformAdminPermission(
          role,
          requiredPermission
        )
      ) {
        return {
          status:
            "forbidden",
          reason:
            "permission",
        };
      }

      return {
        status:
          "authorized",

        context: {
          userId,
          email,
          role,
        },
      };
    }
  );

export async function requirePlatformAdmin():
  Promise<PlatformAdminContext> {
  const access =
    await getPlatformAdminAccess();

  if (
    access.status ===
      "authorized"
  ) {
    return access.context;
  }

  if (
    access.status ===
      "unauthenticated"
  ) {
    redirect(
      "/platform-admin/login"
    );
  }

  redirect(
    "/platform-admin/forbidden"
  );
}

export async function requirePlatformAdminPermission(
  permission: PlatformAdminPermission
): Promise<PlatformAdminContext> {
  const access =
    await getPlatformAdminAccess(
      permission
    );

  if (
    access.status ===
      "authorized"
  ) {
    return access.context;
  }

  if (
    access.status ===
      "unauthenticated"
  ) {
    redirect(
      "/platform-admin/login"
    );
  }

  if (
    access.reason ===
      "permission"
  ) {
    redirect(
      "/platform-admin/denied"
    );
  }

  redirect(
    "/platform-admin/forbidden"
  );
}
