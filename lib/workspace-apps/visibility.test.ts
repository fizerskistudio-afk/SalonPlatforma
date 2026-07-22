import {
  readFileSync,
} from "node:fs";
import {
  join,
} from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveProductPackageAccess,
  type ProductPackageAccess,
} from "@/lib/product-packages/resolver";

import {
  getVisibleWorkspaceApps,
  resolveWorkspaceApps,
} from "./visibility";

const bookingPageAccess =
  resolveProductPackageAccess({
    package_key:
      "booking_page",
    package_contract_version:
      1,
  });

const noEntitlementsAccess:
  ProductPackageAccess = {
    mode: "assigned",
    packageKey:
      "booking_page",
    contractVersion: 1,
    entitlements: [],
    grantsAllEntitlements:
      false,
    requiresAttention:
      false,
    reason: "assigned",
  };

describe(
  "ORDUM-WORKSPACE-APPSHELL-01A visibility",
  () => {
    it(
      "owner-u daje Studio, zaključava Content i skriva research module",
      () => {
        const decisions =
          resolveWorkspaceApps({
            role: "owner",
            productAccess:
              bookingPageAccess,
          });

        expect(
          decisions.map(
            (decision) => [
              decision.app.key,
              decision.state,
              decision.reason,
              decision.route,
            ]
          )
        ).toEqual([
          [
            "studio",
            "available",
            "available",
            "/admin",
          ],
          [
            "content",
            "locked",
            "coming_soon",
            null,
          ],
          [
            "finance",
            "hidden",
            "research",
            null,
          ],
          [
            "operations",
            "hidden",
            "research",
            null,
          ],
          [
            "store",
            "hidden",
            "research",
            null,
          ],
        ]);
      }
    );

    it(
      "staff-u daje samo postojeći Studio panel",
      () => {
        const visible =
          getVisibleWorkspaceApps({
            role: "staff",
            productAccess:
              bookingPageAccess,
          });

        expect(
          visible.map(
            (decision) => [
              decision.app.key,
              decision.state,
              decision.route,
            ]
          )
        ).toEqual([
          [
            "studio",
            "available",
            "/staff",
          ],
        ]);
      }
    );

    it(
      "zaključava Studio kada paket nema role entitlement",
      () => {
        const ownerDecision =
          resolveWorkspaceApps({
            role: "owner",
            productAccess:
              noEntitlementsAccess,
          })[0];

        const staffDecision =
          resolveWorkspaceApps({
            role: "staff",
            productAccess:
              noEntitlementsAccess,
          })[0];

        expect(
          ownerDecision
        ).toMatchObject({
          state: "locked",
          reason: "package",
          route: null,
        });

        expect(
          staffDecision
        ).toMatchObject({
          state: "locked",
          reason: "package",
          route: null,
        });
      }
    );

    it(
      "research module može da se vidi samo kao zaključan interni signal",
      () => {
        const visible =
          getVisibleWorkspaceApps({
            role: "owner",
            productAccess:
              bookingPageAccess,
            includeResearch:
              true,
          });

        expect(
          visible.map(
            (decision) => [
              decision.app.key,
              decision.state,
              decision.reason,
            ]
          )
        ).toEqual([
          [
            "studio",
            "available",
            "available",
          ],
          [
            "content",
            "locked",
            "coming_soon",
          ],
          [
            "finance",
            "locked",
            "research",
          ],
          [
            "operations",
            "locked",
            "research",
          ],
          [
            "store",
            "locked",
            "research",
          ],
        ]);
      }
    );

    it(
      "server entrypoint ostaje server-only i ne uvodi UI rutu",
      () => {
        const serverSource =
          readFileSync(
            join(
              process.cwd(),
              "lib/workspace-apps/server.ts"
            ),
            "utf8"
          );

        expect(
          serverSource
        ).toContain(
          'import "server-only";'
        );

        expect(
          serverSource
        ).not.toContain(
          "next/navigation"
        );

        expect(
          serverSource
        ).not.toContain(
          "createClient"
        );
      }
    );
  }
);
