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
      "AI-CONTENT-ASSIST-FOUNDATION-01C-B-INTERNAL-ROUTES.md"
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );

const REQUIRED_FILES = [
  "lib/ai/content-assist/google-review-context.ts",
  "lib/ai/content-assist/google-review-context-server.ts",
  "lib/ai/content-assist/api-contract.ts",
  "lib/ai/content-assist/internal-api-server.ts",
  "app/api/platform-admin/ai/content-translation/route.ts",
  "app/api/admin/reviews/google/reply-draft/route.ts",
  "docs/milestones/AI-CONTENT-ASSIST-FOUNDATION-01C-B-INTERNAL-ROUTES.md",
] as const;

describe(
  "AI content assist 01C-B foundation",
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
      "locks separate routes and server-loaded Google review context",
      () => {
        expect(
          MILESTONE
        ).toContain(
          "POST /api/platform-admin/ai/content-translation"
        );

        expect(
          MILESTONE
        ).toContain(
          "POST /api/admin/reviews/google/reply-draft"
        );

        expect(
          MILESTONE
        ).toContain(
          "nikada ne dolazi iz browser body-ja"
        );

        expect(
          MILESTONE
        ).toContain(
          "01C-B ne menja `ROADMAP.md`"
        );
      }
    );
  }
);
