import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(...parts: string[]): string {
  return readFileSync(
    join(process.cwd(), ...parts),
    "utf8"
  ).replace(/\r\n/g, "\n");
}

describe(
  "ORDUM-ADMIN-PERFORMANCE-01E",
  () => {
    it(
      "measures the shared admin context pipeline",
      () => {
        const source = read(
          "lib",
          "auth",
          "admin.ts"
        );

        for (
          const label of [
            "admin.context.createClient",
            "admin.context.claims",
            "admin.context.tenantRead",
            "admin.context.preferredBusiness",
          ]
        ) {
          expect(source).toContain(
            `"${label}"`
          );
        }
      }
    );

    it(
      "measures protected layout and deferred badge dependencies",
      () => {
        const layoutSource =
          read(
            "app",
            "admin",
            "(protected)",
            "layout.tsx"
          );

        for (
          const label of [
            "admin.metadata.context",
            "admin.layout.requireAdmin",
            "admin.layout.productAccess",
          ]
        ) {
          expect(
            layoutSource
          ).toContain(
            `"${label}"`
          );
        }

        const routeSource =
          read(
            "app",
            "api",
            "admin",
            "review-attention",
            "route.ts"
          );

        expect(
          routeSource
        ).toContain(
          '"admin.reviewAttention.route"'
        );

        expect(
          layoutSource
        ).not.toContain(
          '"admin.layout.reviewAttention"'
        );
      }
    );
  }
);
