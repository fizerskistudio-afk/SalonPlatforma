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
  "ORDUM-ADMIN-PERFORMANCE-01G",
  () => {
    const adminSource =
      read(
        "lib",
        "auth",
        "admin.ts"
      );

    const gatesSource =
      read(
        "lib",
        "product-packages",
        "admin-gates-server.ts"
      );

    it(
      "loads memberships and businesses in one authenticated read",
      () => {
        expect(
          adminSource
        ).toContain(
          '"admin.context.tenantRead"'
        );

        expect(
          adminSource
        ).toContain(
          '.from("business_members")'
        );

        expect(
          adminSource
        ).toContain(
          "businesses!inner"
        );

        expect(
          adminSource
        ).toContain(
          '.eq("user_id", userId)'
        );

        expect(
          adminSource
        ).toContain(
          '.eq("is_active", true)'
        );

        expect(
          adminSource
        ).toMatch(
          /\.eq\(\s*"businesses\.is_active",\s*true\s*\)/
        );

        expect(
          adminSource
        ).toContain(
          '"owner"'
        );

        expect(
          adminSource
        ).toContain(
          '"manager"'
        );
      }
    );

    it(
      "does not use a service-role client for tenant discovery",
      () => {
        expect(
          adminSource
        ).not.toContain(
          "createAdminClient"
        );

        expect(
          adminSource
        ).not.toContain(
          '.from("businesses")'
        );

        expect(
          adminSource.indexOf(
            "supabase.auth.getClaims()"
          )
        ).toBeLessThan(
          adminSource.indexOf(
            '.from("business_members")'
          )
        );
      }
    );

    it(
      "keeps package access request-scoped in feature gates",
      () => {
        const snapshotIndex =
          gatesSource.indexOf(
            "admin.productAccess"
          );

        const fallbackIndex =
          gatesSource.indexOf(
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
      }
    );
  }
);
