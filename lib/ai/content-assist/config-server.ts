import "server-only";

import {
  GROQ_CONTENT_ASSIST_ENDPOINT,
  GROQ_CONTENT_ASSIST_MODEL,
} from "@/lib/ai/content-assist/groq-contract";
import {
  AiContentAssistProviderError,
} from "@/lib/ai/content-assist/provider";

export const GROQ_API_KEY_ENV_NAME =
  "GROQ_API_KEY" as const;

export type GroqContentAssistServerConfig = {
  apiKey: string;
  endpoint:
    typeof GROQ_CONTENT_ASSIST_ENDPOINT;
  model:
    typeof GROQ_CONTENT_ASSIST_MODEL;
};

export function readGroqContentAssistServerConfig(
  env:
    NodeJS.ProcessEnv =
      process.env
): GroqContentAssistServerConfig {
  const apiKey =
    env[
      GROQ_API_KEY_ENV_NAME
    ]?.trim() ??
    "";

  if (
    apiKey.length ===
    0
  ) {
    throw new AiContentAssistProviderError({
      code:
        "AI_PROVIDER_NOT_CONFIGURED",
      message:
        "Groq AI provider nije konfigurisan.",
    });
  }

  return {
    apiKey,
    endpoint:
      GROQ_CONTENT_ASSIST_ENDPOINT,
    model:
      GROQ_CONTENT_ASSIST_MODEL,
  };
}
