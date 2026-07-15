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
      "skips the reviews badge query when the package does not include reviews",
      () => {
        const decisionIndex =
          LAYOUT_SOURCE.indexOf(
            "reviewsDecision"
          );

        const countIndex =
          LAYOUT_SOURCE.indexOf(
            "await getAdminReviewAttentionCount("
          );

        expect(
          decisionIndex
        ).toBeGreaterThan(
          -1
        );

        expect(
          countIndex
        ).toBeGreaterThan(
          decisionIndex
        );

        expect(
          LAYOUT_SOURCE
        ).toContain(
          "reviewsDecision.allowed"
        );
      }
    );

    it(
      "keeps locked navigation routes clickable and marks them as package features",
      () => {
        expect(
          SHELL_SOURCE
        ).toContain(
          "resolveProductFeatureGate"
        );

        expect(
          SHELL_SOURCE
        ).toMatch(
          /blockedBy\s*===\s*"package"/
        );

        expect(
          SHELL_SOURCE
        ).toContain(
          "Paket"
        );

        expect(
          SHELL_SOURCE
        ).toContain(
          'href: "/admin/gallery"'
        );

        expect(
          SHELL_SOURCE
        ).toContain(
          'href: "/admin/reviews"'
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
