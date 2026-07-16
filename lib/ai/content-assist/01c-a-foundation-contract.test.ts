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
      "AI-CONTENT-ASSIST-FOUNDATION-01C-A-AUTH-REQUEST-BOUNDARY.md"
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );

const REQUIRED_FILES = [
  "lib/ai/content-assist/auth-adapters.ts",
  "lib/ai/content-assist/auth-adapters-server.ts",
  "lib/ai/content-assist/request-contract.ts",
  "lib/ai/content-assist/request-body-server.ts",
  "lib/ai/content-assist/usage-server.ts",
  "docs/milestones/AI-CONTENT-ASSIST-FOUNDATION-01C-A-AUTH-REQUEST-BOUNDARY.md",
] as const;

describe(
  "AI content assist 01C-A foundation",
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
      "locks the two auth surfaces without a generic tenant AI endpoint",
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
          "01C-A ne uvodi opšti AI endpoint"
        );

        expect(
          MILESTONE
        ).toContain(
          "AI-CONTENT-ASSIST-FOUNDATION-01C-B — INTERNAL ROUTES AND GOOGLE REVIEW CONTEXT"
        );
      }
    );

    it(
      "keeps ROADMAP status outside the code installer contract",
      () => {
        expect(
          MILESTONE
        ).toContain(
          "ROADMAP update je zaseban manual docs korak"
        );

        expect(
          MILESTONE
        ).toContain(
          "Posle uspešnog code PASS-a koristi se zaseban"
        );
      }
    );
  }
);
