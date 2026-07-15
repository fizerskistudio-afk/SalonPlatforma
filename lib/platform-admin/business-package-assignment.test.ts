import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildBusinessPackageAssignmentUpdate,
} from "./business-package-assignment";

describe(
  "platform-admin business package assignment",
  () => {
    it(
      "builds versioned audit metadata for a valid package assignment",
      () => {
        expect(
          buildBusinessPackageAssignmentUpdate({
            packageKey:
              "digital_studio",
            actorUserId:
              "  user-123  ",
            assignedAt:
              "2026-07-15T12:00:00.000Z",
          })
        ).toEqual({
          package_key:
            "digital_studio",
          package_contract_version:
            1,
          package_assigned_at:
            "2026-07-15T12:00:00.000Z",
          package_assigned_by_user_id:
            "user-123",
        });
      }
    );

    it(
      "rejects an unknown package key",
      () => {
        expect(
          buildBusinessPackageAssignmentUpdate({
            packageKey:
              "free",
            actorUserId:
              "user-123",
            assignedAt:
              "2026-07-15T12:00:00.000Z",
          })
        ).toBeNull();
      }
    );

    it(
      "rejects missing actor identity or an invalid timestamp",
      () => {
        expect(
          buildBusinessPackageAssignmentUpdate({
            packageKey:
              "operations_pro",
            actorUserId:
              "",
            assignedAt:
              "2026-07-15T12:00:00.000Z",
          })
        ).toBeNull();

        expect(
          buildBusinessPackageAssignmentUpdate({
            packageKey:
              "operations_pro",
            actorUserId:
              "user-123",
            assignedAt:
              "not-a-date",
          })
        ).toBeNull();
      }
    );
  }
);
