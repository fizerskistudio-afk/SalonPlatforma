import {
  existsSync,
  readFileSync,
} from "node:fs";
import {
  join,
} from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

function projectPath(
  ...segments:
    string[]
): string {
  return join(
    process.cwd(),
    ...segments
  );
}

const MILESTONE =
  readFileSync(
    projectPath(
      "docs",
      "milestones",
      "AI-CONTENT-ASSIST-FOUNDATION-01B-GUARDED-INVOCATION.md"
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );

const REQUIRED_FILES = [
  "lib/ai/content-assist/authorization.ts",
  "lib/ai/content-assist/surface-policy.ts",
  "lib/ai/content-assist/quota.ts",
  "lib/ai/content-assist/invocation.ts",
  "lib/ai/content-assist/invocation-server.ts",
  "docs/milestones/AI-CONTENT-ASSIST-FOUNDATION-01B-GUARDED-INVOCATION.md",
] as const;

describe(
  "AI content assist guarded invocation foundation",
  () => {
    it.each(
      REQUIRED_FILES
    )(
      "ships %s",
      (
        file
      ) => {
        expect(
          existsSync(
            projectPath(
              ...file.split(
                "/"
              )
            )
          )
        ).toBe(true);
      }
    );

    it(
      "records the stable controlled rollout surface policy",
      () => {
        expect(
          MILESTONE
        ).toContain(
          "platform_admin_content_translation"
        );

        expect(
          MILESTONE
        ).toContain(
          "tenant_google_review_reply"
        );

        expect(
          MILESTONE
        ).toContain(
          "Ne uvodi se opšti tenant AI endpoint"
        );

        expect(
          MILESTONE
        ).toContain(
          "01B ne dodaje:"
        );

        expect(
          MILESTONE
        ).toContain(
          "usage persistence"
        );

        expect(
          MILESTONE
        ).toContain(
          "content apply"
        );
      }
    );
  }
);
