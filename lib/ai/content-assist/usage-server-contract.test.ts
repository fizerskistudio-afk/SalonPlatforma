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
      "usage-server.ts"
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );

describe(
  "AI rollout usage adapter",
  () => {
    it(
      "is explicit, read-only and database-free",
      () => {
        expect(
          SOURCE
        ).toContain(
          '"rollout_read_only_zero"'
        );

        expect(
          SOURCE
        ).toContain(
          'period:\n      "calendar_month"'
        );

        expect(
          SOURCE
        ).toContain(
          'used:\n      0'
        );

        for (
          const marker of [
            "supabase",
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
