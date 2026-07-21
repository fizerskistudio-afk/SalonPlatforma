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

const SHELL_SOURCE =
  readSource(
    "components",
    "admin",
    "AdminShell.tsx"
  );

const NAVIGATION_SOURCE =
  readSource(
    "lib",
    "admin",
    "admin-navigation.ts"
  );

describe(
  "Ordum admin information architecture contract",
  () => {
    it(
      "uses one central navigation registry instead of a duplicate shell list",
      () => {
        expect(
          SHELL_SOURCE
        ).toContain(
          "@/lib/admin/admin-navigation"
        );

        expect(
          SHELL_SOURCE
        ).toContain(
          "getAdminNavigationGroups"
        );

        expect(
          SHELL_SOURCE
        ).not.toMatch(
          /const\s+navigationItems\s*=/
        );
      }
    );

    it(
      "ships grouped progressive navigation and a dedicated mobile primary surface",
      () => {
        expect(
          SHELL_SOURCE
        ).toContain(
          "collapsedGroups"
        );

        expect(
          SHELL_SOURCE
        ).toContain(
          "MobileBottomNavigation"
        );

        expect(
          SHELL_SOURCE
        ).toContain(
          "grid grid-cols-4"
        );

        expect(
          NAVIGATION_SOURCE
        ).toContain(
          'mobileLabel: "Danas"'
        );

        expect(
          SHELL_SOURCE
        ).toContain(
          "Više"
        );
      }
    );

    it(
      "keeps package gates and review attention inside the new shell",
      () => {
        expect(
          SHELL_SOURCE
        ).toContain(
          "resolveProductFeatureGate"
        );

        expect(
          SHELL_SOURCE
        ).toMatch(
          /blockedBy\s*===\s*[\n\s]*"package"/
        );

        expect(
          SHELL_SOURCE
        ).toContain(
          "reviewAttentionCount"
        );
      }
    );

    it(
      "records the global Business OS taxonomy without rendering dead future routes",
      () => {
        for (
          const label of [
            "Digitalno prisustvo",
            "Operacije",
            "Prodaja i finansije",
            "Izveštaji",
            "Administracija",
          ]
        ) {
          expect(
            NAVIGATION_SOURCE
          ).toContain(label);
        }

        expect(
          NAVIGATION_SOURCE
        ).toContain(
          "presence.google_business_profile"
        );

        expect(
          NAVIGATION_SOURCE
        ).toContain(
          "operations.inventory"
        );

        expect(
          NAVIGATION_SOURCE
        ).not.toContain(
          'href: "/admin/inventory"'
        );
      }
    );
  }
);
