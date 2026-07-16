import type {
  NextRequest,
} from "next/server";

import {
  handleTenantGoogleReviewReplyRequest,
} from "@/lib/ai/content-assist/internal-api-server";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export async function POST(
  request:
    NextRequest
) {
  return handleTenantGoogleReviewReplyRequest(
    request
  );
}
