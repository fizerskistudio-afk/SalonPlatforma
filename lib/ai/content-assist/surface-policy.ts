import type {
  AiContentAssistTask,
} from "@/lib/ai/content-assist/domain";
import type {
  AiContentAssistActorType,
} from "@/lib/ai/content-assist/authorization";
import type {
  ReviewSource,
} from "@/lib/reviews/domain";

export const AI_CONTENT_ASSIST_SURFACES = [
  "platform_admin_content_translation",
  "tenant_google_review_reply",
] as const;

export type AiContentAssistSurface =
  (typeof AI_CONTENT_ASSIST_SURFACES)[number];

export type AiContentAssistSurfaceContext = {
  googleReviewIntegrationConnected?:
    boolean;
  reviewSource?:
    ReviewSource;
};

export type AiContentAssistSurfaceBlocker =
  | "surface"
  | "integration"
  | "review_source";

export type AiContentAssistSurfaceDecision = {
  allowed: boolean;
  blockedBy:
    AiContentAssistSurfaceBlocker | null;
};

export function resolveAiContentAssistSurfaceDecision({
  surface,
  actorType,
  task,
  context,
}: {
  surface:
    AiContentAssistSurface;
  actorType:
    AiContentAssistActorType;
  task:
    AiContentAssistTask;
  context:
    AiContentAssistSurfaceContext;
}): AiContentAssistSurfaceDecision {
  if (
    surface ===
    "platform_admin_content_translation"
  ) {
    return (
      actorType ===
        "platform_admin" &&
      task ===
        "content_translation"
    )
      ? {
          allowed:
            true,
          blockedBy:
            null,
        }
      : {
          allowed:
            false,
          blockedBy:
            "surface",
        };
  }

  if (
    actorType !==
      "tenant_admin" ||
    task !==
      "review_reply_draft"
  ) {
    return {
      allowed:
        false,
      blockedBy:
        "surface",
    };
  }

  if (
    context
      .googleReviewIntegrationConnected !==
    true
  ) {
    return {
      allowed:
        false,
      blockedBy:
        "integration",
    };
  }

  if (
    context.reviewSource !==
    "google"
  ) {
    return {
      allowed:
        false,
      blockedBy:
        "review_source",
    };
  }

  return {
    allowed:
      true,
    blockedBy:
      null,
  };
}
