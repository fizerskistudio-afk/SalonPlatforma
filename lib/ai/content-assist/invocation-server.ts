import "server-only";

import type {
  AiContentAssistRequest,
} from "@/lib/ai/content-assist/domain";
import type {
  AiContentAssistActorContext,
} from "@/lib/ai/content-assist/authorization";
import {
  invokeAiContentAssist,
  type AiContentAssistInvocationResult,
} from "@/lib/ai/content-assist/invocation";
import {
  getAiContentAssistProvider,
} from "@/lib/ai/content-assist/provider-registry-server";
import {
  AiContentAssistProviderError,
  type AiContentAssistProvider,
} from "@/lib/ai/content-assist/provider";
import type {
  AiContentAssistUsageSnapshot,
} from "@/lib/ai/content-assist/quota";
import type {
  AiContentAssistSurface,
  AiContentAssistSurfaceContext,
} from "@/lib/ai/content-assist/surface-policy";
import {
  loadProductPackageAccessForBusinessId,
} from "@/lib/product-packages/access-server";
import {
  logServerEvent,
} from "@/lib/monitoring/server";

export type LoadAiContentAssistAccess =
  typeof loadProductPackageAccessForBusinessId;

function accessUnavailableResult({
  businessId,
  actor,
  request,
}: {
  businessId: string;
  actor:
    AiContentAssistActorContext;
  request:
    AiContentAssistRequest;
}): AiContentAssistInvocationResult {
  logServerEvent(
    "error",
    "ai.content_assist.failed",
    {
      requestId:
        request.requestId,
      businessId,
      actorType:
        actor.actorType,
      task:
        request.task,
      errorCode:
        "AI_ACCESS_UNAVAILABLE",
    }
  );

  return {
    ok:
      false,
    requestId:
      request.requestId,
    code:
      "AI_ACCESS_UNAVAILABLE",
    message:
      "AI pristup trenutno nije moguće proveriti.",
    retryable:
      true,
    blockedBy:
      "access",
    quota:
      null,
  };
}

function providerUnavailableResult({
  businessId,
  actor,
  request,
  error,
}: {
  businessId: string;
  actor:
    AiContentAssistActorContext;
  request:
    AiContentAssistRequest;
  error:
    AiContentAssistProviderError;
}): AiContentAssistInvocationResult {
  logServerEvent(
    "error",
    "ai.content_assist.failed",
    {
      requestId:
        request.requestId,
      businessId,
      actorType:
        actor.actorType,
      task:
        request.task,
      errorCode:
        error.code,
    }
  );

  return {
    ok:
      false,
    requestId:
      request.requestId,
    code:
      error.code,
    message:
      error.message,
    retryable:
      error.code !==
        "AI_PROVIDER_NOT_CONFIGURED",
    blockedBy:
      "provider",
    quota:
      null,
  };
}

export async function invokeAiContentAssistForBusiness({
  businessId,
  actor,
  surface,
  surfaceContext,
  usage,
  request,
  provider,
  loadAccess =
    loadProductPackageAccessForBusinessId,
}: {
  businessId: string;
  actor:
    AiContentAssistActorContext;
  surface:
    AiContentAssistSurface;
  surfaceContext:
    AiContentAssistSurfaceContext;
  usage:
    AiContentAssistUsageSnapshot;
  request:
    AiContentAssistRequest;
  provider?:
    AiContentAssistProvider;
  loadAccess?:
    LoadAiContentAssistAccess;
}): Promise<AiContentAssistInvocationResult> {
  let accessSnapshot:
    Awaited<
      ReturnType<
        LoadAiContentAssistAccess
      >
    >;

  try {
    accessSnapshot =
      await loadAccess(
        businessId
      );
  } catch {
    return accessUnavailableResult({
      businessId,
      actor,
      request,
    });
  }

  if (
    !accessSnapshot
  ) {
    logServerEvent(
      "warn",
      "ai.content_assist.blocked",
      {
        requestId:
          request.requestId,
        businessId,
        actorType:
          actor.actorType,
        task:
          request.task,
        blockedBy:
          "tenant_missing",
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
        "Salon nije dostupan za AI zahtev.",
      retryable:
        false,
      blockedBy:
        "tenant_scope",
      quota:
        null,
    };
  }

  let resolvedProvider:
    AiContentAssistProvider;

  try {
    resolvedProvider =
      provider ??
      getAiContentAssistProvider();
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

    return providerUnavailableResult({
      businessId,
      actor,
      request,
      error:
        providerError,
    });
  }

  return invokeAiContentAssist({
    businessId:
      accessSnapshot
        .businessId,
    actor,
    surface,
    surfaceContext,
    access:
      accessSnapshot.access,
    usage,
    request,
    provider:
      resolvedProvider,
    onEvent:
      (
        event
      ) => {
        logServerEvent(
          event.level,
          event.event,
          event.context
        );
      },
  });
}
