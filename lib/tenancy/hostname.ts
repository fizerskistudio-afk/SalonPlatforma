const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const RESERVED_PLATFORM_SUBDOMAINS =
  new Set([
    "www",
    "app",
    "admin",
    "staff",
    "platform-admin",
    "api",
    "booking",
    "mail",
    "status",
    "support",
    "help",
    "cdn",
    "assets",
    "static",
  ]);

export type PlatformHostnameResolution =
  | {
      kind: "unconfigured";
    }
  | {
      kind: "root";
    }
  | {
      kind: "reserved";
      subdomain: string;
    }
  | {
      kind: "tenant";
      businessSlug: string;
    }
  | {
      kind: "external";
    };

function stripProtocolAndPath(
  value: string
): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(
      trimmed.includes("://")
        ? trimmed
        : `http://${trimmed}`
    );

    return parsed.host;
  } catch {
    return trimmed
      .replace(/^https?:\/\//i, "")
      .split("/")[0]
      .trim();
  }
}

export function normalizeHostname(
  value: string | null | undefined
): string {
  if (!value) {
    return "";
  }

  const firstForwardedHost =
    value.split(",")[0]?.trim() ?? "";

  const authority = stripProtocolAndPath(
    firstForwardedHost
  ).toLowerCase();

  if (!authority) {
    return "";
  }

  if (authority.startsWith("[")) {
    const closingBracket =
      authority.indexOf("]");

    return closingBracket >= 0
      ? authority.slice(
          1,
          closingBracket
        )
      : authority;
  }

  return authority
    .split(":")[0]
    .replace(/\.$/, "");
}

export function getConfiguredPlatformRootAuthority():
  | string
  | null {
  const configuredValue =
    process.env.PLATFORM_ROOT_DOMAIN?.trim();

  if (!configuredValue) {
    return null;
  }

  const authority =
    stripProtocolAndPath(configuredValue);

  return authority || null;
}

export function getConfiguredPlatformRootHostname():
  | string
  | null {
  const authority =
    getConfiguredPlatformRootAuthority();

  if (!authority) {
    return null;
  }

  return normalizeHostname(authority) || null;
}

export function resolvePlatformHostname(
  incomingHost: string | null | undefined,
  configuredRootDomain:
    | string
    | null
    | undefined
): PlatformHostnameResolution {
  const hostname =
    normalizeHostname(incomingHost);

  const rootHostname =
    normalizeHostname(configuredRootDomain);

  if (!rootHostname) {
    return {
      kind: "unconfigured",
    };
  }

  if (!hostname) {
    return {
      kind: "external",
    };
  }

  if (hostname === rootHostname) {
    return {
      kind: "root",
    };
  }

  const suffix = `.${rootHostname}`;

  if (!hostname.endsWith(suffix)) {
    return {
      kind: "external",
    };
  }

  const subdomain = hostname.slice(
    0,
    -suffix.length
  );

  if (
    !subdomain ||
    subdomain.includes(".") ||
    !BUSINESS_SLUG_PATTERN.test(
      subdomain
    )
  ) {
    return {
      kind: "external",
    };
  }

  if (
    RESERVED_PLATFORM_SUBDOMAINS.has(
      subdomain
    )
  ) {
    return {
      kind: "reserved",
      subdomain,
    };
  }

  return {
    kind: "tenant",
    businessSlug: subdomain,
  };
}

export function buildTenantPublicUrl(
  businessSlug: string
): string {
  if (
    !BUSINESS_SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    throw new Error(
      "Invalid business slug."
    );
  }

  const rootAuthority =
    getConfiguredPlatformRootAuthority();

  if (!rootAuthority) {
    return `/salon/${businessSlug}`;
  }

  const rootHostname =
    normalizeHostname(rootAuthority);

  const configuredProtocol =
    process.env.PLATFORM_ROOT_PROTOCOL?.trim();

  const protocol =
    configuredProtocol === "http" ||
    configuredProtocol === "https"
      ? configuredProtocol
      : rootHostname === "localhost"
        ? "http"
        : "https";

  return `${protocol}://${businessSlug}.${rootAuthority}`;
}
