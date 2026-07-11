import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import {
  resolve,
} from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

const migrationDirectory =
  resolve(
    process.cwd(),
    "supabase/migrations"
  );

const reviewMigrations =
  readdirSync(
    migrationDirectory
  ).filter(
    (fileName) =>
      fileName.endsWith(
        "_reviews_foundation.sql"
      )
  );

describe(
  "reviews foundation migration contract",
  () => {
    it(
      "has exactly one migration source",
      () => {
        expect(
          reviewMigrations
        ).toHaveLength(1);
      }
    );

    const migrationPath =
      resolve(
        migrationDirectory,
        reviewMigrations[0] ?? ""
      );

    const sql =
      readFileSync(
        migrationPath,
        "utf8"
      ).replace(
        /\r\n/g,
        "\n"
      );

    it.each([
      "create table public.review_settings",
      "create table public.review_provider_connections",
      "create table public.review_invitations",
      "create table public.reviews",
      "create type public.review_source",
      "create type public.review_status",
      "create or replace function public.can_manage_business_reviews",
      "create or replace function public.validate_review_invitation_row",
      "create or replace function public.validate_review_row",
      "alter table public.reviews\n" +
        "enable row level security",
      "create policy reviews_public_select_published",
      "create policy reviews_admin_select",
      "create unique index reviews_booking_unique",
      "create unique index reviews_google_external_unique",
    ])(
      "contains required SQL marker %s",
      (
        marker
      ) => {
        expect(
          sql
        ).toContain(
          marker
        );
      }
    );

    it(
      "stores only a SHA-256 token hash",
      () => {
        expect(
          sql
        ).toContain(
          "token_hash text not null"
        );

        expect(
          sql
        ).toContain(
          "token_hash ~ '^[0-9a-f]{64}$'"
        );

        expect(
          sql
        ).not.toMatch(
          /\n\s*token\s+text\b/i
        );
      }
    );

    it(
      "keeps review mutations server-only",
      () => {
        expect(
          sql
        ).not.toMatch(
          /grant\s+insert[\s\S]*on\s+table\s+public\.reviews[\s\S]*to\s+(?:anon|authenticated)/i
        );

        expect(
          sql
        ).not.toMatch(
          /grant\s+update[\s\S]*on\s+table\s+public\.reviews[\s\S]*to\s+(?:anon|authenticated)/i
        );
      }
    );

    it(
      "uses existing owner and manager membership roles",
      () => {
        expect(
          sql
        ).toContain(
          "from public.business_members"
        );

        expect(
          sql
        ).toContain(
          "'owner',\n" +
            "        'manager'"
        );
      }
    );

    it(
      "ships a read-only database verification script",
      () => {
        const verificationPath =
          resolve(
            process.cwd(),
            "supabase/verification/verify_reviews_foundation.sql"
          );

        expect(
          existsSync(
            verificationPath
          )
        ).toBe(true);

        const verificationSql =
          readFileSync(
            verificationPath,
            "utf8"
          );

        expect(
          verificationSql
        ).toContain(
          "set local transaction read only"
        );

        expect(
          verificationSql
        ).toContain(
          "'PASS' as reviews_foundation_status"
        );
      }
    );
  }
);
