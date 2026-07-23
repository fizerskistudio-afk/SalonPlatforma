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
  "ORDUM-ADMIN-PERFORMANCE-01F",
  () => {
    const adminSource =
      read(
        "lib",
        "auth",
        "admin.ts"
      );

    const layoutSource =
      read(
        "app",
        "admin",
        "(protected)",
        "layout.tsx"
      );

    it(
      "loads package assignment in the existing business lookup",
      () => {
        expect(
          adminSource
        ).toContain(
          "resolveBusinessProductAccess"
        );

        for (
          const column of [
            "package_key",
            "package_contract_version",
            "package_assigned_at",
            "package_assigned_by_user_id",
          ]
        ) {
          expect(
            adminSource
          ).toContain(
            column
          );
        }

        expect(
          adminSource
        ).toContain(
          "productAccess:"
        );
      }
    );

    it(
      "uses the request-scoped package snapshot before fallback loading",
      () => {
        const snapshotIndex =
          layoutSource.indexOf(
            "admin.productAccess"
          );

        const fallbackIndex =
          layoutSource.indexOf(
            "loadProductPackageAccessForBusinessId("
          );

        expect(
          snapshotIndex
        ).toBeGreaterThan(
          -1
        );

        expect(
          fallbackIndex
        ).toBeGreaterThan(
          snapshotIndex
        );

        expect(
          layoutSource
        ).toContain(
          '"admin.layout.productAccess"'
        );
      }
    );

    it(
      "preserves package and review gate behavior",
      () => {
        expect(
          layoutSource
        ).toContain(
          "reviewsDecision.allowed"
        );

        expect(
          layoutSource
        ).not.toContain(
          "getAdminReviewAttentionCount"
        );

        expect(
          layoutSource
        ).toContain(
          "reviewsEnabled={"
        );

        expect(
          layoutSource
        ).toContain(
          "productAccess={"
        );
      }
    );
  }
);
