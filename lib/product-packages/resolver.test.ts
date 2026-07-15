import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveProductFeatureDecision,
  resolveProductPackageAccess,
} from "./resolver";

describe(
  "product package server resolver",
  () => {
    it(
      "keeps an unassigned legacy tenant on full access during rollout",
      () => {
        const access =
          resolveProductPackageAccess({
            package_key:
              null,
            package_contract_version:
              null,
          });

        expect(
          access.mode
        ).toBe(
          "legacy_full_access"
        );

        expect(
          access.grantsAllEntitlements
        ).toBe(true);

        expect(
          access.requiresAttention
        ).toBe(false);

        expect(
          access.entitlements
        ).toContain(
          "reviews.management"
        );

        expect(
          access.entitlements
        ).toContain(
          "calendar.two_way_busy_sync"
        );
      }
    );

    it(
      "resolves the exact entitlement set for an assigned package",
      () => {
        const access =
          resolveProductPackageAccess({
            package_key:
              "digital_studio",
            package_contract_version:
              1,
          });

        expect(
          access.mode
        ).toBe(
          "assigned"
        );

        expect(
          access.packageKey
        ).toBe(
          "digital_studio"
        );

        expect(
          access.entitlements
        ).toContain(
          "site.full_profile"
        );

        expect(
          access.entitlements
        ).toContain(
          "ai.content_translation"
        );

        expect(
          access.entitlements
        ).not.toContain(
          "reviews.management"
        );
      }
    );

    it(
      "fails safely to full access when assignment metadata is incomplete",
      () => {
        const access =
          resolveProductPackageAccess({
            package_key:
              "operations_pro",
            package_contract_version:
              null,
          });

        expect(
          access.mode
        ).toBe(
          "invalid_assignment"
        );

        expect(
          access.reason
        ).toBe(
          "missing_contract_version"
        );

        expect(
          access.grantsAllEntitlements
        ).toBe(true);

        expect(
          access.requiresAttention
        ).toBe(true);
      }
    );

    it(
      "fails safely to full access for an unsupported contract version",
      () => {
        const access =
          resolveProductPackageAccess({
            package_key:
              "reputation_pro",
            package_contract_version:
              2,
          });

        expect(
          access.mode
        ).toBe(
          "invalid_assignment"
        );

        expect(
          access.reason
        ).toBe(
          "unsupported_contract_version"
        );

        expect(
          access.grantsAllEntitlements
        ).toBe(true);
      }
    );

    it(
      "keeps package, permission and integration blockers separate",
      () => {
        const digitalStudio =
          resolveProductPackageAccess({
            package_key:
              "digital_studio",
            package_contract_version:
              1,
          });

        expect(
          resolveProductFeatureDecision({
            access:
              digitalStudio,
            entitlement:
              "reviews.management",
            permissionGranted:
              true,
          })
        ).toMatchObject({
          entitled:
            false,
          permissionGranted:
            true,
          allowed:
            false,
          blockedBy:
            "package",
        });

        expect(
          resolveProductFeatureDecision({
            access:
              digitalStudio,
            entitlement:
              "site.full_profile",
            permissionGranted:
              false,
          })
        ).toMatchObject({
          entitled:
            true,
          permissionGranted:
            false,
          allowed:
            false,
          blockedBy:
            "permission",
        });

        expect(
          resolveProductFeatureDecision({
            access:
              digitalStudio,
            entitlement:
              "calendar.business_sync",
            permissionGranted:
              true,
            integrationRequired:
              true,
            integrationConnected:
              false,
          })
        ).toMatchObject({
          entitled:
            true,
          permissionGranted:
            true,
          integrationRequired:
            true,
          integrationConnected:
            false,
          allowed:
            false,
          blockedBy:
            "integration",
        });
      }
    );

    it(
      "allows a feature only when every required contract passes",
      () => {
        const access =
          resolveProductPackageAccess({
            package_key:
              "operations_pro",
            package_contract_version:
              1,
          });

        expect(
          resolveProductFeatureDecision({
            access,
            entitlement:
              "calendar.employee_sync",
            permissionGranted:
              true,
            integrationRequired:
              true,
            integrationConnected:
              true,
          })
        ).toEqual({
          entitlement:
            "calendar.employee_sync",
          entitled:
            true,
          permissionGranted:
            true,
          integrationRequired:
            true,
          integrationConnected:
            true,
          allowed:
            true,
          blockedBy:
            null,
        });
      }
    );

    it(
      "does not require an integration for ordinary product features",
      () => {
        const access =
          resolveProductPackageAccess({
            package_key:
              "booking_page",
            package_contract_version:
              1,
          });

        expect(
          resolveProductFeatureDecision({
            access,
            entitlement:
              "staff.portal",
            permissionGranted:
              true,
          })
        ).toMatchObject({
          integrationRequired:
            false,
          integrationConnected:
            true,
          allowed:
            true,
          blockedBy:
            null,
        });
      }
    );
  }
);
