import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(
  request: NextRequest
) {
  return updateSession(request);
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