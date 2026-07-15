import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveProductPackageAccess,
} from "@/lib/product-packages/resolver";
import {
  resolveAiContentAssistQuotaDecision,
} from "./quota";

function access(
  packageKey:
    string | null
) {
  return resolveProductPackageAccess({
    package_key:
      packageKey,
    package_contract_version:
      packageKey ===
      null
        ? null
        : 1,
  });
}

describe(
  "AI content assist quota",
  () => {
    it(
      "keeps legacy and invalid assignments unlimited during rollout",
      () => {
        for (
          const packageAccess of [
            access(
              null
            ),
            resolveProductPackageAccess({
              package_key:
                "unknown",
              package_contract_version:
                1,
            }),
          ]
        ) {
          expect(
            resolveAiContentAssistQuotaDecision({
              access:
                packageAccess,
              task:
                "content_translation",
              usage: {
                period:
                  "calendar_month",
                used:
                  999,
              },
            })
          ).toMatchObject({
            allowed:
              true,
            mode:
              "unlimited",
            limit:
              null,
            remaining:
              null,
          });
        }
      }
    );

    it(
      "uses the package-specific monthly task limit",
      () => {
        expect(
          resolveAiContentAssistQuotaDecision({
            access:
              access(
                "digital_studio"
              ),
            task:
              "content_translation",
            usage: {
              period:
                "calendar_month",
              used:
                24,
            },
          })
        ).toMatchObject({
          allowed:
            true,
          limit:
            25,
          remaining:
            1,
        });

        expect(
          resolveAiContentAssistQuotaDecision({
            access:
              access(
                "digital_studio"
              ),
            task:
              "content_translation",
            usage: {
              period:
                "calendar_month",
              used:
                25,
            },
          })
        ).toMatchObject({
          allowed:
            false,
          blockedBy:
            "quota",
          remaining:
            0,
        });
      }
    );

    it(
      "keeps task limits separate",
      () => {
        expect(
          resolveAiContentAssistQuotaDecision({
            access:
              access(
                "digital_studio"
              ),
            task:
              "review_reply_draft",
            usage: {
              period:
                "calendar_month",
              used:
                0,
            },
          })
        ).toMatchObject({
          allowed:
            false,
          limit:
            0,
        });

        expect(
          resolveAiContentAssistQuotaDecision({
            access:
              access(
                "reputation_pro"
              ),
            task:
              "review_reply_draft",
            usage: {
              period:
                "calendar_month",
              used:
                249,
            },
          })
        ).toMatchObject({
          allowed:
            true,
          limit:
            250,
          remaining:
            1,
        });
      }
    );
  }
);
