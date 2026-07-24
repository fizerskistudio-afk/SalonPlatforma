import {
  readFileSync,
} from "node:fs";
import {
  describe,
  expect,
  it,
} from "vitest";

const source =
  readFileSync(
    "scripts/performance/public-booking-load-01c-isolation.mjs",
    "utf8"
  ).replace(
    /\r\n?/g,
    "\n"
  );

describe(
  "PUBLIC-BOOKING-LOAD-01C source contract",
  () => {
    it(
      "isolates tenant page catalog and availability",
      () => {
        for (
          const token of [
            '"tenantPage"',
            '"catalog"',
            '"availability"',
          ]
        ) {
          expect(
            source
          ).toContain(
            token
          );
        }
      }
    );

    it(
      "uses two rounds and alternates route order",
      () => {
        expect(
          source
        ).toContain(
          '"2"'
        );

        expect(
          source
        ).toContain(
          'round %\n        2'
        );
      }
    );

    it(
      "measures TTFB separately from total duration",
      () => {
        for (
          const token of [
            "ttfbMs",
            "bodyMs",
            "totalMs",
            "headersAt",
          ]
        ) {
          expect(
            source
          ).toContain(
            token
          );
        }
      }
    );

    it(
      "never performs booking POST or writes",
      () => {
        expect(
          source
        ).not.toContain(
          'method:\n            "POST"'
        );

        expect(
          source
        ).not.toContain(
          "/api/bookings"
        );

        expect(
          source
        ).toContain(
          "bookingPostRequests"
        );

        expect(
          source
        ).toContain(
          "writesPerformed"
        );
      }
    );

    it(
      "keeps availability concurrency bounded",
      () => {
        expect(
          source
        ).toContain(
          "Math.min(\n      20"
        );

        expect(
          source
        ).toContain(
          "AVAILABILITY_RATIO"
        );
      }
    );

    it(
      "produces route diagnosis evidence",
      () => {
        for (
          const token of [
            "catalog-dominant",
            "tenant-shell-template-overhead-significant",
            "catalogShareOfTenantTtfbP95Percent",
            '"REPORT.md"',
            '"results.json"',
          ]
        ) {
          expect(
            source
          ).toContain(
            token
          );
        }
      }
    );
  }
);
