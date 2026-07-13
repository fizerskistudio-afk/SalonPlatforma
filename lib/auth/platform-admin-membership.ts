import {
  getPlatformAdminRoleForEmail,
  isPlatformAdminRole,
  type PlatformAdminRole,
} from "@/lib/auth/platform-admin-policy";

export const PLATFORM_ADMIN_MEMBERSHIP_MODES = [
  "legacy",
  "hybrid",
  "database",
] as const;

export type PlatformAdminMembershipMode =
  (typeof PLATFORM_ADMIN_MEMBERSHIP_MODES)[number];

export type PlatformAdminRoleSource =
  | "legacy_allowlist"
  | "database_membership";

type DatabaseRoleLookupResult = {
  data: unknown;
  error: unknown | null;
};

type PlatformAdminMembershipResult =
  | {
      status: "authorized";
      role: PlatformAdminRole;
      source:
        PlatformAdminRoleSource;
      mode:
        PlatformAdminMembershipMode;
    }
  | {
      status: "forbidden";
      reason:
        | "membership"
        | "membership_unavailable";
      mode:
        PlatformAdminMembershipMode;
    };

export function parsePlatformAdminMembershipMode(
  value: string | null | undefined
): PlatformAdminMembershipMode | null {
  const normalized =
    value
      ?.trim()
      .toLowerCase() ??
    "";

  if (
    normalized.length ===
    0
  ) {
    return "legacy";
  }

  return PLATFORM_ADMIN_MEMBERSHIP_MODES.includes(
    normalized as
      PlatformAdminMembershipMode
  )
    ? normalized as
        PlatformAdminMembershipMode
    : null;
}

export async function resolvePlatformAdminMembership({
  mode,
  email,
  configuredEmails,
  loadDatabaseRole,
}: {
  mode:
    PlatformAdminMembershipMode;
  email: string;
  configuredEmails:
    string | null | undefined;
  loadDatabaseRole:
    () => Promise<
      DatabaseRoleLookupResult
    >;
}): Promise<PlatformAdminMembershipResult> {
  const legacyRole =
    getPlatformAdminRoleForEmail(
      email,
      configuredEmails
    );

  if (
    mode ===
    "legacy"
  ) {
    return legacyRole
      ? {
          status:
            "authorized",
          role:
            legacyRole,
          source:
            "legacy_allowlist",
          mode,
        }
      : {
          status:
            "forbidden",
          reason:
            "membership",
          mode,
        };
  }

  let databaseResult:
    DatabaseRoleLookupResult;

  try {
    databaseResult =
      await loadDatabaseRole();
  } catch {
    databaseResult = {
      data:
        null,
      error:
        new Error(
          "PLATFORM_ADMIN_MEMBERSHIP_LOOKUP_FAILED"
        ),
    };
  }

  if (
    !databaseResult.error &&
    isPlatformAdminRole(
      databaseResult.data
    )
  ) {
    return {
      status:
        "authorized",
      role:
        databaseResult.data,
      source:
        "database_membership",
      mode,
    };
  }

  if (
    mode ===
      "hybrid" &&
    legacyRole
  ) {
    return {
      status:
        "authorized",
      role:
        legacyRole,
      source:
        "legacy_allowlist",
      mode,
    };
  }

  const membershipUnavailable =
    Boolean(
      databaseResult.error
    ) ||
    (
      databaseResult.data !==
        null &&
      databaseResult.data !==
        undefined
    );

  return {
    status:
      "forbidden",
    reason:
      membershipUnavailable
        ? "membership_unavailable"
        : "membership",
    mode,
  };
}
