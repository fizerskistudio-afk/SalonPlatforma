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
    "ROADMAP.md"
  );

const REQUIRED_RUNTIME_FILES = [
  "lib/product-packages/access-server.ts",
  "lib/product-packages/admin-gates-server.ts",
  "lib/product-packages/business-access.ts",
  "lib/product-packages/gates.ts",
  "lib/product-packages/staff-gates-server.ts",
  "lib/product-packages/upgrade-guidance.ts",
  "lib/google-calendar/employee-sync.ts",
  "app/admin/(protected)/gallery/actions.ts",
  "app/admin/(protected)/reviews/actions.ts",
  "app/api/admin/gallery/upload-url/route.ts",
  "app/staff/(protected)/calendar/actions.ts",
  "app/api/staff/google-calendar/connect/route.ts",
  "app/api/admin/google-calendar/callback/route.ts",
] as const;

const REQUIRED_MILESTONE_DOCS = [
  "docs/milestones/PRODUCT-PACKAGES-ENTITLEMENTS-01E-A-GATE-MAP.md",
  "docs/milestones/PRODUCT-PACKAGES-ENTITLEMENTS-01E-B1-TENANT-ADMIN-ROUTE-GATES.md",
  "docs/milestones/PRODUCT-PACKAGES-ENTITLEMENTS-01E-B2-TENANT-ADMIN-MUTATION-GATES.md",
  "docs/milestones/PRODUCT-PACKAGES-ENTITLEMENTS-01E-C1-STAFF-ROUTE-GATES.md",
  "docs/milestones/PRODUCT-PACKAGES-ENTITLEMENTS-01E-C2-STAFF-CALENDAR-SERVER-GATES.md",
  "docs/milestones/PRODUCT-PACKAGES-ENTITLEMENTS-01E-D-UPGRADE-UX-MATRIX.md",
  "docs/milestones/PRODUCT-PACKAGES-ENTITLEMENTS-CLOSEOUT-01.md",
] as const;

describe(
  "product package entitlement closeout",
  () => {
    it.each(
      REQUIRED_RUNTIME_FILES
    )(
      "ships runtime boundary %s",
      (file) => {
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

    it.each(
      REQUIRED_MILESTONE_DOCS
    )(
      "ships milestone record %s",
      (file) => {
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
      "records the completed package chapter and the next operational milestone",
      () => {
        expect(
          ROADMAP
        ).toContain(
          "PRODUCT-PACKAGES-ENTITLEMENTS-01 — lokalni closeout završen"
        );

        expect(
          ROADMAP
        ).toContain(
          "`PLATFORM-ADMIN-OPERATIONS-01` — sledeći aktivni milestone"
        );

        expect(
          ROADMAP
        ).toContain(
          "`AI-CONTENT-ASSIST-FOUNDATION-01`"
        );
      }
    );

    it(
      "keeps the rollout and blocker decisions explicit in the roadmap",
      () => {
        for (
          const marker of [
            "Booking Page",
            "Digital Studio",
            "Operations Pro",
            "Reputation Pro",
            "Signature",
            "legacy full access",
            "package, permission i integration",
          ]
        ) {
          expect(
            ROADMAP
          ).toContain(
            marker
          );
        }
      }
    );

    it(
      "does not claim that the closeout commit or push already happened",
      () => {
        expect(
          ROADMAP
        ).toContain(
          "commit i push čekaju eksplicitnu autorizaciju"
        );

        expect(
          ROADMAP
        ).not.toContain(
          "PRODUCT-PACKAGES-ENTITLEMENTS-CLOSEOUT-01 — pushovan"
        );
      }
    );
  }
);
