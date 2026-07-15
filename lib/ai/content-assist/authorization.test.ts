import {
  describe,
  expect,
  it,
} from "vitest";

import {
  authorizeAiContentAssistActor,
  getAiContentAssistPermission,
} from "./authorization";

describe(
  "AI content assist authorization",
  () => {
    it(
      "maps each task to an explicit AI permission",
      () => {
        expect(
          getAiContentAssistPermission(
            "content_translation"
          )
        ).toBe(
          "content.translate"
        );

        expect(
          getAiContentAssistPermission(
            "review_reply_draft"
          )
        ).toBe(
          "reviews.reply.draft"
        );
      }
    );

    it(
      "requires both tenant scope and task permission",
      () => {
        const actor = {
          actorType:
            "platform_admin" as const,
          actorId:
            "user-1",
          businessId:
            "business-1",
          permissions: [
            "content.translate",
          ] as const,
        };

        expect(
          authorizeAiContentAssistActor({
            actor,
            businessId:
              "business-1",
            task:
              "content_translation",
          })
        ).toMatchObject({
          allowed:
            true,
          blockedBy:
            null,
        });

        expect(
          authorizeAiContentAssistActor({
            actor,
            businessId:
              "business-2",
            task:
              "content_translation",
          })
        ).toMatchObject({
          allowed:
            false,
          blockedBy:
            "tenant_scope",
        });

        expect(
          authorizeAiContentAssistActor({
            actor,
            businessId:
              "business-1",
            task:
              "review_reply_draft",
          })
        ).toMatchObject({
          allowed:
            false,
          blockedBy:
            "permission",
        });
      }
    );
  }
);
