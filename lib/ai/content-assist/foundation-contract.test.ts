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
  "lib/ai/content-assist/domain.ts",
  "lib/ai/content-assist/provider.ts",
  "lib/ai/content-assist/groq-contract.ts",
  "lib/ai/content-assist/config-server.ts",
  "lib/ai/content-assist/groq-provider-server.ts",
  "lib/ai/content-assist/provider-registry-server.ts",
  "docs/milestones/AI-CONTENT-ASSIST-FOUNDATION-01A-DOMAIN-PROVIDER-BOUNDARY.md",
] as const;

describe(
  "AI content assist foundation contract",
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
      "records the completed Operations and AI 01A/01B Git checkpoints",
      () => {
        expect(
          ROADMAP
        ).toContain(
          "PLATFORM-ADMIN-OPERATIONS-01 — završen i pushovan"
        );

        expect(
          ROADMAP
        ).toContain(
          "AI-CONTENT-ASSIST-FOUNDATION-01 — aktivan"
        );

        expect(
          ROADMAP
        ).toContain(
          "01A domain i provider boundary završen i pushovan"
        );

        expect(
          ROADMAP
        ).toContain(
          "01A + 01B ciljani Git commit i push završeni"
        );
      }
    );

    it(
      "keeps API, persistence and automatic apply outside 01A",
      () => {
        expect(
          ROADMAP
        ).toContain(
          "bez API rute, quota persistence-a i automatskog upisa"
        );
      }
    );
  }
);
