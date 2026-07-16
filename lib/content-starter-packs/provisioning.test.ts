import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createStarterPackServiceDrafts,
  materializeStarterPackProvisioning,
  StarterPackProvisioningError,
} from "./provisioning";

import {
  resolveStarterPackPreview,
} from "./preview";

describe(
  "starter pack provisioning",
  () => {
    it(
      "materializes a reviewed barber pack for the existing atomic RPC",
      () => {
        const preview =
          resolveStarterPackPreview({
            packId:
              "barber",
            locale:
              "sr-Latn",
            selectedModules: [
              "mens-grooming",
            ],
          });

        const serviceEdits =
          createStarterPackServiceDrafts(
            preview
          ).map(
            (
              service,
              index
            ) => ({
              ...service,
              priceFrom:
                1_200 +
                index *
                  100,
            })
          );

        const preset =
          materializeStarterPackProvisioning({
            packId:
              "barber",
            selectedModules: [
              "mens-grooming",
            ],
            locale:
              "sr-Latn",
            currency:
              "RSD",
            templateKey:
              "barber-heritage",
            applyKey:
              "123e4567-e89b-42d3-a456-426614174000",
            confirmed:
              true,
            serviceEdits,
          });

        expect(
          preset.presetKey
        ).toBe(
          "barber"
        );

        expect(
          preset.templateKey
        ).toBe(
          "barber-heritage"
        );

        expect(
          preset.counts.services
        ).toBe(
          preview.services.length
        );

        expect(
          preset
            .templateConfig
            .starterPack
            .selectedModules
        ).toEqual(
          expect.arrayContaining([
            "mens-grooming",
          ])
        );

        expect(
          preset.services[0]
            ?.priceFrom
        ).toBe(
          1_200
        );
      }
    );

    it(
      "excludes disabled services and empty categories",
      () => {
        const preview =
          resolveStarterPackPreview({
            packId:
              "nails",
            locale:
              "sr-Latn",
          });

        const drafts =
          createStarterPackServiceDrafts(
            preview
          ).map(
            (
              service,
              index
            ) => ({
              ...service,
              enabled:
                index ===
                0,
              priceFrom:
                2_000,
            })
          );

        const preset =
          materializeStarterPackProvisioning({
            packId:
              "nails",
            selectedModules:
              [],
            locale:
              "sr-Latn",
            currency:
              "RSD",
            templateKey:
              "hair-editorial",
            applyKey:
              "223e4567-e89b-42d3-a456-426614174000",
            confirmed:
              true,
            serviceEdits:
              drafts,
          });

        expect(
          preset.counts.services
        ).toBe(
          1
        );

        expect(
          preset.counts.categories
        ).toBe(
          1
        );
      }
    );

    it(
      "requires an exact reviewed edit for every source service",
      () => {
        const preview =
          resolveStarterPackPreview({
            packId:
              "hair-salon",
            locale:
              "sr-Latn",
          });

        const drafts =
          createStarterPackServiceDrafts(
            preview
          )
            .slice(
              1
            )
            .map(
              (
                service
              ) => ({
                ...service,
                priceFrom:
                  1_000,
              })
            );

        expect(
          () =>
            materializeStarterPackProvisioning({
              packId:
                "hair-salon",
              selectedModules:
                [],
              locale:
                "sr-Latn",
              currency:
                "RSD",
              templateKey:
                "hair-luxury",
              applyKey:
                "323e4567-e89b-42d3-a456-426614174000",
              confirmed:
                true,
              serviceEdits:
                drafts,
            })
        ).toThrowError(
          StarterPackProvisioningError
        );
      }
    );

    it(
      "requires explicit confirmation before any apply payload exists",
      () => {
        const preview =
          resolveStarterPackPreview({
            packId:
              "beauty-general",
            locale:
              "sr-Latn",
          });

        expect(
          () =>
            materializeStarterPackProvisioning({
              packId:
                "beauty-general",
              selectedModules:
                [],
              locale:
                "sr-Latn",
              currency:
                "RSD",
              templateKey:
                "hair-luxury",
              applyKey:
                "423e4567-e89b-42d3-a456-426614174000",
              confirmed:
                false,
              serviceEdits:
                createStarterPackServiceDrafts(
                  preview
                ),
            })
        ).toThrowError(
          expect.objectContaining({
            code:
              "STARTER_PACK_CONFIRMATION_REQUIRED",
          })
        );
      }
    );
  }
);
