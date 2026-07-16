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

const ROOT =
  process.cwd();

function source(
  path:
    string
): string {
  return readFileSync(
    join(
      ROOT,
      path
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );
}

describe(
  "CONTENT-STARTER-PACKS-01B contract",
  () => {
    it.each([
      "lib/content-starter-packs/provisioning.ts",
      "lib/content-starter-packs/provisioning.test.ts",
      "components/platform-admin/StarterPackBusinessWizard.tsx",
      "app/platform-admin/businesses/new/starter-pack/page.tsx",
      "app/api/platform-admin/starter-packs/preview/route.ts",
      "app/api/platform-admin/businesses/provision-starter-pack/route.ts",
      "docs/milestones/CONTENT-STARTER-PACKS-01B-VISUAL-BUILDER-ATOMIC-PROVISIONING.md",
    ])(
      "ships %s",
      (
        path:
          string
      ) => {
        expect(
          existsSync(
            join(
              ROOT,
              path
            )
          )
        ).toBe(
          true
        );
      }
    );

    it(
      "keeps browser code away from direct Supabase writes",
      () => {
        const component =
          source(
            "components/platform-admin/StarterPackBusinessWizard.tsx"
          );

        expect(
          component
        ).not.toContain(
          "createBrowserClient"
        );

        expect(
          component
        ).not.toContain(
          ".from("
        );

        expect(
          component
        ).toContain(
          "/api/platform-admin/businesses/provision-starter-pack"
        );
      }
    );

    it(
      "requires platform-admin permission and the existing atomic RPC",
      () => {
        const route =
          source(
            "app/api/platform-admin/businesses/provision-starter-pack/route.ts"
          );

        expect(
          route
        ).toContain(
          'getPlatformAdminAccess(\n      "tenant.create"'
        );

        expect(
          route
        ).toContain(
          '"provision_business"'
        );

        expect(
          route
        ).toContain(
          "getStoredApplyKey"
        );

        expect(
          route
        ).toContain(
          "BUSINESS_SLUG_EXISTS"
        );
      }
    );

    it(
      "does not auto publish or overwrite an existing tenant",
      () => {
        const combined =
          [
            source(
              "lib/content-starter-packs/provisioning.ts"
            ),
            source(
              "app/api/platform-admin/businesses/provision-starter-pack/route.ts"
            ),
          ].join(
            "\n"
          );

        expect(
          combined
        ).not.toContain(
          "publication_status"
        );

        expect(
          combined
        ).not.toContain(
          ".update("
        );

        expect(
          combined
        ).not.toContain(
          ".upsert("
        );
      }
    );

    it(
      "documents the visible creation scope and next theme sequence",
      () => {
        const milestone =
          source(
            "docs/milestones/CONTENT-STARTER-PACKS-01B-VISUAL-BUILDER-ATOMIC-PROVISIONING.md"
          );

        for (
          const marker of [
            "Lumière",
            "Editorial",
            "Barber",
            "Nails",
            "preview-only",
            "ne objavljuje",
            "01B ne menja `ROADMAP.md`",
          ]
        ) {
          expect(
            milestone
          ).toContain(
            marker
          );
        }
      }
    );
  }
);
