import {
  describe,
  expect,
  it,
} from "vitest";

import {
  PRODUCT_ROLLOUT_FEATURES,
} from "@/lib/product-strategy/rollout-registry";

import {
  GROWTH_ATTRIBUTION_ALLOWED_DIMENSIONS,
  GROWTH_ATTRIBUTION_FORBIDDEN_FIELDS,
  GROWTH_ATTRIBUTION_QUERY_KEY,
  isValidGrowthAttributionId,
} from "./attribution-contract";
import {
  DISCOVERY_BOOKING_QUERY_KEYS,
  buildTenantBookingPreselectionQuery,
  compareDiscoveryCandidatesByEarliest,
  isTenantServiceDiscoverable,
  type DiscoveryCandidate,
} from "./discovery-contract";
import {
  GROWTH_SEO_ROUTES,
  hasRuntimeGrowthFilters,
  isGrowthSeoRouteIndexable,
} from "./seo-contract";

describe(
  "platform growth architecture contract",
  () => {
    it(
      "keeps required growth product features in coming soon",
      () => {
        const requiredFeatureKeys = [
          "growth.blog_and_guides",
          "growth.local_discovery",
          "growth.first_available_redirect",
          "growth.advanced_analytics",
        ];

        for (
          const featureKey of
          requiredFeatureKeys
        ) {
          const feature =
            PRODUCT_ROLLOUT_FEATURES.find(
              (candidate) =>
                candidate.key ===
                featureKey
            );

          expect(feature).toBeDefined();
          expect(feature?.status).toBe(
            "coming_soon"
          );
          expect(feature?.area).toBe(
            "growth_platform"
          );
        }
      }
    );

    it(
      "requires active published opt-in tenants and mappings",
      () => {
        expect(
          isTenantServiceDiscoverable({
            profile: {
              businessId: "business-1",
              businessSlug:
                "heritage-barber",
              canonicalLocationKey:
                "rs:svilajnac",
              active: true,
              published: true,
              discoveryOptIn: true,
            },
            mapping: {
              businessId: "business-1",
              businessSlug:
                "heritage-barber",
              tenantServiceId:
                "service-1",
              canonicalServiceKey:
                "barber:musko-sisanje",
              active: true,
              discoverable: true,
            },
          })
        ).toBe(true);

        expect(
          isTenantServiceDiscoverable({
            profile: {
              businessId: "business-1",
              businessSlug:
                "heritage-barber",
              canonicalLocationKey:
                "rs:svilajnac",
              active: true,
              published: true,
              discoveryOptIn: false,
            },
            mapping: {
              businessId: "business-1",
              businessSlug:
                "heritage-barber",
              tenantServiceId:
                "service-1",
              canonicalServiceKey:
                "barber:musko-sisanje",
              active: true,
              discoverable: true,
            },
          })
        ).toBe(false);
      }
    );

    it(
      "sorts discovery candidates by earliest slot with stable ties",
      () => {
        const candidates:
          DiscoveryCandidate[] = [
            {
              businessId: "business-b",
              businessSlug: "beta",
              tenantServiceId:
                "service-b",
              employeeId:
                "employee-b",
              employeeName: "Zoran",
              startsAt:
                "2026-07-22T10:00:00.000Z",
              endsAt:
                "2026-07-22T10:30:00.000Z",
              priceFrom: 1200,
              currency: "RSD",
              tenantPublicUrl:
                "https://beta.example",
            },
            {
              businessId: "business-a",
              businessSlug: "alpha",
              tenantServiceId:
                "service-a",
              employeeId:
                "employee-a",
              employeeName: "Ana",
              startsAt:
                "2026-07-22T09:00:00.000Z",
              endsAt:
                "2026-07-22T09:30:00.000Z",
              priceFrom: 1000,
              currency: "RSD",
              tenantPublicUrl:
                "https://alpha.example",
            },
          ];

        candidates.sort(
          compareDiscoveryCandidatesByEarliest
        );

        expect(
          candidates.map(
            (candidate) =>
              candidate.businessSlug
          )
        ).toEqual([
          "alpha",
          "beta",
        ]);
      }
    );

    it(
      "defines a tenant booking preselection redirect contract",
      () => {
        const query =
          buildTenantBookingPreselectionQuery({
            attributionId:
              "abcdefghijkl",
            businessSlug:
              "heritage-barber",
            tenantServiceId:
              "service-1",
            employeeId:
              "employee-1",
            startsAt:
              "2026-07-22T09:00:00.000Z",
          });

        const params =
          new URLSearchParams(query);

        expect(
          params.get(
            DISCOVERY_BOOKING_QUERY_KEYS.openBooking
          )
        ).toBe("1");
        expect(
          params.get(
            DISCOVERY_BOOKING_QUERY_KEYS.serviceId
          )
        ).toBe("service-1");
        expect(
          params.get(
            DISCOVERY_BOOKING_QUERY_KEYS.employeeId
          )
        ).toBe("employee-1");
        expect(
          params.get(
            DISCOVERY_BOOKING_QUERY_KEYS.attributionId
          )
        ).toBe(
          "abcdefghijkl"
        );
        expect(
          GROWTH_ATTRIBUTION_QUERY_KEY
        ).toBe("ordum_ref");
      }
    );

    it(
      "keeps redirect routes out of the index and inventory pages conditional",
      () => {
        const redirectRoute =
          GROWTH_SEO_ROUTES.find(
            (route) =>
              route.key ===
                "attribution_redirect"
          );
        const cityServiceRoute =
          GROWTH_SEO_ROUTES.find(
            (route) =>
              route.key ===
                "city_service_directory"
          );

        expect(
          redirectRoute?.indexPolicy
        ).toBe("never");
        expect(
          redirectRoute?.sitemapGroup
        ).toBeNull();

        expect(
          cityServiceRoute
        ).toBeDefined();

        expect(
          isGrowthSeoRouteIndexable({
            route:
              cityServiceRoute!,
            inventory: {
              hasCuratedContent: true,
              eligibleBusinesses: 1,
              mappedServices: 1,
            },
          })
        ).toBe(true);

        expect(
          isGrowthSeoRouteIndexable({
            route:
              cityServiceRoute!,
            inventory: {
              hasCuratedContent: false,
              eligibleBusinesses: 10,
              mappedServices: 10,
            },
          })
        ).toBe(false);
      }
    );

    it(
      "treats date and other runtime filters as non-canonical search state",
      () => {
        expect(
          hasRuntimeGrowthFilters({
            date: "2026-07-22",
          })
        ).toBe(true);

        expect(
          hasRuntimeGrowthFilters({})
        ).toBe(false);
      }
    );

    it(
      "keeps attribution dimensions pseudonymous and excludes customer PII",
      () => {
        for (
          const forbiddenField of
          GROWTH_ATTRIBUTION_FORBIDDEN_FIELDS
        ) {
          expect(
            GROWTH_ATTRIBUTION_ALLOWED_DIMENSIONS
          ).not.toContain(
            forbiddenField
          );
        }

        expect(
          isValidGrowthAttributionId(
            "abcdefghijkl"
          )
        ).toBe(true);
        expect(
          isValidGrowthAttributionId(
            "customer@example.com"
          )
        ).toBe(false);
      }
    );

    it(
      "does not create a duplicate platform salon profile route",
      () => {
        expect(
          GROWTH_SEO_ROUTES.map(
            (route) =>
              route.pattern as string
          )
        ).not.toContain(
          "/saloni/[businessSlug]"
        );
      }
    );
  }
);
