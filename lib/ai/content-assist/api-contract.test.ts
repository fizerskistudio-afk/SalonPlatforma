import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getAiContentAssistHttpStatus,
  toAiContentAssistApiEnvelope,
} from "./api-contract";
import type {
  AiContentAssistInvocationResult,
} from "./invocation";

function failure(
  code:
    Extract<
      AiContentAssistInvocationResult,
      {
        ok: false;
      }
    >["code"]
): Extract<
  AiContentAssistInvocationResult,
  {
    ok: false;
  }
> {
  return {
    ok:
      false,
    requestId:
      "request-123",
    code,
    message:
      "safe message",
    retryable:
      false,
    blockedBy:
      code ===
        "AI_QUOTA_EXHAUSTED"
        ? "quota"
        : "provider",
    quota:
      null,
  };
}

describe(
  "AI internal API contract",
  () => {
    it.each([
      [
        "AI_REQUEST_INVALID",
        400,
      ],
      [
        "AI_TENANT_SCOPE_MISMATCH",
        404,
      ],
      [
        "AI_PERMISSION_DENIED",
        403,
      ],
      [
        "AI_PACKAGE_REQUIRED",
        403,
      ],
      [
        "AI_INTEGRATION_REQUIRED",
        403,
      ],
      [
        "AI_REVIEW_SOURCE_NOT_SUPPORTED",
        403,
      ],
      [
        "AI_QUOTA_EXHAUSTED",
        429,
      ],
      [
        "AI_PROVIDER_REQUEST_FAILED",
        502,
      ],
      [
        "AI_PROVIDER_TIMEOUT",
        504,
      ],
      [
        "AI_PROVIDER_NOT_CONFIGURED",
        503,
      ],
    ] as const)(
      "maps %s to HTTP %i",
      (
        code,
        status
      ) => {
        expect(
          getAiContentAssistHttpStatus(
            failure(
              code
            )
          )
        ).toBe(
          status
        );
      }
    );

    it(
      "returns only the stable invocation envelope",
      () => {
        expect(
          toAiContentAssistApiEnvelope(
            failure(
              "AI_PROVIDER_REQUEST_FAILED"
            )
          )
        ).toEqual({
          ok:
            false,
          requestId:
            "request-123",
          code:
            "AI_PROVIDER_REQUEST_FAILED",
          message:
            "safe message",
          retryable:
            false,
          blockedBy:
            "provider",
          quota:
            null,
        });
      }
    );
  }
);
