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
  "review admin moderation source contract",
  () => {
    const migration =
      readSource(
        "supabase/migrations/028_review_moderation.sql"
      );

    it.each([
      "create table public.review_moderation_events",
      "create or replace function public.moderate_review",
      "create or replace function public.set_review_owner_reply",
      "for update",
      "business_members",
      "REVIEW_TRANSITION_NOT_ALLOWED",
      "REVIEW_REPLY_NOT_SUPPORTED",
    ])(
      "contains database marker %s",
      (marker) => {
        expect(
          migration
        ).toContain(
          marker
        );
      }
    );

    it(
      "does not grant anonymous moderation",
      () => {
        expect(
          migration
        ).not.toMatch(
          /grant\s+execute[\s\S]{0,140}to\s+anon/i
        );
      }
    );

    const actions =
      readSource(
        "app/admin/(protected)/reviews/actions.ts"
      );

    it.each([
      "requireAdmin",
      "moderate_review",
      "set_review_owner_reply",
      "createClient",
      "revalidatePath",
    ])(
      "connects server action marker %s",
      (marker) => {
        expect(
          actions
        ).toContain(
          marker
        );
      }
    );

    it(
      "does not mutate review author, rating or body",
      () => {
        expect(
          actions
        ).not.toContain(
          '.from("reviews")'
        );

        expect(
          actions
        ).not.toContain(
          "author_name"
        );

        expect(
          actions
        ).not.toContain(
          "rating:"
        );

        expect(
          actions
        ).not.toContain(
          "body:"
        );
      }
    );

    const manager =
      readSource(
        "components/admin/reviews/AdminReviewsManager.tsx"
      );

    it.each([
      "Negativna ocena sama po sebi nije razlog za odbijanje",
      "Potvrđena poseta",
      "Odgovor salona",
      "Traže pažnju",
      "aria-modal=\"true\"",
    ])(
      "contains moderation UI marker %s",
      (marker) => {
        expect(
          manager
        ).toContain(
          marker
        );
      }
    );

    const shell =
      readSource(
        "components/admin/AdminShell.tsx"
      );

    it(
      "adds review navigation and attention count",
      () => {
        expect(
          shell
        ).toContain(
          'href: "/admin/reviews"'
        );

        expect(
          shell
        ).toContain(
          "reviewAttentionCount"
        );
      }
    );

    const verification =
      readSource(
        "supabase/verification/verify_review_moderation.sql"
      );

    it(
      "ships read-only PASS verification",
      () => {
        expect(
          verification
        ).toContain(
          "set local transaction read only"
        );

        expect(
          verification
        ).toContain(
          "'PASS' as review_moderation_status"
        );
      }
    );
  }
);
