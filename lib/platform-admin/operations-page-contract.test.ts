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
      "app",
      "platform-admin",
      "page.tsx"
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );

describe(
  "platform operations dashboard page contract",
  () => {
    it(
      "uses the dedicated server read model instead of direct database queries",
      () => {
        expect(
          SOURCE
        ).toContain(
          "loadPlatformOperationsOverview"
        );

        expect(
          SOURCE
        ).not.toContain(
          "createAdminClient"
        );

        expect(
          SOURCE
        ).not.toContain(
          '.from(\n          "businesses"'
        );
      }
    );

    it(
      "keeps attention queue construction in the pure readiness module",
      () => {
        expect(
          SOURCE
        ).toContain(
          "buildTenantAttentionQueue"
        );
      }
    );

    it(
      "renders package and severity signals for attention items",
      () => {
        expect(
          SOURCE
        ).toContain(
          "tenant.severity"
        );

        expect(
          SOURCE
        ).toContain(
          "tenant.packageLabel"
        );

        expect(
          SOURCE
        ).toContain(
          "Kritično"
        );

        expect(
          SOURCE
        ).toContain(
          "Upozorenje"
        );
      }
    );

    it(
      "keeps the dashboard read-only",
      () => {
        expect(
          SOURCE
        ).not.toContain(
          '"use server"'
        );

        expect(
          SOURCE
        ).not.toContain(
          "<form"
        );
      }
    );
  }
);
