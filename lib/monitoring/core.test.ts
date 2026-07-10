import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createMonitoringRecord,
  createRequestId,
  createSafeErrorContext,
  sanitizeMonitoringContext,
} from "@/lib/monitoring/core";

describe(
  "monitoring core",
  () => {
    it(
      "preserves a valid incoming request id",
      () => {
        const headers =
          new Headers({
            "x-request-id":
              "req_test_12345678",
          });

        expect(
          createRequestId(
            headers
          )
        ).toBe(
          "req_test_12345678"
        );
      }
    );

    it(
      "replaces an invalid request id",
      () => {
        const headers =
          new Headers({
            "x-request-id":
              "bad request id",
          });

        expect(
          createRequestId(
            headers
          )
        ).toMatch(
          /^[0-9a-f-]{36}$/
        );
      }
    );

    it(
      "redacts sensitive context keys",
      () => {
        expect(
          sanitizeMonitoringContext({
            requestId:
              "req_test_12345678",
            businessSlug:
              "mika-berberin",
            customerEmail:
              "person@example.com",
            customerPhone:
              "+38160000000",
            payload: {
              hidden: true,
            },
          })
        ).toEqual({
          requestId:
            "req_test_12345678",
          businessSlug:
            "mika-berberin",
          customerEmail:
            "[REDACTED]",
          customerPhone:
            "[REDACTED]",
          payload:
            "[REDACTED]",
        });
      }
    );

    it(
      "never returns a raw error message or stack",
      () => {
        const error =
          Object.assign(
            new Error(
              "customer person@example.com failed"
            ),
            {
              code: "PGRST116",
            }
          );

        const safe =
          createSafeErrorContext(
            error
          );

        expect(
          JSON.stringify(safe)
        ).not.toContain(
          "person@example.com"
        );
        expect(
          JSON.stringify(safe)
        ).not.toContain(
          "customer"
        );
        expect(
          safe.errorCode
        ).toBe("PGRST116");
        expect(
          safe.errorFingerprint
        ).toMatch(
          /^[0-9a-f]{24}$/
        );
      }
    );

    it(
      "prevents context from overriding record identity",
      () => {
        const record =
          createMonitoringRecord(
            "warn",
            "booking.rate_limit.blocked",
            {
              timestamp:
                "forged",
              level:
                "error",
              event:
                "forged.event",
            },
            new Date(
              "2026-07-10T12:00:00.000Z"
            )
          );

        expect(record).toMatchObject({
          timestamp:
            "2026-07-10T12:00:00.000Z",
          level: "warn",
          event:
            "booking.rate_limit.blocked",
        });
      }
    );
  }
);
