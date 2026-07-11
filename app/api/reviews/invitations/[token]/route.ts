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
  validateVerifiedReviewRequest,
} from "@/lib/reviews/public-validation";
import {
  hashReviewInvitationToken,
  normalizeReviewInvitationToken,
} from "@/lib/reviews/token";
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
  "REVIEW_LINK_INVALID",
] as const;

type DatabaseErrorCode =
  (typeof DATABASE_ERROR_CODES)[number];

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

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

type InvitationContext = {
  businessSlug: string;
  businessName: string;
  defaultLocale: string;
  bookingStartsAt: string;
  serviceName: unknown;
  employeeName: string;
  expiresAt: string;
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
    value.isVerifiedVisit !==
      true
  ) {
    return null;
  }

  return {
    id:
      value.reviewId,
    status:
      value.status,
    isVerifiedVisit:
      true,
  };
}

function parseInvitationContext(
  value: unknown
): InvitationContext | null {
  if (
    !isJsonRecord(
      value
    ) ||
    typeof value.businessSlug !==
      "string" ||
    typeof value.businessName !==
      "string" ||
    typeof value.defaultLocale !==
      "string" ||
    typeof value.bookingStartsAt !==
      "string" ||
    typeof value.employeeName !==
      "string" ||
    typeof value.expiresAt !==
      "string"
  ) {
    return null;
  }

  return {
    businessSlug:
      value.businessSlug,
    businessName:
      value.businessName,
    defaultLocale:
      value.defaultLocale,
    bookingStartsAt:
      value.bookingStartsAt,
    serviceName:
      value.serviceName,
    employeeName:
      value.employeeName,
    expiresAt:
      value.expiresAt,
  };
}

function extractDatabaseErrorCode(
  error: DatabaseErrorPayload
): DatabaseErrorCode | "REVIEW_ALREADY_SUBMITTED" | null {
  if (
    error.code ===
    "23505"
  ) {
    return "REVIEW_ALREADY_SUBMITTED";
  }

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

async function resolveTokenHash(
  context: RouteContext
): Promise<string | null> {
  const {
    token: rawToken,
  } =
    await context.params;

  const token =
    normalizeReviewInvitationToken(
      rawToken
    );

  return token
    ? hashReviewInvitationToken(
        token
      )
    : null;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
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
    const tokenHash =
      await resolveTokenHash(
        context
      );

    if (!tokenHash) {
      return respondError(
        404,
        "Review link is invalid or unavailable.",
        "REVIEW_LINK_INVALID"
      );
    }

    const clientAddress =
      getClientAddress(
        request.headers
      );

    const rateLimit =
      await consumeRateLimit({
        scope:
          "review-link-read-address-token",
        parts: [
          clientAddress,
          tokenHash,
        ],
        limit: 30,
        windowSeconds:
          15 * 60,
        failureMode:
          "closed",
        requestId,
      });

    if (!rateLimit.allowed) {
      if (
        rateLimit.unavailable
      ) {
        return respondError(
          503,
          "Review protection is temporarily unavailable.",
          "RATE_LIMIT_UNAVAILABLE"
        );
      }

      return respondError(
        429,
        "Too many review link attempts. Please try again later.",
        "RATE_LIMITED",
        getRateLimitHeaders(
          rateLimit
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
        "get_review_invitation_context",
        {
          p_token_hash:
            tokenHash,
        }
      );

    if (error) {
      const databaseCode =
        extractDatabaseErrorCode(
          error
        );

      if (
        databaseCode ===
        "REVIEW_LINK_INVALID"
      ) {
        return respondError(
          404,
          "Review link is invalid or unavailable.",
          "REVIEW_LINK_INVALID"
        );
      }

      logServerError(
        "review.verified.context.failed",
        error,
        {
          requestId,
        }
      );

      return respondError(
        500,
        "Failed to load review link.",
        "REVIEW_LINK_LOAD_FAILED"
      );
    }

    const invitation =
      parseInvitationContext(
        data
      );

    if (!invitation) {
      logServerEvent(
        "error",
        "review.verified.context.invalid_result",
        {
          requestId,
        }
      );

      return respondError(
        500,
        "Review link returned an invalid result.",
        "INVALID_REVIEW_LINK_RESULT"
      );
    }

    return withRequestId(
      jsonResponse(
        {
          ok: true,
          invitation,
        },
        200,
        {
          headers:
            getRateLimitHeaders(
              rateLimit
            ),
        }
      ),
      requestId
    );
  } catch (error) {
    logServerError(
      "review.verified.context.unexpected",
      error,
      {
        requestId,
      }
    );

    return respondError(
      500,
      "Unexpected review link error.",
      "UNKNOWN_REVIEW_LINK_ERROR"
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
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
    const tokenHash =
      await resolveTokenHash(
        context
      );

    if (!tokenHash) {
      return respondError(
        404,
        "Review link is invalid or unavailable.",
        "REVIEW_LINK_INVALID"
      );
    }

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
      validateVerifiedReviewRequest(
        bodyResult.value
      );

    if (!validation.ok) {
      return respondError(
        validation.error.status,
        validation.error.message,
        validation.error.code
      );
    }

    const clientAddress =
      getClientAddress(
        request.headers
      );

    const [
      addressLimit,
      tokenLimit,
    ] =
      await Promise.all([
        consumeRateLimit({
          scope:
            "review-verified-address-token",
          parts: [
            clientAddress,
            tokenHash,
          ],
          limit: 5,
          windowSeconds:
            60 * 60,
          failureMode:
            "closed",
          requestId,
        }),
        consumeRateLimit({
          scope:
            "review-verified-token",
          parts: [
            tokenHash,
          ],
          limit: 6,
          windowSeconds:
            60 * 60,
          failureMode:
            "closed",
          requestId,
        }),
      ]);

    const blockedLimit =
      !addressLimit.allowed
        ? addressLimit
        : !tokenLimit.allowed
          ? tokenLimit
          : null;

    if (blockedLimit) {
      if (
        blockedLimit.unavailable
      ) {
        return respondError(
          503,
          "Review protection is temporarily unavailable.",
          "RATE_LIMIT_UNAVAILABLE"
        );
      }

      logServerEvent(
        "warn",
        "review.verified.rate_limit.blocked",
        {
          requestId,
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

    const {
      authorName,
      rating,
      body,
      languageCode,
    } =
      validation.value;

    const supabase =
      createAdminClient();

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "submit_verified_review",
        {
          p_token_hash:
            tokenHash,
          input_payload: {
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
        "REVIEW_LINK_INVALID"
      ) {
        return respondError(
          404,
          "Review link is invalid or unavailable.",
          "REVIEW_LINK_INVALID"
        );
      }

      if (
        databaseCode ===
        "REVIEW_ALREADY_SUBMITTED"
      ) {
        return respondError(
          409,
          "A review has already been submitted for this visit.",
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
        "review.verified.submit.failed",
        error,
        {
          requestId,
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
        "review.verified.submit.invalid_result",
        {
          requestId,
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
      "review.verified.submit.succeeded",
      {
        requestId,
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
              addressLimit
            ),
        }
      ),
      requestId
    );
  } catch (error) {
    logServerError(
      "review.verified.unexpected",
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
