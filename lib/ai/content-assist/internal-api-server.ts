import "server-only";

import {
  resolvePlatformAdminTranslationAuth,
  resolveTenantGoogleReviewReplyAuth,
} from "@/lib/ai/content-assist/auth-adapters-server";
import {
  GoogleReviewContextLoadError,
  loadGoogleReviewReplyContext,
} from "@/lib/ai/content-assist/google-review-context-server";
import {
  createAiContentAssistInternalApiHandlers,
} from "@/lib/ai/content-assist/internal-api-runtime";
import {
  invokeAiContentAssistForBusiness,
} from "@/lib/ai/content-assist/invocation-server";
import {
  getAiContentAssistRequestId,
  readAiContentAssistJsonBody,
} from "@/lib/ai/content-assist/request-body-server";
import {
  loadAiContentAssistUsageSnapshot,
} from "@/lib/ai/content-assist/usage-server";
import {
  logServerError,
  withRequestId,
} from "@/lib/monitoring/server";

const handlers =
  createAiContentAssistInternalApiHandlers({
    getRequestId:
      getAiContentAssistRequestId,
    readJsonBody:
      readAiContentAssistJsonBody,
    resolvePlatformAuth:
      resolvePlatformAdminTranslationAuth,
    resolveTenantAuth:
      resolveTenantGoogleReviewReplyAuth,
    loadReviewContext:
      loadGoogleReviewReplyContext,
    loadUsage:
      loadAiContentAssistUsageSnapshot,
    invoke:
      invokeAiContentAssistForBusiness,
    isReviewContextLoadError:
      (
        error
      ) =>
        error instanceof
          GoogleReviewContextLoadError,
    logError:
      (
        event,
        error,
        context
      ) => {
        logServerError(
          event,
          error,
          context
        );
      },
    withRequestId:
      (
        response,
        requestId
      ) =>
        withRequestId(
          response,
          requestId
        ),
  });

export const handlePlatformAdminContentTranslationRequest =
  handlers
    .handlePlatformAdminContentTranslationRequest;

export const handleTenantGoogleReviewReplyRequest =
  handlers
    .handleTenantGoogleReviewReplyRequest;
