import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveProductFeatureGate,
  type ProductFeatureKey,
} from "./gates";
import {
  PRODUCT_PACKAGE_KEYS,
  type ProductPackageKey,
} from "./registry";
import {
  resolveProductPackageAccess,
} from "./resolver";

const RUNTIME_FEATURES = [
  "admin.dashboard",
  "admin.gallery",
  "staff.calendar_connection",
  "staff.employee_calendar_sync",
  "admin.reviews",
] as const satisfies
  readonly ProductFeatureKey[];

const EXPECTED_ACCESS:
  Record<
    ProductPackageKey,
    Record<
      (typeof RUNTIME_FEATURES)[number],
      boolean
    >
  > = {
  booking_page: {
    "admin.dashboard":
      true,
    "admin.gallery":
      false,
    "staff.calendar_connection":
      false,
    "staff.employee_calendar_sync":
      false,
    "admin.reviews":
      false,
  },
  digital_studio: {
    "admin.dashboard":
      true,
    "admin.gallery":
      true,
    "staff.calendar_connection":
      false,
    "staff.employee_calendar_sync":
      false,
    "admin.reviews":
      false,
  },
  operations_pro: {
    "admin.dashboard":
      true,
    "admin.gallery":
      true,
    "staff.calendar_connection":
      true,
    "staff.employee_calendar_sync":
      true,
    "admin.reviews":
      false,
  },
  reputation_pro: {
    "admin.dashboard":
      true,
    "admin.gallery":
      true,
    "staff.calendar_connection":
      true,
    "staff.employee_calendar_sync":
      true,
    "admin.reviews":
      true,
  },
  signature: {
    "admin.dashboard":
      true,
    "admin.gallery":
      true,
    "staff.calendar_connection":
      true,
    "staff.employee_calendar_sync":
      true,
    "admin.reviews":
      true,
  },
};

describe(
  "runtime package gate matrix",
  () => {
    it.each(
      PRODUCT_PACKAGE_KEYS
    )(
      "matches the expected runtime boundary for %s",
      (packageKey) => {
        const access =
          resolveProductPackageAccess({
            package_key:
              packageKey,
            package_contract_version:
              1,
          });

        for (
          const featureKey of
          RUNTIME_FEATURES
        ) {
          const decision =
            resolveProductFeatureGate({
              access,
              featureKey,
              integrationConnected:
                true,
            });

          expect(
            decision.allowed,
            `${packageKey}:${featureKey}`
          ).toBe(
            EXPECTED_ACCESS[
              packageKey
            ][
              featureKey
            ]
          );
        }
      }
    );

    it(
      "keeps legacy and invalid rollout assignments fail-open",
      () => {
        const assignments = [
          {
            package_key:
              null,
            package_contract_version:
              null,
          },
          {
            package_key:
              "unknown-package",
            package_contract_version:
              1,
          },
          {
            package_key:
              "operations_pro",
            package_contract_version:
              999,
          },
        ];

        for (
          const assignment of
          assignments
        ) {
          const access =
            resolveProductPackageAccess(
              assignment
            );

          expect(
            access.grantsAllEntitlements
          ).toBe(true);

          for (
            const featureKey of
            RUNTIME_FEATURES
          ) {
            expect(
              resolveProductFeatureGate({
                access,
                featureKey,
                integrationConnected:
                  true,
              }).allowed
            ).toBe(true);
          }
        }
      }
    );

    it(
      "keeps package, permission and integration blocker precedence stable",
      () => {
        const bookingPage =
          resolveProductPackageAccess({
            package_key:
              "booking_page",
            package_contract_version:
              1,
          });

        const reputationPro =
          resolveProductPackageAccess({
            package_key:
              "reputation_pro",
            package_contract_version:
              1,
          });

        expect(
          resolveProductFeatureGate({
            access:
              bookingPage,
            featureKey:
              "admin.reviews",
            permissionGranted:
              false,
            integrationConnected:
              false,
          }).blockedBy
        ).toBe(
          "package"
        );

        expect(
          resolveProductFeatureGate({
            access:
              reputationPro,
            featureKey:
              "admin.reviews",
            permissionGranted:
              false,
            integrationConnected:
              false,
          }).blockedBy
        ).toBe(
          "permission"
        );

        expect(
          resolveProductFeatureGate({
            access:
              reputationPro,
            featureKey:
              "admin.reviews",
            permissionGranted:
              true,
            integrationConnected:
              false,
          }).blockedBy
        ).toBe(
          "integration"
        );

        expect(
          resolveProductFeatureGate({
            access:
              reputationPro,
            featureKey:
              "admin.reviews",
            permissionGranted:
              true,
            integrationConnected:
              true,
          }).allowed
        ).toBe(true);
      }
    );

    it(
      "keeps the base public booking page available in every assigned package",
      () => {
        for (
          const packageKey of
          PRODUCT_PACKAGE_KEYS
        ) {
          const access =
            resolveProductPackageAccess({
              package_key:
                packageKey,
              package_contract_version:
                1,
            });

          expect(
            resolveProductFeatureGate({
              access,
              featureKey:
                "public.booking_page",
            }).allowed
          ).toBe(true);
        }
      }
    );
  }
);
