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
    "scripts/performance/public-booking-load-01b.mjs",
    "utf8"
  ).replace(
    /\r\n?/g,
    "\n"
  );

describe(
  "PUBLIC-BOOKING-LOAD-01B source contract",
  () => {
    it(
      "uses the required concurrency levels by default",
      () => {
        expect(
          source
        ).toContain(
          '"25,50,100"'
        );
      }
    );

    it(
      "is read-only and never calls the booking POST route",
      () => {
        expect(
          source
        ).toContain(
          'method:\n            "GET"'
        );

        expect(
          source
        ).not.toContain(
          'method:\n            "POST"'
        );

        expect(
          source
        ).not.toContain(
          '"/api/bookings"'
        );

        expect(
          source
        ).not.toContain(
          "`/api/bookings"
        );
      }
    );

    it(
      "measures p50 p95 p99 timeouts and rate limits",
      () => {
        for (
          const token of [
            "p50Ms",
            "p95Ms",
            "p99Ms",
            "timeoutCount",
            "rateLimitedCount",
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
      "keeps availability requests below full session volume",
      () => {
        expect(
          source
        ).toContain(
          "PUBLIC_BOOKING_LOAD_AVAILABILITY_RATIO"
        );

        expect(
          source
        ).toContain(
          '"0.2"'
        );
      }
    );

    it(
      "writes reproducible JSON and Markdown evidence",
      () => {
        expect(
          source
        ).toContain(
          '"results.json"'
        );

        expect(
          source
        ).toContain(
          '"REPORT.md"'
        );

        expect(
          source
        ).toContain(
          "writesPerformed"
        );

        expect(
          source
        ).toContain(
          "bookingPostRequests"
        );
      }
    );
  }
);
