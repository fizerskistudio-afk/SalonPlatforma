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
      "auth-adapters-server.ts"
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );

describe(
  "AI server auth adapter contract",
  () => {
    it(
      "uses existing auth boundaries and dedicated permission",
      () => {
        expect(
          SOURCE
        ).toContain(
          'import "server-only"'
        );

        expect(
          SOURCE
        ).toContain(
          "getPlatformAdminAccess"
        );

        expect(
          SOURCE
        ).toContain(
          "getAdminContext"
        );

        expect(
          SOURCE
        ).toContain(
          '"tenant.content.translate"'
        );
      }
    );

    it(
      "does not read tenant business ID from request body or query Supabase",
      () => {
        for (
          const marker of [
            "request.json",
            "body.businessId",
            "createAdminClient",
            "createClient",
            ".from(",
            ".rpc(",
            ".insert(",
            ".update(",
            ".delete(",
            ".upsert(",
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
  }
);
