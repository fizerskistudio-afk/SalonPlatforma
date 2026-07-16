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
      "google-review-context-server.ts"
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );

describe(
  "Google review context server contract",
  () => {
    it(
      "loads review and Google connection with explicit tenant filters",
      () => {
        expect(
          SOURCE
        ).toContain(
          '.from(\n          "reviews"'
        );

        expect(
          SOURCE
        ).toContain(
          '"review_provider_connections"'
        );

        expect(
          SOURCE
        ).toContain(
          '.eq(\n          "business_id",\n          businessId'
        );

        expect(
          SOURCE
        ).toContain(
          '.eq(\n          "provider",\n          "google"'
        );
      }
    );

    it(
      "is server-only and read-only",
      () => {
        expect(
          SOURCE
        ).toContain(
          'import "server-only"'
        );

        for (
          const marker of [
            ".insert(",
            ".update(",
            ".upsert(",
            ".delete(",
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
  }
);
