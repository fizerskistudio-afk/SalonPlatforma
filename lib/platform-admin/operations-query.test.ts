import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  PlatformOperationsTenant,
} from "./operations-server";
import {
  buildPlatformOperationsHref,
  countPlatformOperationsViews,
  filterPlatformOperationsTenants,
  parsePlatformOperationsFilters,
} from "./operations-query";

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
  "platform operations query",
  () => {
    it(
      "normalizes invalid URL values to stable defaults",
      () => {
        expect(
          parsePlatformOperationsFilters({
            view:
              "unknown",
            lifecycle:
              "broken",
            severity:
              "urgent",
            package:
              "none",
            q:
              "  salon  ",
          })
        ).toEqual({
          view:
            "attention",
          query:
            "salon",
          lifecycle:
            "all",
          severity:
            "all",
          packageState:
            "all",
        });
      }
    );

    it(
      "accepts the first value from repeated query params",
      () => {
        expect(
          parsePlatformOperationsFilters({
            view: [
              "published",
              "all",
            ],
            q: [
              "alpha",
              "beta",
            ],
          })
        ).toMatchObject({
          view:
            "published",
          query:
            "alpha",
        });
      }
    );

    it(
      "filters the attention view by search, severity and package state",
      () => {
        const result =
          filterPlatformOperationsTenants(
            [
              tenant({
                id:
                  "critical",
                slug:
                  "critical-salon",
                name:
                  "Critical Salon",
                hasActiveOwner:
                  false,
                packageMode:
                  "assigned",
                upcomingBookings:
                  9,
              }),
              tenant({
                id:
                  "invalid",
                slug:
                  "invalid-salon",
                name:
                  "Invalid Salon",
                packageLabel:
                  "Nepoznat paket",
                packageMode:
                  "invalid_assignment",
                packageRequiresAttention:
                  true,
              }),
              tenant({
                id:
                  "healthy",
                slug:
                  "healthy-salon",
                name:
                  "Healthy Salon",
              }),
            ],
            {
              view:
                "attention",
              query:
                "invalid",
              lifecycle:
                "all",
              severity:
                "warning",
              packageState:
                "invalid",
            }
          );

        expect(
          result.map(
            (
              item
            ) =>
              item.tenant.id
          )
        ).toEqual([
          "invalid",
        ]);
      }
    );

    it(
      "keeps healthy tenants out of severity filters",
      () => {
        const result =
          filterPlatformOperationsTenants(
            [
              tenant({
                id:
                  "healthy",
              }),
              tenant({
                id:
                  "draft",
                publicationStatus:
                  "draft",
              }),
            ],
            {
              view:
                "all",
              query:
                "",
              lifecycle:
                "all",
              severity:
                "info",
              packageState:
                "all",
            }
          );

        expect(
          result.map(
            (
              item
            ) =>
              item.tenant.id
          )
        ).toEqual([
          "draft",
        ]);
      }
    );

    it(
      "supports launch and published operational views",
      () => {
        const tenants = [
          tenant({
            id:
              "draft",
            publicationStatus:
              "draft",
          }),
          tenant({
            id:
              "published",
          }),
          tenant({
            id:
              "archived",
            publicationStatus:
              "archived",
          }),
        ];

        expect(
          filterPlatformOperationsTenants(
            tenants,
            {
              view:
                "launch",
              query:
                "",
              lifecycle:
                "all",
              severity:
                "all",
              packageState:
                "all",
            }
          ).map(
            (
              item
            ) =>
              item.tenant.id
          )
        ).toEqual([
          "draft",
        ]);

        expect(
          filterPlatformOperationsTenants(
            tenants,
            {
              view:
                "published",
              query:
                "",
              lifecycle:
                "all",
              severity:
                "all",
              packageState:
                "all",
            }
          ).map(
            (
              item
            ) =>
              item.tenant.id
          )
        ).toEqual([
          "published",
        ]);
      }
    );

    it(
      "counts each operational view independently",
      () => {
        expect(
          countPlatformOperationsViews([
            tenant({
              id:
                "draft",
              publicationStatus:
                "draft",
            }),
            tenant({
              id:
                "published",
            }),
            tenant({
              id:
                "warning",
              packageMode:
                "invalid_assignment",
              packageRequiresAttention:
                true,
            }),
          ])
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

    it(
      "builds deterministic bookmarkable URLs",
      () => {
        expect(
          buildPlatformOperationsHref(
            {
              view:
                "attention",
              query:
                "Studio One",
              lifecycle:
                "published",
              severity:
                "warning",
              packageState:
                "invalid",
            },
            {
              view:
                "all",
            }
          )
        ).toBe(
          "/platform-admin/operations?view=all&q=Studio+One&lifecycle=published&severity=warning&package=invalid"
        );
      }
    );
  }
);
