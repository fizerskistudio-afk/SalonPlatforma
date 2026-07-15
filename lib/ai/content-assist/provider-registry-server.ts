import "server-only";

import {
  createGroqContentAssistProvider,
  type AiContentAssistFetch,
} from "@/lib/ai/content-assist/groq-provider-server";
import type {
  AiContentAssistProvider,
  AiContentAssistProviderId,
} from "@/lib/ai/content-assist/provider";

export const DEFAULT_AI_CONTENT_ASSIST_PROVIDER =
  "groq" as const satisfies
    AiContentAssistProviderId;

export function getAiContentAssistProvider({
  provider =
    DEFAULT_AI_CONTENT_ASSIST_PROVIDER,
  env =
    process.env,
  fetchImpl,
}: {
  provider?:
    AiContentAssistProviderId;
  env?:
    NodeJS.ProcessEnv;
  fetchImpl?:
    AiContentAssistFetch;
} = {}): AiContentAssistProvider {
  switch (
    provider
  ) {
    case "groq":
      return createGroqContentAssistProvider({
        env,
        fetchImpl,
      });
  }
}
