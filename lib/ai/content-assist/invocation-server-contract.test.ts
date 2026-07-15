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

const SOURCE =
  readFileSync(
    join(
      process.cwd(),
      "lib",
      "ai",
      "content-assist",
      "invocation-server.ts"
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );

describe(
  "AI content assist invocation server boundary",
  () => {
    it(
      "stays server-only and reuses the existing package access loader",
      () => {
        expect(
          SOURCE
        ).toContain(
          'import "server-only"'
        );

        expect(
          SOURCE
        ).toContain(
          "loadProductPackageAccessForBusinessId"
        );
      }
    );

    it(
      "passes the explicit rollout surface through the server boundary",
      () => {
        expect(
          SOURCE
        ).toContain(
          "AiContentAssistSurface"
        );

        expect(
          SOURCE
        ).toContain(
          "surfaceContext"
        );
      }
    );

    it(
      "uses the shared monitoring layer without logging source text or actor ID",
      () => {
        expect(
          SOURCE
        ).toContain(
          "logServerEvent"
        );

        expect(
          SOURCE
        ).not.toContain(
          "sourceText"
        );

        expect(
          SOURCE
        ).not.toContain(
          "actorId"
        );

        expect(
          SOURCE
        ).not.toContain(
          "email"
        );
      }
    );

    it(
      "does not persist quota, content or provider responses",
      () => {
        for (
          const marker of [
            ".insert(",
            ".update(",
            ".delete(",
            ".upsert(",
            ".rpc(",
          ]
        ) {
          expect(
            SOURCE
          ).not.toContain(
            marker
          );
        }
      }
    );

    it(
      "does not expose an API route or content apply operation",
      () => {
        expect(
          SOURCE
        ).not.toContain(
          "NextRequest"
        );

        expect(
          SOURCE
        ).not.toContain(
          "NextResponse"
        );

        expect(
          SOURCE
        ).not.toContain(
          "apply"
        );
      }
    );
  }
);
