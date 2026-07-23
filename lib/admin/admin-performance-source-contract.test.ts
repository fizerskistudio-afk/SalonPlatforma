import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(...parts: string[]): string {
  return readFileSync(
    join(process.cwd(), ...parts),
    "utf8"
  ).replace(/\r\n/g, "\n");
}

describe("ORDUM-ADMIN-PERFORMANCE-01A", () => {
  it("keeps timing opt-in", () => {
    const source = read(
      "lib",
      "performance",
      "admin-server-timing.ts"
    );

    expect(source).toContain(
      'process.env.ADMIN_PERF_DEBUG === "1"'
    );
    expect(source).toContain(
      '"[ADMIN_PERF]"'
    );
  });

  it("parallelizes booking lookups", () => {
    const source = read(
      "lib",
      "admin",
      "bookings.ts"
    );

    expect(source).toMatch(
      /Promise\.all\(\s*\[/
    );
    expect(source).toContain(
      '"admin.bookings.lookups"'
    );
  });

  it("ships admin loading feedback", () => {
    const source = read(
      "app",
      "admin",
      "(protected)",
      "loading.tsx"
    );

    expect(source).toContain(
      "Učitavanje administracije"
    );
  });
});
