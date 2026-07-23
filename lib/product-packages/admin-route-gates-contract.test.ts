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
  ).replace(
    /\r\n/g,
    "\n"
  );
}

const LAYOUT_SOURCE =
  readSource(
    "app",
    "admin",
    "(protected)",
    "layout.tsx"
  );

const SHELL_SOURCE =
  readSource(
    "components",
    "admin",
    "AdminShell.tsx"
  );

const REVIEW_ATTENTION_ROUTE_SOURCE =
  readSource(
    "app",
    "api",
    "admin",
    "review-attention",
    "route.ts"
  );

const NAVIGATION_SOURCE =
  readSource(
    "lib",
    "admin",
    "admin-navigation.ts"
  );

const GALLERY_PAGE_SOURCE =
  readSource(
    "app",
    "admin",
    "(protected)",
    "gallery",
    "page.tsx"
  );

const REVIEWS_PAGE_SOURCE =
  readSource(
    "app",
    "admin",
    "(protected)",
    "reviews",
    "page.tsx"
  );

const UPGRADE_NOTICE_SOURCE =
  readSource(
    "components",
    "admin",
    "ProductFeatureUpgradeNotice.tsx"
  );

describe(
  "tenant-admin route gate integration contract",
  () => {
    it(
      "loads package access once in the protected admin layout",
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
        ).toMatch(
          /featureKey:\s*"admin\.reviews"/
        );
      }
    );

    it(
      "defers and gates the reviews badge query",
      () => {
        expect(
          LAYOUT_SOURCE
        ).toMatch(
          /reviewsEnabled\s*=\s*{\s*reviewsDecision\.allowed\s*}/
        );

        expect(
          LAYOUT_SOURCE
        ).not.toContain(
          "getAdminReviewAttentionCount"
        );

        expect(
          REVIEW_ATTENTION_ROUTE_SOURCE
        ).toMatch(
          /reviewsDecision\.allowed[\s\S]*getAdminReviewAttentionCount\s*\(/
        );
      }
    );

    it(
      "keeps locked navigation routes clickable through the central registry",
      () => {
        expect(
          SHELL_SOURCE
        ).toContain(
          "resolveProductFeatureGate"
        );

        expect(
          SHELL_SOURCE
        ).toMatch(
          /blockedBy\s*===\s*[\n\s]*"package"/
        );

        expect(
          SHELL_SOURCE
        ).toContain(
          "Paket"
        );

        expect(
          NAVIGATION_SOURCE
        ).toContain(
          'href: "/admin/gallery"'
        );

        expect(
          NAVIGATION_SOURCE
        ).toContain(
          'href: "/admin/reviews"'
        );

        expect(
          SHELL_SOURCE
        ).toContain(
          "@/lib/admin/admin-navigation"
        );
      }
    );

    it(
      "gates gallery before loading gallery data",
      () => {
        expect(
          GALLERY_PAGE_SOURCE.indexOf(
            "await loadAdminProductFeatureContext("
          )
        ).toBeLessThan(
          GALLERY_PAGE_SOURCE.indexOf(
            "await getAdminGallery()"
          )
        );

        expect(
          GALLERY_PAGE_SOURCE
        ).toContain(
          '"admin.gallery"'
        );
      }
    );

    it(
      "gates reviews before loading review data",
      () => {
        expect(
          REVIEWS_PAGE_SOURCE.indexOf(
            "await loadAdminProductFeatureContext("
          )
        ).toBeLessThan(
          REVIEWS_PAGE_SOURCE.indexOf(
            "await getAdminReviewManagement()"
          )
        );

        expect(
          REVIEWS_PAGE_SOURCE
        ).toContain(
          '"admin.reviews"'
        );
      }
    );

    it(
      "renders a real locked state without a dead upgrade link",
      () => {
        expect(
          UPGRADE_NOTICE_SOURCE
        ).toContain(
          "getProductFeatureUpgradeGuidance"
        );

        expect(
          UPGRADE_NOTICE_SOURCE
        ).toContain(
          'href="/admin"'
        );

        expect(
          UPGRADE_NOTICE_SOURCE
        ).not.toContain(
          'href="/admin/upgrade"'
        );

        expect(
          UPGRADE_NOTICE_SOURCE
        ).not.toContain(
          'href="/billing"'
        );
      }
    );
  }
);
