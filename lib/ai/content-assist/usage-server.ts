import "server-only";

import type {
  AiContentAssistTask,
} from "@/lib/ai/content-assist/domain";
import type {
  AiContentAssistUsageSnapshot,
} from "@/lib/ai/content-assist/quota";
import type {
  AiContentAssistSurface,
} from "@/lib/ai/content-assist/surface-policy";

export const AI_CONTENT_ASSIST_USAGE_MODE =
  "rollout_read_only_zero" as const;

export type LoadAiContentAssistUsageInput = {
  businessId: string;
  task: AiContentAssistTask;
  surface: AiContentAssistSurface;
};

export async function loadAiContentAssistUsageSnapshot(
  input: LoadAiContentAssistUsageInput
): Promise<AiContentAssistUsageSnapshot> {
  void input;

  return {
    period:
      "calendar_month",
    used:
      0,
  };
}
