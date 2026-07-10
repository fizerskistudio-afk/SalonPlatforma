import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DEFAULT_TEMPLATE_KEY,
  getTemplateManifest,
  getTemplateManifests,
  isTemplateKey,
  normalizeTemplateConfig,
  resolveTemplateKey,
} from "./registry";

describe(
  "template registry",
  () => {
    it.each([
      "hair-luxury",
      "hair-editorial",
      "barber-heritage",
    ])(
      "accepts registered key %s",
      (
        key
      ) => {
        expect(
          isTemplateKey(
            key
          )
        ).toBe(true);

        expect(
          resolveTemplateKey(
            key
          )
        ).toBe(key);
      }
    );

    it.each([
      null,
      undefined,
      "",
      "unknown-template",
      123,
    ])(
      "falls back for invalid key %s",
      (
        value
      ) => {
        expect(
          resolveTemplateKey(
            value
          )
        ).toBe(
          DEFAULT_TEMPLATE_KEY
        );
      }
    );

    it(
      "returns all unique manifests",
      () => {
        const manifests =
          getTemplateManifests();

        expect(
          manifests
        ).toHaveLength(3);

        expect(
          new Set(
            manifests.map(
              (
                manifest
              ) =>
                manifest.key
            )
          ).size
        ).toBe(3);
      }
    );

    it(
      "returns matching manifest",
      () => {
        expect(
          getTemplateManifest(
            "barber-heritage"
          )
        ).toMatchObject({
          key:
            "barber-heritage",
          businessType:
            "barber",
          supportsBooking:
            true,
        });
      }
    );

    it(
      "normalizes object config without mutating input",
      () => {
        const input = {
          hero: {
            visible:
              true,
          },
        };

        const normalized =
          normalizeTemplateConfig(
            input
          );

        expect(
          normalized
        ).toEqual(input);

        expect(
          normalized
        ).not.toBe(input);
      }
    );

    it.each([
      null,
      undefined,
      [],
      "config",
      1,
    ])(
      "normalizes invalid config %s to empty object",
      (
        value
      ) => {
        expect(
          normalizeTemplateConfig(
            value
          )
        ).toEqual({});
      }
    );
  }
);
