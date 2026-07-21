import {
  describe,
  expect,
  it,
} from "vitest";

import {
  PRODUCT_PACKAGE_KEYS,
} from "@/lib/product-packages/registry";

import {
  COMMERCIAL_OFFERS,
  COMMERCIAL_PRICING_MODELS,
  getPrimaryCommercialOffer,
} from "./commercial-offers";
import {
  PLATFORM_LEVELS,
  getActivePlatformLevel,
  getNextLockedPlatformLevel,
} from "./platform-levels";
import {
  PRODUCT_ROLLOUT_FEATURES,
  PRODUCT_ROLLOUT_STATUSES,
  getProductRolloutFeature,
  getPublicProductRoadmap,
  isProductFeatureLive,
  isProductFeaturePubliclyMarketable,
} from "./rollout-registry";

describe(
  "Ordum product strategy registry",
  () => {
    it(
      "keeps stable rollout statuses and unique feature keys",
      () => {
        expect(
          PRODUCT_ROLLOUT_STATUSES
        ).toEqual([
          "live",
          "beta",
          "coming_soon",
          "research",
          "retired",
        ]);

        const keys =
          PRODUCT_ROLLOUT_FEATURES.map(
            (feature) => feature.key
          );

        expect(
          new Set(keys).size
        ).toBe(keys.length);
      }
    );

    it(
      "separates live promises from managed beta and public roadmap items",
      () => {
        expect(
          isProductFeatureLive(
            "tenant.online_booking"
          )
        ).toBe(true);

        expect(
          isProductFeaturePubliclyMarketable(
            "tenant.online_booking"
          )
        ).toBe(true);

        expect(
          isProductFeaturePubliclyMarketable(
            "tenant.email_notifications"
          )
        ).toBe(false);

        expect(
          getProductRolloutFeature(
            "growth.first_available_redirect"
          ).status
        ).toBe("coming_soon");

        expect(
          getPublicProductRoadmap().some(
            (feature) =>
              feature.key ===
              "operations.fiscalization"
          )
        ).toBe(false);
      }
    );

    it(
      "keeps commercial pricing models flexible and technical packages valid",
      () => {
        expect(
          COMMERCIAL_PRICING_MODELS
        ).toContain("pay_per_lead");
        expect(
          COMMERCIAL_PRICING_MODELS
        ).toContain("commission");
        expect(
          COMMERCIAL_PRICING_MODELS
        ).toContain("hybrid");

        for (
          const offer of
          COMMERCIAL_OFFERS
        ) {
          expect(
            PRODUCT_PACKAGE_KEYS
          ).toContain(
            offer.technicalPackage
          );
        }
      }
    );

    it(
      "allows active offers to promise only live features",
      () => {
        for (
          const offer of
          COMMERCIAL_OFFERS
        ) {
          for (
            const featureKey of
            offer.includedLiveFeatures
          ) {
            expect(
              getProductRolloutFeature(
                featureKey
              ).status
            ).toBe("live");
          }

          for (
            const featureKey of
            offer.managedBetaOptions
          ) {
            expect(
              getProductRolloutFeature(
                featureKey
              ).status
            ).toBe("beta");
          }
        }
      }
    );

    it(
      "keeps Founding Partner cheaper, limited and time locked",
      () => {
        const launch =
          getPrimaryCommercialOffer();
        const founding =
          COMMERCIAL_OFFERS.find(
            (offer) =>
              offer.key ===
              "founding_partner"
          );

        expect(founding).toBeDefined();
        expect(
          founding?.setupPriceRsd
        ).toBeLessThan(
          launch.setupPriceRsd ?? 0
        );
        expect(
          founding?.monthlyPriceRsd
        ).toBeLessThan(
          launch.monthlyPriceRsd ?? 0
        );
        expect(
          founding?.clientLimit
        ).toBe(5);
        expect(
          founding?.priceLockMonths
        ).toBe(12);
      }
    );

    it(
      "keeps platform levels sequential with one active level",
      () => {
        expect(
          PLATFORM_LEVELS.map(
            (level) => level.level
          )
        ).toEqual([
          1,
          2,
          3,
          4,
          5,
          6,
        ]);

        expect(
          PLATFORM_LEVELS.filter(
            (level) =>
              level.status === "active"
          )
        ).toHaveLength(1);

        expect(
          getActivePlatformLevel().key
        ).toBe("growth_platform");
        expect(
          getNextLockedPlatformLevel()?.key
        ).toBe("local_discovery");
      }
    );

    it(
      "assigns every strategy feature to at least one platform level",
      () => {
        const assignedFeatures =
          new Set(
            PLATFORM_LEVELS.flatMap(
              (level) =>
                level.featureKeys
            )
          );

        for (
          const feature of
          PRODUCT_ROLLOUT_FEATURES
        ) {
          expect(
            assignedFeatures.has(
              feature.key
            )
          ).toBe(true);
        }
      }
    );
  }
);
