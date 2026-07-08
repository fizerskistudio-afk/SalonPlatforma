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

export async function proxy(
  request: NextRequest
) {
  const sessionResponse =
    await updateSession(request);

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
