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
) {
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
  "reviews public submission contract",
  () => {
    const migration =
      readSource(
        "supabase/migrations/026_reviews_public_submission.sql"
      );

    it.each([
      "create or replace function public.submit_direct_review",
      "create or replace function public.get_review_invitation_context",
      "create or replace function public.submit_verified_review",
      "security definer",
      "for update of review_invitations",
      "to service_role",
      "REVIEW_SUBMISSION_NOT_AVAILABLE",
      "REVIEW_LINK_INVALID",
    ])(
      "contains database trust marker %s",
      (
        marker
      ) => {
        expect(
          migration.toLowerCase()
        ).toContain(
          marker.toLowerCase()
        );
      }
    );

    it(
      "does not grant public RPC execution",
      () => {
        expect(
          migration
        ).not.toMatch(
          /grant\s+execute[\s\S]{0,180}to\s+(?:anon|authenticated)/i
        );
      }
    );

    const directRoute =
      readSource(
        "app/api/reviews/route.ts"
      );

    const verifiedRoute =
      readSource(
        "app/api/reviews/invitations/[token]/route.ts"
      );

    it.each([
      [
        directRoute,
        "submit_direct_review",
      ],
      [
        verifiedRoute,
        "get_review_invitation_context",
      ],
      [
        verifiedRoute,
        "submit_verified_review",
      ],
    ])(
      "connects route to RPC",
      (
        source,
        rpcName
      ) => {
        expect(
          source
        ).toContain(
          rpcName
        );
      }
    );

    it.each([
      directRoute,
      verifiedRoute,
    ])(
      "uses rate-limit and monitoring boundaries",
      (
        source
      ) => {
        expect(
          source
        ).toContain(
          "consumeRateLimit"
        );

        expect(
          source
        ).toContain(
          "createRequestId"
        );

        expect(
          source
        ).not.toContain(
          "console."
        );
      }
    );

    it(
      "hashes the verified bearer before database access",
      () => {
        expect(
          verifiedRoute
        ).toContain(
          "hashReviewInvitationToken"
        );

        expect(
          verifiedRoute
        ).not.toMatch(
          /p_token_hash:\s*rawToken/
        );
      }
    );

    it(
      "ships a read-only database verification",
      () => {
        const verification =
          readSource(
            "supabase/verification/verify_reviews_public_submission.sql"
          );

        expect(
          verification
        ).toContain(
          "set local transaction read only"
        );

        expect(
          verification
        ).toContain(
          "'PASS' as reviews_public_submission_status"
        );
      }
    );
  }
);
