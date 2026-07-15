import {
  describe,
  expect,
  it,
} from "vitest";

import {
  PRODUCT_FEATURE_GATES,
  getMinimumProductPackageForEntitlement,
  resolveProductFeatureForPath,
  resolveProductFeatureGate,
} from "./gates";
import {
  resolveProductPackageAccess,
} from "./resolver";

describe(
  "product feature gate map",
  () => {
    it(
      "keeps Booking Page admin and staff core features available",
      () => {
        const access =
          resolveProductPackageAccess({
            package_key:
              "booking_page",
            package_contract_version:
              1,
          });

        for (
          const featureKey of [
            "admin.dashboard",
            "admin.bookings",
            "admin.customers",
            "admin.services",
            "admin.team",
            "admin.schedule",
            "admin.members",
            "admin.notifications",
            "admin.settings",
            "staff.portal",
            "staff.reservations",
            "staff.notes",
            "staff.time_off",
            "staff.schedule",
          ] as const
        ) {
          expect(
            resolveProductFeatureGate({
              access,
              featureKey,
            }).allowed
          ).toBe(true);
        }
      }
    );

    it(
      "blocks Digital Studio features from Booking Page without blocking the base settings route",
      () => {
        const access =
          resolveProductPackageAccess({
            package_key:
              "booking_page",
            package_contract_version:
              1,
          });

        expect(
          resolveProductFeatureGate({
            access,
            featureKey:
              "admin.settings",
          }).allowed
        ).toBe(true);

        for (
          const featureKey of [
            "admin.gallery",
            "admin.site_profile",
            "admin.branding",
            "admin.seo",
            "admin.custom_domain",
            "admin.theme_library",
            "admin.business_calendar",
            "platform.ai_translation",
          ] as const
        ) {
          const decision =
            resolveProductFeatureGate({
              access,
              featureKey,
              integrationConnected:
                true,
            });

          expect(
            decision.allowed
          ).toBe(false);

          expect(
            decision.blockedBy
          ).toBe(
            "package"
          );

          expect(
            decision.minimumPackage
              ?.key
          ).toBe(
            "digital_studio"
          );
        }
      }
    );

    it(
      "reserves staff calendar features for Operations Pro",
      () => {
        const digitalStudio =
          resolveProductPackageAccess({
            package_key:
              "digital_studio",
            package_contract_version:
              1,
          });

        const operationsPro =
          resolveProductPackageAccess({
            package_key:
              "operations_pro",
            package_contract_version:
              1,
          });

        for (
          const featureKey of [
            "staff.calendar_connection",
            "staff.employee_calendar_sync",
            "staff.two_way_busy_sync",
          ] as const
        ) {
          expect(
            resolveProductFeatureGate({
              access:
                digitalStudio,
              featureKey,
              integrationConnected:
                true,
            }).blockedBy
          ).toBe(
            "package"
          );

          expect(
            resolveProductFeatureGate({
              access:
                operationsPro,
              featureKey,
              integrationConnected:
                true,
            }).allowed
          ).toBe(true);
        }
      }
    );

    it(
      "keeps package, permission and integration blockers separate",
      () => {
        const access =
          resolveProductPackageAccess({
            package_key:
              "reputation_pro",
            package_contract_version:
              1,
          });

        expect(
          resolveProductFeatureGate({
            access,
            featureKey:
              "admin.reviews",
            permissionGranted:
              false,
            integrationConnected:
              true,
          }).blockedBy
        ).toBe(
          "permission"
        );

        expect(
          resolveProductFeatureGate({
            access,
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
      }
    );

    it(
      "keeps legacy and invalid rollout assignments fail-open",
      () => {
        for (
          const access of [
            resolveProductPackageAccess({
              package_key:
                null,
              package_contract_version:
                null,
            }),
            resolveProductPackageAccess({
              package_key:
                "unknown",
              package_contract_version:
                1,
            }),
          ]
        ) {
          expect(
            resolveProductFeatureGate({
              access,
              featureKey:
                "admin.reviews",
              integrationConnected:
                true,
            }).allowed
          ).toBe(true);
        }
      }
    );

    it(
      "resolves the longest matching registered route boundary",
      () => {
        expect(
          resolveProductFeatureForPath(
            "/admin"
          )?.key
        ).toBe(
          "admin.dashboard"
        );

        expect(
          resolveProductFeatureForPath(
            "/admin/bookings/123?view=details"
          )?.key
        ).toBe(
          "admin.bookings"
        );

        expect(
          resolveProductFeatureForPath(
            "/staff/calendar/"
          )?.key
        ).toBe(
          "staff.calendar_connection"
        );

        expect(
          resolveProductFeatureForPath(
            "/staff/login"
          )
        ).toBeNull();

        expect(
          resolveProductFeatureForPath(
            "/platform-admin"
          )
        ).toBeNull();
      }
    );

    it(
      "maps every registered feature to a known minimum package",
      () => {
        for (
          const definition of
          Object.values(
            PRODUCT_FEATURE_GATES
          )
        ) {
          expect(
            getMinimumProductPackageForEntitlement(
              definition.entitlement
            )
          ).not.toBeNull();
        }
      }
    );

    it(
      "reserves review functionality for Reputation Pro",
      () => {
        expect(
          getMinimumProductPackageForEntitlement(
            "reviews.management"
          )?.key
        ).toBe(
          "reputation_pro"
        );
      }
    );
  }
);
