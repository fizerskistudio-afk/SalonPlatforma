import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getAuthFailureLoginPath,
  getPlatformAdminPermissions,
  getPlatformAdminRoleForEmail,
  getSafeAuthNextPath,
  getSafePlatformAdminNextPath,
  hasPlatformAdminPermission,
  isPlatformAdminRole,
  isPlatformAdminPath,
  normalizePlatformAdminEmail,
} from "@/lib/auth/platform-admin-policy";

describe(
  "platform-admin policy",
  () => {
    it(
      "normalizes platform-admin email values",
      () => {
        expect(
          normalizePlatformAdminEmail(
            "  Owner@Example.COM "
          )
        ).toBe(
          "owner@example.com"
        );
      }
    );

    it(
      "maps only an explicitly configured email to the legacy super-admin role",
      () => {
        const configuredEmails =
          "first@example.com, OWNER@example.com";

        expect(
          getPlatformAdminRoleForEmail(
            " owner@EXAMPLE.com ",
            configuredEmails
          )
        ).toBe(
          "super_admin"
        );

        expect(
          getPlatformAdminRoleForEmail(
            "owner@example.co",
            configuredEmails
          )
        ).toBeNull();
      }
    );

    it(
      "fails closed when email or configuration is missing",
      () => {
        expect(
          getPlatformAdminRoleForEmail(
            null,
            "owner@example.com"
          )
        ).toBeNull();

        expect(
          getPlatformAdminRoleForEmail(
            "owner@example.com",
            undefined
          )
        ).toBeNull();
      }
    );

    it.each([
      "super_admin",
      "sales",
      "launch_manager",
      "it",
    ])(
      "recognizes the supported %s role",
      (role) => {
        expect(
          isPlatformAdminRole(
            role
          )
        ).toBe(true);
      }
    );

    it(
      "gives super-admin every registered permission",
      () => {
        expect(
          getPlatformAdminPermissions(
            "super_admin"
          )
        ).toContain(
          "platform.members.manage"
        );

        expect(
          getPlatformAdminPermissions(
            "super_admin"
          )
        ).toContain(
          "tenant.publish"
        );

        expect(
          getPlatformAdminPermissions(
            "super_admin"
          )
        ).toContain(
          "tenant.content.translate"
        );
      }
    );

    it(
      "allows Sales to build previews but never publish or manage owner access",
      () => {
        expect(
          hasPlatformAdminPermission(
            "sales",
            "tenant.create"
          )
        ).toBe(true);

        expect(
          hasPlatformAdminPermission(
            "sales",
            "tenant.package.read"
          )
        ).toBe(true);

        expect(
          hasPlatformAdminPermission(
            "sales",
            "tenant.package.write"
          )
        ).toBe(true);

        expect(
          hasPlatformAdminPermission(
            "sales",
            "tenant.preview.share"
          )
        ).toBe(true);

        expect(
          hasPlatformAdminPermission(
            "sales",
            "tenant.content.translate"
          )
        ).toBe(true);

        expect(
          hasPlatformAdminPermission(
            "sales",
            "tenant.publish"
          )
        ).toBe(false);

        expect(
          hasPlatformAdminPermission(
            "sales",
            "tenant.owner_access.write"
          )
        ).toBe(false);
      }
    );

    it(
      "reserves lifecycle release controls for launch managers and super-admins",
      () => {
        for (
          const role of [
            "launch_manager",
            "super_admin",
          ] as const
        ) {
          expect(
            hasPlatformAdminPermission(
              role,
              "tenant.publish"
            )
          ).toBe(true);

          expect(
            hasPlatformAdminPermission(
              role,
              "tenant.deactivate"
            )
          ).toBe(true);
        }
      }
    );

    it(
      "keeps IT read-oriented with monitoring access and no tenant mutations",
      () => {
        expect(
          hasPlatformAdminPermission(
            "it",
            "platform.monitoring.read"
          )
        ).toBe(true);

        expect(
          hasPlatformAdminPermission(
            "it",
            "tenant.read"
          )
        ).toBe(true);

        expect(
          hasPlatformAdminPermission(
            "it",
            "tenant.package.read"
          )
        ).toBe(true);

        expect(
          hasPlatformAdminPermission(
            "it",
            "tenant.package.write"
          )
        ).toBe(false);

        expect(
          hasPlatformAdminPermission(
            "it",
            "tenant.profile.write"
          )
        ).toBe(false);

        expect(
          hasPlatformAdminPermission(
            "it",
            "tenant.content.translate"
          )
        ).toBe(false);
      }
    );

    it(
      "recognizes only the platform-admin route boundary",
      () => {
        expect(
          isPlatformAdminPath(
            "/platform-admin"
          )
        ).toBe(true);

        expect(
          isPlatformAdminPath(
            "/platform-admin/businesses/demo"
          )
        ).toBe(true);

        expect(
          isPlatformAdminPath(
            "/platform-administrator"
          )
        ).toBe(false);
      }
    );

    it(
      "routes callback failures to the matching login boundary",
      () => {
        expect(
          getAuthFailureLoginPath(
            "/platform-admin/businesses/demo"
          )
        ).toBe(
          "/platform-admin/login"
        );

        expect(
          getAuthFailureLoginPath(
            "/admin/change-password"
          )
        ).toBe(
          "/admin/login"
        );
      }
    );

    it(
      "keeps only a same-origin auth callback destination",
      () => {
        expect(
          getSafeAuthNextPath(
            "/admin/change-password?source=recovery"
          )
        ).toBe(
          "/admin/change-password?source=recovery"
        );

        expect(
          getSafeAuthNextPath(
            "/\\evil.example/path"
          )
        ).toBe(
          "/admin"
        );

        expect(
          getSafeAuthNextPath(
            "https://evil.example/platform-admin"
          )
        ).toBe(
          "/admin"
        );
      }
    );

    it(
      "keeps a safe platform-admin destination including its query",
      () => {
        expect(
          getSafePlatformAdminNextPath(
            "/platform-admin/businesses/demo?tab=access"
          )
        ).toBe(
          "/platform-admin/businesses/demo?tab=access"
        );
      }
    );

    it.each([
      undefined,
      "",
      "https://example.com/platform-admin",
      "//example.com/platform-admin",
      "/admin",
      "/platform-administrator",
      "/platform-admin/login",
      "/platform-admin/forbidden?reason=role",
    ])(
      "falls back for unsafe next destination %s",
      (value) => {
        expect(
          getSafePlatformAdminNextPath(
            value
          )
        ).toBe(
          "/platform-admin"
        );
      }
    );
  }
);
