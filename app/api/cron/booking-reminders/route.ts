import {
  timingSafeEqual,
} from "node:crypto";
import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  processBookingReminders,
} from "@/lib/notifications/reminders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

function safeEqual(
  left: string,
  right: string
): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

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
    request.headers.get("authorization");

  if (
    authorization?.startsWith("Bearer ")
  ) {
    return authorization
      .slice("Bearer ".length)
      .trim();
  }

  return request.headers
    .get("x-cron-secret")
    ?.trim() ?? null;
}

function authorize(
  request: NextRequest
): NextResponse | null {
  const expectedSecret =
    process.env.CRON_SECRET?.trim();

  if (!expectedSecret) {
    console.error(
      "Booking reminder cron is disabled because CRON_SECRET is missing."
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "Reminder cron is not configured.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const presentedSecret =
    getPresentedSecret(request);

  if (
    !presentedSecret ||
    !safeEqual(
      presentedSecret,
      expectedSecret
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unauthorized.",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  return null;
}

function readBatchLimit(): number {
  const raw =
    process.env.REMINDER_CRON_BATCH_LIMIT
      ?.trim();
  const parsed = raw
    ? Number.parseInt(raw, 10)
    : 250;

  return Number.isFinite(parsed)
    ? Math.min(
        Math.max(parsed, 1),
        1000
      )
    : 250;
}

async function run(
  request: NextRequest
) {
  const authError = authorize(request);

  if (authError) {
    return authError;
  }

  const result =
    await processBookingReminders({
      limit: readBatchLimit(),
    });

  return NextResponse.json(
    result,
    {
      status: result.ok
        ? 200
        : 500,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function GET(
  request: NextRequest
) {
  return run(request);
}

export async function POST(
  request: NextRequest
) {
  return run(request);
}
