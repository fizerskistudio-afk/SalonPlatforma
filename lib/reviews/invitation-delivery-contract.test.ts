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
  "review invitation delivery contract",
  () => {
    const migration =
      readSource(
        "supabase/migrations/027_review_invitation_delivery.sql"
      );

    it.each([
      "create table public.review_invitation_jobs",
      "bookings_queue_review_invitation",
      "after update of status",
      "claim_due_review_invitation_jobs",
      "for update skip locked",
      "prepare_review_invitation_delivery",
      "complete_review_invitation_delivery",
      "to service_role",
      "delete from public.review_invitations",
    ])(
      "contains database marker %s",
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
      "does not grant worker RPCs to public roles",
      () => {
        expect(
          migration
        ).not.toMatch(
          /grant\s+execute[\s\S]{0,180}to\s+(?:anon|authenticated)/i
        );
      }
    );

    const delivery =
      readSource(
        "lib/reviews/invitation-delivery.ts"
      );

    it.each([
      "generateReviewInvitationToken",
      "hashReviewInvitationToken",
      "sendNotificationEmail",
      "claim_due_review_invitation_jobs",
      "prepare_review_invitation_delivery",
      "complete_review_invitation_delivery",
      "review_invitation",
    ])(
      "connects worker marker %s",
      (
        marker
      ) => {
        expect(
          delivery
        ).toContain(
          marker
        );
      }
    );

    it(
      "never places the raw token in delivery metadata or logs",
      () => {
        expect(
          delivery
        ).not.toMatch(
          /metadata:\s*\{[\s\S]{0,500}rawToken/
        );

        expect(
          delivery
        ).not.toMatch(
          /logServer(?:Event|Error)\([\s\S]{0,500}rawToken/
        );
      }
    );

    const cron =
      readSource(
        "app/api/cron/review-invitations/route.ts"
      );

    it.each([
      "CRON_SECRET",
      "timingSafeEqual",
      "processReviewInvitationJobs",
      "Cache-Control",
    ])(
      "protects cron with %s",
      (
        marker
      ) => {
        expect(
          cron
        ).toContain(
          marker
        );
      }
    );

    const verification =
      readSource(
        "supabase/verification/verify_review_invitation_delivery.sql"
      );

    it(
      "ships read-only verification",
      () => {
        expect(
          verification
        ).toContain(
          "set local transaction read only"
        );

        expect(
          verification
        ).toContain(
          "'PASS' as review_invitation_delivery_status"
        );
      }
    );
  }
);
