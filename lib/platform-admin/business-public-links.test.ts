import React from "react";
import {
  renderToStaticMarkup,
} from "react-dom/server";
import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";

import BusinessPublicLinkActions from "@/components/platform-admin/BusinessPublicLinkActions";
import PlatformAdminAccessProvider from "@/components/platform-admin/PlatformAdminAccessProvider";
import {
  getPlatformAdminPermissions,
} from "@/lib/auth/platform-admin-policy";

import {
  buildBusinessPublicLinks,
} from "./business-public-links";

const originalRootDomain =
  process.env
    .PLATFORM_ROOT_DOMAIN;

const originalProtocol =
  process.env
    .PLATFORM_ROOT_PROTOCOL;

afterEach(() => {
  if (
    originalRootDomain ===
    undefined
  ) {
    delete process.env
      .PLATFORM_ROOT_DOMAIN;
  } else {
    process.env
      .PLATFORM_ROOT_DOMAIN =
        originalRootDomain;
  }

  if (
    originalProtocol ===
    undefined
  ) {
    delete process.env
      .PLATFORM_ROOT_PROTOCOL;
  } else {
    process.env
      .PLATFORM_ROOT_PROTOCOL =
        originalProtocol;
  }
});

describe(
  "buildBusinessPublicLinks",
  () => {
    it(
      "builds canonical public and preview URLs",
      () => {
        process.env
          .PLATFORM_ROOT_DOMAIN =
            "localhost:3000";

        delete process.env
          .PLATFORM_ROOT_PROTOCOL;

        expect(
          buildBusinessPublicLinks(
            "lumiere-studio"
          )
        ).toEqual({
          publicUrl:
            "http://lumiere-studio.localhost:3000",
          previewUrl:
            "http://lumiere-studio.localhost:3000?preview=1",
        });
      }
    );

    it(
      "renders the canonical URL in initial HTML before hydration",
      () => {
        const publicUrl =
          "http://lumiere-studio.localhost:3000";

        const html =
          renderToStaticMarkup(
            React.createElement(
              PlatformAdminAccessProvider,
              {
                access: {
                  role:
                    "super_admin",
                  permissions:
                    getPlatformAdminPermissions(
                      "super_admin"
                    ),
                },
              },
              React.createElement(
                BusinessPublicLinkActions,
                {
                  businessSlug:
                    "lumiere-studio",
                  publicUrl,
                  isActive:
                    true,
                }
              )
            )
          );

        expect(
          html
        ).toContain(
          `href="${publicUrl}"`
        );

        expect(
          html
        ).toContain(
          ">http://lumiere-studio.localhost:3000<"
        );

        expect(
          html
        ).not.toContain(
          'href="/salon/lumiere-studio"'
        );
      }
    );
  }
);
