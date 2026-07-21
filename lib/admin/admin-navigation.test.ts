import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ADMIN_NAVIGATION_GROUPS,
  ADMIN_NAVIGATION_ITEMS,
  ADMIN_PLANNED_MODULES,
  getAdminMobilePrimaryItems,
  getAdminNavigationGroupForPath,
  getAdminNavigationGroups,
  getAdminNavigationItemForPath,
  isAdminNavigationItemActive,
} from "./admin-navigation";

const CURRENT_ADMIN_ROUTES = [
  "/admin",
  "/admin/bookings",
  "/admin/customers",
  "/admin/schedule",
  "/admin/services",
  "/admin/team",
  "/admin/gallery",
  "/admin/reviews",
  "/admin/members",
  "/admin/notifications",
  "/admin/settings",
] as const;

describe(
  "admin navigation registry",
  () => {
    it(
      "keeps group, item and route keys unique",
      () => {
        expect(
          new Set(
            ADMIN_NAVIGATION_GROUPS.map(
              (group) =>
                group.key
            )
          ).size
        ).toBe(
          ADMIN_NAVIGATION_GROUPS.length
        );

        expect(
          new Set(
            ADMIN_NAVIGATION_ITEMS.map(
              (item) =>
                item.key
            )
          ).size
        ).toBe(
          ADMIN_NAVIGATION_ITEMS.length
        );

        expect(
          new Set(
            ADMIN_NAVIGATION_ITEMS.map(
              (item) =>
                item.href
            )
          ).size
        ).toBe(
          ADMIN_NAVIGATION_ITEMS.length
        );
      }
    );

    it(
      "covers every current tenant-admin route exactly once",
      () => {
        expect(
          ADMIN_NAVIGATION_ITEMS.map(
            (item) =>
              item.href
          ).sort()
        ).toEqual(
          [...CURRENT_ADMIN_ROUTES].sort()
        );
      }
    );

    it(
      "resolves active nested routes without making dashboard a prefix catch-all",
      () => {
        expect(
          isAdminNavigationItemActive(
            "/admin",
            "/admin"
          )
        ).toBe(true);

        expect(
          isAdminNavigationItemActive(
            "/admin/bookings",
            "/admin"
          )
        ).toBe(false);

        expect(
          getAdminNavigationItemForPath(
            "/admin/bookings/example"
          )?.key
        ).toBe("bookings");

        expect(
          getAdminNavigationGroupForPath(
            "/admin/reviews"
          )?.key
        ).toBe(
          "digital_presence"
        );
      }
    );

    it(
      "renders only groups with live routes while preserving the future Business OS taxonomy",
      () => {
        const liveGroups =
          getAdminNavigationGroups();

        expect(
          liveGroups.map(
            (group) =>
              group.key
          )
        ).toEqual([
          "overview",
          "appointments",
          "offer_team",
          "digital_presence",
          "administration",
        ]);

        expect(
          ADMIN_PLANNED_MODULES.some(
            (moduleItem) =>
              moduleItem.groupKey ===
                "operations"
          )
        ).toBe(true);

        expect(
          ADMIN_PLANNED_MODULES.some(
            (moduleItem) =>
              moduleItem.key ===
                "presence.google_business_profile"
          )
        ).toBe(true);
      }
    );

    it(
      "keeps the mobile primary surface intentionally limited to today, calendar and clients",
      () => {
        const mobileItems =
          getAdminMobilePrimaryItems();

        expect(
          mobileItems.map(
            (item) =>
              item.mobileSlot
          )
        ).toEqual([
          "today",
          "calendar",
          "clients",
        ]);

        expect(
          mobileItems.map(
            (item) =>
              item.href
          )
        ).toEqual([
          "/admin",
          "/admin/bookings",
          "/admin/customers",
        ]);
      }
    );

    it(
      "keeps every live and planned module inside a declared group",
      () => {
        const groupKeys =
          new Set(
            ADMIN_NAVIGATION_GROUPS.map(
              (group) =>
                group.key
            )
          );

        for (
          const item of
          ADMIN_NAVIGATION_ITEMS
        ) {
          expect(
            groupKeys.has(
              item.groupKey
            )
          ).toBe(true);
        }

        for (
          const moduleItem of
          ADMIN_PLANNED_MODULES
        ) {
          expect(
            groupKeys.has(
              moduleItem.groupKey
            )
          ).toBe(true);
        }
      }
    );
  }
);
