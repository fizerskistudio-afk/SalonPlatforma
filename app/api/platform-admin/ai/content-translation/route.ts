import type {
  NextRequest,
} from "next/server";

import {
  handlePlatformAdminContentTranslationRequest,
} from "@/lib/ai/content-assist/internal-api-server";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export async function POST(
  request:
    NextRequest
) {
  return handlePlatformAdminContentTranslationRequest(
    request
  );
}
