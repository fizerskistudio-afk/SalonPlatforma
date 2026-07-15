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
      "staff-gates-server.ts"
    ),
    "utf8"
  );

describe(
  "staff product gate server contract",
  () => {
    it(
      "stays server-only and starts from authenticated staff context",
      () => {
        expect(
          SOURCE
        ).toContain(
          'import "server-only"'
        );

        expect(
          SOURCE
        ).toContain(
          "await requireStaff()"
        );

        expect(
          SOURCE
        ).toContain(
          "staff.business.id"
        );
      }
    );

    it(
      "loads package access through the shared business loader",
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
      "rejects use with a non-staff feature",
      () => {
        expect(
          SOURCE
        ).toMatch(
          /definition\.surface\s*!==\s*"staff"/
        );
      }
    );

    it(
      "keeps C1 route gating package-focused",
      () => {
        expect(
          SOURCE
        ).toContain(
          "permissionGranted:"
        );

        expect(
          SOURCE
        ).toContain(
          "integrationConnected:"
        );
      }
    );

    it(
      "does not mutate or start OAuth",
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
          "generateGoogleAuthorizationUrl"
        );
      }
    );
  }
);
