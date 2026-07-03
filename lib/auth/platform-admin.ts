import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

export type PlatformAdminRole =
  "super_admin";

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
    };

function normalizeEmail(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
}

function getConfiguredPlatformAdminEmails():
  ReadonlySet<string> {
  const configuredEmails =
    process.env
      .PLATFORM_ADMIN_EMAILS ??
    "";

  return new Set(
    configuredEmails
      .split(",")
      .map(normalizeEmail)
      .filter(
        (email) =>
          email.length > 0
      )
  );
}

export const getPlatformAdminAccess =
  cache(
    async (): Promise<PlatformAdminAccess> => {
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
        normalizeEmail(
          emailClaim
        );

      const allowedEmails =
        getConfiguredPlatformAdminEmails();

      if (
        !allowedEmails.has(
          email
        )
      ) {
        return {
          status:
            "forbidden",
        };
      }

      return {
        status:
          "authorized",

        context: {
          userId,
          email,
          role:
            "super_admin",
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
      "/admin/login"
    );
  }

  redirect(
    "/admin"
  );
}