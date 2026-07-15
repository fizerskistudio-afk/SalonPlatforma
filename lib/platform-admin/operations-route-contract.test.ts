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

const PAGE_SOURCE =
  readFileSync(
    join(
      process.cwd(),
      "app",
      "platform-admin",
      "operations",
      "page.tsx"
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );

const NAV_SOURCE =
  readFileSync(
    join(
      process.cwd(),
      "components",
      "platform-admin",
      "PlatformAdminNavigation.tsx"
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );

describe(
  "platform operations route contract",
  () => {
    it(
      "requires dashboard permission before loading tenant operations",
      () => {
        const permissionIndex =
          PAGE_SOURCE.indexOf(
            'requirePlatformAdminPermission(\n    "platform.dashboard.read"'
          );

        const loaderIndex =
          PAGE_SOURCE.indexOf(
            "loadPlatformOperationsOverview()"
          );

        expect(
          permissionIndex
        ).toBeGreaterThanOrEqual(
          0
        );

        expect(
          loaderIndex
        ).toBeGreaterThan(
          permissionIndex
        );
      }
    );

    it(
      "uses stable GET query params without client filter state",
      () => {
        expect(
          PAGE_SOURCE
        ).toContain(
          'method="get"'
        );

        for (
          const name of [
            'name="view"',
            'name="q"',
            'name="lifecycle"',
            'name="severity"',
            'name="package"',
          ]
        ) {
          expect(
            PAGE_SOURCE
          ).toContain(
            name
          );
        }

        expect(
          PAGE_SOURCE
        ).not.toContain(
          '"use client"'
        );
      }
    );

    it(
      "links every result to the existing tenant command center",
      () => {
        expect(
          PAGE_SOURCE
        ).toContain(
          'href={`/platform-admin/businesses/${tenant.slug}`}'
        );

        expect(
          PAGE_SOURCE
        ).toContain(
          "Command center"
        );
      }
    );

    it(
      "adds a dedicated operations navigation item",
      () => {
        expect(
          NAV_SOURCE
        ).toContain(
          '"/platform-admin/operations"'
        );

        expect(
          NAV_SOURCE
        ).toContain(
          '"Operacije"'
        );
      }
    );

    it(
      "keeps the route read-only",
      () => {
        for (
          const forbidden of [
            '"use server"',
            ".insert(",
            ".update(",
            ".delete(",
            ".upsert(",
          ]
        ) {
          expect(
            PAGE_SOURCE
          ).not.toContain(
            forbidden
          );
        }
      }
    );
  }
);
