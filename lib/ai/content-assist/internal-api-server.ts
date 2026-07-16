import "server-only";

import {
  jsonResponse,
} from "@/lib/api/http";
import {
  resolvePlatformAdminTranslationAuth,
  resolveTenantGoogleReviewReplyAuth,
} from "@/lib/ai/content-assist/auth-adapters-server";
import {
  getAiContentAssistHttpStatus,
  toAiContentAssistApiEnvelope,
} from "@/lib/ai/content-assist/api-contract";
import {
  AiContentAssistValidationError,
} from "@/lib/ai/content-assist/domain";
import {
  GoogleReviewContextLoadError,
  loadGoogleReviewReplyContext,
} from "@/lib/ai/content-assist/google-review-context-server";
import {
  invokeAiContentAssistForBusiness,
} from "@/lib/ai/content-assist/invocation-server";
import {
  getAiContentAssistRequestId,
  readAiContentAssistJsonBody,
} from "@/lib/ai/content-assist/request-body-server";
import {
  AiContentAssistRequestContractError,
  parsePlatformAdminTranslationCommand,
  parseTenantGoogleReviewReplyCommand,
} from "@/lib/ai/content-assist/request-contract";
import {
  loadAiContentAssistUsageSnapshot,
} from "@/lib/ai/content-assist/usage-server";
import {
  logServerError,
  withRequestId,
} from "@/lib/monitoring/server";

type ApiFailureBody = {
  ok: false;
  requestId: string;
  code: string;
  message: string;
  retryable: boolean;
  blockedBy:
    string | null;
  quota: null;
};

function failureResponse({
  requestId,
  status,
  code,
  message,
  retryable =
    false,
  blockedBy =
    null,
}: {
  requestId: string;
  status: number;
  code: string;
  message: string;
  retryable?: boolean;
  blockedBy?:
    string | null;
}) {
  return withRequestId(
    jsonResponse<ApiFailureBody>(
      {
        ok:
          false,
        requestId,
        code,
        message,
        retryable,
        blockedBy,
        quota:
          null,
      },
      status
    ),
    requestId
  );
}

function invocationResponse(
  result:
    Awaited<
      ReturnType<
        typeof invokeAiContentAssistForBusiness
      >
    >,
  requestId: string
) {
  return withRequestId(
    jsonResponse(
      toAiContentAssistApiEnvelope(
        result
      ),
      getAiContentAssistHttpStatus(
        result
      )
    ),
    requestId
  );
}

function requestContractFailure(
  error: unknown,
  requestId: string
) {
  if (
    error instanceof
      AiContentAssistRequestContractError ||
    error instanceof
      AiContentAssistValidationError
  ) {
    return failureResponse({
      requestId,
      status:
        400,
      code:
        error.code,
      message:
        error.message,
      blockedBy:
        "validation",
    });
  }

  return null;
}

export async function handlePlatformAdminContentTranslationRequest(
  request:
    Request
): Promise<Response> {
  const requestId =
    getAiContentAssistRequestId(
      request.headers
    );

  try {
    const body =
      await readAiContentAssistJsonBody(
        request
      );

    if (
      !body.ok
    ) {
      return failureResponse({
        requestId,
        status:
          body.status,
        code:
          body.code,
        message:
          body.message,
        blockedBy:
          "validation",
      });
    }

    let command:
      ReturnType<
        typeof parsePlatformAdminTranslationCommand
      >;

    try {
      command =
        parsePlatformAdminTranslationCommand({
          value:
            body.value,
          requestId,
        });
    } catch (
      error
    ) {
      const response =
        requestContractFailure(
          error,
          requestId
        );

      if (
        response
      ) {
        return response;
      }

      throw error;
    }

    const authorization =
      await resolvePlatformAdminTranslationAuth({
        businessId:
          command.businessId,
      });

    if (
      !authorization.ok
    ) {
      return failureResponse({
        requestId,
        status:
          authorization.status,
        code:
          authorization.code,
        message:
          authorization.message,
        blockedBy:
          "authorization",
      });
    }

    const usage =
      await loadAiContentAssistUsageSnapshot({
        businessId:
          authorization.businessId,
        task:
          "content_translation",
        surface:
          authorization.surface,
      });

    const result =
      await invokeAiContentAssistForBusiness({
        businessId:
          authorization.businessId,
        actor:
          authorization.actor,
        surface:
          authorization.surface,
        surfaceContext:
          {},
        usage,
        request:
          command.request,
      });

    return invocationResponse(
      result,
      requestId
    );
  } catch (
    error
  ) {
    logServerError(
      "ai.content_assist.internal_api_failed",
      error,
      {
        requestId,
        surface:
          "platform_admin_content_translation",
      }
    );

    return failureResponse({
      requestId,
      status:
        500,
      code:
        "AI_INTERNAL_ERROR",
      message:
        "AI zahtev trenutno nije moguće obraditi.",
      retryable:
        true,
      blockedBy:
        "internal",
    });
  }
}

export async function handleTenantGoogleReviewReplyRequest(
  request:
    Request
): Promise<Response> {
  const requestId =
    getAiContentAssistRequestId(
      request.headers
    );

  try {
    const body =
      await readAiContentAssistJsonBody(
        request
      );

    if (
      !body.ok
    ) {
      return failureResponse({
        requestId,
        status:
          body.status,
        code:
          body.code,
        message:
          body.message,
        blockedBy:
          "validation",
      });
    }

    let command:
      ReturnType<
        typeof parseTenantGoogleReviewReplyCommand
      >;

    try {
      command =
        parseTenantGoogleReviewReplyCommand({
          value:
            body.value,
          requestId,
        });
    } catch (
      error
    ) {
      const response =
        requestContractFailure(
          error,
          requestId
        );

      if (
        response
      ) {
        return response;
      }

      throw error;
    }

    const authorization =
      await resolveTenantGoogleReviewReplyAuth();

    if (
      !authorization.ok
    ) {
      return failureResponse({
        requestId,
        status:
          authorization.status,
        code:
          authorization.code,
        message:
          authorization.message,
        blockedBy:
          "authorization",
      });
    }

    let reviewContext:
      Awaited<
        ReturnType<
          typeof loadGoogleReviewReplyContext
        >
      >;

    try {
      reviewContext =
        await loadGoogleReviewReplyContext({
          businessId:
            authorization.businessId,
          reviewId:
            command.reviewId,
          requestId,
          targetLocale:
            command.targetLocale,
          tone:
            command.tone,
        });
    } catch (
      error
    ) {
      if (
        error instanceof
        GoogleReviewContextLoadError
      ) {
        return failureResponse({
          requestId,
          status:
            503,
          code:
            "AI_REVIEW_CONTEXT_UNAVAILABLE",
          message:
            error.message,
          retryable:
            true,
          blockedBy:
            "review_context",
        });
      }

      throw error;
    }

    if (
      !reviewContext.ok
    ) {
      return failureResponse({
        requestId,
        status:
          reviewContext.status,
        code:
          reviewContext.code,
        message:
          reviewContext.message,
        blockedBy:
          "review_context",
      });
    }

    const usage =
      await loadAiContentAssistUsageSnapshot({
        businessId:
          authorization.businessId,
        task:
          "review_reply_draft",
        surface:
          authorization.surface,
      });

    const result =
      await invokeAiContentAssistForBusiness({
        businessId:
          authorization.businessId,
        actor:
          authorization.actor,
        surface:
          authorization.surface,
        surfaceContext:
          reviewContext.surfaceContext,
        usage,
        request:
          reviewContext.request,
      });

    return invocationResponse(
      result,
      requestId
    );
  } catch (
    error
  ) {
    logServerError(
      "ai.content_assist.internal_api_failed",
      error,
      {
        requestId,
        surface:
          "tenant_google_review_reply",
      }
    );

    return failureResponse({
      requestId,
      status:
        500,
      code:
        "AI_INTERNAL_ERROR",
      message:
        "AI zahtev trenutno nije moguće obraditi.",
      retryable:
        true,
      blockedBy:
        "internal",
    });
  }
}
