import type { NextRequest } from "next/server";

import { jsonError, jsonResponse } from "@/lib/api/http";
import { sendContactRequestEmail } from "@/lib/marketing/contact-email";
import { validateContactRequest } from "@/lib/marketing/contact-validation";
import { createRequestId, logServerError, logServerEvent, withRequestId } from "@/lib/monitoring/server";
import { consumeRateLimit, getClientAddress, getRateLimitHeaders } from "@/lib/security/rate-limit";
import { readJsonBodyWithLimit } from "@/lib/security/request-body";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const MAX_CONTACT_BYTES = 12 * 1024;

export async function POST(request: NextRequest) {
  const requestId = createRequestId(request.headers);
  const error = (status: number, message: string, code: string, headers?: HeadersInit) =>
    withRequestId(jsonError(status, message, code, { headers }), requestId);

  try {
    const body = await readJsonBodyWithLimit(request, MAX_CONTACT_BYTES);
    if (!body.ok) return error(body.status, body.message, body.code);

    const validation = validateContactRequest(body.value);
    if (!validation.ok) return error(400, validation.message, "INVALID_CONTACT_REQUEST");

    if (validation.value.website) {
      logServerEvent("info", "platform_contact.honeypot_blocked", { requestId });
      return withRequestId(jsonResponse({ ok: true, message: "Upit je primljen." }, 200), requestId);
    }

    const rateLimit = await consumeRateLimit({
      scope: "platform_contact_submit",
      parts: [getClientAddress(request.headers), validation.value.email],
      limit: 4,
      windowSeconds: 60 * 60,
      failureMode: "closed",
      requestId,
    });
    const headers = getRateLimitHeaders(rateLimit);
    if (!rateLimit.allowed) {
      return error(429, "Previše pokušaja. Pokušajte ponovo malo kasnije.", "CONTACT_RATE_LIMITED", headers);
    }

    const result = await sendContactRequestEmail(validation.value, requestId);
    logServerEvent("info", "platform_contact.sent", { requestId, providerMessageId: result.id });

    return withRequestId(jsonResponse({ ok: true, message: "Upit je poslat." }, 200, { headers }), requestId);
  } catch (cause) {
    logServerError("platform_contact.failed", cause, { requestId });
    return error(503, "Poruka trenutno nije poslata. Pokušajte ponovo.", "CONTACT_UNAVAILABLE");
  }
}
