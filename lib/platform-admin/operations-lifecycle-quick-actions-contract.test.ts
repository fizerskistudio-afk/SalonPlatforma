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

function readSource(
  ...segments:
    string[]
): string {
  return readFileSync(
    join(
      process.cwd(),
      ...segments
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );
}

const QUICK_ACTIONS =
  readSource(
    "components",
    "platform-admin",
    "OperationsLifecycleQuickActions.tsx"
  );

const OPERATIONS_PAGE =
  readSource(
    "app",
    "platform-admin",
    "operations",
    "page.tsx"
  );

const PUBLICATION_CONTROLS =
  readSource(
    "components",
    "platform-admin",
    "BusinessPublicationControls.tsx"
  );

const PUBLICATION_ROUTE =
  readSource(
    "app",
    "api",
    "platform-admin",
    "businesses",
    "publication",
    "route.ts"
  );

const OPERATIONS_SERVER =
  readSource(
    "lib",
    "platform-admin",
    "operations-server.ts"
  );

describe(
  "guarded platform operations lifecycle actions",
  () => {
    it(
      "uses the existing publication endpoint with confirmation and optimistic concurrency",
      () => {
        expect(
          QUICK_ACTIONS
        ).toContain(
          "window.confirm"
        );

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
          "version"
        );
      }
    );

    it(
      "filters visible actions through lifecycle and platform permission contracts",
      () => {
        expect(
          QUICK_ACTIONS
        ).toContain(
          "getAllowedLifecycleTargets"
        );

        expect(
          QUICK_ACTIONS
        ).toContain(
          "getPublicationPermission"
        );

        expect(
          QUICK_ACTIONS
        ).toContain(
          "platformAccess"
        );
      }
    );

    it(
      "passes the current tenant version from the operations read model",
      () => {
        expect(
          OPERATIONS_PAGE
        ).toContain(
          "<OperationsLifecycleQuickActions"
        );

        expect(
          OPERATIONS_PAGE
        ).toContain(
          "tenant.updatedAt"
        );

        expect(
          OPERATIONS_SERVER
        ).toContain(
          "updated_at"
        );

        expect(
          OPERATIONS_SERVER
        ).toContain(
          "updatedAt"
        );
      }
    );

    it(
      "keeps the publication API as the single guarded write boundary",
      () => {
        for (
          const marker of [
            "getPlatformAdminAccess",
            "getPublicationPermission",
            "isLifecycleTransitionAllowed",
            "loadTenantLifecycleContext",
            'nextStatus === "published"',
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

        expect(
          QUICK_ACTIONS
        ).not.toContain(
          "createAdminClient"
        );

        expect(
          OPERATIONS_PAGE
        ).not.toContain(
          "createAdminClient"
        );
      }
    );

    it(
      "shares lifecycle action copy with the existing command-center controls",
      () => {
        expect(
          PUBLICATION_CONTROLS
        ).toContain(
          "@/lib/platform-admin/lifecycle-action-copy"
        );

        expect(
          PUBLICATION_CONTROLS
        ).toContain(
          "getLifecycleConfirmationMessage"
        );

        expect(
          PUBLICATION_CONTROLS
        ).not.toContain(
          "function getLifecycleActionLabel("
        );

        expect(
          PUBLICATION_CONTROLS
        ).not.toContain(
          "function getConfirmationMessage("
        );
      }
    );

    it(
      "does not add a second lifecycle API route",
      () => {
        expect(
          QUICK_ACTIONS
        ).not.toContain(
          "/api/platform-admin/operations"
        );

        expect(
          QUICK_ACTIONS
        ).not.toContain(
          ".update("
        );
      }
    );
  }
);
