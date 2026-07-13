import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  hasPlatformAdminPermission,
  type PlatformAdminPermission,
  type PlatformAdminRole,
} from "@/lib/auth/platform-admin-policy";
import {
  parsePlatformAdminMembershipMode,
  resolvePlatformAdminMembership,
  type PlatformAdminMembershipMode,
  type PlatformAdminRoleSource,
} from "@/lib/auth/platform-admin-membership";

export type {
  PlatformAdminRole,
} from "@/lib/auth/platform-admin-policy";

export type PlatformAdminContext = {
  userId: string;
  email: string;
  role: PlatformAdminRole;
  roleSource:
    PlatformAdminRoleSource;
  membershipMode:
    PlatformAdminMembershipMode;
};

type PlatformAdminSupabaseClient =
  Awaited<
    ReturnType<
      typeof createClient
    >
  >;

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
        | "permission"
        | "membership_unavailable"
        | "configuration";
    };

export async function resolvePlatformAdminMembershipForClient(
  supabase:
    PlatformAdminSupabaseClient,
  email: string
) {
  const membershipMode =
    parsePlatformAdminMembershipMode(
      process.env
        .PLATFORM_ADMIN_MEMBERSHIP_MODE
    );

  if (
    !membershipMode
  ) {
    return {
      status:
        "forbidden" as const,
      reason:
        "configuration" as const,
    };
  }

  return resolvePlatformAdminMembership({
    mode:
      membershipMode,
    email,
    configuredEmails:
      process.env
        .PLATFORM_ADMIN_EMAILS,
    loadDatabaseRole:
      async () => {
        const {
          data,
          error,
        } =
          await supabase
            .rpc(
              "get_my_platform_admin_role"
            );

        return {
          data,
          error,
        };
      },
  });
}

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

      const membership =
        await resolvePlatformAdminMembershipForClient(
          supabase,
          email,
        );

      if (
        membership.status !==
        "authorized"
      ) {
        return {
          status:
            "forbidden",
          reason:
            membership.reason,
        };
      }

      const role =
        membership.role;

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
          roleSource:
            membership.source,
          membershipMode:
            membership.mode,
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
