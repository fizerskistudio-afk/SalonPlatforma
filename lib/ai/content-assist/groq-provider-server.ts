import "server-only";

import {
  createAiContentAssistDraftResult,
  normalizeAiContentAssistRequest,
} from "@/lib/ai/content-assist/domain";
import {
  readGroqContentAssistServerConfig,
} from "@/lib/ai/content-assist/config-server";
import {
  buildGroqContentAssistRequestBody,
  GROQ_CONTENT_ASSIST_TIMEOUT_MS,
  parseGroqContentAssistResponse,
} from "@/lib/ai/content-assist/groq-contract";
import {
  type AiContentAssistProvider,
  AiContentAssistProviderError,
} from "@/lib/ai/content-assist/provider";

export type AiContentAssistFetch =
  (
    input:
      string,
    init:
      RequestInit
  ) =>
    Promise<Response>;

export function createGroqContentAssistProvider({
  env =
    process.env,
  fetchImpl =
    fetch,
}: {
  env?:
    NodeJS.ProcessEnv;
  fetchImpl?:
    AiContentAssistFetch;
} = {}): AiContentAssistProvider {
  const config =
    readGroqContentAssistServerConfig(
      env
    );

  return {
    id:
      "groq",
    model:
      config.model,

    async generateDraft(
      rawRequest
    ) {
      const request =
        normalizeAiContentAssistRequest(
          rawRequest
        );

      const controller =
        new AbortController();

      const timeout =
        setTimeout(
          () =>
            controller.abort(),
          GROQ_CONTENT_ASSIST_TIMEOUT_MS
        );

      try {
        const response =
          await fetchImpl(
            config.endpoint,
            {
              method:
                "POST",
              headers: {
                Authorization:
                  `Bearer ${config.apiKey}`,
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify(
                  buildGroqContentAssistRequestBody(
                    request
                  )
                ),
              cache:
                "no-store",
              signal:
                controller.signal,
            }
          );

        if (
          !response.ok
        ) {
          throw new AiContentAssistProviderError({
            code:
              "AI_PROVIDER_REQUEST_FAILED",
            message:
              "Groq AI provider zahtev nije uspeo.",
            status:
              response.status,
          });
        }

        let providerPayload:
          unknown;

        try {
          providerPayload =
            await response.json();
        } catch {
          throw new AiContentAssistProviderError({
            code:
              "AI_PROVIDER_RESPONSE_INVALID",
            message:
              "Groq AI provider odgovor nije validan JSON.",
          });
        }

        const parsed =
          parseGroqContentAssistResponse(
            providerPayload
          );

        return createAiContentAssistDraftResult({
          request,
          draftText:
            parsed.draftText,
          provider:
            "groq",
          model:
            config.model,
          usage:
            parsed.usage,
        });
      } catch (
        error
      ) {
        if (
          error instanceof
          AiContentAssistProviderError
        ) {
          throw error;
        }

        if (
          error instanceof
            Error &&
          error.name ===
            "AbortError"
        ) {
          throw new AiContentAssistProviderError({
            code:
              "AI_PROVIDER_TIMEOUT",
            message:
              "Groq AI provider nije odgovorio na vreme.",
          });
        }

        throw new AiContentAssistProviderError({
          code:
            "AI_PROVIDER_REQUEST_FAILED",
          message:
            "Groq AI provider trenutno nije dostupan.",
        });
      } finally {
        clearTimeout(
          timeout
        );
      }
    },
  };
}
