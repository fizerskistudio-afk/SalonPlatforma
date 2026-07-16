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
      "request-body-server.ts"
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );

describe(
  "AI request body server contract",
  () => {
    it(
      "uses shared request ID and enforces declared and actual size",
      () => {
        expect(
          SOURCE
        ).toContain(
          'import "server-only"'
        );

        expect(
          SOURCE
        ).toContain(
          "createRequestId"
        );

        expect(
          SOURCE
        ).toContain(
          "content-length"
        );

        expect(
          SOURCE
        ).toContain(
          "TextEncoder"
        );

        expect(
          SOURCE
        ).toContain(
          "REQUEST_BODY_TOO_LARGE"
        );
      }
    );

    it(
      "does not log or persist body content",
      () => {
        for (
          const marker of [
            "console.",
            "logServerEvent",
            ".from(",
            ".insert(",
            ".update(",
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
