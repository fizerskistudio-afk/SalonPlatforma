import {
  describe,
  expect,
  it,
} from "vitest";

import {
  hasPlatformAdminPermission,
  type PlatformAdminRole,
} from "@/lib/auth/platform-admin-policy";
import {
  getLifecycleActionLabel,
  getLifecycleConfirmationMessage,
} from "@/lib/platform-admin/lifecycle-action-copy";
import {
  countPlatformOperationsViews,
  filterPlatformOperationsTenants,
  parsePlatformOperationsFilters,
} from "@/lib/platform-admin/operations-query";
import type {
  PlatformOperationsTenant,
} from "@/lib/platform-admin/operations-server";
import {
  getPublicationPermission,
} from "@/lib/platform-admin/publication-permissions";
import {
  getAllowedLifecycleTargets,
} from "@/lib/platform-admin/tenant-lifecycle";
import type {
  BusinessPublicationStatus,
} from "@/lib/publishing/status";

const LIFECYCLE_PERMISSIONS = [
  "tenant.publish",
  "tenant.unpublish",
  "tenant.deactivate",
  "tenant.reactivate",
] as const;

function tenant(
  overrides:
    Partial<PlatformOperationsTenant> = {}
): PlatformOperationsTenant {
  return {
    id:
      "tenant-1",
    slug:
      "studio-one",
    name:
      "Studio One",
    publicationStatus:
      "published",
    hasActiveOwner:
      true,
    hasContact:
      true,
    hasTemplate:
      true,
    packageLabel:
      "Digital Studio",
    packageMode:
      "assigned",
    packageRequiresAttention:
      false,
    upcomingBookings:
      5,
    createdAt:
      "2026-07-10T10:00:00.000Z",
    updatedAt:
      "2026-07-15T08:00:00.000Z",
    ...overrides,
  };
}

describe(
  "platform operations runtime matrix",
  () => {
    it.each([
      "super_admin",
      "launch_manager",
    ] as const)(
      "%s can execute every lifecycle permission",
      (
        role
      ) => {
        for (
          const permission of
          LIFECYCLE_PERMISSIONS
        ) {
          expect(
            hasPlatformAdminPermission(
              role,
              permission
            )
          ).toBe(true);
        }
      }
    );

    it.each([
      "sales",
      "it",
    ] as const)(
      "%s remains read-only for lifecycle actions",
      (
        role
      ) => {
        for (
          const permission of
          LIFECYCLE_PERMISSIONS
        ) {
          expect(
            hasPlatformAdminPermission(
              role,
              permission
            )
          ).toBe(false);
        }
      }
    );

    it(
      "keeps the exact lifecycle transition matrix",
      () => {
        const expected:
          Record<
            BusinessPublicationStatus,
            readonly BusinessPublicationStatus[]
          > = {
          draft: [
            "published",
            "suspended",
            "archived",
          ],
          published: [
            "draft",
            "suspended",
            "archived",
          ],
          suspended: [
            "draft",
            "published",
            "archived",
          ],
          archived: [
            "draft",
          ],
        };

        for (
          const [
            current,
            targets,
          ] of Object.entries(
            expected
          ) as [
            BusinessPublicationStatus,
            readonly BusinessPublicationStatus[],
          ][]
        ) {
          expect(
            getAllowedLifecycleTargets(
              current
            )
          ).toEqual(
            targets
          );
        }
      }
    );

    it(
      "maps every allowed transition to a concrete platform permission and confirmation",
      () => {
        const roles:
          PlatformAdminRole[] = [
          "super_admin",
          "sales",
          "launch_manager",
          "it",
        ];

        const statuses:
          BusinessPublicationStatus[] = [
          "draft",
          "published",
          "suspended",
          "archived",
        ];

        for (
          const current of
          statuses
        ) {
          for (
            const target of
            getAllowedLifecycleTargets(
              current
            )
          ) {
            const permission =
              getPublicationPermission(
                current,
                target
              );

            expect(
              LIFECYCLE_PERMISSIONS
            ).toContain(
              permission
            );

            expect(
              getLifecycleActionLabel(
                current,
                target
              ).length
            ).toBeGreaterThan(
              0
            );

            expect(
              getLifecycleConfirmationMessage(
                target
              ).length
            ).toBeGreaterThan(
              20
            );

            expect(
              roles.filter(
                (
                  role
                ) =>
                  hasPlatformAdminPermission(
                    role,
                    permission
                  )
              )
            ).toEqual([
              "super_admin",
              "launch_manager",
            ]);
          }
        }
      }
    );

    it(
      "keeps publish confirmation explicit about the server readiness recheck",
      () => {
        expect(
          getLifecycleConfirmationMessage(
            "published"
          )
        ).toContain(
          "Server će ponovo proveriti production readiness"
        );
      }
    );

    it(
      "preserves URL-normalized operations views and package attention",
      () => {
        const filters =
          parsePlatformOperationsFilters({
            view:
              "attention",
            severity:
              "warning",
            package:
              "invalid",
          });

        const tenants = [
          tenant({
            id:
              "healthy",
          }),
          tenant({
            id:
              "invalid",
            slug:
              "invalid-package",
            name:
              "Invalid Package",
            packageLabel:
              "Nepoznat paket",
            packageMode:
              "invalid_assignment",
            packageRequiresAttention:
              true,
          }),
          tenant({
            id:
              "draft",
            publicationStatus:
              "draft",
          }),
        ];

        expect(
          filterPlatformOperationsTenants(
            tenants,
            filters
          ).map(
            (
              item
            ) =>
              item.tenant.id
          )
        ).toEqual([
          "invalid",
        ]);

        expect(
          countPlatformOperationsViews(
            tenants
          )
        ).toEqual({
          attention:
            2,
          launch:
            1,
          published:
            2,
          all:
            3,
        });
      }
    );
  }
);
