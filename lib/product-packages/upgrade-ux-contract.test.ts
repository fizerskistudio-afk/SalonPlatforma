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

const ADMIN_NOTICE =
  readSource(
    "components",
    "admin",
    "ProductFeatureUpgradeNotice.tsx"
  );

const STAFF_NOTICE =
  readSource(
    "components",
    "staff",
    "StaffProductFeatureUpgradeNotice.tsx"
  );

const ADMIN_GATE =
  readSource(
    "lib",
    "product-packages",
    "admin-gates-server.ts"
  );

const STAFF_GATE =
  readSource(
    "lib",
    "product-packages",
    "staff-gates-server.ts"
  );

describe(
  "shared product upgrade UX contract",
  () => {
    it(
      "uses one guidance helper across both locked screens",
      () => {
        for (
          const source of [
            ADMIN_NOTICE,
            STAFF_NOTICE,
          ]
        ) {
          expect(
            source
          ).toContain(
            "getProductFeatureUpgradeGuidance"
          );

          expect(
            source
          ).not.toContain(
            "getProductFeatureUpgradeCandidates"
          );

          expect(
            source
          ).not.toContain(
            "PRODUCT_PACKAGES"
          );
        }
      }
    );

    it(
      "uses the same guidance message across admin and staff server gates",
      () => {
        for (
          const source of [
            ADMIN_GATE,
            STAFF_GATE,
          ]
        ) {
          expect(
            source
          ).toContain(
            "getProductFeatureUpgradeGuidance"
          );

          expect(
            source
          ).toContain(
            "guidance.message"
          );

          expect(
            source
          ).toContain(
            '"PRODUCT_PACKAGE_REQUIRED"'
          );
        }
      }
    );

    it(
      "keeps safe return links and ships no dead billing route",
      () => {
        expect(
          ADMIN_NOTICE
        ).toContain(
          'href="/admin"'
        );

        expect(
          STAFF_NOTICE
        ).toContain(
          'href="/staff"'
        );

        for (
          const source of [
            ADMIN_NOTICE,
            STAFF_NOTICE,
          ]
        ) {
          expect(
            source
          ).not.toContain(
            'href="/billing"'
          );

          expect(
            source
          ).not.toContain(
            'href="/upgrade"'
          );
        }
      }
    );
  }
);
