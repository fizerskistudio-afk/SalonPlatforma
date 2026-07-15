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
      "platform-admin",
      "operations-server.ts"
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );

describe(
  "platform operations server read model",
  () => {
    it(
      "is server-only and uses the admin database client",
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
      "loads tenant, owner and seven-day booking signals",
      () => {
        for (
          const marker of [
            '.from(\n          "businesses"',
            '.from(\n          "business_members"',
            '.from(\n          "bookings"',
            '"pending"',
            '"confirmed"',
          ]
        ) {
          expect(
            SOURCE
          ).toContain(
            marker
          );
        }
      }
    );

    it(
      "resolves package assignment through the central package resolver",
      () => {
        expect(
          SOURCE
        ).toContain(
          "resolveProductPackageAccess"
        );

        expect(
          SOURCE
        ).toContain(
          "package_key"
        );

        expect(
          SOURCE
        ).toContain(
          "package_contract_version"
        );

        expect(
          SOURCE
        ).toContain(
          "packageRequiresAttention"
        );

        expect(
          SOURCE
        ).toContain(
          "updated_at"
        );

        expect(
          SOURCE
        ).toContain(
          "updatedAt"
        );
      }
    );

    it(
      "degrades partial dashboard queries into visible error messages",
      () => {
        expect(
          SOURCE
        ).toContain(
          "Platform operations business query failed:"
        );

        expect(
          SOURCE
        ).toContain(
          "Owner status trenutno nije kompletan."
        );

        expect(
          SOURCE
        ).toContain(
          "Upcoming booking brojač trenutno nije dostupan."
        );
      }
    );

    it(
      "does not mutate tenant data",
      () => {
        for (
          const forbidden of [
            ".insert(",
            ".update(",
            ".delete(",
            ".upsert(",
            ".rpc(",
          ]
        ) {
          expect(
            SOURCE
          ).not.toContain(
            forbidden
          );
        }
      }
    );
  }
);
