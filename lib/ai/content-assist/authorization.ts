import type {
  AiContentAssistTask,
} from "@/lib/ai/content-assist/domain";

export const AI_CONTENT_ASSIST_PERMISSIONS = [
  "content.translate",
  "reviews.reply.draft",
] as const;

export type AiContentAssistPermission =
  (typeof AI_CONTENT_ASSIST_PERMISSIONS)[number];

export const AI_CONTENT_ASSIST_TASK_PERMISSIONS = {
  content_translation:
    "content.translate",
  review_reply_draft:
    "reviews.reply.draft",
} as const satisfies Record<
  AiContentAssistTask,
  AiContentAssistPermission
>;

export type AiContentAssistActorType =
  | "tenant_admin"
  | "platform_admin";

export type AiContentAssistActorContext = {
  actorType:
    AiContentAssistActorType;
  actorId: string;
  businessId: string;
  permissions:
    readonly AiContentAssistPermission[];
};

export type AiContentAssistAuthorizationDecision = {
  allowed: boolean;
  requiredPermission:
    AiContentAssistPermission;
  blockedBy:
    | "tenant_scope"
    | "permission"
    | null;
};

export function getAiContentAssistPermission(
  task:
    AiContentAssistTask
): AiContentAssistPermission {
  return AI_CONTENT_ASSIST_TASK_PERMISSIONS[
    task
  ];
}

export function authorizeAiContentAssistActor({
  actor,
  businessId,
  task,
}: {
  actor:
    AiContentAssistActorContext;
  businessId: string;
  task:
    AiContentAssistTask;
}): AiContentAssistAuthorizationDecision {
  const requiredPermission =
    getAiContentAssistPermission(
      task
    );

  if (
    actor.businessId !==
    businessId
  ) {
    return {
      allowed:
        false,
      requiredPermission,
      blockedBy:
        "tenant_scope",
    };
  }

  if (
    !actor.permissions.includes(
      requiredPermission
    )
  ) {
    return {
      allowed:
        false,
      requiredPermission,
      blockedBy:
        "permission",
    };
  }

  return {
    allowed:
      true,
    requiredPermission,
    blockedBy:
      null,
  };
}
