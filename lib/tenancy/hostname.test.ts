import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  buildTenantPublicUrl,
  normalizeHostname,
  resolvePlatformHostname,
} from "./hostname";

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
  "normalizeHostname",
  () => {
    it.each([
      [
        "Mika-Berberin.LOCALHOST:3000",
        "mika-berberin.localhost",
      ],
      [
        "https://Example.COM/path",
        "example.com",
      ],
      [
        "tenant.example.com., proxy.example.com",
        "tenant.example.com",
      ],
      [
        "[::1]:3000",
        "::1",
      ],
      [
        null,
        "",
      ],
    ])(
      "normalizes %s",
      (
        input,
        expected
      ) => {
        expect(
          normalizeHostname(
            input
          )
        ).toBe(expected);
      }
    );
  }
);

describe(
  "resolvePlatformHostname",
  () => {
    it(
      "returns unconfigured without a root domain",
      () => {
        expect(
          resolvePlatformHostname(
            "mika.localhost",
            null
          )
        ).toEqual({
          kind:
            "unconfigured",
        });
      }
    );

    it(
      "recognizes root host",
      () => {
        expect(
          resolvePlatformHostname(
            "localhost:3000",
            "localhost:3000"
          )
        ).toEqual({
          kind:
            "root",
        });
      }
    );

    it(
      "recognizes tenant subdomain",
      () => {
        expect(
          resolvePlatformHostname(
            "mika-berberin.localhost:3000",
            "localhost:3000"
          )
        ).toEqual({
          kind:
            "tenant",
          businessSlug:
            "mika-berberin",
        });
      }
    );

    it(
      "recognizes reserved subdomain",
      () => {
        expect(
          resolvePlatformHostname(
            "admin.example.com",
            "example.com"
          )
        ).toEqual({
          kind:
            "reserved",
          subdomain:
            "admin",
        });
      }
    );

    it.each([
      "other-domain.com",
      "nested.tenant.example.com",
      "Invalid_Slug.example.com",
      "",
    ])(
      "rejects external or invalid host %s",
      (
        host
      ) => {
        expect(
          resolvePlatformHostname(
            host,
            "example.com"
          )
        ).toEqual({
          kind:
            "external",
        });
      }
    );
  }
);

describe(
  "buildTenantPublicUrl",
  () => {
    it(
      "falls back to path URL when root is not configured",
      () => {
        delete process.env
          .PLATFORM_ROOT_DOMAIN;

        expect(
          buildTenantPublicUrl(
            "mika-berberin"
          )
        ).toBe(
          "/salon/mika-berberin"
        );
      }
    );

    it(
      "builds localhost tenant URL with http",
      () => {
        process.env
          .PLATFORM_ROOT_DOMAIN =
            "localhost:3000";

        delete process.env
          .PLATFORM_ROOT_PROTOCOL;

        expect(
          buildTenantPublicUrl(
            "mika-berberin"
          )
        ).toBe(
          "http://mika-berberin.localhost:3000"
        );
      }
    );

    it(
      "uses configured production protocol",
      () => {
        process.env
          .PLATFORM_ROOT_DOMAIN =
            "example.com";

        process.env
          .PLATFORM_ROOT_PROTOCOL =
            "https";

        expect(
          buildTenantPublicUrl(
            "lumiere-studio"
          )
        ).toBe(
          "https://lumiere-studio.example.com"
        );
      }
    );

    it(
      "rejects invalid business slug",
      () => {
        expect(() =>
          buildTenantPublicUrl(
            "Invalid Slug"
          )
        ).toThrow(
          "Invalid business slug."
        );
      }
    );
  }
);
