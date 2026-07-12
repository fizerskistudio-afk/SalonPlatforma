import {
  readFileSync,
} from "node:fs";
import {
  resolve,
} from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

function readSource(
  path: string
): string {
  return readFileSync(
    resolve(
      process.cwd(),
      path
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );
}

describe(
  "reviews deployed preflight contract",
  () => {
    const script =
      readSource(
        "scripts/reviews-deployed-preflight.mjs"
      );

    it(
      "keeps B1 read-only",
      () => {
        expect(
          script
        ).toContain(
          "authorizedCronCalled"
        );

        expect(
          script
        ).toContain(
          "emailSent"
        );

        expect(
          script
        ).not.toContain(
          "process.env.CRON_SECRET"
        );

        expect(
          script
        ).not.toContain(
          "SUPABASE_SECRET_KEY"
        );

        expect(
          script
        ).not.toContain(
          "RESEND_API_KEY"
        );

        expect(
          script
        ).not.toContain(
          'method: "POST"'
        );
      }
    );

    it.each([
      "platform-root",
      "tenant-public-page",
      "tenant-catalog-review-contract",
      "direct-review-page",
      "invalid-invitation-page",
      "cron-rejects-missing-secret",
      "cron-rejects-wrong-secret",
    ])(
      "keeps deployed check %s",
      (
        marker
      ) => {
        expect(
          script
        ).toContain(
          marker
        );
      }
    );

    it(
      "validates the mandatory catalog review shape",
      () => {
        expect(
          script
        ).toContain(
          "catalog.reviews"
        );

        expect(
          script
        ).toContain(
          "catalog.reviewSummary"
        );

        expect(
          script
        ).toContain(
          "catalog.reviewConfig"
        );
      }
    );

    it(
      "writes sanitized evidence under an ignored path",
      () => {
        expect(
          script
        ).toContain(
          "tmp/reviews-qa"
        );

        const gitignore =
          readSource(
            ".gitignore"
          );

        expect(
          gitignore
        ).toContain(
          "/tmp/reviews-qa/"
        );
      }
    );

    it(
      "exposes an npm command",
      () => {
        const packageJson =
          JSON.parse(
            readSource(
              "package.json"
            )
          ) as {
            scripts?: Record<
              string,
              string
            >;
          };

        expect(
          packageJson.scripts?.[
            "qa:reviews:deployed"
          ]
        ).toBe(
          "node scripts/reviews-deployed-preflight.mjs"
        );
      }
    );

    it(
      "documents B1, B2 and plan-aware activation",
      () => {
        const preflight =
          readSource(
            "docs/qa/REVIEWS-DEPLOYED-PREFLIGHT.md"
          );

        const activation =
          readSource(
            "docs/deployment/VERCEL-REVIEW-CRON-ACTIVATION.md"
          );

        expect(
          preflight
        ).toContain(
          "B2 entry criteria"
        );

        expect(
          activation
        ).toContain(
          "EMAIL_TEST_MODE=true"
        );

        expect(
          activation
        ).toContain(
          "REVIEW_INVITATION_CRON_BATCH_LIMIT=1"
        );

        expect(
          activation
        ).toContain(
          "Hobby"
        );

        expect(
          activation
        ).toContain(
          "Pro or Enterprise"
        );

        expect(
          activation
        ).toContain(
          "Do not add an active `vercel.json`"
        );
      }
    );
  }
);
