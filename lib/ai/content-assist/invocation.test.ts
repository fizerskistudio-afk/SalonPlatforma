import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  AiContentAssistPermission,
} from "./authorization";
import {
  createAiContentAssistDraftResult,
  normalizeAiContentAssistRequest,
} from "./domain";
import {
  invokeAiContentAssist,
} from "./invocation";
import type {
  AiContentAssistProvider,
} from "./provider";
import {
  resolveProductPackageAccess,
} from "@/lib/product-packages/resolver";

const translationRequest = {
  task:
    "content_translation" as const,
  requestId:
    "request-123",
  sourceLocale:
    "sr-Latn" as const,
  targetLocale:
    "de" as const,
  sourceText:
    "Premium salon.",
  tone:
    "professional" as const,
};

function actor({
  actorType =
    "platform_admin",
  permissions = [
    "content.translate",
  ],
  businessId =
    "business-1",
}: {
  actorType?:
    "platform_admin" |
    "tenant_admin";
  permissions?:
    readonly AiContentAssistPermission[];
  businessId?:
    string;
} = {}) {
  return {
    actorType,
    actorId:
      "user-1",
    businessId,
    permissions,
  };
}

function access(
  packageKey:
    "booking_page" |
    "digital_studio" |
    "reputation_pro"
) {
  return resolveProductPackageAccess({
    package_key:
      packageKey,
    package_contract_version:
      1,
  });
}

const provider = (
  generateDraft:
    AiContentAssistProvider[
      "generateDraft"
    ]
): AiContentAssistProvider => ({
  id:
    "groq",
  model:
    "openai/gpt-oss-20b",
  generateDraft,
});

describe(
  "AI content assist invocation",
  () => {
    it(
      "does not call the provider when package access blocks the task",
      async () => {
        const generateDraft =
          vi.fn<AiContentAssistProvider["generateDraft"]>();

        const result =
          await invokeAiContentAssist({
            businessId:
              "business-1",
            actor:
              actor(),
            surface:
              "platform_admin_content_translation",
            surfaceContext:
              {},
            access:
              access(
                "booking_page"
              ),
            usage: {
              period:
                "calendar_month",
              used:
                0,
            },
            request:
              translationRequest,
            provider:
              provider(
                generateDraft
              ),
          });

        expect(
          result
        ).toMatchObject({
          ok:
            false,
          code:
            "AI_PACKAGE_REQUIRED",
          blockedBy:
            "package",
        });

        expect(
          generateDraft
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "enforces tenant scope, surface, permission and quota before provider invocation",
      async () => {
        const generateDraft =
          vi.fn<AiContentAssistProvider["generateDraft"]>();

        const tenantResult =
          await invokeAiContentAssist({
            businessId:
              "business-2",
            actor:
              actor(),
            surface:
              "platform_admin_content_translation",
            surfaceContext:
              {},
            access:
              access(
                "digital_studio"
              ),
            usage: {
              period:
                "calendar_month",
              used:
                0,
            },
            request:
              translationRequest,
            provider:
              provider(
                generateDraft
              ),
          });

        expect(
          tenantResult
        ).toMatchObject({
          code:
            "AI_TENANT_SCOPE_MISMATCH",
        });

        const surfaceResult =
          await invokeAiContentAssist({
            businessId:
              "business-1",
            actor:
              actor({
                actorType:
                  "tenant_admin",
              }),
            surface:
              "platform_admin_content_translation",
            surfaceContext:
              {},
            access:
              access(
                "digital_studio"
              ),
            usage: {
              period:
                "calendar_month",
              used:
                0,
            },
            request:
              translationRequest,
            provider:
              provider(
                generateDraft
              ),
          });

        expect(
          surfaceResult
        ).toMatchObject({
          code:
            "AI_SURFACE_NOT_ALLOWED",
        });

        const permissionResult =
          await invokeAiContentAssist({
            businessId:
              "business-1",
            actor:
              actor({
                permissions:
                  [],
              }),
            surface:
              "platform_admin_content_translation",
            surfaceContext:
              {},
            access:
              access(
                "digital_studio"
              ),
            usage: {
              period:
                "calendar_month",
              used:
                0,
            },
            request:
              translationRequest,
            provider:
              provider(
                generateDraft
              ),
          });

        expect(
          permissionResult
        ).toMatchObject({
          code:
            "AI_PERMISSION_DENIED",
        });

        const quotaResult =
          await invokeAiContentAssist({
            businessId:
              "business-1",
            actor:
              actor(),
            surface:
              "platform_admin_content_translation",
            surfaceContext:
              {},
            access:
              access(
                "digital_studio"
              ),
            usage: {
              period:
                "calendar_month",
              used:
                25,
            },
            request:
              translationRequest,
            provider:
              provider(
                generateDraft
              ),
          });

        expect(
          quotaResult
        ).toMatchObject({
          code:
            "AI_QUOTA_EXHAUSTED",
        });

        expect(
          generateDraft
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "requires connected Google review context for tenant reply drafts",
      async () => {
        const generateDraft =
          vi.fn<AiContentAssistProvider["generateDraft"]>();

        const reviewRequest = {
          task:
            "review_reply_draft" as const,
          requestId:
            "review-request",
          sourceLocale:
            "sr-Latn" as const,
          targetLocale:
            "sr-Latn" as const,
          sourceText:
            "Odličan salon.",
          tone:
            "warm" as const,
        };

        const integrationResult =
          await invokeAiContentAssist({
            businessId:
              "business-1",
            actor:
              actor({
                actorType:
                  "tenant_admin",
                permissions: [
                  "reviews.reply.draft",
                ],
              }),
            surface:
              "tenant_google_review_reply",
            surfaceContext: {
              googleReviewIntegrationConnected:
                false,
              reviewSource:
                "google",
            },
            access:
              access(
                "reputation_pro"
              ),
            usage: {
              period:
                "calendar_month",
              used:
                0,
            },
            request:
              reviewRequest,
            provider:
              provider(
                generateDraft
              ),
          });

        expect(
          integrationResult
        ).toMatchObject({
          code:
            "AI_INTEGRATION_REQUIRED",
        });

        const sourceResult =
          await invokeAiContentAssist({
            businessId:
              "business-1",
            actor:
              actor({
                actorType:
                  "tenant_admin",
                permissions: [
                  "reviews.reply.draft",
                ],
              }),
            surface:
              "tenant_google_review_reply",
            surfaceContext: {
              googleReviewIntegrationConnected:
                true,
              reviewSource:
                "platform",
            },
            access:
              access(
                "reputation_pro"
              ),
            usage: {
              period:
                "calendar_month",
              used:
                0,
            },
            request:
              reviewRequest,
            provider:
              provider(
                generateDraft
              ),
          });

        expect(
          sourceResult
        ).toMatchObject({
          code:
            "AI_REVIEW_SOURCE_NOT_SUPPORTED",
        });

        expect(
          generateDraft
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "returns only a human-approved draft envelope and emits PII-safe metadata",
      async () => {
        const normalized =
          normalizeAiContentAssistRequest(
            translationRequest
          );

        const events:
          unknown[] = [];

        const result =
          await invokeAiContentAssist({
            businessId:
              "business-1",
            actor:
              actor(),
            surface:
              "platform_admin_content_translation",
            surfaceContext:
              {},
            access:
              access(
                "digital_studio"
              ),
            usage: {
              period:
                "calendar_month",
              used:
                3,
            },
            request:
              translationRequest,
            provider: {
              id:
                "groq",
              model:
                "openai/gpt-oss-20b",
              generateDraft:
                async (
                  providerRequest
                ) =>
                  createAiContentAssistDraftResult({
                    request:
                      normalizeAiContentAssistRequest(
                        providerRequest
                      ),
                    draftText:
                      "Premium-Friseursalon.",
                    provider:
                      "groq",
                    model:
                      "openai/gpt-oss-20b",
                  }),
            },
            onEvent:
              (
                event
              ) => {
                events.push(
                  event
                );
              },
          });

        expect(
          normalized.context
        ).toBeNull();

        expect(
          result
        ).toMatchObject({
          ok:
            true,
          draft: {
            status:
              "draft",
            requiresHumanApproval:
              true,
            autoApplyAllowed:
              false,
          },
          quota: {
            used:
              3,
            limit:
              25,
            remaining:
              22,
          },
        });

        const serialized =
          JSON.stringify(
            events
          );

        expect(
          serialized
        ).not.toContain(
          translationRequest
            .sourceText
        );

        expect(
          serialized
        ).not.toContain(
          "user-1"
        );

        expect(
          serialized
        ).toContain(
          "sourceCharacterCount"
        );

        expect(
          serialized
        ).toContain(
          "platform_admin_content_translation"
        );
      }
    );
  }
);
