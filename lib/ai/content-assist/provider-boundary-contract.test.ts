import {
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

function source(
  file: string
): string {
  return readFileSync(
    join(
      process.cwd(),
      "lib",
      "ai",
      "content-assist",
      file
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );
}

const CONFIG =
  source(
    "config-server.ts"
  );

const PROVIDER =
  source(
    "groq-provider-server.ts"
  );

const REGISTRY =
  source(
    "provider-registry-server.ts"
  );

const CONTRACT =
  source(
    "groq-contract.ts"
  );

describe(
  "AI content assist provider boundary",
  () => {
    it(
      "keeps provider configuration and network calls server-only",
      () => {
        for (
          const fileSource of [
            CONFIG,
            PROVIDER,
            REGISTRY,
          ]
        ) {
          expect(
            fileSource
          ).toContain(
            'import "server-only"'
          );
        }
      }
    );

    it(
      "uses the private GROQ_API_KEY environment variable only",
      () => {
        expect(
          CONFIG
        ).toContain(
          '"GROQ_API_KEY"'
        );

        expect(
          CONFIG
        ).not.toContain(
          "NEXT_PUBLIC_GROQ"
        );

        expect(
          PROVIDER
        ).toContain(
          "Authorization:"
        );

        expect(
          PROVIDER
        ).toContain(
          "`Bearer ${config.apiKey}`"
        );
      }
    );

    it(
      "does not expose provider response bodies or secrets in errors",
      () => {
        expect(
          PROVIDER
        ).not.toContain(
          "response.text("
        );

        expect(
          PROVIDER
        ).not.toContain(
          "console."
        );

        expect(
          CONFIG
        ).not.toContain(
          "console."
        );
      }
    );

    it(
      "keeps the provider layer free of tenant database writes",
      () => {
        for (
          const fileSource of [
            CONFIG,
            PROVIDER,
            REGISTRY,
            CONTRACT,
          ]
        ) {
          for (
            const forbidden of [
              "createAdminClient",
              ".from(",
              ".insert(",
              ".update(",
              ".delete(",
              ".upsert(",
              ".rpc(",
            ]
          ) {
            expect(
              fileSource
            ).not.toContain(
              forbidden
            );
          }
        }
      }
    );

    it(
      "does not introduce an API route or automatic apply contract",
      () => {
        expect(
          PROVIDER
        ).toContain(
          "createAiContentAssistDraftResult"
        );

        expect(
          CONTRACT
        ).toContain(
          "include_reasoning:"
        );

        expect(
          CONTRACT
        ).toContain(
          "false"
        );

        expect(
          PROVIDER
        ).not.toContain(
          "autoApplyAllowed: true"
        );
      }
    );
  }
);
