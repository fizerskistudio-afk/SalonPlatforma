import {
  LOCALE_CODES,
  type LocaleCode,
} from "@/lib/i18n/locales";
import {
  AI_CONTENT_ASSIST_TONES,
  normalizeAiContentAssistRequest,
  type AiContentAssistRequest,
  type AiContentAssistTone,
} from "@/lib/ai/content-assist/domain";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const LOCALE_SET =
  new Set<string>(
    LOCALE_CODES
  );

const TONE_SET =
  new Set<string>(
    AI_CONTENT_ASSIST_TONES
  );

const PLATFORM_TRANSLATION_FIELDS =
  new Set([
    "businessId",
    "sourceLocale",
    "targetLocale",
    "sourceText",
    "context",
    "tone",
  ]);

const TENANT_REVIEW_REPLY_FIELDS =
  new Set([
    "reviewId",
    "targetLocale",
    "tone",
  ]);

export const AI_CONTENT_ASSIST_REQUEST_CONTRACT_ERROR_CODES = [
  "INVALID_REQUEST_BODY",
  "INVALID_REQUEST_FIELDS",
  "INVALID_BUSINESS_ID",
  "INVALID_REVIEW_ID",
  "INVALID_TARGET_LOCALE",
  "INVALID_TONE",
] as const;

export type AiContentAssistRequestContractErrorCode =
  (typeof AI_CONTENT_ASSIST_REQUEST_CONTRACT_ERROR_CODES)[number];

export class AiContentAssistRequestContractError
  extends Error {
  readonly code:
    AiContentAssistRequestContractErrorCode;

  constructor(
    code:
      AiContentAssistRequestContractErrorCode,
    message: string
  ) {
    super(message);
    this.name =
      "AiContentAssistRequestContractError";
    this.code =
      code;
  }
}

export type PlatformAdminTranslationCommand = {
  businessId: string;
  request: AiContentAssistRequest;
};

export type TenantGoogleReviewReplyCommand = {
  requestId: string;
  reviewId: string;
  targetLocale: LocaleCode;
  tone: AiContentAssistTone;
};

function isJsonRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value
    )
  );
}

function assertOnlyFields(
  value: Record<string, unknown>,
  allowed: ReadonlySet<string>
): void {
  const unexpected =
    Object.keys(
      value
    ).filter(
      (
        key
      ) =>
        !allowed.has(
          key
        )
    );

  if (
    unexpected.length >
    0
  ) {
    throw new AiContentAssistRequestContractError(
      "INVALID_REQUEST_FIELDS",
      "AI zahtev sadrži nedozvoljena polja."
    );
  }
}

function getString(
  value: unknown
): string {
  return typeof value ===
    "string"
      ? value
      : "";
}

function getLocale(
  value: unknown,
  code:
    AiContentAssistRequestContractErrorCode,
  message: string
): LocaleCode {
  if (
    typeof value !==
      "string" ||
    !LOCALE_SET.has(
      value
    )
  ) {
    throw new AiContentAssistRequestContractError(
      code,
      message
    );
  }

  return value as
    LocaleCode;
}

function getTone(
  value: unknown,
  fallback:
    AiContentAssistTone
): AiContentAssistTone {
  if (
    typeof value ===
    "undefined"
  ) {
    return fallback;
  }

  if (
    typeof value !==
      "string" ||
    !TONE_SET.has(
      value
    )
  ) {
    throw new AiContentAssistRequestContractError(
      "INVALID_TONE",
      "AI ton nije podržan."
    );
  }

  return value as
    AiContentAssistTone;
}

function toProviderCompatibleRequest(
  request: AiContentAssistRequest
): AiContentAssistRequest {
  const normalized =
    normalizeAiContentAssistRequest(
      request
    );

  return {
    task:
      normalized.task,
    requestId:
      normalized.requestId,
    sourceLocale:
      normalized.sourceLocale,
    targetLocale:
      normalized.targetLocale,
    sourceText:
      normalized.sourceText,
    tone:
      normalized.tone,
    ...(normalized.context ===
    null
      ? {}
      : {
          context:
            normalized.context,
        }),
  };
}

export function parsePlatformAdminTranslationCommand({
  value,
  requestId,
}: {
  value: unknown;
  requestId: string;
}): PlatformAdminTranslationCommand {
  if (
    !isJsonRecord(
      value
    )
  ) {
    throw new AiContentAssistRequestContractError(
      "INVALID_REQUEST_BODY",
      "AI zahtev mora biti JSON objekat."
    );
  }

  assertOnlyFields(
    value,
    PLATFORM_TRANSLATION_FIELDS
  );

  const businessId =
    getString(
      value.businessId
    ).trim();

  if (
    !UUID_PATTERN.test(
      businessId
    )
  ) {
    throw new AiContentAssistRequestContractError(
      "INVALID_BUSINESS_ID",
      "Salon za AI prevod nije validan."
    );
  }

  const contextValue =
    typeof value.context ===
      "string"
      ? value.context
      : undefined;

  return {
    businessId,
    request:
      toProviderCompatibleRequest({
        task:
          "content_translation",
        requestId,
        sourceLocale:
          getLocale(
            value.sourceLocale,
            "INVALID_REQUEST_BODY",
            "Izvorni jezik nije podržan."
          ),
        targetLocale:
          getLocale(
            value.targetLocale,
            "INVALID_TARGET_LOCALE",
            "Ciljni jezik nije podržan."
          ),
        sourceText:
          getString(
            value.sourceText
          ),
        tone:
          getTone(
            value.tone,
            "professional"
          ),
        ...(typeof contextValue ===
        "string"
          ? {
              context:
                contextValue,
            }
          : {}),
      }),
  };
}

export function parseTenantGoogleReviewReplyCommand({
  value,
  requestId,
}: {
  value: unknown;
  requestId: string;
}): TenantGoogleReviewReplyCommand {
  if (
    !isJsonRecord(
      value
    )
  ) {
    throw new AiContentAssistRequestContractError(
      "INVALID_REQUEST_BODY",
      "AI zahtev mora biti JSON objekat."
    );
  }

  assertOnlyFields(
    value,
    TENANT_REVIEW_REPLY_FIELDS
  );

  const reviewId =
    getString(
      value.reviewId
    ).trim();

  if (
    !UUID_PATTERN.test(
      reviewId
    )
  ) {
    throw new AiContentAssistRequestContractError(
      "INVALID_REVIEW_ID",
      "Google recenzija nije validna."
    );
  }

  return {
    requestId,
    reviewId,
    targetLocale:
      getLocale(
        value.targetLocale,
        "INVALID_TARGET_LOCALE",
        "Ciljni jezik odgovora nije podržan."
      ),
    tone:
      getTone(
        value.tone,
        "warm"
      ),
  };
}
