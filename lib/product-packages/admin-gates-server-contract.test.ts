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
      "admin-gates-server.ts"
    ),
    "utf8"
  );

describe(
  "tenant-admin product gate server contract",
  () => {
    it(
      "stays server-only and begins from the authenticated admin tenant",
      () => {
        expect(
          SOURCE
        ).toContain(
          'import "server-only"'
        );

        expect(
          SOURCE
        ).toContain(
          "await requireAdmin()"
        );

        expect(
          SOURCE
        ).toContain(
          "admin.business.id"
        );
      }
    );

    it(
      "loads the active business package through the shared access loader",
      () => {
        expect(
          SOURCE
        ).toContain(
          "loadProductPackageAccessForBusinessId"
        );

        expect(
          SOURCE
        ).toContain(
          "resolveProductFeatureGate"
        );
      }
    );

    it(
      "rejects use with a non tenant-admin feature",
      () => {
        expect(
          SOURCE
        ).toContain(
          'definition.surface !==\n    "tenant_admin"'
        );
      }
    );

    it(
      "keeps route gating package-focused in B1",
      () => {
        expect(
          SOURCE
        ).toContain(
          "permissionGranted:\n          true"
        );

        expect(
          SOURCE
        ).toContain(
          "integrationConnected:\n          true"
        );
      }
    );

    it(
      "does not mutate, redirect for package access or inspect integrations",
      () => {
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
          "google_"
        );
      }
    );
  }
);
