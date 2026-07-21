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

const ROUTE_SOURCE =
  readFileSync(
    join(
      process.cwd(),
      "app",
      "api",
      "platform-admin",
      "businesses",
      "package",
      "route.ts"
    ),
    "utf8"
  ).replace(
    /\r\n?/g,
    "\n"
  );

describe(
  "platform-admin business package route contract",
  () => {
    it(
      "requires the dedicated package write permission",
      () => {
        expect(
          ROUTE_SOURCE
        ).toContain(
          '"tenant.package.write"'
        );
      }
    );

    it(
      "requires optimistic concurrency before and during the update",
      () => {
        expect(
          ROUTE_SOURCE
        ).toContain(
          "expectedUpdatedAt"
        );

        expect(
          ROUTE_SOURCE
        ).toContain(
          'business.updated_at !==\n      expectedUpdatedAt'
        );

        expect(
          ROUTE_SOURCE
        ).toContain(
          '.eq(\n        "updated_at",\n        expectedUpdatedAt\n      )'
        );

        expect(
          ROUTE_SOURCE
        ).toContain(
          '"BUSINESS_CHANGED"'
        );
      }
    );

    it(
      "writes the package through the versioned assignment builder",
      () => {
        expect(
          ROUTE_SOURCE
        ).toContain(
          "buildBusinessPackageAssignmentUpdate"
        );

        expect(
          ROUTE_SOURCE
        ).toContain(
          "access.context.userId"
        );

        expect(
          ROUTE_SOURCE
        ).toContain(
          ".update(\n        assignment\n      )"
        );
      }
    );

    it(
      "does not change roles, integration state or runtime entitlements",
      () => {
        expect(
          ROUTE_SOURCE
        ).not.toContain(
          "business_members"
        );

        expect(
          ROUTE_SOURCE
        ).not.toContain(
          "google_calendar"
        );

        expect(
          ROUTE_SOURCE
        ).not.toContain(
          "google_business"
        );
      }
    );
  }
);
