import {
  timingSafeEqual,
} from "node:crypto";
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
  processReviewInvitationJobs,
} from "@/lib/reviews/invitation-delivery";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export const revalidate = 0;

function cronResponse<TBody>(
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

function safeEqual(
  left: string,
  right: string
): boolean {
  const leftBuffer =
    Buffer.from(
      left
    );

  const rightBuffer =
    Buffer.from(
      right
    );

  if (
    leftBuffer.length !==
    rightBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    leftBuffer,
    rightBuffer
  );
}

function getPresentedSecret(
  request: NextRequest
): string | null {
  const authorization =
    request.headers.get(
      "authorization"
    );

  if (
    authorization?.startsWith(
      "Bearer "
    )
  ) {
    return authorization
      .slice(
        "Bearer ".length
      )
      .trim();
  }

  return request.headers
    .get(
      "x-cron-secret"
    )
    ?.trim() ??
    null;
}

function authorize(
  request: NextRequest,
  requestId: string
): NextResponse | null {
  const expectedSecret =
    process.env
      .CRON_SECRET
      ?.trim();

  if (!expectedSecret) {
    logServerEvent(
      "error",
      "review.invitation.cron.configuration_missing",
      {
        requestId,
      }
    );

    return cronResponse(
      requestId,
      {
        ok: false,
        message:
          "Review invitation cron is not configured.",
      },
      503
    );
  }

  const presentedSecret =
    getPresentedSecret(
      request
    );

  if (
    !presentedSecret ||
    !safeEqual(
      presentedSecret,
      expectedSecret
    )
  ) {
    logServerEvent(
      "warn",
      "review.invitation.cron.unauthorized",
      {
        requestId,
      }
    );

    return cronResponse(
      requestId,
      {
        ok: false,
        message:
          "Unauthorized.",
      },
      401
    );
  }

  return null;
}

function readBatchLimit(): number {
  const raw =
    process.env
      .REVIEW_INVITATION_CRON_BATCH_LIMIT
      ?.trim();

  const parsed =
    raw
      ? Number.parseInt(
          raw,
          10
        )
      : 50;

  return Number.isFinite(
    parsed
  )
    ? Math.min(
        Math.max(
          parsed,
          1
        ),
        250
      )
    : 50;
}

async function run(
  request: NextRequest
) {
  const requestId =
    createRequestId(
      request.headers
    );

  const authError =
    authorize(
      request,
      requestId
    );

  if (authError) {
    return authError;
  }

  try {
    const result =
      await processReviewInvitationJobs({
        limit:
          readBatchLimit(),
        requestId,
      });

    logServerEvent(
      result.ok
        ? "info"
        : "error",
      "review.invitation.cron.completed",
      {
        requestId,
        checked:
          result.checked,
        eligible:
          result.eligible,
        sent:
          result.sent,
        skipped:
          result.skipped,
        failed:
          result.failed,
      }
    );

    return cronResponse(
      requestId,
      result,
      result.ok
        ? 200
        : 500
    );
  } catch (error) {
    logServerError(
      "review.invitation.cron.unexpected",
      error,
      {
        requestId,
      }
    );

    return cronResponse(
      requestId,
      {
        ok: false,
        checked: 0,
        eligible: 0,
        sent: 0,
        skipped: 0,
        failed: 1,
        message:
          "Review invitation cron failed.",
      },
      500
    );
  }
}

export async function GET(
  request: NextRequest
) {
  return run(
    request
  );
}

export async function POST(
  request: NextRequest
) {
  return run(
    request
  );
}
