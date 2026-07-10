import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildTenantAttentionQueue,
  buildTenantReadiness,
  getTenantAttentionReasons,
  type TenantOperationalInput,
} from "./operational-readiness";

function operationalTenant(
  overrides:
    Partial<TenantOperationalInput> = {}
): TenantOperationalInput {
  return {
    id:
      "tenant-1",
    slug:
      "mika-berberin",
    name:
      "Mika Berberin",
    publicationStatus:
      "published",
    hasActiveOwner:
      true,
    hasContact:
      true,
    hasTemplate:
      true,
    upcomingBookings:
      4,
    createdAt:
      "2026-07-10T10:00:00.000Z",
    ...overrides,
  };
}

describe(
  "tenant operational readiness",
  () => {
    it(
      "marks complete tenant ready to publish",
      () => {
        const result =
          buildTenantReadiness({
            businessSlug:
              "mika-berberin",
            contactReady:
              true,
            bookingSettingsReady:
              true,
            categoriesReady:
              true,
            servicesReady:
              true,
            employeesReady:
              true,
            workingHoursReady:
              true,
            ownerReady:
              true,
          });

        expect(
          result.completed
        ).toBe(7);

        expect(
          result.percent
        ).toBe(100);

        expect(
          result.readyToPublish
        ).toBe(true);
      }
    );

    it(
      "returns corrective route for missing owner",
      () => {
        const result =
          buildTenantReadiness({
            businessSlug:
              "lumiere-studio",
            contactReady:
              true,
            bookingSettingsReady:
              true,
            categoriesReady:
              true,
            servicesReady:
              true,
            employeesReady:
              true,
            workingHoursReady:
              true,
            ownerReady:
              false,
          });

        const ownerItem =
          result.items.find(
            (
              item
            ) =>
              item.key ===
              "owner"
          );

        expect(
          result.readyToPublish
        ).toBe(false);

        expect(
          ownerItem
        ).toMatchObject({
          ready:
            false,
          href:
            "/platform-admin/businesses/lumiere-studio/access",
        });
      }
    );

    it(
      "flags draft and missing owner",
      () => {
        expect(
          getTenantAttentionReasons(
            operationalTenant({
              publicationStatus:
                "draft",
              hasActiveOwner:
                false,
            })
          )
        ).toEqual([
          "Čeka objavu",
          "Nema aktivnog owner-a",
        ]);
      }
    );

    it(
      "does not flag complete published tenant",
      () => {
        expect(
          getTenantAttentionReasons(
            operationalTenant()
          )
        ).toEqual([]);
      }
    );

    it(
      "excludes archived tenant without owner from attention queue",
      () => {
        const queue =
          buildTenantAttentionQueue([
            operationalTenant({
              publicationStatus:
                "archived",
              hasActiveOwner:
                false,
            }),
          ]);

        expect(
          queue
        ).toEqual([]);
      }
    );

    it(
      "places draft tenant before suspended tenant",
      () => {
        const queue =
          buildTenantAttentionQueue([
            operationalTenant({
              id:
                "suspended",
              slug:
                "suspended",
              name:
                "Suspendovan",
              publicationStatus:
                "suspended",
            }),
            operationalTenant({
              id:
                "draft",
              slug:
                "draft",
              name:
                "Draft",
              publicationStatus:
                "draft",
            }),
          ]);

        expect(
          queue.map(
            (
              item
            ) =>
              item.id
          )
        ).toEqual([
          "draft",
          "suspended",
        ]);
      }
    );
  }
);
