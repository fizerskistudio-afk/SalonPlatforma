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
  "ORDUM-ADMIN-PERFORMANCE-01C",
  () => {
    it(
      "measures every canonical schedule query",
      () => {
        const source = read(
          "lib",
          "admin",
          "schedule.ts"
        );

        for (
          const label of [
            "admin.schedule.business",
            "admin.schedule.employees",
            "admin.schedule.workingHours",
            "admin.schedule.timeOff",
          ]
        ) {
          expect(source).toContain(
            `"${label}"`
          );
        }
      }
    );

    it(
      "logs sanitized Supabase diagnostics only in debug mode",
      () => {
        const source = read(
          "lib",
          "admin",
          "schedule.ts"
        );

        expect(source).toMatch(
          /process\.env\.ADMIN_PERF_DEBUG\s*!==\s*"1"/
        );
        expect(source).toContain(
          '"[ADMIN_PERF_ERROR]"'
        );

        for (
          const field of [
            "code",
            "message",
            "details",
            "hint",
          ]
        ) {
          expect(source).toContain(
            `${field}:`
          );
        }

        expect(source).not.toContain(
          "customer_"
        );
        expect(source).not.toContain(
          "requesterEmail"
        );
      }
    );

    it(
      "preserves safe user-facing schedule errors",
      () => {
        const source = read(
          "lib",
          "admin",
          "schedule.ts"
        );

        expect(source).toContain(
          "Nije moguće učitati zaposlene za raspored."
        );
        expect(source).toContain(
          "Nije moguće učitati radno vreme."
        );
        expect(source).toContain(
          "Nije moguće učitati odsustva i blokade."
        );
      }
    );
  }
);
