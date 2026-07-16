import "server-only";

import {
  getAdminContext,
} from "@/lib/auth/admin";
import {
  getPlatformAdminAccess,
} from "@/lib/auth/platform-admin";
import {
  hasPlatformAdminPermission,
  type PlatformAdminPermission,
} from "@/lib/auth/platform-admin-policy";
import {
  resolvePlatformAdminTranslationActor,
  resolveTenantGoogleReviewReplyActor,
  type AiContentAssistAuthResult,
} from "@/lib/ai/content-assist/auth-adapters";

export type LoadPlatformAdminAiAccess =
  (
    permission:
      PlatformAdminPermission
  ) =>
    ReturnType<
      typeof getPlatformAdminAccess
    >;

export type LoadTenantAdminAiContext =
  typeof getAdminContext;

export async function resolvePlatformAdminTranslationAuth({
  businessId,
  loadAccess =
    getPlatformAdminAccess,
}: {
  businessId: string;
  loadAccess?: LoadPlatformAdminAiAccess;
}): Promise<AiContentAssistAuthResult> {
  const access =
    await loadAccess(
      "tenant.content.translate"
    );

  if (
    "context" in
    access
  ) {
    return resolvePlatformAdminTranslationActor({
      businessId,
      access: {
        status: "authorized",
        userId:
          access.context.userId,
        hasTranslationPermission:
          hasPlatformAdminPermission(
            access.context.role,
            "tenant.content.translate"
          ),
      },
    });
  }

  return resolvePlatformAdminTranslationActor({
    businessId,
    access: {
      status:
        access.status ===
          "unauthenticated"
          ? "unauthenticated"
          : "forbidden",
    },
  });
}

export async function resolveTenantGoogleReviewReplyAuth({
  loadContext =
    getAdminContext,
}: {
  loadContext?: LoadTenantAdminAiContext;
} = {}): Promise<AiContentAssistAuthResult> {
  const context =
    await loadContext();

  return resolveTenantGoogleReviewReplyActor({
    context:
      context
        ? {
            userId:
              context.userId,
            businessId:
              context.business.id,
            role:
              context.role,
            mustChangePassword:
              context.mustChangePassword,
            requiresTenantSelection:
              context.requiresTenantSelection,
          }
        : null,
  });
}
