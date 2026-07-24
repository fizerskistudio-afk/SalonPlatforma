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
    "app/api/admin/google-calendar/connect/route.ts",
    "utf8"
  );

describe(
  "Google Calendar admin connect tenant context contract",
  () => {
    it(
      "uses the selected admin tenant context",
      () => {
        expect(source).toMatch(
          /import\s*\{\s*requireAdmin\s*,?\s*\}\s*from\s*["']@\/lib\/auth\/admin["']/
        );
        expect(source).toMatch(
          /const\s+admin\s*=\s*await\s+requireAdmin\s*\(\s*\)/
        );
        expect(source).toMatch(
          /businessId\s*:\s*admin\.business\.id/
        );
        expect(source).toMatch(
          /userId\s*:\s*admin\.userId/
        );
        expect(source).toMatch(
          /loginHint\s*:\s*admin\.email/
        );
      }
    );

    it(
      "does not select an arbitrary owner or manager membership",
      () => {
        expect(source).not.toContain("business_members");
        expect(source).not.toContain(".limit(1)");
        expect(source).not.toContain("membership.business_id");
        expect(source).not.toContain("createAdminClient");
        expect(source).not.toContain("createClient");
      }
    );

    it(
      "keeps OAuth state bound to the authenticated admin",
      () => {
        expect(source).toContain(
          'target:\n        "business"'
        );
        expect(source).toContain(
          "salon_google_calendar_oauth_nonce"
        );
        expect(source).toContain(
          "salon_google_calendar_oauth_target"
        );
        expect(source).toContain(
          "/api/admin/google-calendar/callback"
        );
      }
    );
  }
);
