import type {
  LocaleCode,
} from "@/lib/i18n/locales";
import type {
  AiContentAssistAuthResult,
} from "@/lib/ai/content-assist/auth-adapters";
import {
  getAiContentAssistHttpStatus,
  toAiContentAssistApiEnvelope,
} from "@/lib/ai/content-assist/api-contract";
import type {
  AiContentAssistActorContext,
} from "@/lib/ai/content-assist/authorization";
import {
  AiContentAssistValidationError,
  type AiContentAssistRequest,
  type AiContentAssistTask,
  type AiContentAssistTone,
} from "@/lib/ai/content-assist/domain";
import type {
  GoogleReviewReplyContextResult,
} from "@/lib/ai/content-assist/google-review-context";
import type {
  AiContentAssistInvocationResult,
} from "@/lib/ai/content-assist/invocation";
import type {
  AiContentAssistUsageSnapshot,
} from "@/lib/ai/content-assist/quota";
import type {
  AiContentAssistJsonBodyResult,
} from "@/lib/ai/content-assist/request-body-server";
import {
  AiContentAssistRequestContractError,
  parsePlatformAdminTranslationCommand,
  parseTenantGoogleReviewReplyCommand,
} from "@/lib/ai/content-assist/request-contract";
import type {
  AiContentAssistSurface,
  AiContentAssistSurfaceContext,
} from "@/lib/ai/content-assist/surface-policy";

type ApiFailureBody = {
  ok: false;
  requestId: string;
  code: string;
  message: string;
  retryable: boolean;
  blockedBy: string | null;
  quota: null;
};

export type LoadGoogleReviewReplyContextInput = {
  businessId: string;
  reviewId: string;
  requestId: string;
  targetLocale: LocaleCode;
  tone: AiContentAssistTone;
};

export type LoadAiContentAssistUsageInput = {
  businessId: string;
  task: AiContentAssistTask;
  surface: AiContentAssistSurface;
};

export type InvokeAiContentAssistForBusinessInput = {
  businessId: string;
  actor: AiContentAssistActorContext;
  surface: AiContentAssistSurface;
  surfaceContext: AiContentAssistSurfaceContext;
  usage: AiContentAssistUsageSnapshot;
  request: AiContentAssistRequest;
};

export type AiContentAssistInternalApiDependencies = {
  getRequestId: (
    headers: Pick<Headers, "get">
  ) => string;
  readJsonBody: (
    request: Pick<Request, "headers" | "text">
  ) => Promise<AiContentAssistJsonBodyResult>;
  resolvePlatformAuth: (
    input: {
      businessId: string;
    }
  ) => Promise<AiContentAssistAuthResult>;
  resolveTenantAuth: () => Promise<AiContentAssistAuthResult>;
  loadReviewContext: (
    input: LoadGoogleReviewReplyContextInput
  ) => Promise<GoogleReviewReplyContextResult>;
  loadUsage: (
    input: LoadAiContentAssistUsageInput
  ) => Promise<AiContentAssistUsageSnapshot>;
  invoke: (
    input: InvokeAiContentAssistForBusinessInput
  ) => Promise<AiContentAssistInvocationResult>;
  isReviewContextLoadError: (
    error: unknown
  ) => boolean;
  logError: (
    event: string,
    error: unknown,
    context: Record<string, unknown>
  ) => void;
  withRequestId: (
    response: Response,
    requestId: string
  ) => Response;
};

export type AiContentAssistInternalApiHandlers = {
  handlePlatformAdminContentTranslationRequest: (
    request: Request
  ) => Promise<Response>;
  handleTenantGoogleReviewReplyRequest: (
    request: Request
  ) => Promise<Response>;
};

function jsonResponse<TBody>(
  body: TBody,
  status: number
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",
        "Cache-Control":
          "no-store",
      },
    }
  );
}

export function createAiContentAssistInternalApiHandlers(
  dependencies:
    AiContentAssistInternalApiDependencies
): AiContentAssistInternalApiHandlers {
  function failureResponse({
    requestId,
    status,
    code,
    message,
    retryable = false,
    blockedBy = null,
  }: {
    requestId: string;
    status: number;
    code: string;
    message: string;
    retryable?: boolean;
    blockedBy?: string | null;
  }): Response {
    return dependencies.withRequestId(
      jsonResponse<ApiFailureBody>(
        {
          ok: false,
          requestId,
          code,
          message,
          retryable,
          blockedBy,
          quota: null,
        },
        status
      ),
      requestId
    );
  }

  function invocationResponse(
    result:
      AiContentAssistInvocationResult,
    requestId: string
  ): Response {
    return dependencies.withRequestId(
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
  ): Response | null {
    if (
      error instanceof
        AiContentAssistRequestContractError ||
      error instanceof
        AiContentAssistValidationError
    ) {
      return failureResponse({
        requestId,
        status: 400,
        code: error.code,
        message: error.message,
        blockedBy: "validation",
      });
    }

    return null;
  }

  async function handlePlatformAdminContentTranslationRequest(
    request: Request
  ): Promise<Response> {
    const requestId =
      dependencies.getRequestId(
        request.headers
      );

    try {
      const body =
        await dependencies.readJsonBody(
          request
        );

      if (!body.ok) {
        return failureResponse({
          requestId,
          status: body.status,
          code: body.code,
          message: body.message,
          blockedBy: "validation",
        });
      }

      let command:
        ReturnType<
          typeof parsePlatformAdminTranslationCommand
        >;

      try {
        command =
          parsePlatformAdminTranslationCommand({
            value: body.value,
            requestId,
          });
      } catch (error) {
        const response =
          requestContractFailure(
            error,
            requestId
          );

        if (response) {
          return response;
        }

        throw error;
      }

      const authorization =
        await dependencies.resolvePlatformAuth({
          businessId:
            command.businessId,
        });

      if (!authorization.ok) {
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
        await dependencies.loadUsage({
          businessId:
            authorization.businessId,
          task:
            "content_translation",
          surface:
            authorization.surface,
        });

      const result =
        await dependencies.invoke({
          businessId:
            authorization.businessId,
          actor:
            authorization.actor,
          surface:
            authorization.surface,
          surfaceContext: {},
          usage,
          request:
            command.request,
        });

      return invocationResponse(
        result,
        requestId
      );
    } catch (error) {
      dependencies.logError(
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
        status: 500,
        code:
          "AI_INTERNAL_ERROR",
        message:
          "AI zahtev trenutno nije moguće obraditi.",
        retryable: true,
        blockedBy:
          "internal",
      });
    }
  }

  async function handleTenantGoogleReviewReplyRequest(
    request: Request
  ): Promise<Response> {
    const requestId =
      dependencies.getRequestId(
        request.headers
      );

    try {
      const body =
        await dependencies.readJsonBody(
          request
        );

      if (!body.ok) {
        return failureResponse({
          requestId,
          status: body.status,
          code: body.code,
          message: body.message,
          blockedBy: "validation",
        });
      }

      let command:
        ReturnType<
          typeof parseTenantGoogleReviewReplyCommand
        >;

      try {
        command =
          parseTenantGoogleReviewReplyCommand({
            value: body.value,
            requestId,
          });
      } catch (error) {
        const response =
          requestContractFailure(
            error,
            requestId
          );

        if (response) {
          return response;
        }

        throw error;
      }

      const authorization =
        await dependencies.resolveTenantAuth();

      if (!authorization.ok) {
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
        GoogleReviewReplyContextResult;

      try {
        reviewContext =
          await dependencies.loadReviewContext({
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
      } catch (error) {
        if (
          dependencies.isReviewContextLoadError(
            error
          )
        ) {
          return failureResponse({
            requestId,
            status: 503,
            code:
              "AI_REVIEW_CONTEXT_UNAVAILABLE",
            message:
              "Google review context trenutno nije moguće učitati.",
            retryable: true,
            blockedBy:
              "review_context",
          });
        }

        throw error;
      }

      if (!reviewContext.ok) {
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
        await dependencies.loadUsage({
          businessId:
            authorization.businessId,
          task:
            "review_reply_draft",
          surface:
            authorization.surface,
        });

      const result =
        await dependencies.invoke({
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
    } catch (error) {
      dependencies.logError(
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
        status: 500,
        code:
          "AI_INTERNAL_ERROR",
        message:
          "AI zahtev trenutno nije moguće obraditi.",
        retryable: true,
        blockedBy:
          "internal",
      });
    }
  }

  return {
    handlePlatformAdminContentTranslationRequest,
    handleTenantGoogleReviewReplyRequest,
  };
}
