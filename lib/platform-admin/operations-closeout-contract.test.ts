import {
  existsSync,
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

function projectPath(
  ...segments:
    string[]
): string {
  return join(
    process.cwd(),
    ...segments
  );
}

function readProjectFile(
  ...segments:
    string[]
): string {
  return readFileSync(
    projectPath(
      ...segments
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );
}

const ROADMAP =
  readProjectFile(
    "docs",
    "history",
    "ROADMAP-LEGACY-2026-07-22.md"
  );

const OPERATIONS_PAGE =
  readProjectFile(
    "app",
    "platform-admin",
    "operations",
    "page.tsx"
  );

const QUICK_ACTIONS =
  readProjectFile(
    "components",
    "platform-admin",
    "OperationsLifecycleQuickActions.tsx"
  );

const PUBLICATION_ROUTE =
  readProjectFile(
    "app",
    "api",
    "platform-admin",
    "businesses",
    "publication",
    "route.ts"
  );

const REQUIRED_FILES = [
  "lib/platform-admin/operations-server.ts",
  "lib/platform-admin/operations-query.ts",
  "lib/platform-admin/operational-readiness.ts",
  "lib/platform-admin/lifecycle-action-copy.ts",
  "components/platform-admin/OperationsLifecycleQuickActions.tsx",
  "app/platform-admin/operations/page.tsx",
  "docs/milestones/PLATFORM-ADMIN-OPERATIONS-01A-READ-MODEL.md",
  "docs/milestones/PLATFORM-ADMIN-OPERATIONS-01B-FILTERS-VIEWS.md",
  "docs/milestones/PLATFORM-ADMIN-OPERATIONS-01C-GUARDED-QUICK-ACTIONS.md",
  "docs/milestones/PLATFORM-ADMIN-OPERATIONS-01D-CLOSEOUT.md",
  "docs/qa/PLATFORM-ADMIN-OPERATIONS-01D-RUNTIME-SMOKE.md",
] as const;

describe(
  "platform-admin operations closeout",
  () => {
    it.each(
      REQUIRED_FILES
    )(
      "ships %s",
      (
        file
      ) => {
        expect(
          existsSync(
            projectPath(
              ...file.split(
                "/"
              )
            )
          )
        ).toBe(true);
      }
    );

    it(
      "keeps the operations workspace on the shared server read model",
      () => {
        expect(
          OPERATIONS_PAGE
        ).toContain(
          "loadPlatformOperationsOverview"
        );

        expect(
          OPERATIONS_PAGE
        ).toContain(
          "parsePlatformOperationsFilters"
        );

        expect(
          OPERATIONS_PAGE
        ).not.toContain(
          "createAdminClient"
        );
      }
    );

    it(
      "keeps lifecycle actions on the existing guarded publication API",
      () => {
        expect(
          QUICK_ACTIONS
        ).toContain(
          '"/api/platform-admin/businesses/publication"'
        );

        expect(
          QUICK_ACTIONS
        ).toContain(
          "expectedUpdatedAt"
        );

        expect(
          QUICK_ACTIONS
        ).toContain(
          "window.confirm"
        );

        expect(
          QUICK_ACTIONS
        ).not.toContain(
          "/api/platform-admin/operations"
        );
      }
    );

    it(
      "keeps authorization, readiness, concurrency and audit checks in the server boundary",
      () => {
        for (
          const marker of [
            "getPlatformAdminAccess",
            "getPublicationPermission",
            "isLifecycleTransitionAllowed",
            "loadTenantLifecycleContext",
            "readiness.productionReady",
            '"updated_at"',
            "expectedUpdatedAt",
            '"tenant.lifecycle.changed"',
          ]
        ) {
          expect(
            PUBLICATION_ROUTE
          ).toContain(
            marker
          );
        }
      }
    );

    it(
      "records local operations closeout without claiming browser database mutations ran automatically",
      () => {
        expect(
          ROADMAP
        ).toContain(
          "PLATFORM-ADMIN-OPERATIONS-01 — završen i pushovan"
        );

        expect(
          ROADMAP
        ).toContain(
          "AI-CONTENT-ASSIST-FOUNDATION-01"
        );

        expect(
          ROADMAP
        ).toContain(
          "browser lifecycle smoke ostaje eksplicitan"
        );

        expect(
          ROADMAP
        ).toContain(
          "ciljani Git commit i push završeni na radnoj grani."
        );
      }
    );

    it(
      "records the completed product-package Git checkpoint",
      () => {
        expect(
          ROADMAP
        ).toContain(
          "PRODUCT-PACKAGES-ENTITLEMENTS-01 — završen i pushovan"
        );

        expect(
          ROADMAP
        ).not.toContain(
          "PRODUCT-PACKAGES-ENTITLEMENTS-01` — lokalni closeout završen; commit i push čekaju"
        );
      }
    );
  }
);
