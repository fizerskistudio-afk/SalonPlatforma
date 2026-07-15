import type {
  AiContentAssistTask,
} from "@/lib/ai/content-assist/domain";
import {
  getProductPackage,
} from "@/lib/product-packages/registry";
import type {
  ProductPackageAccess,
} from "@/lib/product-packages/resolver";

export const AI_CONTENT_ASSIST_QUOTA_PERIOD =
  "calendar_month" as const;

export type AiContentAssistUsageSnapshot = {
  period:
    typeof AI_CONTENT_ASSIST_QUOTA_PERIOD;
  used: number;
};

export type AiContentAssistQuotaDecision = {
  allowed: boolean;
  period:
    typeof AI_CONTENT_ASSIST_QUOTA_PERIOD;
  mode:
    | "unlimited"
    | "limited";
  limit: number | null;
  used: number;
  remaining:
    number | null;
  blockedBy:
    | "quota"
    | null;
};

export class AiContentAssistQuotaError
  extends Error {
  constructor(
    message: string
  ) {
    super(
      message
    );

    this.name =
      "AiContentAssistQuotaError";
  }
}

function getTaskLimit({
  access,
  task,
}: {
  access:
    ProductPackageAccess;
  task:
    AiContentAssistTask;
}): number | null {
  if (
    access.grantsAllEntitlements ||
    access.packageKey ===
      null
  ) {
    return null;
  }

  const limits =
    getProductPackage(
      access.packageKey
    ).limits;

  return task ===
    "content_translation"
      ? limits
          .aiTranslationRequestsPerMonth
      : limits
          .aiReviewDraftsPerMonth;
}

export function resolveAiContentAssistQuotaDecision({
  access,
  task,
  usage,
}: {
  access:
    ProductPackageAccess;
  task:
    AiContentAssistTask;
  usage:
    AiContentAssistUsageSnapshot;
}): AiContentAssistQuotaDecision {
  if (
    usage.period !==
      AI_CONTENT_ASSIST_QUOTA_PERIOD ||
    !Number.isInteger(
      usage.used
    ) ||
    usage.used <
      0
  ) {
    throw new AiContentAssistQuotaError(
      "AI usage snapshot nije validan."
    );
  }

  const limit =
    getTaskLimit({
      access,
      task,
    });

  if (
    limit ===
    null
  ) {
    return {
      allowed:
        true,
      period:
        AI_CONTENT_ASSIST_QUOTA_PERIOD,
      mode:
        "unlimited",
      limit:
        null,
      used:
        usage.used,
      remaining:
        null,
      blockedBy:
        null,
    };
  }

  const remaining =
    Math.max(
      limit -
        usage.used,
      0
    );

  return {
    allowed:
      remaining >
      0,
    period:
      AI_CONTENT_ASSIST_QUOTA_PERIOD,
    mode:
      "limited",
    limit,
    used:
      usage.used,
    remaining,
    blockedBy:
      remaining >
      0
        ? null
        : "quota",
  };
}
