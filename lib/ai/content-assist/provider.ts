import type {
  AiContentAssistDraftResult,
  AiContentAssistRequest,
} from "@/lib/ai/content-assist/domain";

export const AI_CONTENT_ASSIST_PROVIDER_IDS = [
  "groq",
] as const;

export type AiContentAssistProviderId =
  (typeof AI_CONTENT_ASSIST_PROVIDER_IDS)[number];

export type AiContentAssistProvider =
  Readonly<{
    id:
      AiContentAssistProviderId;
    model: string;
    generateDraft:
      (
        request:
          AiContentAssistRequest
      ) =>
        Promise<
          AiContentAssistDraftResult
        >;
  }>;

export type AiContentAssistProviderErrorCode =
  | "AI_PROVIDER_NOT_CONFIGURED"
  | "AI_PROVIDER_REQUEST_FAILED"
  | "AI_PROVIDER_RESPONSE_INVALID"
  | "AI_PROVIDER_TIMEOUT";

export class AiContentAssistProviderError
  extends Error {
  readonly code:
    AiContentAssistProviderErrorCode;

  readonly status:
    number | null;

  constructor({
    code,
    message,
    status = null,
    cause,
  }: {
    code:
      AiContentAssistProviderErrorCode;
    message: string;
    status?: number | null;
    cause?: unknown;
  }) {
    super(
      message,
      {
        cause,
      }
    );

    this.name =
      "AiContentAssistProviderError";

    this.code =
      code;

    this.status =
      status;
  }
}
