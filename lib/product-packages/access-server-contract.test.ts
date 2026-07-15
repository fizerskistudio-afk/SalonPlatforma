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
      "product-packages",
      "access-server.ts"
    ),
    "utf8"
  );

describe(
  "product package access server contract",
  () => {
    it(
      "stays server-only and loads through the admin database client",
      () => {
        expect(
          SOURCE
        ).toContain(
          'import "server-only"'
        );

        expect(
          SOURCE
        ).toContain(
          "createAdminClient"
        );
      }
    );

    it(
      "supports both authenticated business-id and public business-slug boundaries",
      () => {
        expect(
          SOURCE
        ).toContain(
          "loadProductPackageAccessForBusinessId"
        );

        expect(
          SOURCE
        ).toContain(
          "loadProductPackageAccessForBusinessSlug"
        );
      }
    );

    it(
      "selects only package assignment identity and metadata",
      () => {
        for (
          const field of [
            "id",
            "slug",
            "package_key",
            "package_contract_version",
            "package_assigned_at",
            "package_assigned_by_user_id",
          ]
        ) {
          expect(
            SOURCE
          ).toContain(
            field
          );
        }

        expect(
          SOURCE
        ).not.toContain(
          "business_members"
        );

        expect(
          SOURCE
        ).not.toContain(
          "employees"
        );
      }
    );

    it(
      "does not redirect, mutate or apply route gates",
      () => {
        expect(
          SOURCE
        ).not.toContain(
          "redirect("
        );

        expect(
          SOURCE
        ).not.toContain(
          ".update("
        );

        expect(
          SOURCE
        ).not.toContain(
          ".insert("
        );

        expect(
          SOURCE
        ).not.toContain(
          "resolveProductFeatureForPath"
        );
      }
    );
  }
);
