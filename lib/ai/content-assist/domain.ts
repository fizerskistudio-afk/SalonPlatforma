import {
  LOCALE_CODES,
  type LocaleCode,
} from "@/lib/i18n/locales";
import type {
  ProductEntitlement,
} from "@/lib/product-packages/registry";

export const AI_CONTENT_ASSIST_CONTRACT_VERSION =
  1 as const;

export const AI_CONTENT_ASSIST_TASKS = [
  "content_translation",
  "review_reply_draft",
] as const;

export type AiContentAssistTask =
  (typeof AI_CONTENT_ASSIST_TASKS)[number];

export const AI_CONTENT_ASSIST_TONES = [
  "neutral",
  "warm",
  "professional",
  "concise",
] as const;

export type AiContentAssistTone =
  (typeof AI_CONTENT_ASSIST_TONES)[number];

export const AI_CONTENT_ASSIST_MAX_SOURCE_CHARACTERS =
  8_000 as const;

export const AI_CONTENT_ASSIST_MAX_CONTEXT_CHARACTERS =
  2_000 as const;

export const AI_CONTENT_ASSIST_MAX_REQUEST_ID_CHARACTERS =
  128 as const;

export const AI_CONTENT_ASSIST_TASK_ENTITLEMENTS = {
  content_translation:
    "ai.content_translation",
  review_reply_draft:
    "ai.review_reply_drafts",
} as const satisfies Record<
  AiContentAssistTask,
  ProductEntitlement
>;

export type AiContentAssistRequest = {
  task:
    AiContentAssistTask;
  requestId: string;
  sourceLocale:
    LocaleCode;
  targetLocale:
    LocaleCode;
  sourceText: string;
  context?: string;
  tone:
    AiContentAssistTone;
};

export type NormalizedAiContentAssistRequest =
  Omit<
    AiContentAssistRequest,
    | "requestId"
    | "sourceText"
    | "context"
  > & {
    requestId: string;
    sourceText: string;
    context: string | null;
  };

export type AiContentAssistUsage = {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
};

export type AiContentAssistDraftResult = {
  contractVersion:
    typeof AI_CONTENT_ASSIST_CONTRACT_VERSION;
  status:
    "draft";
  task:
    AiContentAssistTask;
  requestId: string;
  draftText: string;
  provider: string;
  model: string;
  requiresHumanApproval:
    true;
  autoApplyAllowed:
    false;
  usage:
    AiContentAssistUsage;
};

export type AiContentAssistValidationErrorCode =
  | "INVALID_TASK"
  | "INVALID_REQUEST_ID"
  | "INVALID_SOURCE_LOCALE"
  | "INVALID_TARGET_LOCALE"
  | "SAME_TRANSLATION_LOCALE"
  | "INVALID_TONE"
  | "EMPTY_SOURCE_TEXT"
  | "SOURCE_TEXT_TOO_LONG"
  | "CONTEXT_TOO_LONG"
  | "EMPTY_DRAFT";

export class AiContentAssistValidationError
  extends Error {
  readonly code:
    AiContentAssistValidationErrorCode;

  constructor(
    code:
      AiContentAssistValidationErrorCode,
    message: string
  ) {
    super(
      message
    );

    this.name =
      "AiContentAssistValidationError";

    this.code =
      code;
  }
}

const TASK_SET =
  new Set<string>(
    AI_CONTENT_ASSIST_TASKS
  );

const TONE_SET =
  new Set<string>(
    AI_CONTENT_ASSIST_TONES
  );

const LOCALE_SET =
  new Set<string>(
    LOCALE_CODES
  );

function isTask(
  value: unknown
): value is AiContentAssistTask {
  return (
    typeof value ===
      "string" &&
    TASK_SET.has(
      value
    )
  );
}

function isTone(
  value: unknown
): value is AiContentAssistTone {
  return (
    typeof value ===
      "string" &&
    TONE_SET.has(
      value
    )
  );
}

function isLocale(
  value: unknown
): value is LocaleCode {
  return (
    typeof value ===
      "string" &&
    LOCALE_SET.has(
      value
    )
  );
}

export function getAiContentAssistEntitlement(
  task:
    AiContentAssistTask
): ProductEntitlement {
  return AI_CONTENT_ASSIST_TASK_ENTITLEMENTS[
    task
  ];
}

export function normalizeAiContentAssistRequest(
  request:
    AiContentAssistRequest
): NormalizedAiContentAssistRequest {
  if (
    !isTask(
      request.task
    )
  ) {
    throw new AiContentAssistValidationError(
      "INVALID_TASK",
      "AI content assist task nije podržan."
    );
  }

  const requestId =
    request.requestId
      .trim();

  if (
    requestId.length ===
      0 ||
    requestId.length >
      AI_CONTENT_ASSIST_MAX_REQUEST_ID_CHARACTERS
  ) {
    throw new AiContentAssistValidationError(
      "INVALID_REQUEST_ID",
      "AI request ID nije validan."
    );
  }

  if (
    !isLocale(
      request.sourceLocale
    )
  ) {
    throw new AiContentAssistValidationError(
      "INVALID_SOURCE_LOCALE",
      "Izvorni jezik nije podržan."
    );
  }

  if (
    !isLocale(
      request.targetLocale
    )
  ) {
    throw new AiContentAssistValidationError(
      "INVALID_TARGET_LOCALE",
      "Ciljni jezik nije podržan."
    );
  }

  if (
    request.task ===
      "content_translation" &&
    request.sourceLocale ===
      request.targetLocale
  ) {
    throw new AiContentAssistValidationError(
      "SAME_TRANSLATION_LOCALE",
      "Izvorni i ciljni jezik prevoda moraju biti različiti."
    );
  }

  if (
    !isTone(
      request.tone
    )
  ) {
    throw new AiContentAssistValidationError(
      "INVALID_TONE",
      "AI tone nije podržan."
    );
  }

  const sourceText =
    request.sourceText
      .trim();

  if (
    sourceText.length ===
    0
  ) {
    throw new AiContentAssistValidationError(
      "EMPTY_SOURCE_TEXT",
      "Izvorni tekst je obavezan."
    );
  }

  if (
    sourceText.length >
    AI_CONTENT_ASSIST_MAX_SOURCE_CHARACTERS
  ) {
    throw new AiContentAssistValidationError(
      "SOURCE_TEXT_TOO_LONG",
      "Izvorni tekst je predugačak."
    );
  }

  const context =
    request.context
      ?.trim() ??
    "";

  if (
    context.length >
    AI_CONTENT_ASSIST_MAX_CONTEXT_CHARACTERS
  ) {
    throw new AiContentAssistValidationError(
      "CONTEXT_TOO_LONG",
      "Dodatni kontekst je predugačak."
    );
  }

  return {
    ...request,
    requestId,
    sourceText,
    context:
      context.length >
      0
        ? context
        : null,
  };
}

export function createAiContentAssistDraftResult({
  request,
  draftText,
  provider,
  model,
  usage,
}: {
  request:
    NormalizedAiContentAssistRequest;
  draftText: string;
  provider: string;
  model: string;
  usage?:
    Partial<AiContentAssistUsage>;
}): AiContentAssistDraftResult {
  const normalizedDraft =
    draftText.trim();

  if (
    normalizedDraft.length ===
    0
  ) {
    throw new AiContentAssistValidationError(
      "EMPTY_DRAFT",
      "AI provider je vratio prazan nacrt."
    );
  }

  return {
    contractVersion:
      AI_CONTENT_ASSIST_CONTRACT_VERSION,
    status:
      "draft",
    task:
      request.task,
    requestId:
      request.requestId,
    draftText:
      normalizedDraft,
    provider,
    model,
    requiresHumanApproval:
      true,
    autoApplyAllowed:
      false,
    usage: {
      inputTokens:
        usage
          ?.inputTokens ??
        null,
      outputTokens:
        usage
          ?.outputTokens ??
        null,
      totalTokens:
        usage
          ?.totalTokens ??
        null,
    },
  };
}
