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
            "draft"
          )
        ).toBe(
          "tenant.unpublish"
        );

        expect(
          getPublicationPermission(
            "suspended"
          )
        ).toBe(
          "tenant.deactivate"
        );

        expect(
          getPublicationPermission(
            "archived"
          )
        ).toBe(
          "tenant.deactivate"
        );
      }
    );
  }
);
