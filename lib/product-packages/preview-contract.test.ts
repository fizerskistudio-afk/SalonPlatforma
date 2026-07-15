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

import {
  buildBusinessPublicLinks,
} from "@/lib/platform-admin/business-public-links";
import {
  PRODUCT_PACKAGE_KEYS,
} from "./registry";

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

const PLATFORM_BUSINESS_PAGE =
  readSource(
    "app",
    "platform-admin",
    "businesses",
    "[businessSlug]",
    "page.tsx"
  );

const ADMIN_GATE_SOURCE =
  readSource(
    "lib",
    "product-packages",
    "admin-gates-server.ts"
  );

const STAFF_GATE_SOURCE =
  readSource(
    "lib",
    "product-packages",
    "staff-gates-server.ts"
  );

describe(
  "platform-admin tenant preview contract",
  () => {
    it(
      "keeps preview as a public tenant URL with the preview query flag",
      () => {
        const links =
          buildBusinessPublicLinks(
            "preview-salon"
          );

        expect(
          links.previewUrl
        ).toBe(
          `${links.publicUrl}?preview=1`
        );

        expect(
          links.previewUrl
        ).not.toContain(
          "/admin"
        );

        expect(
          links.previewUrl
        ).not.toContain(
          "/staff"
        );
      }
    );

    it.each(
      PRODUCT_PACKAGE_KEYS
    )(
      "does not change preview link generation for %s",
      () => {
        const links =
          buildBusinessPublicLinks(
            "preview-salon"
          );

        expect(
          links.previewUrl.endsWith(
            "?preview=1"
          )
        ).toBe(true);
      }
    );

    it(
      "keeps the platform-admin management page wired to the preview URL",
      () => {
        expect(
          PLATFORM_BUSINESS_PAGE
        ).toMatch(
          /previewUrl=\{\s*publicLinks\.previewUrl\s*\}/
        );

        expect(
          PLATFORM_BUSINESS_PAGE
        ).toContain(
          "<BusinessPackageManager"
        );

        expect(
          PLATFORM_BUSINESS_PAGE
        ).toContain(
          "<BusinessPublicationControls"
        );
      }
    );

    it(
      "does not couple tenant preview generation to admin or staff gate helpers",
      () => {
        for (
          const source of [
            ADMIN_GATE_SOURCE,
            STAFF_GATE_SOURCE,
          ]
        ) {
          expect(
            source
          ).not.toContain(
            "buildBusinessPublicLinks"
          );

          expect(
            source
          ).not.toContain(
            "previewUrl"
          );
        }
      }
    );
  }
);
