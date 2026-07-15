import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildTenantAttentionQueue,
  getTenantAttentionReasons,
  getTenantAttentionSeverity,
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
    packageLabel:
      "Digital Studio",
    packageMode:
      "assigned",
    packageRequiresAttention:
      false,
    upcomingBookings:
      4,
    createdAt:
      "2026-07-10T10:00:00.000Z",
    updatedAt:
      "2026-07-15T08:00:00.000Z",
    ...overrides,
  };
}

describe(
  "tenant operational readiness",
  () => {
    it(
      "flags the highest-risk reasons before informational onboarding state",
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
          "Nema aktivnog owner-a",
          "Čeka objavu",
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
      "excludes archived tenant from operational attention",
      () => {
        const queue =
          buildTenantAttentionQueue([
            operationalTenant({
              publicationStatus:
                "archived",
              hasActiveOwner:
                false,
              packageMode:
                "invalid_assignment",
              packageRequiresAttention:
                true,
            }),
          ]);

        expect(
          queue
        ).toEqual([]);
      }
    );

    it(
      "flags invalid package assignment without blocking legacy rollout mode",
      () => {
        expect(
          getTenantAttentionReasons(
            operationalTenant({
              packageMode:
                "invalid_assignment",
              packageRequiresAttention:
                true,
            })
          )
        ).toContain(
          "Package assignment zahteva proveru"
        );

        expect(
          getTenantAttentionReasons(
            operationalTenant({
              packageLabel:
                "Legacy full access",
              packageMode:
                "legacy_full_access",
              packageRequiresAttention:
                false,
            })
          )
        ).toEqual([]);
      }
    );

    it(
      "derives critical, warning and info severity",
      () => {
        expect(
          getTenantAttentionSeverity(
            operationalTenant({
              hasActiveOwner:
                false,
            })
          )
        ).toBe(
          "critical"
        );

        expect(
          getTenantAttentionSeverity(
            operationalTenant({
              packageMode:
                "invalid_assignment",
              packageRequiresAttention:
                true,
            })
          )
        ).toBe(
          "warning"
        );

        expect(
          getTenantAttentionSeverity(
            operationalTenant({
              publicationStatus:
                "draft",
            })
          )
        ).toBe(
          "info"
        );
      }
    );

    it(
      "orders critical before warning before info",
      () => {
        const queue =
          buildTenantAttentionQueue([
            operationalTenant({
              id:
                "info",
              slug:
                "info",
              name:
                "Info",
              publicationStatus:
                "draft",
            }),
            operationalTenant({
              id:
                "warning",
              slug:
                "warning",
              name:
                "Warning",
              packageMode:
                "invalid_assignment",
              packageRequiresAttention:
                true,
            }),
            operationalTenant({
              id:
                "critical",
              slug:
                "critical",
              name:
                "Critical",
              publicationStatus:
                "suspended",
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
          "critical",
          "warning",
          "info",
        ]);
      }
    );

    it(
      "uses upcoming bookings as a same-severity risk tiebreaker",
      () => {
        const queue =
          buildTenantAttentionQueue([
            operationalTenant({
              id:
                "low",
              slug:
                "low",
              name:
                "Low",
              hasActiveOwner:
                false,
              upcomingBookings:
                1,
            }),
            operationalTenant({
              id:
                "high",
              slug:
                "high",
              name:
                "High",
              hasActiveOwner:
                false,
              upcomingBookings:
                12,
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
          "high",
          "low",
        ]);
      }
    );
  }
);
