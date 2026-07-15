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
  );
}

const LAYOUT_SOURCE =
  readSource(
    "app",
    "staff",
    "(protected)",
    "layout.tsx"
  );

const SHELL_SOURCE =
  readSource(
    "components",
    "staff",
    "StaffShell.tsx"
  );

const CALENDAR_PAGE_SOURCE =
  readSource(
    "app",
    "staff",
    "(protected)",
    "calendar",
    "page.tsx"
  );

const UPGRADE_SOURCE =
  readSource(
    "components",
    "staff",
    "StaffProductFeatureUpgradeNotice.tsx"
  );

describe(
  "staff route gate integration contract",
  () => {
    it(
      "loads active business package in the protected staff layout",
      () => {
        expect(
          LAYOUT_SOURCE
        ).toContain(
          "loadProductPackageAccessForBusinessId"
        );

        expect(
          LAYOUT_SOURCE
        ).toContain(
          "productAccess={"
        );

        expect(
          LAYOUT_SOURCE
        ).toContain(
          "staff.business.id"
        );
      }
    );

    it(
      "keeps the calendar link visible and marks a package lock",
      () => {
        expect(
          SHELL_SOURCE
        ).toContain(
          'href="/staff/calendar"'
        );

        expect(
          SHELL_SOURCE
        ).toContain(
          "resolveProductFeatureGate"
        );

        expect(
          SHELL_SOURCE
        ).toMatch(
          /blockedBy\s*===\s*"package"/
        );

        expect(
          SHELL_SOURCE
        ).toContain(
          "Operations Pro"
        );

        expect(
          SHELL_SOURCE
        ).toContain(
          "Paket"
        );
      }
    );

    it(
      "gates the calendar page before loading connection data",
      () => {
        const gateIndex =
          CALENDAR_PAGE_SOURCE.indexOf(
            "await loadStaffProductFeatureContext("
          );

        const dataIndex =
          CALENDAR_PAGE_SOURCE.indexOf(
            "getStaffGoogleCalendarConnection()"
          );

        expect(
          gateIndex
        ).toBeGreaterThanOrEqual(
          0
        );

        expect(
          dataIndex
        ).toBeGreaterThan(
          gateIndex
        );

        expect(
          CALENDAR_PAGE_SOURCE
        ).toContain(
          '"staff.calendar_connection"'
        );
      }
    );

    it(
      "renders a staff-specific upgrade state with a safe dashboard return",
      () => {
        expect(
          UPGRADE_SOURCE
        ).toContain(
          "getProductFeatureUpgradeGuidance"
        );

        expect(
          UPGRADE_SOURCE
        ).toContain(
          'href="/staff"'
        );

        expect(
          UPGRADE_SOURCE
        ).not.toContain(
          'href="/billing"'
        );

        expect(
          UPGRADE_SOURCE
        ).not.toContain(
          'href="/staff/upgrade"'
        );
      }
    );

    it(
      "does not gate the staff dashboard route",
      () => {
        expect(
          LAYOUT_SOURCE
        ).not.toContain(
          'featureKey="staff.portal"'
        );

        expect(
          CALENDAR_PAGE_SOURCE
        ).not.toContain(
          '"staff.reservations"'
        );
      }
    );
  }
);
