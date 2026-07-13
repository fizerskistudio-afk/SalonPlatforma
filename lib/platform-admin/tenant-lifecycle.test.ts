import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildTenantReadiness,
  getAllowedLifecycleTargets,
  isLifecycleTransitionAllowed,
  type TenantReadinessInput,
} from "./tenant-lifecycle";

function readyInput(
  overrides: Partial<TenantReadinessInput> = {}
): TenantReadinessInput {
  return {
    businessSlug: "lumiere-studio",
    templateReady: true,
    localesReady: true,
    contactReady: true,
    categoriesReady: true,
    servicesReady: true,
    bookingSettingsReady: true,
    employeesReady: true,
    serviceAssignmentsReady: true,
    workingHoursReady: true,
    ownerReady: true,
    ...overrides,
  };
}

describe(
  "tenant lifecycle readiness",
  () => {
    it(
      "distinguishes preview readiness from production readiness",
      () => {
        const readiness =
          buildTenantReadiness(
            readyInput({
              bookingSettingsReady: false,
              employeesReady: false,
              serviceAssignmentsReady: false,
              workingHoursReady: false,
              ownerReady: false,
            })
          );

        expect(
          readiness.technicalReady
        ).toBe(true);
        expect(
          readiness.contentReady
        ).toBe(true);
        expect(
          readiness.previewReady
        ).toBe(true);
        expect(
          readiness.bookingReady
        ).toBe(false);
        expect(
          readiness.ownerAccessReady
        ).toBe(false);
        expect(
          readiness.productionReady
        ).toBe(false);
        expect(
          readiness.readyToPublish
        ).toBe(false);
      }
    );

    it(
      "returns direct corrective routes for every blocker",
      () => {
        const readiness =
          buildTenantReadiness(
            readyInput({
              templateReady: false,
              ownerReady: false,
            })
          );

        expect(
          readiness.blockers
        ).toEqual([
          expect.objectContaining({
            key: "template",
            group: "technical",
            href: "/platform-admin/businesses/lumiere-studio/theme",
          }),
          expect.objectContaining({
            key: "owner",
            group: "owner-access",
            href: "/platform-admin/businesses/lumiere-studio/access",
          }),
        ]);
      }
    );

    it(
      "marks a complete tenant production ready",
      () => {
        const readiness =
          buildTenantReadiness(
            readyInput()
          );

        expect(
          readiness.completed
        ).toBe(10);
        expect(
          readiness.percent
        ).toBe(100);
        expect(
          readiness.productionReady
        ).toBe(true);
      }
    );

    it(
      "requires archived tenants to reactivate through draft",
      () => {
        expect(
          getAllowedLifecycleTargets(
            "archived"
          )
        ).toEqual([
          "draft",
        ]);

        expect(
          isLifecycleTransitionAllowed(
            "archived",
            "published"
          )
        ).toBe(false);

        expect(
          isLifecycleTransitionAllowed(
            "suspended",
            "draft"
          )
        ).toBe(true);
      }
    );
  }
);
