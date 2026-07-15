import {
  describe,
  expect,
  it,
} from "vitest";

import {
  PRODUCT_ENTITLEMENTS,
  PRODUCT_PACKAGE_CONTRACT_VERSION,
  PRODUCT_PACKAGE_KEYS,
  PRODUCT_PACKAGES,
  getPackageEntitlements,
  getPackageUpgradeCandidates,
  isProductEntitlement,
  isProductPackageKey,
  packageHasEntitlement,
} from "./registry";

describe(
  "product package registry",
  () => {
    it(
      "keeps a versioned and stable commercial package order",
      () => {
        expect(
          PRODUCT_PACKAGE_CONTRACT_VERSION
        ).toBe(1);

        expect(
          PRODUCT_PACKAGE_KEYS
        ).toEqual([
          "booking_page",
          "digital_studio",
          "operations_pro",
          "reputation_pro",
          "signature",
        ]);
      }
    );

    it(
      "contains only registered and unique entitlements in every package",
      () => {
        const knownEntitlements =
          new Set(
            PRODUCT_ENTITLEMENTS
          );

        for (
          const packageKey of
          PRODUCT_PACKAGE_KEYS
        ) {
          const entitlements =
            getPackageEntitlements(
              packageKey
            );

          expect(
            new Set(
              entitlements
            ).size
          ).toBe(
            entitlements.length
          );

          for (
            const entitlement of
            entitlements
          ) {
            expect(
              knownEntitlements.has(
                entitlement
              )
            ).toBe(true);
          }
        }
      }
    );

    it(
      "keeps every higher package as a superset of the previous package",
      () => {
        for (
          let index = 1;
          index <
          PRODUCT_PACKAGE_KEYS.length;
          index += 1
        ) {
          const previous =
            getPackageEntitlements(
              PRODUCT_PACKAGE_KEYS[
                index - 1
              ]
            );

          const current =
            new Set(
              getPackageEntitlements(
                PRODUCT_PACKAGE_KEYS[
                  index
                ]
              )
            );

          for (
            const entitlement of
            previous
          ) {
            expect(
              current.has(
                entitlement
              )
            ).toBe(true);
          }
        }
      }
    );

    it(
      "keeps the staff panel in the entry package",
      () => {
        expect(
          packageHasEntitlement(
            "booking_page",
            "staff.portal"
          )
        ).toBe(true);

        expect(
          packageHasEntitlement(
            "booking_page",
            "staff.reservations"
          )
        ).toBe(true);

        expect(
          packageHasEntitlement(
            "booking_page",
            "staff.time_off"
          )
        ).toBe(true);

        expect(
          packageHasEntitlement(
            "booking_page",
            "staff.schedule"
          )
        ).toBe(true);
      }
    );

    it(
      "introduces the full site and translation assistant in Digital Studio",
      () => {
        expect(
          packageHasEntitlement(
            "booking_page",
            "site.full_profile"
          )
        ).toBe(false);

        expect(
          packageHasEntitlement(
            "digital_studio",
            "site.full_profile"
          )
        ).toBe(true);

        expect(
          packageHasEntitlement(
            "digital_studio",
            "calendar.business_sync"
          )
        ).toBe(true);

        expect(
          packageHasEntitlement(
            "digital_studio",
            "ai.content_translation"
          )
        ).toBe(true);
      }
    );

    it(
      "introduces team calendar operations only from Operations Pro",
      () => {
        expect(
          packageHasEntitlement(
            "digital_studio",
            "calendar.employee_sync"
          )
        ).toBe(false);

        expect(
          packageHasEntitlement(
            "operations_pro",
            "staff.calendar_connection"
          )
        ).toBe(true);

        expect(
          packageHasEntitlement(
            "operations_pro",
            "calendar.employee_sync"
          )
        ).toBe(true);

        expect(
          packageHasEntitlement(
            "operations_pro",
            "calendar.two_way_busy_sync"
          )
        ).toBe(true);
      }
    );

    it(
      "keeps Google review management and AI reply drafts in Reputation Pro",
      () => {
        expect(
          packageHasEntitlement(
            "operations_pro",
            "reviews.management"
          )
        ).toBe(false);

        expect(
          packageHasEntitlement(
            "reputation_pro",
            "reviews.public_widget"
          )
        ).toBe(true);

        expect(
          packageHasEntitlement(
            "reputation_pro",
            "reviews.management"
          )
        ).toBe(true);

        expect(
          packageHasEntitlement(
            "reputation_pro",
            "ai.review_reply_drafts"
          )
        ).toBe(true);
      }
    );

    it(
      "keeps multi-location support in the custom Signature package",
      () => {
        expect(
          packageHasEntitlement(
            "reputation_pro",
            "locations.multiple"
          )
        ).toBe(false);

        expect(
          packageHasEntitlement(
            "signature",
            "locations.multiple"
          )
        ).toBe(true);

        expect(
          PRODUCT_PACKAGES
            .signature
            .customQuote
        ).toBe(true);

        expect(
          PRODUCT_PACKAGES
            .signature
            .monthlyPriceRsd
        ).toBeNull();
      }
    );

    it(
      "returns only higher packages as upgrade candidates",
      () => {
        expect(
          getPackageUpgradeCandidates(
            "operations_pro"
          ).map(
            (productPackage) =>
              productPackage.key
          )
        ).toEqual([
          "reputation_pro",
          "signature",
        ]);

        expect(
          getPackageUpgradeCandidates(
            "signature"
          )
        ).toEqual([]);
      }
    );

    it(
      "rejects unknown package and entitlement keys",
      () => {
        expect(
          isProductPackageKey(
            "digital_studio"
          )
        ).toBe(true);

        expect(
          isProductPackageKey(
            "free"
          )
        ).toBe(false);

        expect(
          isProductEntitlement(
            "staff.portal"
          )
        ).toBe(true);

        expect(
          isProductEntitlement(
            "billing.unlimited"
          )
        ).toBe(false);
      }
    );
  }
);
