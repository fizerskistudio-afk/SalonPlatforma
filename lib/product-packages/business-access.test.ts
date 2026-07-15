import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveBusinessProductAccess,
} from "./business-access";

describe(
  "business product access snapshot",
  () => {
    it(
      "maps an assigned business to package access",
      () => {
        const snapshot =
          resolveBusinessProductAccess({
            id:
              "business-1",
            slug:
              "demo-salon",
            package_key:
              "digital_studio",
            package_contract_version:
              1,
            package_assigned_at:
              "2026-07-15T12:00:00.000Z",
            package_assigned_by_user_id:
              "user-1",
          });

        expect(
          snapshot.businessId
        ).toBe(
          "business-1"
        );

        expect(
          snapshot.businessSlug
        ).toBe(
          "demo-salon"
        );

        expect(
          snapshot.access.mode
        ).toBe(
          "assigned"
        );

        expect(
          snapshot.access.packageKey
        ).toBe(
          "digital_studio"
        );
      }
    );

    it(
      "keeps an unassigned business in legacy full-access mode",
      () => {
        const snapshot =
          resolveBusinessProductAccess({
            id:
              "business-1",
            slug:
              "legacy-salon",
            package_key:
              null,
            package_contract_version:
              null,
            package_assigned_at:
              null,
            package_assigned_by_user_id:
              null,
          });

        expect(
          snapshot.access.mode
        ).toBe(
          "legacy_full_access"
        );

        expect(
          snapshot.access.grantsAllEntitlements
        ).toBe(true);
      }
    );
  }
);
