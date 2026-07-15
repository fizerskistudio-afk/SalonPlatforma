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

const ROADMAP =
  readFileSync(
    projectPath(
      "ROADMAP.md"
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
      "records the controlled rollout surface policy",
      () => {
        expect(
          ROADMAP
        ).toContain(
          "AI prevodi su u prvom rollout-u samo Platform Admin alat"
        );

        expect(
          ROADMAP
        ).toContain(
          "tenant AI je u prvom rollout-u samo Google review reply draft"
        );

        expect(
          ROADMAP
        ).toContain(
          "bez API rute, quota persistence-a i content write-a"
        );

        expect(
          ROADMAP
        ).toContain(
          "01A + 01B ciljani Git commit i push završeni"
        );

        expect(
          ROADMAP
        ).toContain(
          "AI-CONTENT-ASSIST-FOUNDATION-01C — AUTH ADAPTERS AND INTERNAL API"
        );
      }
    );
  }
);
