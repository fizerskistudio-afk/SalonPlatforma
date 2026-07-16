import {
  describe,
  expect,
  it,
} from "vitest";

import {
  StarterPackPreviewError,
  resolveStarterPackPreview,
} from "./preview";

describe(
  "content starter pack preview",
  () => {
    it(
      "merges universal core with a vertical manifest",
      () => {
        const preview =
          resolveStarterPackPreview({
            packId:
              "hair-salon",
            selectedModules: [
              "bridal-services",
            ],
          });

        expect(
          preview.mode
        ).toBe(
          "preview_only"
        );

        expect(
          preview.applyAllowed
        ).toBe(
          false
        );

        expect(
          preview.publishAllowed
        ).toBe(
          false
        );

        expect(
          preview.requiresOwnerConfirmation
        ).toBe(
          true
        );

        expect(
          preview.policies.some(
            (
              item
            ) =>
              item.key ===
              "cancellation"
          )
        ).toBe(
          true
        );

        expect(
          preview.contentSections.some(
            (
              item
            ) =>
              item.key ===
              "hero"
          )
        ).toBe(
          true
        );

        expect(
          preview.modules.find(
            (
              item
            ) =>
              item
                .definition
                .id ===
              "bridal-services"
          )
        ).toMatchObject({
          selected:
            true,
          support:
            "optional",
        });
      }
    );

    it(
      "automatically selects required safety modules",
      () => {
        const preview =
          resolveStarterPackPreview({
            packId:
              "laser-hair-removal",
          });

        const selected =
          preview.modules
            .filter(
              (
                item
              ) =>
                item.selected
            )
            .map(
              (
                item
              ) =>
                item
                  .definition
                  .id
            );

        expect(
          selected
        ).toEqual(
          expect.arrayContaining([
            "aftercare",
            "consent",
            "device-booking",
            "health-intake",
            "patch-test",
            "resource-booking",
          ])
        );

        expect(
          preview.warnings.join(
            " "
          )
        ).toContain(
          "resource booking"
        );
      }
    );

    it(
      "rejects unsupported module selection",
      () => {
        expect(
          () =>
            resolveStarterPackPreview({
              packId:
                "solarium",
              selectedModules: [
                "bridal-services",
              ],
            })
        ).toThrowError(
          StarterPackPreviewError
        );

        try {
          resolveStarterPackPreview({
            packId:
              "solarium",
            selectedModules: [
              "bridal-services",
            ],
          });
        } catch (
          error
        ) {
          expect(
            error
          ).toMatchObject({
            code:
              "STARTER_PACK_MODULE_UNSUPPORTED",
          });
        }
      }
    );

    it(
      "returns a clone so preview edits do not mutate the registry",
      () => {
        const first =
          resolveStarterPackPreview({
            packId:
              "nails",
          });

        const originalName =
          first
            .services[0]
            ?.name;

        if (
          first.services[0]
        ) {
          first
            .services[0]
            .name =
              "Lokalna preview izmena";
        }

        const second =
          resolveStarterPackPreview({
            packId:
              "nails",
          });

        expect(
          second
            .services[0]
            ?.name
        ).toBe(
          originalName
        );
      }
    );
  }
);
