import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolvePlatformAdminTranslationActor,
  resolveTenantGoogleReviewReplyActor,
} from "./auth-adapters";

describe(
  "AI content assist auth adapters",
  () => {
    it(
      "builds only the Platform Admin translation actor",
      () => {
        expect(
          resolvePlatformAdminTranslationActor({
            businessId:
              "business-1",
            access: {
              status:
                "authorized",
              userId:
                "platform-user",
              hasTranslationPermission:
                true,
            },
          })
        ).toEqual({
          ok: true,
          businessId:
            "business-1",
          surface:
            "platform_admin_content_translation",
          actor: {
            actorType:
              "platform_admin",
            actorId:
              "platform-user",
            businessId:
              "business-1",
            permissions: [
              "content.translate",
            ],
          },
        });
      }
    );

    it(
      "fails closed for missing Platform Admin session or permission",
      () => {
        expect(
          resolvePlatformAdminTranslationActor({
            businessId:
              "business-1",
            access: {
              status:
                "unauthenticated",
            },
          })
        ).toMatchObject({
          ok: false,
          status: 401,
          code:
            "PLATFORM_ADMIN_UNAUTHENTICATED",
        });

        expect(
          resolvePlatformAdminTranslationActor({
            businessId:
              "business-1",
            access: {
              status:
                "authorized",
              userId:
                "platform-user",
              hasTranslationPermission:
                false,
            },
          })
        ).toMatchObject({
          ok: false,
          status: 403,
          code:
            "PLATFORM_ADMIN_FORBIDDEN",
        });
      }
    );

    it(
      "uses only active tenant context for Google reply",
      () => {
        expect(
          resolveTenantGoogleReviewReplyActor({
            context: {
              userId:
                "tenant-user",
              businessId:
                "business-1",
              role:
                "owner",
              mustChangePassword:
                false,
              requiresTenantSelection:
                false,
            },
          })
        ).toEqual({
          ok: true,
          businessId:
            "business-1",
          surface:
            "tenant_google_review_reply",
          actor: {
            actorType:
              "tenant_admin",
            actorId:
              "tenant-user",
            businessId:
              "business-1",
            permissions: [
              "reviews.reply.draft",
            ],
          },
        });
      }
    );

    it(
      "blocks password-change and unresolved tenant-selection states",
      () => {
        expect(
          resolveTenantGoogleReviewReplyActor({
            context: {
              userId:
                "tenant-user",
              businessId:
                "business-1",
              role:
                "manager",
              mustChangePassword:
                true,
              requiresTenantSelection:
                false,
            },
          })
        ).toMatchObject({
          ok: false,
          status: 403,
          code:
            "TENANT_PASSWORD_CHANGE_REQUIRED",
        });

        expect(
          resolveTenantGoogleReviewReplyActor({
            context: {
              userId:
                "tenant-user",
              businessId:
                "business-1",
              role:
                "owner",
              mustChangePassword:
                false,
              requiresTenantSelection:
                true,
            },
          })
        ).toMatchObject({
          ok: false,
          status: 409,
          code:
            "TENANT_SELECTION_REQUIRED",
        });
      }
    );
  }
);
