import "server-only";

import {
  logServerError,
  logServerEvent,
} from "@/lib/monitoring/server";
import {
  sendNotificationEmail,
} from "@/lib/notifications/delivery";
import {
  generateReviewInvitationToken,
} from "@/lib/reviews/invitation-token";
import {
  renderReviewInvitationEmail,
} from "@/lib/reviews/invitation-templates";
import {
  hashReviewInvitationToken,
} from "@/lib/reviews/token";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

const DEFAULT_BATCH_LIMIT = 50;
const MAX_BATCH_LIMIT = 250;

type ClaimedJob = {
  job_id: string;
  business_id: string;
  booking_id: string;
  attempt_count: number;
};

type PreparationResult = {
  eligible: boolean;
  reason: string | null;
  invitationId: string | null;
  recipient: string | null;
  businessName: string | null;
  businessSlug: string | null;
  defaultLocale: string | null;
  timezone: string | null;
  customerName: string | null;
  serviceName: unknown;
  employeeName: string | null;
  bookingStartsAt: string | null;
  expiresAt: string | null;
};

export type ReviewInvitationRunResult = {
  ok: boolean;
  checked: number;
  eligible: number;
  sent: number;
  skipped: number;
  failed: number;
  message: string;
};

type FinalStatus =
  | "sent"
  | "skipped"
  | "failed";

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parsePreparation(
  value: unknown
): PreparationResult | null {
  if (
    !isRecord(
      value
    ) ||
    typeof value.eligible !==
      "boolean"
  ) {
    return null;
  }

  return {
    eligible:
      value.eligible,
    reason:
      typeof value.reason ===
        "string"
        ? value.reason
        : null,
    invitationId:
      typeof value.invitationId ===
        "string"
        ? value.invitationId
        : null,
    recipient:
      typeof value.recipient ===
        "string"
        ? value.recipient
        : null,
    businessName:
      typeof value.businessName ===
        "string"
        ? value.businessName
        : null,
    businessSlug:
      typeof value.businessSlug ===
        "string"
        ? value.businessSlug
        : null,
    defaultLocale:
      typeof value.defaultLocale ===
        "string"
        ? value.defaultLocale
        : null,
    timezone:
      typeof value.timezone ===
        "string"
        ? value.timezone
        : null,
    customerName:
      typeof value.customerName ===
        "string"
        ? value.customerName
        : null,
    serviceName:
      value.serviceName,
    employeeName:
      typeof value.employeeName ===
        "string"
        ? value.employeeName
        : null,
    bookingStartsAt:
      typeof value.bookingStartsAt ===
        "string"
        ? value.bookingStartsAt
        : null,
    expiresAt:
      typeof value.expiresAt ===
        "string"
        ? value.expiresAt
        : null,
  };
}

function getLocalizedValue(
  value: unknown,
  preferredLocale: string
): string {
  if (
    typeof value ===
      "string"
  ) {
    return value.trim();
  }

  if (
    !isRecord(
      value
    )
  ) {
    return "";
  }

  const preferred =
    value[
      preferredLocale
    ];

  if (
    typeof preferred ===
      "string" &&
    preferred.trim()
  ) {
    return preferred.trim();
  }

  for (
    const locale of [
      "sr-Latn",
      "mk",
      "hr",
      "sq",
      "en",
      "de",
      "fr",
    ]
  ) {
    const candidate =
      value[locale];

    if (
      typeof candidate ===
        "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return "";
}

function normalizeBaseUrl(
  rawValue: string
): string {
  const value =
    rawValue.trim();

  const candidate =
    value.includes(
      "://"
    )
      ? value
      : `https://${value}`;

  const url =
    new URL(candidate);

  if (
    process.env.NODE_ENV ===
      "production" &&
    url.protocol !==
      "https:"
  ) {
    throw new Error(
      "Review public base URL must use HTTPS in production."
    );
  }

  if (
    url.protocol !==
      "https:" &&
    url.protocol !==
      "http:"
  ) {
    throw new Error(
      "Review public base URL must use HTTP or HTTPS."
    );
  }

  return url
    .toString()
    .replace(
      /\/+$/g,
      ""
    );
}

export function getReviewPublicBaseUrl(): string {
  const configured = [
    process.env
      .REVIEW_PUBLIC_BASE_URL,
    process.env
      .NEXT_PUBLIC_SITE_URL,
    process.env
      .NEXT_PUBLIC_APP_URL,
    process.env
      .VERCEL_PROJECT_PRODUCTION_URL,
    process.env
      .VERCEL_URL,
  ].find(
    (
      value
    ): value is string =>
      Boolean(
        value?.trim()
      )
  );

  if (configured) {
    return normalizeBaseUrl(
      configured
    );
  }

  if (
    process.env.NODE_ENV !==
      "production"
  ) {
    return "http://localhost:3000";
  }

  throw new Error(
    "REVIEW_PUBLIC_BASE_URL is required in production."
  );
}

export function createReviewInvitationUrl(
  token: string
): string {
  return `${
    getReviewPublicBaseUrl()
  }/reviews/invitation/${
    encodeURIComponent(
      token
    )
  }`;
}

async function completeJob({
  jobId,
  invitationId,
  deliveryId,
  status,
  errorMessage,
}: {
  jobId: string;
  invitationId:
    | string
    | null;
  deliveryId:
    | string
    | null;
  status: FinalStatus;
  errorMessage:
    | string
    | null;
}): Promise<void> {
  const supabase =
    createAdminClient();

  const {
    error,
  } = await supabase.rpc(
    "complete_review_invitation_delivery",
    {
      p_job_id:
        jobId,
      p_invitation_id:
        invitationId,
      p_notification_delivery_id:
        deliveryId,
      p_outcome:
        status,
      p_error:
        errorMessage,
    }
  );

  if (error) {
    throw new Error(
      `Review invitation job could not be completed: ${error.message}`
    );
  }
}

async function processClaimedJob(
  job: ClaimedJob,
  requestId?: string
): Promise<
  | "sent"
  | "skipped"
  | "failed"
> {
  const supabase =
    createAdminClient();

  const rawToken =
    generateReviewInvitationToken();

  const tokenHash =
    hashReviewInvitationToken(
      rawToken
    );

  let invitationId:
    | string
    | null =
      null;

  try {
    const {
      data,
      error,
    } = await supabase.rpc(
      "prepare_review_invitation_delivery",
      {
        p_job_id:
          job.job_id,
        p_token_hash:
          tokenHash,
      }
    );

    if (error) {
      throw new Error(
        `Review invitation could not be prepared: ${error.message}`
      );
    }

    const preparation =
      parsePreparation(
        data
      );

    if (!preparation) {
      throw new Error(
        "Review invitation preparation returned an invalid result."
      );
    }

    invitationId =
      preparation.invitationId;

    if (
      !preparation.eligible
    ) {
      logServerEvent(
        "info",
        "review.invitation.skipped",
        {
          requestId:
            requestId ?? null,
          jobId:
            job.job_id,
          bookingId:
            job.booking_id,
          businessId:
            job.business_id,
          reason:
            preparation.reason,
        }
      );

      return "skipped";
    }

    if (
      !preparation.invitationId ||
      !preparation.recipient ||
      !preparation.businessName ||
      !preparation.businessSlug ||
      !preparation.defaultLocale ||
      !preparation.timezone ||
      !preparation.customerName ||
      !preparation.employeeName ||
      !preparation.bookingStartsAt ||
      !preparation.expiresAt
    ) {
      throw new Error(
        "Eligible review invitation context is incomplete."
      );
    }

    const serviceName =
      getLocalizedValue(
        preparation.serviceName,
        preparation.defaultLocale
      ) || "Usluga";

    const reviewUrl =
      createReviewInvitationUrl(
        rawToken
      );

    const content =
      renderReviewInvitationEmail({
        locale:
          preparation.defaultLocale,
        businessName:
          preparation.businessName,
        customerName:
          preparation.customerName,
        serviceName,
        employeeName:
          preparation.employeeName,
        startsAt:
          preparation.bookingStartsAt,
        timezone:
          preparation.timezone,
        reviewUrl,
        expiresAt:
          preparation.expiresAt,
      });

    const delivery =
      await sendNotificationEmail({
        scope:
          "business",
        audience:
          "customer",
        templateKey:
          "review_invitation",
        dedupeKey:
          `review-invitation:${preparation.invitationId}:${tokenHash.slice(0, 16)}`,
        recipient:
          preparation.recipient,
        businessId:
          job.business_id,
        bookingId:
          job.booking_id,
        ...content,
        metadata: {
          invitationId:
            preparation.invitationId,
          invitationExpiresAt:
            preparation.expiresAt,
          bookingStartsAt:
            preparation.bookingStartsAt,
          attemptCount:
            job.attempt_count,
        },
      });

    const outcome:
      FinalStatus =
        delivery.ok &&
        delivery.status ===
          "sent"
          ? "sent"
          : delivery.ok
            ? "skipped"
            : "failed";

    await completeJob({
      jobId:
        job.job_id,
      invitationId:
        preparation.invitationId,
      deliveryId:
        delivery.deliveryId ??
        null,
      status:
        outcome,
      errorMessage:
        outcome === "sent"
          ? null
          : delivery.message,
    });

    logServerEvent(
      outcome ===
        "failed"
        ? "warn"
        : "info",
      "review.invitation.delivery.completed",
      {
        requestId:
          requestId ?? null,
        jobId:
          job.job_id,
        bookingId:
          job.booking_id,
        businessId:
          job.business_id,
        invitationId:
          preparation.invitationId,
        deliveryId:
          delivery.deliveryId ??
          null,
        outcome,
      }
    );

    return outcome;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown review invitation delivery error.";

    try {
      await completeJob({
        jobId:
          job.job_id,
        invitationId,
        deliveryId:
          null,
        status:
          "failed",
        errorMessage,
      });
    } catch (
      completionError
    ) {
      logServerError(
        "review.invitation.completion.failed",
        completionError,
        {
          requestId:
            requestId ?? null,
          jobId:
            job.job_id,
          bookingId:
            job.booking_id,
          businessId:
            job.business_id,
        }
      );
    }

    logServerError(
      "review.invitation.delivery.failed",
      error,
      {
        requestId:
          requestId ?? null,
        jobId:
          job.job_id,
        bookingId:
          job.booking_id,
        businessId:
          job.business_id,
        invitationId,
      }
    );

    return "failed";
  }
}

export async function processReviewInvitationJobs({
  limit =
    DEFAULT_BATCH_LIMIT,
  requestId,
}: {
  limit?: number;
  requestId?: string;
} = {}): Promise<
  ReviewInvitationRunResult
> {
  const supabase =
    createAdminClient();

  const safeLimit =
    Math.min(
      Math.max(
        Math.trunc(
          limit
        ),
        1
      ),
      MAX_BATCH_LIMIT
    );

  const {
    data,
    error,
  } = await supabase.rpc(
    "claim_due_review_invitation_jobs",
    {
      p_limit:
        safeLimit,
    }
  );

  if (error) {
    logServerError(
      "review.invitation.claim.failed",
      error,
      {
        requestId:
          requestId ?? null,
        limit:
          safeLimit,
      }
    );

    return {
      ok: false,
      checked: 0,
      eligible: 0,
      sent: 0,
      skipped: 0,
      failed: 1,
      message:
        "Review invitation claim failed.",
    };
  }

  const jobs =
    Array.isArray(
      data
    )
      ? data as unknown as ClaimedJob[]
      : [];

  let eligible = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (
    const job of jobs
  ) {
    const outcome =
      await processClaimedJob(
        job,
        requestId
      );

    if (
      outcome ===
      "sent"
    ) {
      eligible += 1;
      sent += 1;
    } else if (
      outcome ===
      "skipped"
    ) {
      skipped += 1;
    } else {
      eligible += 1;
      failed += 1;
    }
  }

  const result = {
    ok:
      failed === 0,
    checked:
      jobs.length,
    eligible,
    sent,
    skipped,
    failed,
    message:
      `Provereno: ${jobs.length}. Poslato: ${sent}. Preskočeno: ${skipped}. Greške: ${failed}.`,
  };

  logServerEvent(
    result.ok
      ? "info"
      : "warn",
    "review.invitation.run.completed",
    {
      requestId:
        requestId ?? null,
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

  return result;
}
