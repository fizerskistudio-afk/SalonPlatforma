import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getPublicationPermission,
} from "@/lib/platform-admin/publication-permissions";

describe(
  "platform-admin publication permissions",
  () => {
    it(
      "requires an explicit release permission for published status",
      () => {
        expect(
          getPublicationPermission(
            "draft",
            "published"
          )
        ).toBe(
          "tenant.publish"
        );
      }
    );

    it(
      "separates unpublish from destructive lifecycle controls",
      () => {
        expect(
          getPublicationPermission(
            "published",
            "draft"
          )
        ).toBe(
          "tenant.unpublish"
        );

        expect(
          getPublicationPermission(
            "published",
            "suspended"
          )
        ).toBe(
          "tenant.deactivate"
        );

        expect(
          getPublicationPermission(
            "published",
            "archived"
          )
        ).toBe(
          "tenant.deactivate"
        );
      }
    );

    it(
      "requires reactivation permission when restoring a deactivated tenant",
      () => {
        expect(
          getPublicationPermission(
            "suspended",
            "draft"
          )
        ).toBe(
          "tenant.reactivate"
        );

        expect(
          getPublicationPermission(
            "archived",
            "draft"
          )
        ).toBe(
          "tenant.reactivate"
        );
      }
    );
  }
);
