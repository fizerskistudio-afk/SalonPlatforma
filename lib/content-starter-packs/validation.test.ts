import {
  describe,
  expect,
  it,
} from "vitest";

import {
  STARTER_PACK_MANIFESTS,
} from "./vertical-manifests";
import {
  validateStarterPackRegistry,
} from "./validation";

describe(
  "content starter pack validation",
  () => {
    it(
      "validates all references and module support",
      () => {
        expect(
          validateStarterPackRegistry()
        ).toEqual(
          []
        );
      }
    );

    it(
      "keeps resource-heavy packs behind declared capability modules",
      () => {
        for (
          const pack of
          STARTER_PACK_MANIFESTS.filter(
            (
              item
            ) =>
              item.resources.length >
              0
          )
        ) {
          expect(
            [
              pack
                .moduleSupport[
                  "resource-booking"
                ],
              pack
                .moduleSupport[
                  "device-booking"
                ],
            ]
          ).not.toEqual([
            "unsupported",
            "unsupported",
          ]);
        }
      }
    );

    it(
      "marks safety-sensitive laser and solarium modules explicitly",
      () => {
        const laser =
          STARTER_PACK_MANIFESTS.find(
            (
              item
            ) =>
              item.id ===
              "laser-hair-removal"
          );

        const solarium =
          STARTER_PACK_MANIFESTS.find(
            (
              item
            ) =>
              item.id ===
              "solarium"
          );

        expect(
          laser
        ).toBeDefined();

        expect(
          solarium
        ).toBeDefined();

        expect(
          laser
            ?.moduleSupport[
              "patch-test"
            ]
        ).toBe(
          "required"
        );

        expect(
          laser
            ?.moduleSupport[
              "consent"
            ]
        ).toBe(
          "required"
        );

        expect(
          solarium
            ?.moduleSupport[
              "device-booking"
            ]
        ).toBe(
          "required"
        );

        expect(
          solarium
            ?.moduleSupport[
              "health-intake"
            ]
        ).toBe(
          "required"
        );
      }
    );
  }
);
