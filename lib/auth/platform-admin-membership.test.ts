import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  parsePlatformAdminMembershipMode,
  resolvePlatformAdminMembership,
} from "@/lib/auth/platform-admin-membership";

describe(
  "platform-admin membership rollout",
  () => {
    it.each([
      [
        undefined,
        "legacy",
      ],
      [
        "",
        "legacy",
      ],
      [
        "LEGACY",
        "legacy",
      ],
      [
        " hybrid ",
        "hybrid",
      ],
      [
        "database",
        "database",
      ],
      [
        "fallback",
        null,
      ],
    ])(
      "parses membership mode %s as %s",
      (
        value,
        expected
      ) => {
        expect(
          parsePlatformAdminMembershipMode(
            value
          )
        ).toBe(
          expected
        );
      }
    );

    it(
      "keeps the current allowlisted owner as legacy super-admin without a database call",
      async () => {
        const loadDatabaseRole =
          vi.fn();

        await expect(
          resolvePlatformAdminMembership({
            mode:
              "legacy",
            email:
              "owner@example.com",
            configuredEmails:
              "owner@example.com",
            loadDatabaseRole,
          })
        ).resolves.toEqual({
          status:
            "authorized",
          role:
            "super_admin",
          source:
            "legacy_allowlist",
          mode:
            "legacy",
        });

        expect(
          loadDatabaseRole
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "accepts an active database Sales membership in hybrid mode",
      async () => {
        await expect(
          resolvePlatformAdminMembership({
            mode:
              "hybrid",
            email:
              "sales@example.com",
            configuredEmails:
              "owner@example.com",
            loadDatabaseRole:
              async () => ({
                data:
                  "sales",
                error:
                  null,
              }),
          })
        ).resolves.toEqual({
          status:
            "authorized",
          role:
            "sales",
          source:
            "database_membership",
          mode:
            "hybrid",
        });
      }
    );

    it.each([
      {
        data:
          null,
        error:
          null,
      },
      {
        data:
          null,
        error:
          new Error(
            "RPC unavailable"
          ),
      },
    ])(
      "retains the allowlisted break-glass owner during hybrid rollout",
      async (
        databaseResult
      ) => {
        await expect(
          resolvePlatformAdminMembership({
            mode:
              "hybrid",
            email:
              "owner@example.com",
            configuredEmails:
              "owner@example.com",
            loadDatabaseRole:
              async () =>
                databaseResult,
          })
        ).resolves.toMatchObject({
          status:
            "authorized",
          role:
            "super_admin",
          source:
            "legacy_allowlist",
        });
      }
    );

    it(
      "fails closed for a non-allowlisted account when hybrid lookup is unavailable",
      async () => {
        await expect(
          resolvePlatformAdminMembership({
            mode:
              "hybrid",
            email:
              "sales@example.com",
            configuredEmails:
              "owner@example.com",
            loadDatabaseRole:
              async () => ({
                data:
                  null,
                error:
                  new Error(
                    "RPC unavailable"
                  ),
              }),
          })
        ).resolves.toEqual({
          status:
            "forbidden",
          reason:
            "membership_unavailable",
          mode:
            "hybrid",
        });
      }
    );

    it(
      "does not use the legacy allowlist as a database-mode fallback",
      async () => {
        await expect(
          resolvePlatformAdminMembership({
            mode:
              "database",
            email:
              "owner@example.com",
            configuredEmails:
              "owner@example.com",
            loadDatabaseRole:
              async () => ({
                data:
                  null,
                error:
                  new Error(
                    "RPC unavailable"
                  ),
              }),
          })
        ).resolves.toEqual({
          status:
            "forbidden",
          reason:
            "membership_unavailable",
          mode:
            "database",
        });
      }
    );

    it(
      "rejects an unknown role returned by the database",
      async () => {
        await expect(
          resolvePlatformAdminMembership({
            mode:
              "database",
            email:
              "owner@example.com",
            configuredEmails:
              "owner@example.com",
            loadDatabaseRole:
              async () => ({
                data:
                  "owner",
                error:
                  null,
              }),
          })
        ).resolves.toEqual({
          status:
            "forbidden",
          reason:
            "membership_unavailable",
          mode:
            "database",
        });
      }
    );
  }
);
