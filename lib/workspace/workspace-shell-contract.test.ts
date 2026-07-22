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
  relativePath: string
): string {
  return readFileSync(
    join(
      process.cwd(),
      relativePath
    ),
    "utf8"
  );
}

describe(
  "ORDUM-WORKSPACE-APPSHELL-01B source contract",
  () => {
    it(
      "Workspace page koristi centralni server context adapter",
      () => {
        const source =
          readSource(
            "app/workspace/page.tsx"
          );

        expect(
          source
        ).toContain(
          "requireWorkspaceContext"
        );

        expect(
          source
        ).toContain(
          "normalizeWorkspaceContextIntent"
        );

        expect(
          source
        ).not.toContain(
          "createClient"
        );
      }
    );

    it(
      "server adapter koristi postojeće auth i package granice bez direktnog DB klijenta",
      () => {
        const source =
          readSource(
            "lib/workspace/context-server.ts"
          );

        expect(
          source
        ).toContain(
          'import "server-only";'
        );

        expect(
          source
        ).toContain(
          "getAdminContext"
        );

        expect(
          source
        ).toContain(
          "getStaffContext"
        );

        expect(
          source
        ).toContain(
          "loadProductPackageAccessForBusinessId"
        );

        expect(
          source
        ).toContain(
          "getVisibleWorkspaceAppsForServer"
        );

        expect(
          source
        ).not.toContain(
          "createClient"
        );

        expect(
          source
        ).not.toContain(
          "createAdminClient"
        );
      }
    );

    it(
      "postojeći admin i staff shell imaju eksplicitni Workspace ulaz",
      () => {
        const adminSource =
          readSource(
            "components/admin/AdminShell.tsx"
          );

        const staffSource =
          readSource(
            "components/staff/StaffShell.tsx"
          );

        expect(
          adminSource
        ).toContain(
          '/workspace?context=admin'
        );

        expect(
          staffSource
        ).toContain(
          '/workspace?context=staff'
        );
      }
    );

    it(
      "Workspace login samo bira postojeće admin ili staff tokove",
      () => {
        const source =
          readSource(
            "app/workspace/login/page.tsx"
          );

        expect(
          source
        ).toContain(
          'href="/admin/login"'
        );

        expect(
          source
        ).toContain(
          'href="/staff/login"'
        );

        expect(
          source
        ).not.toContain(
          "signInWithPassword"
        );
      }
    );

    it(
      "Workspace ostaje privatna noindex površina u proxy contractu",
      () => {
        const source =
          readSource(
            "proxy.ts"
          );

        expect(
          source
        ).toMatch(
          /PRIVATE_PATH_PREFIXES[\s\S]*"\/workspace"/
        );
      }
    );
  }
);
