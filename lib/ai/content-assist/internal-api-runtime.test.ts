import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  AiContentAssistAuthResult,
} from "./auth-adapters";
import type {
  AiContentAssistRequest,
} from "./domain";
import type {
  GoogleReviewReplyContextResult,
} from "./google-review-context";
import {
  createAiContentAssistInternalApiHandlers,
  type AiContentAssistInternalApiDependencies,
} from "./internal-api-runtime";
import type {
  AiContentAssistInvocationResult,
} from "./invocation";

const BUSINESS_ID =
  "11111111-1111-4111-8111-111111111111";

const REVIEW_ID =
  "22222222-2222-4222-8222-222222222222";

const REQUEST_ID =
  "runtime-request-123";

function platformAuthSuccess():
  AiContentAssistAuthResult {
  return {
    ok: true,
    businessId:
      BUSINESS_ID,
    surface:
      "platform_admin_content_translation",
    actor: {
      actorType:
        "platform_admin",
      actorId:
        "platform-user",
      businessId:
        BUSINESS_ID,
      permissions: [
        "content.translate",
      ],
    },
  };
}

function tenantAuthSuccess():
  AiContentAssistAuthResult {
  return {
    ok: true,
    businessId:
      BUSINESS_ID,
    surface:
      "tenant_google_review_reply",
    actor: {
      actorType:
        "tenant_admin",
      actorId:
        "tenant-user",
      businessId:
        BUSINESS_ID,
      permissions: [
        "reviews.reply.draft",
      ],
    },
  };
}

function invocationSuccess(
  request:
    AiContentAssistRequest
): AiContentAssistInvocationResult {
  return {
    ok: true,
    requestId:
      request.requestId,
    draft: {
      contractVersion: 1,
      status: "draft",
      task:
        request.task,
      requestId:
        request.requestId,
      draftText:
        "Kontrolisani draft.",
      provider:
        "controlled-runtime",
      model:
        "controlled-runtime",
      requiresHumanApproval:
        true,
      autoApplyAllowed:
        false,
      usage: {
        inputTokens: 12,
        outputTokens: 8,
        totalTokens: 20,
      },
    },
    quota: {
      allowed: true,
      period:
        "calendar_month",
      mode:
        "unlimited",
      limit: null,
      used: 0,
      remaining: null,
      blockedBy: null,
    },
  };
}

function invocationFailure({
  code,
  blockedBy,
  retryable = false,
}: {
  code:
    Extract<
      AiContentAssistInvocationResult,
      {
        ok: false;
      }
    >["code"];
  blockedBy:
    Extract<
      AiContentAssistInvocationResult,
      {
        ok: false;
      }
    >["blockedBy"];
  retryable?: boolean;
}): AiContentAssistInvocationResult {
  return {
    ok: false,
    requestId:
      REQUEST_ID,
    code,
    message:
      "Kontrolisana greška.",
    retryable,
    blockedBy,
    quota: null,
  };
}

function googleReviewContext({
  requestId =
    REQUEST_ID,
}: {
  requestId?: string;
} = {}): GoogleReviewReplyContextResult {
  return {
    ok: true,
    request: {
      task:
        "review_reply_draft",
      requestId,
      sourceLocale: "en",
      targetLocale:
        "sr-Latn",
      sourceText:
        "Server-loaded review text.",
      context:
        "Ocena recenzije: 5/5.",
      tone: "warm",
    },
    surfaceContext: {
      googleReviewIntegrationConnected:
        true,
      reviewSource:
        "google",
    },
  };
}

function request(
  requestBody:
    Record<
      string,
      unknown
    >
): Request {
  return new Request(
    "http://localhost/internal-ai",
    {
      method: "POST",
      headers: {
        "content-type":
          "application/json",
        "x-request-id":
          REQUEST_ID,
      },
      body:
        JSON.stringify(
          requestBody
        ),
    }
  );
}

async function responseBody(
  response:
    Response
): Promise<
  Record<
    string,
    unknown
  >
> {
  return await response
    .json() as
      Record<
        string,
        unknown
      >;
}

function createDependencies(
  overrides:
    Partial<
      AiContentAssistInternalApiDependencies
    > = {}
): AiContentAssistInternalApiDependencies {
  const dependencies:
    AiContentAssistInternalApiDependencies = {
    getRequestId:
      () =>
        REQUEST_ID,
    readJsonBody:
      async (
        input
      ) => ({
        ok: true,
        value:
          JSON.parse(
            await input.text()
          ) as unknown,
      }),
    resolvePlatformAuth:
      async () =>
        platformAuthSuccess(),
    resolveTenantAuth:
      async () =>
        tenantAuthSuccess(),
    loadReviewContext:
      async (
        input
      ) =>
        googleReviewContext({
          requestId:
            input.requestId,
        }),
    loadUsage:
      async () => ({
        period:
          "calendar_month",
        used: 0,
      }),
    invoke:
      async (
        input
      ) =>
        invocationSuccess(
          input.request
        ),
    isReviewContextLoadError:
      () =>
        false,
    logError:
      () => {},
    withRequestId:
      (
        response,
        requestId
      ) => {
        response.headers.set(
          "X-Request-ID",
          requestId
        );

        return response;
      },
  };

  return {
    ...dependencies,
    ...overrides,
  };
}

describe(
  "AI internal API controlled runtime",
  () => {
    it(
      "runs a Platform Admin translation through the real parser and HTTP envelope",
      async () => {
        const invokeImplementation:
          AiContentAssistInternalApiDependencies["invoke"] =
          async (
            input
          ) =>
            invocationSuccess(
              input.request
            );

        const invoke =
          vi.fn(
            invokeImplementation
          );

        const handlers =
          createAiContentAssistInternalApiHandlers(
            createDependencies({
              invoke,
            })
          );

        const response =
          await handlers
            .handlePlatformAdminContentTranslationRequest(
              request({
                businessId:
                  BUSINESS_ID,
                sourceLocale: "en",
                targetLocale:
                  "sr-Latn",
                sourceText:
                  "Welcome to our salon.",
                tone:
                  "professional",
              })
            );

        expect(
          response.status
        ).toBe(200);

        expect(
          response.headers.get(
            "X-Request-ID"
          )
        ).toBe(
          REQUEST_ID
        );

        expect(
          await responseBody(
            response
          )
        ).toMatchObject({
          ok: true,
          requestId:
            REQUEST_ID,
          draft: {
            status: "draft",
            task:
              "content_translation",
            requiresHumanApproval:
              true,
            autoApplyAllowed:
              false,
          },
        });

        expect(
          invoke
        ).toHaveBeenCalledTimes(1);

        expect(
          invoke.mock
            .calls[0]?.[0]
        ).toMatchObject({
          businessId:
            BUSINESS_ID,
          surface:
            "platform_admin_content_translation",
          request: {
            task:
              "content_translation",
            sourceLocale: "en",
            targetLocale:
              "sr-Latn",
          },
        });
      }
    );

    it(
      "loads tenant review context from the active business before invocation",
      async () => {
        const loadImplementation:
          AiContentAssistInternalApiDependencies["loadReviewContext"] =
          async (
            input
          ) =>
            googleReviewContext({
              requestId:
                input.requestId,
            });

        const loadReviewContext =
          vi.fn(
            loadImplementation
          );

        const invokeImplementation:
          AiContentAssistInternalApiDependencies["invoke"] =
          async (
            input
          ) =>
            invocationSuccess(
              input.request
            );

        const invoke =
          vi.fn(
            invokeImplementation
          );

        const handlers =
          createAiContentAssistInternalApiHandlers(
            createDependencies({
              loadReviewContext,
              invoke,
            })
          );

        const response =
          await handlers
            .handleTenantGoogleReviewReplyRequest(
              request({
                reviewId:
                  REVIEW_ID,
                targetLocale:
                  "sr-Latn",
                tone: "warm",
              })
            );

        expect(
          response.status
        ).toBe(200);

        expect(
          loadReviewContext
        ).toHaveBeenCalledWith({
          businessId:
            BUSINESS_ID,
          reviewId:
            REVIEW_ID,
          requestId:
            REQUEST_ID,
          targetLocale:
            "sr-Latn",
          tone: "warm",
        });

        expect(
          invoke.mock
            .calls[0]?.[0]
        ).toMatchObject({
          businessId:
            BUSINESS_ID,
          surface:
            "tenant_google_review_reply",
          surfaceContext: {
            googleReviewIntegrationConnected:
              true,
            reviewSource:
              "google",
          },
          request: {
            task:
              "review_reply_draft",
            sourceText:
              "Server-loaded review text.",
          },
        });
      }
    );

    it(
      "rejects client-injected tenant business and review text before auth",
      async () => {
        const tenantAuthImplementation:
          AiContentAssistInternalApiDependencies["resolveTenantAuth"] =
          async () =>
            tenantAuthSuccess();

        const resolveTenantAuth =
          vi.fn(
            tenantAuthImplementation
          );

        const handlers =
          createAiContentAssistInternalApiHandlers(
            createDependencies({
              resolveTenantAuth,
            })
          );

        const response =
          await handlers
            .handleTenantGoogleReviewReplyRequest(
              request({
                reviewId:
                  REVIEW_ID,
                targetLocale:
                  "sr-Latn",
                businessId:
                  BUSINESS_ID,
                sourceText:
                  "Browser supplied text.",
              })
            );

        expect(
          response.status
        ).toBe(400);

        expect(
          await responseBody(
            response
          )
        ).toMatchObject({
          ok: false,
          code:
            "INVALID_REQUEST_FIELDS",
          blockedBy:
            "validation",
        });

        expect(
          resolveTenantAuth
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "returns tenant authentication failure without loading review context",
      async () => {
        const loadImplementation:
          AiContentAssistInternalApiDependencies["loadReviewContext"] =
          async () =>
            googleReviewContext();

        const loadReviewContext =
          vi.fn(
            loadImplementation
          );

        const handlers =
          createAiContentAssistInternalApiHandlers(
            createDependencies({
              resolveTenantAuth:
                async () => ({
                  ok: false,
                  status: 401,
                  code:
                    "TENANT_ADMIN_UNAUTHENTICATED",
                  message:
                    "Admin sesija nije aktivna.",
                }),
              loadReviewContext,
            })
          );

        const response =
          await handlers
            .handleTenantGoogleReviewReplyRequest(
              request({
                reviewId:
                  REVIEW_ID,
                targetLocale:
                  "sr-Latn",
              })
            );

        expect(
          response.status
        ).toBe(401);

        expect(
          loadReviewContext
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "returns cross-tenant review as not found and skips invocation",
      async () => {
        const invokeImplementation:
          AiContentAssistInternalApiDependencies["invoke"] =
          async (
            input
          ) =>
            invocationSuccess(
              input.request
            );

        const invoke =
          vi.fn(
            invokeImplementation
          );

        const handlers =
          createAiContentAssistInternalApiHandlers(
            createDependencies({
              loadReviewContext:
                async () => ({
                  ok: false,
                  status: 404,
                  code:
                    "AI_REVIEW_NOT_FOUND",
                  message:
                    "Recenzija nije pronađena za aktivni salon.",
                }),
              invoke,
            })
          );

        const response =
          await handlers
            .handleTenantGoogleReviewReplyRequest(
              request({
                reviewId:
                  REVIEW_ID,
                targetLocale:
                  "sr-Latn",
              })
            );

        expect(
          response.status
        ).toBe(404);

        expect(
          await responseBody(
            response
          )
        ).toMatchObject({
          code:
            "AI_REVIEW_NOT_FOUND",
          blockedBy:
            "review_context",
        });

        expect(
          invoke
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "maps controlled review context storage failure to retryable 503",
      async () => {
        class ControlledReviewContextError
          extends Error {}

        const handlers =
          createAiContentAssistInternalApiHandlers(
            createDependencies({
              loadReviewContext:
                async () => {
                  throw new ControlledReviewContextError(
                    "sensitive storage detail"
                  );
                },
              isReviewContextLoadError:
                (
                  error
                ) =>
                  error instanceof
                    ControlledReviewContextError,
            })
          );

        const response =
          await handlers
            .handleTenantGoogleReviewReplyRequest(
              request({
                reviewId:
                  REVIEW_ID,
                targetLocale:
                  "sr-Latn",
              })
            );

        const parsed =
          await responseBody(
            response
          );

        expect(
          response.status
        ).toBe(503);

        expect(
          parsed
        ).toMatchObject({
          code:
            "AI_REVIEW_CONTEXT_UNAVAILABLE",
          retryable: true,
          blockedBy:
            "review_context",
        });

        expect(
          JSON.stringify(
            parsed
          )
        ).not.toContain(
          "sensitive storage detail"
        );
      }
    );

    it(
      "passes integration blocker through the stable 403 envelope",
      async () => {
        const handlers =
          createAiContentAssistInternalApiHandlers(
            createDependencies({
              invoke:
                async () =>
                  invocationFailure({
                    code:
                      "AI_INTEGRATION_REQUIRED",
                    blockedBy:
                      "integration",
                  }),
            })
          );

        const response =
          await handlers
            .handleTenantGoogleReviewReplyRequest(
              request({
                reviewId:
                  REVIEW_ID,
                targetLocale:
                  "sr-Latn",
              })
            );

        expect(
          response.status
        ).toBe(403);

        expect(
          await responseBody(
            response
          )
        ).toMatchObject({
          code:
            "AI_INTEGRATION_REQUIRED",
          blockedBy:
            "integration",
        });
      }
    );

    it(
      "maps provider timeout to 504 without changing the request ID",
      async () => {
        const handlers =
          createAiContentAssistInternalApiHandlers(
            createDependencies({
              invoke:
                async () =>
                  invocationFailure({
                    code:
                      "AI_PROVIDER_TIMEOUT",
                    blockedBy:
                      "provider",
                    retryable: true,
                  }),
            })
          );

        const response =
          await handlers
            .handlePlatformAdminContentTranslationRequest(
              request({
                businessId:
                  BUSINESS_ID,
                sourceLocale: "en",
                targetLocale:
                  "sr-Latn",
                sourceText:
                  "Welcome.",
              })
            );

        expect(
          response.status
        ).toBe(504);

        expect(
          response.headers.get(
            "X-Request-ID"
          )
        ).toBe(
          REQUEST_ID
        );

        expect(
          await responseBody(
            response
          )
        ).toMatchObject({
          requestId:
            REQUEST_ID,
          code:
            "AI_PROVIDER_TIMEOUT",
          retryable: true,
        });
      }
    );

    it(
      "stops oversized bodies before auth and invocation",
      async () => {
        const platformAuthImplementation:
          AiContentAssistInternalApiDependencies["resolvePlatformAuth"] =
          async () =>
            platformAuthSuccess();

        const resolvePlatformAuth =
          vi.fn(
            platformAuthImplementation
          );

        const invokeImplementation:
          AiContentAssistInternalApiDependencies["invoke"] =
          async (
            input
          ) =>
            invocationSuccess(
              input.request
            );

        const invoke =
          vi.fn(
            invokeImplementation
          );

        const handlers =
          createAiContentAssistInternalApiHandlers(
            createDependencies({
              readJsonBody:
                async () => ({
                  ok: false,
                  status: 413,
                  code:
                    "REQUEST_BODY_TOO_LARGE",
                  message:
                    "AI zahtev je prevelik.",
                }),
              resolvePlatformAuth,
              invoke,
            })
          );

        const response =
          await handlers
            .handlePlatformAdminContentTranslationRequest(
              request({
                businessId:
                  BUSINESS_ID,
              })
            );

        expect(
          response.status
        ).toBe(413);

        expect(
          resolvePlatformAuth
        ).not.toHaveBeenCalled();

        expect(
          invoke
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "returns sanitized 500 and records only controlled error context",
      async () => {
        const logError =
          vi.fn();

        const handlers =
          createAiContentAssistInternalApiHandlers(
            createDependencies({
              resolvePlatformAuth:
                async () => {
                  throw new Error(
                    "raw secret detail"
                  );
                },
              logError,
            })
          );

        const response =
          await handlers
            .handlePlatformAdminContentTranslationRequest(
              request({
                businessId:
                  BUSINESS_ID,
                sourceLocale: "en",
                targetLocale:
                  "sr-Latn",
                sourceText:
                  "Welcome.",
              })
            );

        const parsed =
          await responseBody(
            response
          );

        expect(
          response.status
        ).toBe(500);

        expect(
          parsed
        ).toMatchObject({
          code:
            "AI_INTERNAL_ERROR",
          retryable: true,
          blockedBy:
            "internal",
        });

        expect(
          JSON.stringify(
            parsed
          )
        ).not.toContain(
          "raw secret detail"
        );

        expect(
          logError
        ).toHaveBeenCalledWith(
          "ai.content_assist.internal_api_failed",
          expect.any(
            Error
          ),
          {
            requestId:
              REQUEST_ID,
            surface:
              "platform_admin_content_translation",
          }
        );
      }
    );
  }
);
