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

const MIGRATION_PATH =
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "030_add_business_product_package.sql"
  );

function readMigration() {
  return readFileSync(
    MIGRATION_PATH,
    "utf8"
  );
}

describe(
  "product package persistence migration",
  () => {
    it(
      "adds nullable package assignment fields to businesses",
      () => {
        const migration =
          readMigration();

        expect(
          migration
        ).toContain(
          "add column if not exists package_key text"
        );

        expect(
          migration
        ).toContain(
          "add column if not exists package_contract_version smallint"
        );

        expect(
          migration
        ).toContain(
          "add column if not exists package_assigned_at timestamptz"
        );

        expect(
          migration
        ).toContain(
          "add column if not exists package_assigned_by_user_id uuid"
        );
      }
    );

    it(
      "accepts only registered package keys when a package is assigned",
      () => {
        const migration =
          readMigration();

        for (
          const packageKey of [
            "booking_page",
            "digital_studio",
            "operations_pro",
            "reputation_pro",
            "signature",
          ]
        ) {
          expect(
            migration
          ).toContain(
            `'${packageKey}'`
          );
        }

        expect(
          migration
        ).toContain(
          "businesses_package_key_check"
        );
      }
    );

    it(
      "keeps existing tenants unassigned instead of silently downgrading them",
      () => {
        const migration =
          readMigration()
            .toLowerCase();

        expect(
          migration
        ).toContain(
          "package_key is null"
        );

        expect(
          migration
        ).not.toMatch(
          /package_key\s+text\s+not\s+null/
        );

        expect(
          migration
        ).not.toMatch(
          /package_key\s+text\s+default/
        );

        expect(
          migration
        ).not.toMatch(
          /update\s+public\.businesses[\s\S]*set\s+package_key/
        );

        expect(
          migration
        ).not.toContain(
          "alter column package_key set not null"
        );
      }
    );

    it(
      "documents NULL as a safe legacy rollout state",
      () => {
        const migration =
          readMigration();

        expect(
          migration
        ).toContain(
          "NULL means legacy/unassigned during the safe rollout"
        );

        expect(
          migration
        ).toContain(
          "must not disable existing functionality"
        );
      }
    );

    it(
      "does not couple package assignment to role or integration state",
      () => {
        const migration =
          readMigration()
            .toLowerCase();

        expect(
          migration
        ).not.toContain(
          "business_members"
        );

        expect(
          migration
        ).not.toContain(
          "google_calendar"
        );

        expect(
          migration
        ).not.toContain(
          "google_business"
        );

        expect(
          migration
        ).not.toContain(
          "platform_admin_role"
        );
      }
    );
  }
);
