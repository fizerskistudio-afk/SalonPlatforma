export type PlatformAdminRole =
  | "super_admin"
  | "sales"
  | "launch_manager"
  | "it";

export const PLATFORM_ADMIN_PERMISSIONS = [
  "platform.dashboard.read",
  "platform.monitoring.read",
  "platform.audit.read",
  "platform.members.manage",
  "tenant.read",
  "tenant.create",
  "tenant.package.read",
  "tenant.package.write",
  "tenant.profile.write",
  "tenant.branding.write",
  "tenant.theme.write",
  "tenant.catalog.write",
  "tenant.team.write",
  "tenant.schedule.write",
  "tenant.settings.write",
  "tenant.bookings.read",
  "tenant.bookings.write",
  "tenant.owner_access.read",
  "tenant.owner_access.write",
  "tenant.preview.read",
  "tenant.preview.share",
  "tenant.publish",
  "tenant.unpublish",
  "tenant.deactivate",
  "tenant.reactivate",
] as const;

export type PlatformAdminPermission =
  (typeof PLATFORM_ADMIN_PERMISSIONS)[number];

const SALES_PERMISSIONS = [
  "platform.dashboard.read",
  "tenant.read",
  "tenant.create",
  "tenant.package.read",
  "tenant.package.write",
  "tenant.profile.write",
  "tenant.branding.write",
  "tenant.theme.write",
  "tenant.catalog.write",
  "tenant.team.write",
  "tenant.schedule.write",
  "tenant.settings.write",
  "tenant.preview.read",
  "tenant.preview.share",
] as const satisfies
  readonly PlatformAdminPermission[];

const LAUNCH_MANAGER_PERMISSIONS = [
  ...SALES_PERMISSIONS,
  "platform.audit.read",
  "tenant.bookings.read",
  "tenant.bookings.write",
  "tenant.owner_access.read",
  "tenant.owner_access.write",
  "tenant.publish",
  "tenant.unpublish",
  "tenant.deactivate",
  "tenant.reactivate",
] as const satisfies
  readonly PlatformAdminPermission[];

const IT_PERMISSIONS = [
  "platform.dashboard.read",
  "platform.monitoring.read",
  "platform.audit.read",
  "tenant.read",
  "tenant.package.read",
  "tenant.preview.read",
] as const satisfies
  readonly PlatformAdminPermission[];

export const PLATFORM_ADMIN_ROLE_LABELS:
  Record<
    PlatformAdminRole,
    string
  > = {
    super_admin:
      "Super admin",
    sales:
      "Sales",
    launch_manager:
      "Launch manager",
    it:
      "IT",
  };

const PLATFORM_ADMIN_ROLE_PERMISSIONS:
  Record<
    PlatformAdminRole,
    readonly PlatformAdminPermission[]
  > = {
    super_admin:
      PLATFORM_ADMIN_PERMISSIONS,
    sales:
      SALES_PERMISSIONS,
    launch_manager:
      LAUNCH_MANAGER_PERMISSIONS,
    it:
      IT_PERMISSIONS,
  };

const PLATFORM_ADMIN_ROOT =
  "/platform-admin";

const PLATFORM_ADMIN_PUBLIC_PATHS =
  new Set([
    "/platform-admin/login",
    "/platform-admin/forbidden",
  ]);

export function normalizePlatformAdminEmail(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
}

export function isPlatformAdminRole(
  value: unknown
): value is PlatformAdminRole {
  return (
    typeof value === "string" &&
    Object.hasOwn(
      PLATFORM_ADMIN_ROLE_PERMISSIONS,
      value
    )
  );
}

export function getPlatformAdminPermissions(
  role: PlatformAdminRole
): readonly PlatformAdminPermission[] {
  return PLATFORM_ADMIN_ROLE_PERMISSIONS[
    role
  ];
}

export function hasPlatformAdminPermission(
  role: PlatformAdminRole,
  permission: PlatformAdminPermission
): boolean {
  return getPlatformAdminPermissions(
    role
  ).includes(
    permission
  );
}

export function getPlatformAdminRoleForEmail(
  email: string | null | undefined,
  configuredEmails: string | null | undefined
): PlatformAdminRole | null {
  if (
    typeof email !== "string"
  ) {
    return null;
  }

  const normalizedEmail =
    normalizePlatformAdminEmail(
      email
    );

  if (
    normalizedEmail.length === 0
  ) {
    return null;
  }

  const allowedEmails =
    new Set(
      (configuredEmails ?? "")
        .split(",")
        .map(
          normalizePlatformAdminEmail
        )
        .filter(
          (value) =>
            value.length > 0
        )
    );

  return allowedEmails.has(
    normalizedEmail
  )
    ? "super_admin"
    : null;
}

export function isPlatformAdminPath(
  value: string
): boolean {
  return (
    value ===
      PLATFORM_ADMIN_ROOT ||
    value.startsWith(
      `${PLATFORM_ADMIN_ROOT}/`
    )
  );
}

export function getAuthFailureLoginPath(
  next: string
):
  | "/platform-admin/login"
  | "/admin/login" {
  return isPlatformAdminPath(
    next
  )
    ? "/platform-admin/login"
    : "/admin/login";
}

export function getSafeAuthNextPath(
  value: unknown
): string {
  if (
    typeof value !==
      "string" ||
    !value.startsWith(
      "/"
    ) ||
    value.startsWith(
      "//"
    )
  ) {
    return "/admin";
  }

  try {
    const parsedUrl =
      new URL(
        value,
        "http://localhost"
      );

    if (
      parsedUrl.origin !==
      "http://localhost"
    ) {
      return "/admin";
    }

    return `${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    return "/admin";
  }
}

export function getSafePlatformAdminNextPath(
  value: unknown
): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return PLATFORM_ADMIN_ROOT;
  }

  try {
    const parsedUrl = new URL(
      value,
      "http://localhost"
    );

    if (
      parsedUrl.origin !==
        "http://localhost" ||
      !isPlatformAdminPath(
        parsedUrl.pathname
      ) ||
      PLATFORM_ADMIN_PUBLIC_PATHS.has(
        parsedUrl.pathname
      )
    ) {
      return PLATFORM_ADMIN_ROOT;
    }

    return `${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    return PLATFORM_ADMIN_ROOT;
  }
}
