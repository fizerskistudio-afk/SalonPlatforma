import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  getConfiguredPlatformRootHostname,
  resolvePlatformHostname,
} from "@/lib/tenancy/hostname";
import { updateSession } from "@/lib/supabase/proxy";

function getIncomingHost(
  request: NextRequest
): string {
  return (
    request.headers.get(
      "x-forwarded-host"
    ) ??
    request.headers.get("host") ??
    request.nextUrl.hostname
  );
}

function copyResponseCookies(
  source: NextResponse,
  target: NextResponse
) {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
}

function isJsonRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value
    )
  );
}

function mustChangePassword(
  claims:
    Record<string, unknown> | null
): boolean {
  if (!claims) {
    return false;
  }

  const appMetadata =
    claims.app_metadata;

  return (
    isJsonRecord(
      appMetadata
    ) &&
    appMetadata.must_change_password ===
      true
  );
}

function isPasswordChangePath(
  pathname: string
): boolean {
  return (
    pathname ===
      "/admin/change-password" ||
    pathname.startsWith(
      "/admin/change-password/"
    )
  );
}

function enforceTemporaryPassword(
  request: NextRequest,
  sessionResponse: NextResponse,
  claims:
    Record<string, unknown> | null
): NextResponse | null {
  if (
    !mustChangePassword(
      claims
    )
  ) {
    return null;
  }

  const pathname =
    request.nextUrl.pathname;

  if (
    pathname.startsWith(
      "/api/admin"
    )
  ) {
    const response =
      NextResponse.json(
        {
          ok: false,
          message:
            "Pre korišćenja administracije moraš promeniti privremenu lozinku.",
          code:
            "PASSWORD_CHANGE_REQUIRED",
        },
        {
          status:
            428,
          headers: {
            "Cache-Control":
              "no-store",
          },
        }
      );

    copyResponseCookies(
      sessionResponse,
      response
    );

    return response;
  }

  if (
    pathname.startsWith(
      "/admin"
    ) &&
    !isPasswordChangePath(
      pathname
    )
  ) {
    const redirectUrl =
      request.nextUrl.clone();

    redirectUrl.pathname =
      "/admin/change-password";
    redirectUrl.search =
      "";

    const response =
      NextResponse.redirect(
        redirectUrl
      );

    copyResponseCookies(
      sessionResponse,
      response
    );

    return response;
  }

  return null;
}

export async function proxy(
  request: NextRequest
) {
  const {
    response:
      sessionResponse,
    claims,
  } =
    await updateSession(request);

  const passwordResponse =
    enforceTemporaryPassword(
      request,
      sessionResponse,
      claims
    );

  if (passwordResponse) {
    return passwordResponse;
  }

  const rootHostname =
    getConfiguredPlatformRootHostname();

  const hostnameResolution =
    resolvePlatformHostname(
      getIncomingHost(request),
      rootHostname
    );

  const isTenantHomepage =
    hostnameResolution.kind ===
      "tenant" &&
    request.nextUrl.pathname === "/";

  if (!isTenantHomepage) {
    return sessionResponse;
  }

  const rewriteUrl =
    request.nextUrl.clone();

  rewriteUrl.pathname =
    `/salon/${hostnameResolution.businessSlug}`;

  const rewriteResponse =
    NextResponse.rewrite(
      rewriteUrl,
      {
        request: {
          headers:
            request.headers,
        },
      }
    );

  copyResponseCookies(
    sessionResponse,
    rewriteResponse
  );

  return rewriteResponse;
}

export const config = {
  matcher: [
    /*
     * Proxy se ne pokreće za Next.js statičke
     * fajlove, optimizovane slike i uobičajene
     * javne asset fajlove.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
