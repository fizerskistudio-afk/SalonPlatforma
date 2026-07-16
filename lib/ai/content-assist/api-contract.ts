import type {
  AiContentAssistInvocationResult,
} from "@/lib/ai/content-assist/invocation";

export type AiContentAssistApiEnvelope =
  | {
      ok: true;
      requestId: string;
      draft:
        Extract<
          AiContentAssistInvocationResult,
          {
            ok: true;
          }
        >["draft"];
      quota:
        Extract<
          AiContentAssistInvocationResult,
          {
            ok: true;
          }
        >["quota"];
    }
  | {
      ok: false;
      requestId:
        string | null;
      code: string;
      message: string;
      retryable: boolean;
      blockedBy:
        string | null;
      quota:
        Extract<
          AiContentAssistInvocationResult,
          {
            ok: false;
          }
        >["quota"];
    };

export function getAiContentAssistHttpStatus(
  result:
    AiContentAssistInvocationResult
): number {
  if (
    result.ok
  ) {
    return 200;
  }

  switch (
    result.code
  ) {
    case "AI_REQUEST_INVALID":
      return 400;

    case "AI_TENANT_SCOPE_MISMATCH":
      return 404;

    case "AI_SURFACE_NOT_ALLOWED":
    case "AI_PERMISSION_DENIED":
    case "AI_PACKAGE_REQUIRED":
    case "AI_INTEGRATION_REQUIRED":
    case "AI_REVIEW_SOURCE_NOT_SUPPORTED":
      return 403;

    case "AI_QUOTA_EXHAUSTED":
      return 429;

    case "AI_PROVIDER_TIMEOUT":
      return 504;

    case "AI_PROVIDER_REQUEST_FAILED":
    case "AI_PROVIDER_RESPONSE_INVALID":
      return 502;

    case "AI_ACCESS_UNAVAILABLE":
    case "AI_PROVIDER_NOT_CONFIGURED":
      return 503;
  }
}

export function toAiContentAssistApiEnvelope(
  result:
    AiContentAssistInvocationResult
): AiContentAssistApiEnvelope {
  if (
    result.ok
  ) {
    return {
      ok:
        true,
      requestId:
        result.requestId,
      draft:
        result.draft,
      quota:
        result.quota,
    };
  }

  return {
    ok:
      false,
    requestId:
      result.requestId,
    code:
      result.code,
    message:
      result.message,
    retryable:
      result.retryable,
    blockedBy:
      result.blockedBy,
    quota:
      result.quota,
  };
}
