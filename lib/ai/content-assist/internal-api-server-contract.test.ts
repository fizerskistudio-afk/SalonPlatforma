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

function source(
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

const SERVER_SOURCE =
  source(
    "lib",
    "ai",
    "content-assist",
    "internal-api-server.ts"
  );

const RUNTIME_SOURCE =
  source(
    "lib",
    "ai",
    "content-assist",
    "internal-api-runtime.ts"
  );

const PLATFORM_ROUTE =
  source(
    "app",
    "api",
    "platform-admin",
    "ai",
    "content-translation",
    "route.ts"
  );

const TENANT_ROUTE =
  source(
    "app",
    "api",
    "admin",
    "reviews",
    "google",
    "reply-draft",
    "route.ts"
  );

describe(
  "AI internal route boundary",
  () => {
    it(
      "ships two physically separate POST routes",
      () => {
        expect(
          PLATFORM_ROUTE
        ).toContain(
          "handlePlatformAdminContentTranslationRequest"
        );

        expect(
          TENANT_ROUTE
        ).toContain(
          "handleTenantGoogleReviewReplyRequest"
        );

        for (
          const route of [
            PLATFORM_ROUTE,
            TENANT_ROUTE,
          ]
        ) {
          expect(
            route
          ).toContain(
            'export const runtime =\n  "nodejs"'
          );

          expect(
            route
          ).toContain(
            'export const dynamic =\n  "force-dynamic"'
          );
        }
      }
    );

    it(
      "does not create a generic tenant AI endpoint",
      () => {
        expect(
          existsSync(
            join(
              process.cwd(),
              "app",
              "api",
              "admin",
              "ai",
              "route.ts"
            )
          )
        ).toBe(false);

        expect(
          existsSync(
            join(
              process.cwd(),
              "app",
              "api",
              "ai",
              "content-assist",
              "route.ts"
            )
          )
        ).toBe(false);
      }
    );

    it(
      "wires production server adapters into the controlled runtime factory",
      () => {
        for (
          const marker of [
            "createAiContentAssistInternalApiHandlers",
            "resolvePlatformAdminTranslationAuth",
            "resolveTenantGoogleReviewReplyAuth",
            "readAiContentAssistJsonBody",
            "loadGoogleReviewReplyContext",
            "loadAiContentAssistUsageSnapshot",
            "invokeAiContentAssistForBusiness",
            "withRequestId",
          ]
        ) {
          expect(
            SERVER_SOURCE
          ).toContain(
            marker
          );
        }

        expect(
          SERVER_SOURCE
        ).toContain(
          'import "server-only"'
        );
      }
    );

    it(
      "keeps request parsing and HTTP orchestration in the runtime boundary",
      () => {
        for (
          const marker of [
            "parsePlatformAdminTranslationCommand",
            "parseTenantGoogleReviewReplyCommand",
            "getAiContentAssistHttpStatus",
            "toAiContentAssistApiEnvelope",
            "resolvePlatformAuth",
            "resolveTenantAuth",
            "loadReviewContext",
            "loadUsage",
            "invoke",
          ]
        ) {
          expect(
            RUNTIME_SOURCE
          ).toContain(
            marker
          );
        }

        expect(
          RUNTIME_SOURCE
        ).not.toContain(
          'import "server-only"'
        );
      }
    );

    it(
      "does not persist content, replies or usage",
      () => {
        for (
          const marker of [
            ".insert(",
            ".update(",
            ".upsert(",
            ".delete(",
            ".rpc(",
          ]
        ) {
          expect(
            SERVER_SOURCE
          ).not.toContain(
            marker
          );

          expect(
            RUNTIME_SOURCE
          ).not.toContain(
            marker
          );
        }
      }
    );

    it(
      "does not log raw review text",
      () => {
        for (
          const inspectedSource of [
            SERVER_SOURCE,
            RUNTIME_SOURCE,
          ]
        ) {
          expect(
            inspectedSource
          ).not.toContain(
            "console."
          );

          expect(
            inspectedSource
          ).not.toContain(
            "review.body"
          );
        }
      }
    );
  }
);
