import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getWorkspaceAppDefinition,
  getWorkspaceAppRegistry,
} from "./registry";
import {
  getWorkspaceAppRoute,
  WORKSPACE_ROOT_ROUTE,
} from "./route-contract";

describe(
  "ORDUM-WORKSPACE-APPSHELL-01A registry",
  () => {
    it(
      "zaključava početnih pet aplikacija i pošten rollout status",
      () => {
        const registry =
          getWorkspaceAppRegistry();

        expect(
          registry.map(
            (app) => [
              app.key,
              app.status,
            ]
          )
        ).toEqual([
          [
            "studio",
            "live",
          ],
          [
            "content",
            "coming_soon",
          ],
          [
            "finance",
            "research",
          ],
          [
            "operations",
            "research",
          ],
          [
            "store",
            "research",
          ],
        ]);

        expect(
          registry.filter(
            (app) =>
              app.status ===
              "live"
          )
        ).toHaveLength(1);
      }
    );

    it(
      "čuva postojeći admin i staff panel kao Studio role route",
      () => {
        expect(
          WORKSPACE_ROOT_ROUTE
        ).toBe(
          "/workspace"
        );

        expect(
          getWorkspaceAppRoute(
            "studio",
            "owner"
          )
        ).toBe(
          "/admin"
        );

        expect(
          getWorkspaceAppRoute(
            "studio",
            "manager"
          )
        ).toBe(
          "/admin"
        );

        expect(
          getWorkspaceAppRoute(
            "studio",
            "staff"
          )
        ).toBe(
          "/staff"
        );
      }
    );

    it(
      "ne uvodi Platform Admin kao tenant Workspace ulogu",
      () => {
        const studio =
          getWorkspaceAppDefinition(
            "studio"
          );

        expect(
          Object.keys(
            studio.roleAccess
          )
        ).toEqual([
          "owner",
          "manager",
          "staff",
        ]);

        expect(
          Object.keys(
            studio.roleAccess
          )
        ).not.toContain(
          "platform_admin"
        );
      }
    );

    it(
      "ima jedinstvene ključeve, redosled i validne dependency reference",
      () => {
        const registry =
          getWorkspaceAppRegistry();

        expect(
          new Set(
            registry.map(
              (app) =>
                app.key
            )
          ).size
        ).toBe(
          registry.length
        );

        expect(
          registry.map(
            (app) =>
              app.order
          )
        ).toEqual([
          10,
          20,
          30,
          40,
          50,
        ]);

        const keys =
          new Set(
            registry.map(
              (app) =>
                app.key
            )
          );

        for (
          const app of
          registry
        ) {
          for (
            const dependency of
            app.dependencies
          ) {
            expect(
              keys.has(
                dependency
              )
            ).toBe(
              true
            );

            expect(
              getWorkspaceAppDefinition(
                dependency
              ).order
            ).toBeLessThan(
              app.order
            );
          }
        }
      }
    );
  }
);
