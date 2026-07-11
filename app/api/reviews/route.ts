import {
  type NextRequest,
} from "next/server";

import {
  jsonError,
  jsonResponse,
} from "@/lib/api/http";
import {
  createRequestId,
  logServerError,
  logServerEvent,
  withRequestId,
} from "@/lib/monitoring/server";
import {
  validateDirectReviewRequest,
} from "@/lib/reviews/public-validation";
import {
  consumeRateLimit,
  getClientAddress,
  getRateLimitHeaders,
} from "@/lib/security/rate-limit";
import {
  readJsonBodyWithLimit,
} from "@/lib/security/request-body";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

const MAX_REVIEW_REQUEST_BYTES =
  12 * 1024;

const DATABASE_ERROR_CODES = [
  "INVALID_REVIEW_PAYLOAD",
  "REVIEW_SUBMISSION_NOT_AVAILABLE",
] as const;

type DatabaseErrorCode =
  (typeof DATABASE_ERROR_CODES)[number];

type DatabaseErrorPayload = {
  message?: string | null;
  details?: string | null;
  hint?: string | null;
  code?: string | null;
};

type JsonRecord = Record<
  string,
  unknown
>;

type ReviewSubmissionResult = {
  id: string;
  status: string;
  isVerifiedVisit: boolean;
};

function isJsonRecord(
  value: unknown
): value is JsonRecord {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseReviewResult(
  value: unknown
): ReviewSubmissionResult | null {
  if (
    !isJsonRecord(
      value
    ) ||
    typeof value.reviewId !==
      "string" ||
    typeof value.status !==
      "string" ||
    typeof value.isVerifiedVisit !==
      "boolean"
  ) {
    return null;
  }

  return {
    id:
      value.reviewId,
    status:
      value.status,
    isVerifiedVisit:
      value.isVerifiedVisit,
  };
}

function extractDatabaseErrorCode(
  error: DatabaseErrorPayload
): DatabaseErrorCode | null {
  const message = [
    error.message,
    error.details,
    error.hint,
  ]
    .filter(
      (
        value
      ): value is string =>
        typeof value ===
          "string"
    )
    .join(" ")
    .toUpperCase();

  for (
    const code of
    DATABASE_ERROR_CODES
  ) {
    if (
      message.includes(
        code
      )
    ) {
      return code;
    }
  }

  return null;
}

export async function POST(
  request: NextRequest
) {
  const requestId =
    createRequestId(
      request.headers
    );

  const respondError = (
    status: number,
    message: string,
    code: string,
    headers?: HeadersInit
  ) =>
    withRequestId(
      jsonError(
        status,
        message,
        code,
        {
          headers,
        }
      ),
      requestId
    );

  try {
    const bodyResult =
      await readJsonBodyWithLimit(
        request,
        MAX_REVIEW_REQUEST_BYTES
      );

    if (!bodyResult.ok) {
      return respondError(
        bodyResult.status,
        bodyResult.message,
        bodyResult.code
      );
    }

    const validation =
      validateDirectReviewRequest(
        bodyResult.value
      );

    if (!validation.ok) {
      return respondError(
        validation.error.status,
        validation.error.message,
        validation.error.code
      );
    }

    const {
      businessSlug,
      authorName,
      rating,
      body,
      languageCode,
    } =
      validation.value;

    const clientAddress =
      getClientAddress(
        request.headers
      );

    const [
      tenantLimit,
      globalLimit,
    ] =
      await Promise.all([
        consumeRateLimit({
          scope:
            "review-direct-address-tenant",
          parts: [
            clientAddress,
            businessSlug,
          ],
          limit: 3,
          windowSeconds:
            30 * 60,
          failureMode:
            "closed",
          requestId,
        }),
        consumeRateLimit({
          scope:
            "review-direct-address-global",
          parts: [
            clientAddress,
          ],
          limit: 10,
          windowSeconds:
            24 * 60 * 60,
          failureMode:
            "closed",
          requestId,
        }),
      ]);

    const blockedLimit =
      !tenantLimit.allowed
        ? tenantLimit
        : !globalLimit.allowed
          ? globalLimit
          : null;

    if (blockedLimit) {
      if (
        blockedLimit.unavailable
      ) {
        logServerEvent(
          "error",
          "review.direct.rate_limit.unavailable",
          {
            requestId,
            businessSlug,
          }
        );

        return respondError(
          503,
          "Review protection is temporarily unavailable.",
          "RATE_LIMIT_UNAVAILABLE"
        );
      }

      logServerEvent(
        "warn",
        "review.direct.rate_limit.blocked",
        {
          requestId,
          businessSlug,
        }
      );

      return respondError(
        429,
        "Too many review attempts. Please try again later.",
        "RATE_LIMITED",
        getRateLimitHeaders(
          blockedLimit
        )
      );
    }

    const supabase =
      createAdminClient();

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "submit_direct_review",
        {
          input_payload: {
            businessSlug,
            authorName,
            rating,
            body,
            languageCode,
          },
        }
      );

    if (error) {
      const databaseCode =
        extractDatabaseErrorCode(
          error
        );

      if (
        databaseCode ===
        "REVIEW_SUBMISSION_NOT_AVAILABLE"
      ) {
        return respondError(
          404,
          "Review submission is not available.",
          databaseCode
        );
      }

      if (
        databaseCode ===
        "INVALID_REVIEW_PAYLOAD"
      ) {
        return respondError(
          400,
          "Review request is invalid.",
          databaseCode
        );
      }

      logServerError(
        "review.direct.submit.failed",
        error,
        {
          requestId,
          businessSlug,
        }
      );

      return respondError(
        500,
        "Failed to submit review.",
        "REVIEW_SUBMIT_FAILED"
      );
    }

    const review =
      parseReviewResult(
        data
      );

    if (!review) {
      logServerEvent(
        "error",
        "review.direct.submit.invalid_result",
        {
          requestId,
          businessSlug,
        }
      );

      return respondError(
        500,
        "Review was submitted but no result was returned.",
        "INVALID_REVIEW_RESULT"
      );
    }

    logServerEvent(
      "info",
      "review.direct.submit.succeeded",
      {
        requestId,
        businessSlug,
        reviewId:
          review.id,
        reviewStatus:
          review.status,
      }
    );

    return withRequestId(
      jsonResponse(
        {
          ok: true,
          review,
        },
        201,
        {
          headers:
            getRateLimitHeaders(
              tenantLimit
            ),
        }
      ),
      requestId
    );
  } catch (error) {
    logServerError(
      "review.direct.unexpected",
      error,
      {
        requestId,
      }
    );

    return respondError(
      500,
      "Unexpected review error.",
      "UNKNOWN_REVIEW_ERROR"
    );
  }
}
