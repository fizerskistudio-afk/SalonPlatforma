import {
  describe,
  expect,
  it,
} from "vitest";

import {
  PRODUCT_PACKAGE_KEYS,
  PRODUCT_PACKAGES,
} from "./registry";
import {
  getProductFeatureUpgradeGuidance,
} from "./upgrade-guidance";

describe(
  "product package upgrade guidance",
  () => {
    it.each([
      [
        "admin.gallery",
        "digital_studio",
        "Digital Studio",
      ],
      [
        "staff.calendar_connection",
        "operations_pro",
        "Operations Pro",
      ],
      [
        "staff.employee_calendar_sync",
        "operations_pro",
        "Operations Pro",
      ],
      [
        "admin.reviews",
        "reputation_pro",
        "Reputation Pro",
      ],
    ] as const)(
      "maps %s to its minimum package",
      (
        featureKey,
        minimumPackageKey,
        minimumPackageName
      ) => {
        const guidance =
          getProductFeatureUpgradeGuidance({
            audience:
              featureKey.startsWith(
                "staff."
              )
                ? "staff"
                : "tenant_admin",
            featureKey,
            currentPackageKey:
              "booking_page",
          });

        expect(
          guidance
            .minimumPackage
            ?.key
        ).toBe(
          minimumPackageKey
        );

        expect(
          guidance
            .requiredPackageLabel
        ).toBe(
          minimumPackageName
        );
      }
    );

    it(
      "uses the same server-safe requirement message for admin and staff audiences",
      () => {
        const admin =
          getProductFeatureUpgradeGuidance({
            audience:
              "tenant_admin",
            featureKey:
              "staff.calendar_connection",
            currentPackageKey:
              "digital_studio",
          });

        const staff =
          getProductFeatureUpgradeGuidance({
            audience:
              "staff",
            featureKey:
              "staff.calendar_connection",
            currentPackageKey:
              "digital_studio",
          });

        expect(
          admin.message
        ).toBe(
          staff.message
        );

        expect(
          staff.message
        ).toContain(
          "Operations Pro"
        );

        expect(
          staff.eyebrow
        ).not.toBe(
          admin.eyebrow
        );
      }
    );

    it.each(
      PRODUCT_PACKAGE_KEYS
    )(
      "shows the assigned package name for %s",
      (packageKey) => {
        const guidance =
          getProductFeatureUpgradeGuidance({
            audience:
              "tenant_admin",
            featureKey:
              "admin.gallery",
            currentPackageKey:
              packageKey,
          });

        expect(
          guidance
            .currentPackageLabel
        ).toBe(
          PRODUCT_PACKAGES[
            packageKey
          ].name
        );
      }
    );

    it(
      "keeps the legacy rollout label explicit",
      () => {
        const guidance =
          getProductFeatureUpgradeGuidance({
            audience:
              "tenant_admin",
            featureKey:
              "admin.gallery",
            currentPackageKey:
              null,
          });

        expect(
          guidance
            .currentPackageLabel
        ).toBe(
          "Legacy full access"
        );
      }
    );

    it(
      "preserves audience-specific continuity copy",
      () => {
        const admin =
          getProductFeatureUpgradeGuidance({
            audience:
              "tenant_admin",
            featureKey:
              "admin.reviews",
            currentPackageKey:
              "operations_pro",
          });

        const staff =
          getProductFeatureUpgradeGuidance({
            audience:
              "staff",
            featureKey:
              "staff.calendar_connection",
            currentPackageKey:
              "digital_studio",
          });

        expect(
          admin.continuityNote
        ).toContain(
          "booking funkcije"
        );

        expect(
          staff.continuityNote
        ).toContain(
          "rezervacije"
        );
      }
    );
  }
);
