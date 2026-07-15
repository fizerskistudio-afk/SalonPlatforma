import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveAiContentAssistSurfaceDecision,
} from "./surface-policy";

describe(
  "AI content assist rollout surface policy",
  () => {
    it(
      "allows translations only from Platform Admin",
      () => {
        expect(
          resolveAiContentAssistSurfaceDecision({
            surface:
              "platform_admin_content_translation",
            actorType:
              "platform_admin",
            task:
              "content_translation",
            context:
              {},
          })
        ).toEqual({
          allowed:
            true,
          blockedBy:
            null,
        });

        expect(
          resolveAiContentAssistSurfaceDecision({
            surface:
              "platform_admin_content_translation",
            actorType:
              "tenant_admin",
            task:
              "content_translation",
            context:
              {},
          })
        ).toMatchObject({
          allowed:
            false,
          blockedBy:
            "surface",
        });
      }
    );

    it(
      "allows tenant reply drafts only for connected Google reviews",
      () => {
        expect(
          resolveAiContentAssistSurfaceDecision({
            surface:
              "tenant_google_review_reply",
            actorType:
              "tenant_admin",
            task:
              "review_reply_draft",
            context: {
              googleReviewIntegrationConnected:
                true,
              reviewSource:
                "google",
            },
          })
        ).toEqual({
          allowed:
            true,
          blockedBy:
            null,
        });

        expect(
          resolveAiContentAssistSurfaceDecision({
            surface:
              "tenant_google_review_reply",
            actorType:
              "tenant_admin",
            task:
              "review_reply_draft",
            context: {
              googleReviewIntegrationConnected:
                false,
              reviewSource:
                "google",
            },
          })
        ).toMatchObject({
          blockedBy:
            "integration",
        });

        expect(
          resolveAiContentAssistSurfaceDecision({
            surface:
              "tenant_google_review_reply",
            actorType:
              "tenant_admin",
            task:
              "review_reply_draft",
            context: {
              googleReviewIntegrationConnected:
                true,
              reviewSource:
                "platform",
            },
          })
        ).toMatchObject({
          blockedBy:
            "review_source",
        });
      }
    );

    it(
      "does not expose a general tenant AI surface",
      () => {
        expect(
          resolveAiContentAssistSurfaceDecision({
            surface:
              "tenant_google_review_reply",
            actorType:
              "tenant_admin",
            task:
              "content_translation",
            context: {
              googleReviewIntegrationConnected:
                true,
              reviewSource:
                "google",
            },
          })
        ).toMatchObject({
          allowed:
            false,
          blockedBy:
            "surface",
        });
      }
    );
  }
);
