import {
  type NextRequest,
  NextResponse,
} from "next/server";

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
  const secret =
    process.env
      .RESEND_WEBHOOK_SECRET
      ?.trim();

  if (!secret) {
    console.error(
      "RESEND_WEBHOOK_SECRET is missing."
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "Webhook endpoint is not configured.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
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
    const message =
      error instanceof Error
        ? error.message
        : "Invalid Resend webhook signature.";

    console.warn(
      "Rejected Resend webhook:",
      {
        svixId,
        error:
          message,
      }
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof
          ResendWebhookVerificationError
            ? message
            : "Invalid webhook.",
      },
      {
        status: 400,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(payload);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Webhook payload is not valid JSON.",
      },
      {
        status: 400,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }

  try {
    const result =
      await processResendWebhookEvent({
        svixId:
          svixId as string,
        payload:
          parsed,
      });

    return NextResponse.json(
      result,
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Resend webhook processing failed:",
      {
        svixId,
        error,
      }
    );

    /*
     * Non-2xx response intentionally asks Resend/Svix
     * to retry the same event.
     */
    return NextResponse.json(
      {
        ok: false,
        message:
          "Webhook processing failed.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}
