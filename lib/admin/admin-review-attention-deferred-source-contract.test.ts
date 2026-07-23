import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(
  ...parts: string[]
): string {
  return readFileSync(
    join(
      process.cwd(),
      ...parts
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );
}

describe(
  "ORDUM-ADMIN-PERFORMANCE-01H",
  () => {
    const layoutSource =
      read(
        "app",
        "admin",
        "(protected)",
        "layout.tsx"
      );

    const shellSource =
      read(
        "components",
        "admin",
        "AdminShell.tsx"
      );

    const routeSource =
      read(
        "app",
        "api",
        "admin",
        "review-attention",
        "route.ts"
      );

    it(
      "does not block the protected layout on review count",
      () => {
        expect(
          layoutSource
        ).not.toContain(
          "getAdminReviewAttentionCount"
        );

        expect(
          layoutSource
        ).not.toContain(
          '"admin.layout.reviewAttention"'
        );

        expect(
          layoutSource
        ).toContain(
          "reviewsEnabled={"
        );
      }
    );

    it(
      "loads review attention once in the client shell",
      () => {
        expect(
          shellSource
        ).toContain(
          "useEffect"
        );

        expect(
          shellSource
        ).toMatch(
          /fetch\(\s*"\/api\/admin\/review-attention"/
        );

        expect(
          shellSource
        ).toMatch(
          /cache:\s*"no-store"/
        );

        expect(
          shellSource
        ).toContain(
          "AbortController"
        );
      }
    );

    it(
      "keeps the API gate before the count query",
      () => {
        expect(
          routeSource
        ).toMatch(
          /reviewsDecision\.allowed[\s\S]*"admin\.reviewAttention\.route"[\s\S]*getAdminReviewAttentionCount\s*\(/
        );

        expect(
          routeSource
        ).toContain(
          "private, no-store"
        );
      }
    );
  }
);
