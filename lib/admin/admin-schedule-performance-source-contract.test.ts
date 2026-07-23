import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(...parts: string[]): string {
  return readFileSync(
    join(process.cwd(), ...parts),
    "utf8"
  ).replace(/\r\n/g, "\n");
}

describe(
  "ORDUM-ADMIN-PERFORMANCE-01B",
  () => {
    it(
      "removes per-member auth lookups from schedule hot path",
      () => {
        const source = read(
          "lib",
          "admin",
          "staff-time-off-requests.ts"
        );

        expect(source).not.toContain(
          ".auth.admin.getUserById"
        );
        expect(source).not.toContain(
          "member_id"
        );
        expect(source).toMatch(
          /\.eq\(\s*"status",\s*"pending"\s*\)/
        );
      }
    );

    it(
      "reuses canonical schedule timezone",
      () => {
        const source = read(
          "app",
          "admin",
          "(protected)",
          "schedule",
          "page.tsx"
        );

        expect(source).toContain(
          "result.business.timezone"
        );
        expect(source).not.toContain(
          "staffRequests.timezone"
        );
      }
    );

    it(
      "keeps schedule request timing explicit",
      () => {
        const source = read(
          "lib",
          "admin",
          "staff-time-off-requests.ts"
        );

        expect(source).toContain(
          '"admin.schedule.staffRequests"'
        );
        expect(source).toContain(
          '"admin.schedule.staffRequestEmployees"'
        );
      }
    );
  }
);
