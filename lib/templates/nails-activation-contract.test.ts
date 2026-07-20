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

import {
  getRecommendedStarterPackTemplate,
} from "@/lib/content-starter-packs/provisioning";

function source(
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
  "Nails theme activation contract",
  () => {
    const migration =
      source(
        "supabase/migrations/032_add_nails_theme_pack.sql"
      );
    const verification =
      source(
        "supabase/verification/verify_nails_theme_pack.sql"
      );
    const runbook =
      source(
        "docs/qa/DEMO-THEME-NAILS-01C-DB-RUNBOOK.md"
      );

    it(
      "recommends the dedicated Nails renderer for future Nails starter packs",
      () => {
        expect(
          getRecommendedStarterPackTemplate(
            "nails"
          )
        ).toBe(
          "nails-soft"
        );
      }
    );

    it.each([
      "'hair-luxury'",
      "'hair-editorial'",
      "'barber-heritage'",
      "'nails-soft'",
    ])(
      "keeps supported database template key %s",
      (
        templateKey
      ) => {
        expect(
          migration
        ).toContain(
          templateKey
        );
      }
    );

    it(
      "changes only the named businesses template constraint",
      () => {
        expect(
          migration
        ).toContain(
          "alter table public.businesses"
        );
        expect(
          migration
        ).toContain(
          "businesses_template_key_supported_check"
        );
        expect(
          migration
        ).not.toMatch(
          /\b(?:delete|truncate|drop\s+table|drop\s+column|update|insert)\b/i
        );
        expect(
          migration
        ).not.toContain(
          "platform_admin_rbac"
        );
      }
    );

    it(
      "ships a read-only verification with an explicit PASS marker",
      () => {
        expect(
          verification
        ).toContain(
          "set local transaction read only"
        );
        expect(
          verification
        ).toContain(
          "pg_get_constraintdef"
        );
        expect(
          verification
        ).toContain(
          "'PASS' as nails_theme_pack_status"
        );
        expect(
          verification.trimEnd()
        ).toMatch(
          /rollback;$/
        );
      }
    );

    it(
      "documents the applied 032 scope, pending verification and tenant-safe rollback",
      () => {
        expect(
          runbook
        ).toContain(
          "ne koristiti običan `supabase db push`"
        );
        expect(
          runbook
        ).toContain(
          "supabase/pending/029_platform_admin_rbac_foundation.sql"
        );
        expect(
          runbook
        ).toContain(
          "Pre rollback-a nijedan tenant ne sme koristiti `nails-soft`"
        );
        expect(
          runbook
        ).toContain(
          "primenio samo `032`"
        );
        expect(
          runbook
        ).toContain(
          "formalni read-only verification output"
        );
        expect(
          runbook
        ).toContain(
          "Ne ponavljati push"
        );
      }
    );
  }
);
