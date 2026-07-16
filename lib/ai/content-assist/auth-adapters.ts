import type {
  AiContentAssistActorContext,
} from "@/lib/ai/content-assist/authorization";
import type {
  AiContentAssistSurface,
} from "@/lib/ai/content-assist/surface-policy";

export const AI_CONTENT_ASSIST_AUTH_FAILURE_CODES = [
  "PLATFORM_ADMIN_UNAUTHENTICATED",
  "PLATFORM_ADMIN_FORBIDDEN",
  "AI_TARGET_BUSINESS_REQUIRED",
  "TENANT_ADMIN_UNAUTHENTICATED",
  "TENANT_PASSWORD_CHANGE_REQUIRED",
  "TENANT_SELECTION_REQUIRED",
] as const;

export type AiContentAssistAuthFailureCode =
  (typeof AI_CONTENT_ASSIST_AUTH_FAILURE_CODES)[number];

export type AiContentAssistAuthFailure = {
  ok: false;
  status: 400 | 401 | 403 | 409;
  code: AiContentAssistAuthFailureCode;
  message: string;
};

export type AiContentAssistAuthSuccess = {
  ok: true;
  businessId: string;
  surface: AiContentAssistSurface;
  actor: AiContentAssistActorContext;
};

export type AiContentAssistAuthResult =
  | AiContentAssistAuthSuccess
  | AiContentAssistAuthFailure;

export type PlatformAdminTranslationAuthSnapshot =
  | {
      status: "authorized";
      userId: string;
      hasTranslationPermission: boolean;
    }
  | {
      status: "unauthenticated";
    }
  | {
      status: "forbidden";
    };

export type TenantGoogleReviewReplyAuthSnapshot =
  | null
  | {
      userId: string;
      businessId: string;
      role: "owner" | "manager";
      mustChangePassword: boolean;
      requiresTenantSelection: boolean;
    };

export function resolvePlatformAdminTranslationActor({
  access,
  businessId,
}: {
  access: PlatformAdminTranslationAuthSnapshot;
  businessId: string;
}): AiContentAssistAuthResult {
  if (
    access.status ===
    "unauthenticated"
  ) {
    return {
      ok: false,
      status: 401,
      code: "PLATFORM_ADMIN_UNAUTHENTICATED",
      message: "Platform admin sesija nije aktivna.",
    };
  }

  if (
    access.status ===
      "forbidden" ||
    !access.hasTranslationPermission
  ) {
    return {
      ok: false,
      status: 403,
      code: "PLATFORM_ADMIN_FORBIDDEN",
      message: "Nemaš dozvolu za AI prevod sadržaja.",
    };
  }

  const normalizedBusinessId =
    businessId.trim();

  if (
    normalizedBusinessId.length ===
    0
  ) {
    return {
      ok: false,
      status: 400,
      code: "AI_TARGET_BUSINESS_REQUIRED",
      message: "Salon za AI prevod nije izabran.",
    };
  }

  return {
    ok: true,
    businessId: normalizedBusinessId,
    surface:
      "platform_admin_content_translation",
    actor: {
      actorType: "platform_admin",
      actorId: access.userId,
      businessId:
        normalizedBusinessId,
      permissions: [
        "content.translate",
      ],
    },
  };
}

export function resolveTenantGoogleReviewReplyActor({
  context,
}: {
  context: TenantGoogleReviewReplyAuthSnapshot;
}): AiContentAssistAuthResult {
  if (
    !context
  ) {
    return {
      ok: false,
      status: 401,
      code: "TENANT_ADMIN_UNAUTHENTICATED",
      message: "Admin sesija nije aktivna.",
    };
  }

  if (
    context.mustChangePassword
  ) {
    return {
      ok: false,
      status: 403,
      code: "TENANT_PASSWORD_CHANGE_REQUIRED",
      message: "Pre korišćenja AI funkcije promeni privremenu lozinku.",
    };
  }

  if (
    context.requiresTenantSelection
  ) {
    return {
      ok: false,
      status: 409,
      code: "TENANT_SELECTION_REQUIRED",
      message: "Izaberi salon pre korišćenja AI odgovora.",
    };
  }

  return {
    ok: true,
    businessId:
      context.businessId,
    surface:
      "tenant_google_review_reply",
    actor: {
      actorType:
        "tenant_admin",
      actorId:
        context.userId,
      businessId:
        context.businessId,
      permissions: [
        "reviews.reply.draft",
      ],
    },
  };
}
