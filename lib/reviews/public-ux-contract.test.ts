import {
  readFileSync,
} from "node:fs";
import {
  resolve,
} from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

function readSource(
  path: string
): string {
  return readFileSync(
    resolve(
      process.cwd(),
      path
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );
}

describe(
  "review public UX contract",
  () => {
    const directPage =
      readSource(
        "app/reviews/[businessSlug]/page.tsx"
      );

    const verifiedPage =
      readSource(
        "app/reviews/invitation/[token]/page.tsx"
      );

    const component =
      readSource(
        "components/reviews/PublicReviewExperience.tsx"
      );

    const loader =
      readSource(
        "lib/reviews/public-page.ts"
      );

    it(
      "ships direct and verified public routes",
      () => {
        expect(
          directPage
        ).toContain(
          'mode="direct"'
        );

        expect(
          verifiedPage
        ).toContain(
          'mode="verified"'
        );

        expect(
          directPage
        ).toContain(
          "loadDirectReviewPageContext"
        );

        expect(
          verifiedPage
        ).toContain(
          "loadVerifiedReviewPageContext"
        );
      }
    );

    it.each([
      "UI_LOCALE_CODES",
      "getLocaleDefinition",
      "type=\"radio\"",
      "maxLength={2000}",
      "aria-live=\"assertive\"",
      "autoComplete=\"off\"",
      "RATE_LIMITED",
      "REVIEW_ALREADY_SUBMITTED",
      "REVIEW_LINK_INVALID",
    ])(
      "contains public UX marker %s",
      (
        marker
      ) => {
        expect(
          component
        ).toContain(
          marker
        );
      }
    );

    it(
      "submits only through reviewed API boundaries",
      () => {
        expect(
          component
        ).toContain(
          '"/api/reviews"'
        );

        expect(
          component
        ).toContain(
          "/api/reviews/invitations/"
        );

        expect(
          component
        ).not.toContain(
          "createAdminClient"
        );

        expect(
          component
        ).not.toContain(
          ".from(\"reviews\")"
        );
      }
    );

    it(
      "hashes verified token before database access and does not log the raw bearer",
      () => {
        const hashIndex =
          loader.indexOf(
            "hashReviewInvitationToken"
          );

        const rpcIndex =
          loader.indexOf(
            "get_review_invitation_context"
          );

        expect(
          hashIndex
        ).toBeGreaterThanOrEqual(
          0
        );

        expect(
          rpcIndex
        ).toBeGreaterThan(
          hashIndex
        );

        expect(
          loader
        ).not.toMatch(
          /logServerError\([\s\S]{0,500}\btoken\b/
        );
      }
    );

    it(
      "marks public review pages as non-indexable",
      () => {
        expect(
          directPage
        ).toContain(
          "index: false"
        );

        expect(
          verifiedPage
        ).toContain(
          "index: false"
        );
      }
    );

    it(
      "ships a shared loading state",
      () => {
        const loading =
          readSource(
            "app/reviews/loading.tsx"
          );

        expect(
          loading
        ).toContain(
          'role="status"'
        );

        expect(
          loading
        ).toContain(
          'aria-live="polite"'
        );
      }
    );
  }
);
