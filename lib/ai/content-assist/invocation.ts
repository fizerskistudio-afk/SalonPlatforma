import {
  AiContentAssistValidationError,
  getAiContentAssistEntitlement,
  normalizeAiContentAssistRequest,
  type AiContentAssistDraftResult,
  type AiContentAssistRequest,
  type NormalizedAiContentAssistRequest,
} from "@/lib/ai/content-assist/domain";
import {
  authorizeAiContentAssistActor,
  type AiContentAssistActorContext,
} from "@/lib/ai/content-assist/authorization";
import type {
  AiContentAssistProvider,
} from "@/lib/ai/content-assist/provider";
import {
  AiContentAssistProviderError,
} from "@/lib/ai/content-assist/provider";
import {
  resolveAiContentAssistQuotaDecision,
  type AiContentAssistQuotaDecision,
  type AiContentAssistUsageSnapshot,
} from "@/lib/ai/content-assist/quota";
import {
  resolveAiContentAssistSurfaceDecision,
  type AiContentAssistSurface,
  type AiContentAssistSurfaceContext,
} from "@/lib/ai/content-assist/surface-policy";
import {
  hasProductEntitlement,
  type ProductPackageAccess,
} from "@/lib/product-packages/resolver";

export const AI_CONTENT_ASSIST_FAILURE_CODES = [
  "AI_REQUEST_INVALID",
  "AI_TENANT_SCOPE_MISMATCH",
  "AI_SURFACE_NOT_ALLOWED",
  "AI_PERMISSION_DENIED",
  "AI_PACKAGE_REQUIRED",
  "AI_INTEGRATION_REQUIRED",
  "AI_REVIEW_SOURCE_NOT_SUPPORTED",
  "AI_QUOTA_EXHAUSTED",
  "AI_ACCESS_UNAVAILABLE",
  "AI_PROVIDER_NOT_CONFIGURED",
  "AI_PROVIDER_REQUEST_FAILED",
  "AI_PROVIDER_RESPONSE_INVALID",
  "AI_PROVIDER_TIMEOUT",
] as const;

export type AiContentAssistFailureCode =
  (typeof AI_CONTENT_ASSIST_FAILURE_CODES)[number];

export type AiContentAssistInvocationSuccess = {
  ok: true;
  requestId: string;
  draft:
    AiContentAssistDraftResult;
  quota:
    AiContentAssistQuotaDecision;
};

export type AiContentAssistInvocationFailure = {
  ok: false;
  requestId: string | null;
  code:
    AiContentAssistFailureCode;
  message: string;
  retryable: boolean;
  blockedBy:
    | "validation"
    | "tenant_scope"
    | "surface"
    | "permission"
    | "package"
    | "integration"
    | "review_source"
    | "quota"
    | "access"
    | "provider";
  quota:
    AiContentAssistQuotaDecision | null;
};

export type AiContentAssistInvocationResult =
  | AiContentAssistInvocationSuccess
  | AiContentAssistInvocationFailure;

export type AiContentAssistInvocationEvent = {
  event:
    | "ai.content_assist.started"
    | "ai.content_assist.blocked"
    | "ai.content_assist.succeeded"
    | "ai.content_assist.failed";
  level:
    | "info"
    | "warn"
    | "error";
  context:
    Record<string, unknown>;
};

export type AiContentAssistInvocationEventSink =
  (
    event:
      AiContentAssistInvocationEvent
  ) =>
    void;

function emit(
  sink:
    AiContentAssistInvocationEventSink | undefined,
  event:
    AiContentAssistInvocationEvent
): void {
  sink?.(
    event
  );
}

function baseContext({
  businessId,
  actor,
  request,
  surface,
}: {
  businessId: string;
  actor:
    AiContentAssistActorContext;
  request:
    NormalizedAiContentAssistRequest;
  surface:
    AiContentAssistSurface;
}) {
  return {
    requestId:
      request.requestId,
    businessId,
    actorType:
      actor.actorType,
    surface,
    task:
      request.task,
    sourceLocale:
      request.sourceLocale,
    targetLocale:
      request.targetLocale,
    sourceCharacterCount:
      request.sourceText.length,
    contextCharacterCount:
      request.context
        ?.length ??
      0,
  };
}

function toProviderRequest(
  request:
    NormalizedAiContentAssistRequest
): AiContentAssistRequest {
  return {
    task:
      request.task,
    requestId:
      request.requestId,
    sourceLocale:
      request.sourceLocale,
    targetLocale:
      request.targetLocale,
    sourceText:
      request.sourceText,
    tone:
      request.tone,
    ...(request.context ===
    null
      ? {}
      : {
          context:
            request.context,
        }),
  };
}

function validationFailure(
  error:
    AiContentAssistValidationError
): AiContentAssistInvocationFailure {
  return {
    ok:
      false,
    requestId:
      null,
    code:
      "AI_REQUEST_INVALID",
    message:
      error.message,
    retryable:
      false,
    blockedBy:
      "validation",
    quota:
      null,
  };
}

function providerFailure(
  requestId: string,
  error:
    AiContentAssistProviderError,
  quota:
    AiContentAssistQuotaDecision
): AiContentAssistInvocationFailure {
  return {
    ok:
      false,
    requestId,
    code:
      error.code,
    message:
      error.message,
    retryable:
      error.code !==
        "AI_PROVIDER_NOT_CONFIGURED" &&
      error.code !==
        "AI_PROVIDER_RESPONSE_INVALID",
    blockedBy:
      "provider",
    quota,
  };
}

export async function invokeAiContentAssist({
  businessId,
  actor,
  surface,
  surfaceContext,
  access,
  usage,
  request: rawRequest,
  provider,
  onEvent,
}: {
  businessId: string;
  actor:
    AiContentAssistActorContext;
  surface:
    AiContentAssistSurface;
  surfaceContext:
    AiContentAssistSurfaceContext;
  access:
    ProductPackageAccess;
  usage:
    AiContentAssistUsageSnapshot;
  request:
    AiContentAssistRequest;
  provider:
    AiContentAssistProvider;
  onEvent?:
    AiContentAssistInvocationEventSink;
}): Promise<AiContentAssistInvocationResult> {
  let request:
    NormalizedAiContentAssistRequest;

  try {
    request =
      normalizeAiContentAssistRequest(
        rawRequest
      );
  } catch (
    error
  ) {
    if (
      error instanceof
      AiContentAssistValidationError
    ) {
      return validationFailure(
        error
      );
    }

    throw error;
  }

  const context =
    baseContext({
      businessId,
      actor,
      request,
      surface,
    });

  emit(
    onEvent,
    {
      event:
        "ai.content_assist.started",
      level:
        "info",
      context,
    }
  );

  const authorization =
    authorizeAiContentAssistActor({
      actor,
      businessId,
      task:
        request.task,
    });

  if (
    authorization.blockedBy ===
    "tenant_scope"
  ) {
    emit(
      onEvent,
      {
        event:
          "ai.content_assist.blocked",
        level:
          "warn",
        context: {
          ...context,
          blockedBy:
            "tenant_scope",
        },
      }
    );

    return {
      ok:
        false,
      requestId:
        request.requestId,
      code:
        "AI_TENANT_SCOPE_MISMATCH",
      message:
        "AI zahtev ne pripada aktivnom salonu.",
      retryable:
        false,
      blockedBy:
        "tenant_scope",
      quota:
        null,
    };
  }

  const surfaceDecision =
    resolveAiContentAssistSurfaceDecision({
      surface,
      actorType:
        actor.actorType,
      task:
        request.task,
      context:
        surfaceContext,
    });

  if (
    surfaceDecision.blockedBy ===
    "surface"
  ) {
    emit(
      onEvent,
      {
        event:
          "ai.content_assist.blocked",
        level:
          "warn",
        context: {
          ...context,
          blockedBy:
            "surface",
        },
      }
    );

    return {
      ok:
        false,
      requestId:
        request.requestId,
      code:
        "AI_SURFACE_NOT_ALLOWED",
      message:
        "Ova AI funkcija nije dostupna na ovoj površini.",
      retryable:
        false,
      blockedBy:
        "surface",
      quota:
        null,
    };
  }

  const entitlement =
    getAiContentAssistEntitlement(
      request.task
    );

  if (
    !hasProductEntitlement(
      access,
      entitlement
    )
  ) {
    emit(
      onEvent,
      {
        event:
          "ai.content_assist.blocked",
        level:
          "info",
        context: {
          ...context,
          blockedBy:
            "package",
          entitlement,
          packageMode:
            access.mode,
          packageKey:
            access.packageKey,
        },
      }
    );

    return {
      ok:
        false,
      requestId:
        request.requestId,
      code:
        "AI_PACKAGE_REQUIRED",
      message:
        "Aktivni paket ne uključuje ovu AI funkciju.",
      retryable:
        false,
      blockedBy:
        "package",
      quota:
        null,
    };
  }

  if (
    authorization.blockedBy ===
    "permission"
  ) {
    emit(
      onEvent,
      {
        event:
          "ai.content_assist.blocked",
        level:
          "warn",
        context: {
          ...context,
          blockedBy:
            "permission",
          requiredPermission:
            authorization
              .requiredPermission,
        },
      }
    );

    return {
      ok:
        false,
      requestId:
        request.requestId,
      code:
        "AI_PERMISSION_DENIED",
      message:
        "Nemaš dozvolu za ovu AI funkciju.",
      retryable:
        false,
      blockedBy:
        "permission",
      quota:
        null,
    };
  }

  if (
    surfaceDecision.blockedBy ===
    "integration"
  ) {
    return {
      ok:
        false,
      requestId:
        request.requestId,
      code:
        "AI_INTEGRATION_REQUIRED",
      message:
        "Google Reviews integracija mora biti povezana.",
      retryable:
        false,
      blockedBy:
        "integration",
      quota:
        null,
    };
  }

  if (
    surfaceDecision.blockedBy ===
    "review_source"
  ) {
    return {
      ok:
        false,
      requestId:
        request.requestId,
      code:
        "AI_REVIEW_SOURCE_NOT_SUPPORTED",
      message:
        "AI odgovor je trenutno dostupan samo za Google recenzije.",
      retryable:
        false,
      blockedBy:
        "review_source",
      quota:
        null,
    };
  }

  const quota =
    resolveAiContentAssistQuotaDecision({
      access,
      task:
        request.task,
      usage,
    });

  if (
    !quota.allowed
  ) {
    emit(
      onEvent,
      {
        event:
          "ai.content_assist.blocked",
        level:
          "info",
        context: {
          ...context,
          blockedBy:
            "quota",
          quotaLimit:
            quota.limit,
          quotaUsed:
            quota.used,
        },
      }
    );

    return {
      ok:
        false,
      requestId:
        request.requestId,
      code:
        "AI_QUOTA_EXHAUSTED",
      message:
        "Mesečni AI limit je iskorišćen.",
      retryable:
        false,
      blockedBy:
        "quota",
      quota,
    };
  }

  try {
    const draft =
      await provider.generateDraft(
        toProviderRequest(
          request
        )
      );

    if (
      draft.requiresHumanApproval !==
        true ||
      draft.autoApplyAllowed !==
        false ||
      draft.status !==
        "draft"
    ) {
      throw new AiContentAssistProviderError({
        code:
          "AI_PROVIDER_RESPONSE_INVALID",
        message:
          "AI provider nije vratio bezbedan draft rezultat.",
      });
    }

    emit(
      onEvent,
      {
        event:
          "ai.content_assist.succeeded",
        level:
          "info",
        context: {
          ...context,
          provider:
            draft.provider,
          model:
            draft.model,
          packageMode:
            access.mode,
          packageKey:
            access.packageKey,
          quotaLimit:
            quota.limit,
          quotaUsed:
            quota.used,
          inputTokens:
            draft.usage
              .inputTokens,
          outputTokens:
            draft.usage
              .outputTokens,
        },
      }
    );

    return {
      ok:
        true,
      requestId:
        request.requestId,
      draft,
      quota,
    };
  } catch (
    error
  ) {
    const providerError =
      error instanceof
      AiContentAssistProviderError
        ? error
        : new AiContentAssistProviderError({
            code:
              "AI_PROVIDER_REQUEST_FAILED",
            message:
              "AI provider trenutno nije dostupan.",
          });

    emit(
      onEvent,
      {
        event:
          "ai.content_assist.failed",
        level:
          "error",
        context: {
          ...context,
          provider:
            provider.id,
          model:
            provider.model,
          errorCode:
            providerError.code,
        },
      }
    );

    return providerFailure(
      request.requestId,
      providerError,
      quota
    );
  }
}
