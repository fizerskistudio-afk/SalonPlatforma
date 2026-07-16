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
      "AI-CONTENT-ASSIST-FOUNDATION-01C-C-RUNTIME-CLOSEOUT.md"
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );

const REQUIRED_FILES = [
  "lib/ai/content-assist/internal-api-runtime.ts",
  "lib/ai/content-assist/internal-api-runtime.test.ts",
  "docs/milestones/AI-CONTENT-ASSIST-FOUNDATION-01C-C-RUNTIME-CLOSEOUT.md",
  "docs/qa/AI-CONTENT-ASSIST-01C-C-RUNTIME-SMOKE.md",
] as const;

describe(
  "AI content assist 01C-C closeout",
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
      "locks controlled runtime coverage and the post-foundation order",
      () => {
        for (
          const marker of [
            "createAiContentAssistInternalApiHandlers",
            "controlled Request/Response runtime",
            "AI-CONTENT-ASSIST-USAGE-01",
            "CONTENT-STARTER-PACKS-01A",
            "01C-C ne menja `ROADMAP.md`",
          ]
        ) {
          expect(
            MILESTONE
          ).toContain(
            marker
          );
        }
      }
    );
  }
);
