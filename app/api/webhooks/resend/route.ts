import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  createRequestId,
  logServerError,
  logServerEvent,
  withRequestId,
} from "@/lib/monitoring/server";
import {
  processResendWebhookEvent,
} from "@/lib/notifications/webhook-events";
import {
  ResendWebhookVerificationError,
  verifyResendWebhookSignature,
} from "@/lib/notifications/webhook-signature";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export const revalidate =
  0;

function webhookResponse<TBody>(
  requestId: string,
  body: TBody,
  status: number
) {
  return withRequestId(
    NextResponse.json(
      body,
      {
        status,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    ),
    requestId
  );
}

function getToleranceSeconds(): number {
  const raw =
    process.env
      .RESEND_WEBHOOK_TOLERANCE_SECONDS
      ?.trim();

  if (!raw) {
    return 5 * 60;
  }

  const parsed =
    Number.parseInt(
      raw,
      10
    );

  if (
    !Number.isFinite(parsed) ||
    parsed < 30 ||
    parsed > 60 * 60
  ) {
    return 5 * 60;
  }

  return parsed;
}

export async function POST(
  request: NextRequest
) {
  const requestId =
    createRequestId(
      request.headers
    );
  const secret =
    process.env
      .RESEND_WEBHOOK_SECRET
      ?.trim();

  if (!secret) {
    logServerEvent(
      "error",
      "notification.webhook.configuration_missing",
      {
        requestId,
      }
    );

    return webhookResponse(
      requestId,
      {
        ok: false,
        message:
          "Webhook endpoint is not configured.",
      },
      503
    );
  }

  const payload =
    await request.text();

  const svixId =
    request.headers.get(
      "svix-id"
    );

  try {
    verifyResendWebhookSignature({
      payload,
      svixId,
      svixTimestamp:
        request.headers.get(
          "svix-timestamp"
        ),
      svixSignature:
        request.headers.get(
          "svix-signature"
        ),
      secret,
      toleranceSeconds:
        getToleranceSeconds(),
    });
  } catch (error) {
    logServerError(
      "notification.webhook.signature_rejected",
      error,
      {
        requestId,
        svixId:
          svixId ?? null,
      }
    );

    return webhookResponse(
      requestId,
      {
        ok: false,
        message:
          error instanceof
          ResendWebhookVerificationError
            ? "Invalid webhook signature."
            : "Invalid webhook.",
      },
      400
    );
  }

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(payload);
  } catch {
    logServerEvent(
      "warn",
      "notification.webhook.invalid_json",
      {
        requestId,
        svixId:
          svixId ?? null,
      }
    );

    return webhookResponse(
      requestId,
      {
        ok: false,
        message:
          "Webhook payload is not valid JSON.",
      },
      400
    );
  }

  try {
    const result =
      await processResendWebhookEvent({
        svixId:
          svixId as string,
        payload:
          parsed,
        requestId,
      });

    logServerEvent(
      result.matched
        ? "info"
        : result.ignored ||
            result.duplicate
          ? "info"
          : "warn",
      "notification.webhook.processed",
      {
        requestId,
        svixId:
          svixId ?? null,
        duplicate:
          result.duplicate,
        ignored:
          result.ignored,
        matched:
          result.matched,
        providerStatus:
          result.providerStatus,
        deliveryId:
          result.deliveryId,
      }
    );

    return webhookResponse(
      requestId,
      result,
      200
    );
  } catch (error) {
    logServerError(
      "notification.webhook.processing_failed",
      error,
      {
        requestId,
        svixId:
          svixId ?? null,
      }
    );

    /*
     * Non-2xx response intentionally asks Resend/Svix
     * to retry the same event.
     */
    return webhookResponse(
      requestId,
      {
        ok: false,
        message:
          "Webhook processing failed.",
      },
      500
    );
  }
}
